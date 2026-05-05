"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Obtener participantes de una batalla específica
export async function getBattleParticipants(battleId: string) {
  try {
    const battleModel = (prisma as any).battle || (prisma as any).Battle;
    if (!battleModel) return { success: false, error: "Servidor no listo" };

    const battle = await battleModel.findUnique({
      where: { id: battleId },
      include: {
        participants: {
          include: {
            user: { select: { name: true, playerId: true, image: true } }
          },
          orderBy: { position: "asc" }
        }
      }
    });

    if (!battle) return { success: false, error: "Batalla no encontrada" };

    const participants = battle.participants.map((p: any) => ({
      name: p.user.name || "Jugador",
      id: p.user.playerId || "000000",
      isUser: false, 
      userId: p.userId
    }));

    return {
      success: true,
      status: battle.status,
      winnerIndex: battle.winnerId ? participants.findIndex((p: any) => p.userId === battle.winnerId) : -1,
      winnerName: battle.winner?.name || null,
      accumulated: battle.accumulated,
      participants: participants
    };
  } catch (error) {
    return { success: false, error: "Error al obtener participantes" };
  }
}

// Obtener la batalla activa del usuario (para reconexión inteligente)
export async function getUserActiveBattle() {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    const participation = await (prisma as any).battleParticipant.findFirst({
      where: { 
        userId: session.user.id,
        battle: { status: { in: ["WAITING", "IN_PROGRESS"] } }
      },
      include: { battle: { include: { creator: { select: { name: true } } } } }
    });

    if (!participation) return { success: false };

    const b = participation.battle;
    
    // Solo auto-reentrar si la batalla YA EMPEZÓ (IN_PROGRESS)
    if (b.status !== "IN_PROGRESS") {
      return { success: false };
    }

    return {
      success: true,
      battle: {
        id: b.id,
        creator: b.creator.name || "Jugador",
        priceUsd: b.priceUsd,
        priceCoins: b.priceCoins,
        joinedCount: 0, 
        color: b.priceUsd >= 5 ? "from-yellow-500 to-amber-600" : 
               b.priceUsd >= 1 ? "from-slate-400 to-slate-600" : "from-amber-700 to-amber-900"
      }
    };
  } catch (error) {
    return { success: false };
  }
}

export async function getWaitingBattles() {
  try {
    const battles = await (prisma as any).battle.findMany({
      where: { status: "WAITING" },
      include: {
        creator: { select: { name: true } },
        participants: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return {
      success: true,
      battles: battles.map((b: any) => ({
        id: b.id,
        creator: b.creator.name || "Jugador",
        priceUsd: b.priceUsd,
        priceCoins: b.priceCoins,
        joinedCount: b.participants.length,
        color: b.priceUsd >= 5 ? "from-yellow-500 to-amber-600" : 
               b.priceUsd >= 1 ? "from-slate-400 to-slate-600" : "from-amber-700 to-amber-900"
      }))
    };
  } catch (error) {
    return { success: false, error: "Error al obtener batallas" };
  }
}

// Crear una nueva batalla real
export async function createBattle(priceUsd: number, priceCoins: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autorizado" };

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Verificar balance (SOLO si no es de prueba $0)
      if (priceUsd > 0) {
        const user = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { balance: true }
        });

        if (!user || user.balance < priceCoins) {
          throw new Error("Saldo insuficiente");
        }

        // 2. Descontar balance
        await tx.user.update({
          where: { id: session.user.id },
          data: { balance: { decrement: priceCoins } }
        });
      }

      // 3. Crear batalla
      const battle = await (tx as any).battle.create({
        data: {
          creatorId: session.user.id,
          priceUsd,
          priceCoins,
          status: "WAITING",
          participants: {
            create: {
              userId: session.user.id,
              position: 0 
            }
          }
        }
      });

      return { success: true, battleId: battle.id };
    });
  } catch (error: any) {
    return { success: false, error: error.message || "Error al crear batalla" };
  }
}

// Unirse a una batalla real
export async function joinBattle(battleId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autorizado" };

  try {
    return await prisma.$transaction(async (tx) => {
      const battle = await (tx as any).battle.findUnique({
        where: { id: battleId },
        include: { participants: true }
      });

      if (!battle) throw new Error("La batalla ya no existe");
      if (battle.status !== "WAITING") throw new Error("La batalla ya ha comenzado");
      if (battle.participants.length >= 6) throw new Error("La sala está llena");
      
      const alreadyJoined = battle.participants.some((p: any) => p.userId === session.user.id);
      if (alreadyJoined) throw new Error("Ya estás en esta batalla");

      // Verificar y descontar balance (si no es prueba)
      if (battle.priceUsd > 0) {
        const user = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { balance: true }
        });

        if (!user || user.balance < battle.priceCoins) {
          throw new Error("Saldo insuficiente");
        }

        await tx.user.update({
          where: { id: session.user.id },
          data: { balance: { decrement: battle.priceCoins } }
        });
      }

      // Añadir participante
      await (tx as any).battleParticipant.create({
        data: {
          battleId,
          userId: session.user.id,
          position: battle.participants.length 
        }
      });

      // Si se llenó a 6, marcamos como en progreso
      if (battle.participants.length + 1 === 6) {
        await (tx as any).battle.update({
          where: { id: battleId },
          data: { status: "IN_PROGRESS" }
        });
      }

      // Obtener lista actualizada de participantes para el cliente
      const allParticipants = await (tx as any).battleParticipant.findMany({
        where: { battleId },
        include: { user: { select: { name: true, playerId: true } } },
        orderBy: { position: "asc" }
      });

      return { 
        success: true, 
        participants: allParticipants.map((p: any) => ({
          name: p.user.name || "Jugador",
          id: p.user.playerId || "000000",
          userId: p.userId
        }))
      };
    });
  } catch (error: any) {
    return { success: false, error: error.message || "Error al unirse" };
  }
}

// Resolver la batalla (decidir ganador y pagar)
export async function resolveBattle(battleId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autorizado" };

  try {
    return await prisma.$transaction(async (tx) => {
      const battle = await (tx as any).battle.findUnique({
        where: { id: battleId },
        include: { 
          participants: { 
            include: { user: true },
            orderBy: { position: "asc" } 
          } 
        }
      });

      if (!battle) throw new Error("Batalla no encontrada");
      if (battle.status === "COMPLETED") {
        return { 
          success: true, 
          winnerIndex: battle.participants.findIndex((p: any) => p.userId === battle.winnerId),
          winnerName: battle.winner?.name,
          isJackpot: false
        };
      }
      
      if (battle.participants.length < 6) throw new Error("Aún faltan jugadores");

      // Probabilidad de caer en Acumulado (1 entre 7)
      const roll = Math.floor(Math.random() * 7); // 0-6
      
      if (roll === 6) {
        // CAYÓ EN ACUMULADO
        const roundPot = battle.priceCoins * 6;
        await (tx as any).battle.update({
          where: { id: battleId },
          data: { 
            accumulated: { increment: roundPot },
            status: "IN_PROGRESS" // Sigue abierta para girar
          }
        });

        return { 
          success: true, 
          winnerIndex: 6, // Índice del Acumulado
          isJackpot: true,
          newPool: battle.accumulated + roundPot
        };
      } else {
        // CAYÓ EN UN JUGADOR (índice 0-5)
        const winnerParticipant = battle.participants[roll];
        const totalPrize = (battle.priceCoins * 6) + battle.accumulated;

        // Finalizar batalla
        await (tx as any).battle.update({
          where: { id: battleId },
          data: {
            status: "COMPLETED",
            winnerId: winnerParticipant.userId,
            totalPrize: totalPrize
          }
        });

        // Pagar al ganador (si no es prueba)
        if (battle.priceUsd > 0) {
          await tx.user.update({
            where: { id: winnerParticipant.userId },
            data: { balance: { increment: totalPrize } }
          });
        }

        return { 
          success: true, 
          winnerIndex: roll, 
          winnerName: winnerParticipant.user.name,
          isJackpot: false,
          totalWon: totalPrize
        };
      }
    });
  } catch (error: any) {
    return { success: false, error: error.message || "Error al resolver batalla" };
  }
}

// Abandonar una batalla (con lógica de reembolso y cierre)
export async function leaveBattle(battleId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autorizado" };

  try {
    const battleModel = (prisma as any).battle || (prisma as any).Battle;
    if (!battleModel) return { success: false, error: "Servidor no listo" };

    return await prisma.$transaction(async (tx) => {
      const battle = await (tx as any).battle.findUnique({
        where: { id: battleId },
        include: { participants: true }
      });

      if (!battle) return { success: true }; // Ya no existe
      if (battle.status !== "WAITING") throw new Error("La batalla ya ha comenzado");

      // Buscar al participante
      const participant = battle.participants.find((p: any) => p.userId === session.user.id);
      if (!participant) return { success: true };

      // Reembolsar dinero si no es sala de prueba
      if (battle.priceUsd > 0) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { balance: { increment: battle.priceCoins } }
        });
      }

      // Lógica de salida
      if (battle.creatorId === session.user.id) {
        // EL CREADOR SALE -> SE CIERRA LA SALA
        // Primero reembolsamos a los otros participantes si los hay
        const others = battle.participants.filter((p: any) => p.userId !== session.user.id);
        if (battle.priceUsd > 0) {
          for (const other of others) {
            await tx.user.update({
              where: { id: other.userId },
              data: { balance: { increment: battle.priceCoins } }
            });
          }
        }

        // Eliminar batalla (cascada eliminará participantes)
        await (tx as any).battle.delete({
          where: { id: battleId }
        });
        
        return { success: true, roomClosed: true };
      } else {
        // UN INVITADO SALE -> SOLO SE VA ÉL
        await (tx as any).battleParticipant.delete({
          where: { id: participant.id }
        });
        
        return { success: true, roomClosed: false };
      }
    });
  } catch (error: any) {
    return { success: false, error: error.message || "Error al abandonar" };
  }
}
