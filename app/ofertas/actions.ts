"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Agrega puntos al usuario por ver anuncios.
 */
export async function addPoints(amount: number, reason: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autorizado" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        points: { increment: amount }
      }
    });

    // Opcional: Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "POINTS_EARNED",
        description: `Ganó ${amount} puntos por: ${reason}`
      }
    });

    revalidatePath("/ofertas");
    revalidatePath("/inicio");
    return { success: true, pointsAdded: amount };
  } catch (error) {
    console.error("Error adding points:", error);
    return { success: false, error: "Error al procesar los puntos" };
  }
}

/**
 * Crea una solicitud de canje para ser aprobada por el admin.
 */
export async function requestRedeemPoints(optionId: "BASIC" | "PREMIUM") {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autorizado" };

  const redemptionConfig = {
    BASIC: { points: 1000, value: 0.50 },
    PREMIUM: { points: 2000, value: 1.00 }
  };

  const selected = redemptionConfig[optionId];

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true }
    });

    if (!user) return { success: false, error: "Usuario no encontrado" };

    // Calcular puntos ya "retenidos" en solicitudes pendientes
    const pendingRequests = await (prisma as any).pointsRedemption.findMany({
      where: {
        userId: session.user.id,
        status: "PENDING"
      },
      select: { pointsAmount: true }
    });

    const pointsInRetention = pendingRequests.reduce((acc: number, req: any) => acc + req.pointsAmount, 0);
    const availablePoints = user.points - pointsInRetention;

    if (availablePoints < selected.points) {
      return { success: false, error: "PUNTOS_INSUFICIENTES" };
    }

    // Diagnóstico: Ver qué modelos hay cargados
    const models = Object.keys(prisma);
    if (!models.includes("pointsRedemption")) {
      console.warn("[CANJEO ALERTA]: El modelo 'pointsRedemption' NO existe en el cliente actual. Modelos:", models);
      return { success: false, error: "Modelo de canje no sincronizado. Reinicia el servidor." };
    }

    // Crear solicitud pendiente
    await (prisma as any).pointsRedemption.create({
      data: {
        userId: session.user.id,
        pointsAmount: selected.points,
        bcAmount: selected.value,
        status: "PENDING"
      }
    });

    // Notificar a los administradores
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MODERATOR"] } },
      select: { id: true }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "NEW_REDEEM_REQUEST",
          title: "Nueva Solicitud de Canje",
          message: `El usuario ${session.user.name} solicita canjear ${selected.points} puntos por $${selected.value} BC.`,
          link: "/dashboard/canjeos"
        }
      });
    }

    revalidatePath("/ofertas");
    return { success: true };
  } catch (error) {
    console.error("Error creating redeem request:", error);
    return { success: false, error: "Error al enviar la solicitud" };
  }
}

// --- ACCIONES DE ADMINISTRADOR ---

export async function getAllRedemptions() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    throw new Error("No autorizado");
  }

  const models = Object.keys(prisma);
  if (!models.includes("pointsRedemption")) {
    console.warn("[CANJEO ALERTA]: El modelo 'pointsRedemption' NO existe en el cliente actual.");
    return [];
  }

  return await (prisma as any).pointsRedemption.findMany({
    include: {
      user: {
        select: {
          name: true,
          playerId: true,
          points: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function approveRedeem(redemptionId: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const request = await (prisma as any).pointsRedemption.findUnique({
      where: { id: redemptionId }
    });

    if (!request || request.status !== "PENDING") {
      return { success: false, error: "Solicitud no válida o ya procesada" };
    }

    // 1. Verificar si el usuario aún tiene los puntos
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { points: true }
    });

    if (!user || user.points < request.pointsAmount) {
      return { success: false, error: "El usuario ya no tiene puntos suficientes" };
    }

    // 2. Ejecutar canje (Atómico)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: request.userId },
        data: {
          points: { decrement: request.pointsAmount },
          balance: { increment: request.bcAmount }
        }
      }),
      (prisma as any).pointsRedemption.update({
        where: { id: redemptionId },
        data: { status: "APPROVED" }
      }),
      prisma.notification.create({
        data: {
          userId: request.userId,
          type: "REDEEM_APPROVED",
          title: "Canje Aprobado!",
          message: `Tu solicitud de canje por $${request.bcAmount} BC ha sido aprobada.`,
          link: "/inicio"
        }
      })
    ]);

    revalidatePath("/dashboard/canjeos");
    revalidatePath("/ofertas");
    return { success: true };
  } catch (error) {
    console.error("Error approving redeem:", error);
    return { success: false, error: "Error al aprobar el canje" };
  }
}

export async function rejectRedeem(redemptionId: string, reason: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" };
  }

  try {
    await (prisma as any).pointsRedemption.update({
      where: { id: redemptionId },
      data: { 
        status: "REJECTED",
        adminNotes: reason
      }
    });

    const request = await (prisma as any).pointsRedemption.findUnique({
      where: { id: redemptionId },
      select: { userId: true }
    });

    await prisma.notification.create({
      data: {
        userId: request.userId,
        type: "REDEEM_REJECTED",
        title: "Canje Rechazado",
        message: `Tu solicitud fue rechazada. Motivo: ${reason}`,
        link: "/ofertas"
      }
    });

    revalidatePath("/dashboard/canjeos");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting redeem:", error);
    return { success: false, error: "Error al rechazar el canje" };
  }
}
