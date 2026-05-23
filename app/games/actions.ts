"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Lista de misiones diarias por defecto
const DEFAULT_MISSIONS = {
  runner: [
    { id: "run_dist", title: "Corredor Incansable", description: "Corre 1,000 metros en total", targetType: "distance", targetValue: 1000, rewardCoins: 100, rewardXp: 150 },
    { id: "run_coins", title: "Acaparador de Oro", description: "Recoge 50 monedas en una partida", targetType: "coins", targetValue: 50, rewardCoins: 50, rewardXp: 100 },
    { id: "run_time", title: "Superviviente", description: "Sobrevive 3 minutos (180s) en una sola carrera", targetType: "playTime", targetValue: 180, rewardCoins: 80, rewardXp: 120 },
    { id: "run_games", title: "Entusiasta del Runner", description: "Completa 3 partidas de Endless Runner", targetType: "gamesPlayed", targetValue: 3, rewardCoins: 60, rewardXp: 80 }
  ],
  puzzle: [
    { id: "puz_lvls", title: "Explorador de Niveles", description: "Completa 3 niveles del puzzle", targetType: "levelsCompleted", targetValue: 3, rewardCoins: 80, rewardXp: 120 },
    { id: "puz_score", title: "Estratega Brillante", description: "Obtén 5,000 puntos en un nivel", targetType: "score", targetValue: 5000, rewardCoins: 100, rewardXp: 150 },
    { id: "puz_combos", title: "Rey de los Combos", description: "Consigue un combo de 5 o más en una partida", targetType: "combo", targetValue: 5, rewardCoins: 120, rewardXp: 200 }
  ]
};

// Verifica si la tabla existe en prisma para evitar crasheos si no se ha corrido el db push
async function checkTableExists(modelName: string): Promise<boolean> {
  try {
    const models = Object.keys(prisma);
    return models.includes(modelName);
  } catch (e) {
    return false;
  }
}

/**
 * Obtener o crear progreso del juego, cargar misiones y rankings.
 */
export async function getGameProgress(gameId: "runner" | "puzzle") {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado", isDemoMode: true };
  }

  const userId = session.user.id;
  const isMigrated = await checkTableExists("gameProgress");

  if (!isMigrated) {
    console.warn(`[GAMES]: Tabla gameProgress no encontrada. Iniciando en modo Demo/LocalStorage.`);
    return {
      success: true,
      isDemoMode: true,
      progress: {
        level: 1,
        xp: 0,
        coins: 0,
        highScore: 0,
        skinsUnlocked: "default",
        currentSkin: "default",
        stats: "{}",
      },
      missions: DEFAULT_MISSIONS[gameId].map(m => ({
        ...m,
        progress: { currentValue: 0, isCompleted: false, isClaimed: false }
      })),
      rankings: []
    };
  }

  try {
    // 1. Obtener o crear el registro de progreso
    let progress = await (prisma as any).gameProgress.findUnique({
      where: { userId_gameId: { userId, gameId } }
    });

    if (!progress) {
      progress = await (prisma as any).gameProgress.create({
        data: {
          userId,
          gameId,
          level: 1,
          xp: 0,
          coins: 100, // Monedas de regalo iniciales
          highScore: 0,
          skinsUnlocked: "default",
          currentSkin: "default",
          stats: "{}"
        }
      });
    }

    // 2. Garantizar que las misiones diarias estén sembradas en la tabla GameMission (si aplica) o usarlas en memoria
    // Para simplificar, buscamos los progresos de misiones del usuario
    const userMissionsProgress = await (prisma as any).userGameMissionProgress.findMany({
      where: { userId }
    });

    const missionsWithProgress = DEFAULT_MISSIONS[gameId].map(m => {
      const userProg = userMissionsProgress.find((up: any) => up.missionId === m.id);
      return {
        ...m,
        progress: {
          currentValue: userProg?.currentValue || 0,
          isCompleted: userProg?.isCompleted || false,
          isClaimed: userProg?.isClaimed || false
        }
      };
    });

    // 3. Cargar Rankings globales
    const rankingsRaw = await (prisma as any).gameRanking.findMany({
      where: { gameId },
      orderBy: { score: "desc" },
      take: 10,
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    });

    const rankings = rankingsRaw.map((r: any, idx: number) => ({
      rank: idx + 1,
      name: r.user.name || "Jugador Anónimo",
      image: r.user.image,
      score: r.score,
      level: r.level
    }));

    return {
      success: true,
      isDemoMode: false,
      progress,
      missions: missionsWithProgress,
      rankings
    };
  } catch (error) {
    console.error("Error al obtener progreso de juego:", error);
    return { success: false, error: "Error de base de datos", isDemoMode: true };
  }
}

/**
 * Guardar el progreso de una partida (sumar monedas, XP, registrar récord y actualizar misiones).
 */
export async function saveGameProgress(
  gameId: "runner" | "puzzle",
  results: {
    score: number;
    coinsEarned: number;
    xpEarned: number;
    distanceRun?: number;
    levelsCompleted?: number;
    timePlayed?: number; // en segundos
    combosEarned?: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  const userId = session.user.id;
  const isMigrated = await checkTableExists("gameProgress");

  if (!isMigrated) {
    return { success: true, isDemoMode: true, message: "Guardado localmente en Demo Mode" };
  }

  try {
    // 1. Obtener progreso actual
    const currentProgress = await (prisma as any).gameProgress.findUnique({
      where: { userId_gameId: { userId, gameId } }
    });

    if (!currentProgress) return { success: false, error: "Progreso no encontrado" };

    const newXp = currentProgress.xp + results.xpEarned;
    const newCoins = currentProgress.coins + results.coinsEarned;
    const isNewHighScore = results.score > currentProgress.highScore;
    const newHighScore = isNewHighScore ? results.score : currentProgress.highScore;

    // Calcular Nivel RPG (Fórmula: raíz cuadrada de XP dividida por 200, + 1)
    const newLevel = Math.floor(Math.sqrt(newXp / 200)) + 1;
    const didLevelUp = newLevel > currentProgress.level;

    // Actualizar JSON de estadísticas
    let stats = {};
    try {
      stats = JSON.parse(currentProgress.stats);
    } catch (_) {}

    stats = {
      ...stats,
      gamesPlayed: ((stats as any).gamesPlayed || 0) + 1,
      totalCoins: ((stats as any).totalCoins || 0) + results.coinsEarned,
      totalXp: ((stats as any).totalXp || 0) + results.xpEarned,
      totalDistance: ((stats as any).totalDistance || 0) + (results.distanceRun || 0),
      totalPlayTime: ((stats as any).totalPlayTime || 0) + (results.timePlayed || 0)
    };

    // Actualizar progreso principal
    const updatedProgress = await (prisma as any).gameProgress.update({
      where: { userId_gameId: { userId, gameId } },
      data: {
        xp: newXp,
        coins: newCoins,
        highScore: newHighScore,
        level: newLevel,
        stats: JSON.stringify(stats)
      }
    });

    // 2. Actualizar misiones del usuario
    const activeMissions = DEFAULT_MISSIONS[gameId];
    const missionUpdates = [];

    for (const mission of activeMissions) {
      let incrementValue = 0;

      if (mission.targetType === "distance" && results.distanceRun) {
        incrementValue = results.distanceRun;
      } else if (mission.targetType === "coins" && results.coinsEarned) {
        // En misiones tipo "monedas", puede ser acumulable o en una sola partida. Por la descripción "en una partida":
        // Si el valor logrado en esta partida supera el anterior o si es acumulable.
        // Haremos que las misiones de monedas sean acumulativas diarias para mejorar el engagement del usuario
        incrementValue = results.coinsEarned;
      } else if (mission.targetType === "playTime" && results.timePlayed) {
        incrementValue = results.timePlayed;
      } else if (mission.targetType === "gamesPlayed") {
        incrementValue = 1;
      } else if (mission.targetType === "levelsCompleted" && results.levelsCompleted) {
        incrementValue = results.levelsCompleted;
      } else if (mission.targetType === "score" && results.score >= mission.targetValue) {
        // Misión de puntuación específica en una partida
        incrementValue = mission.targetValue; 
      } else if (mission.targetType === "combo" && results.combosEarned && results.combosEarned >= mission.targetValue) {
        incrementValue = mission.targetValue;
      }

      if (incrementValue > 0) {
        const userProg = await (prisma as any).userGameMissionProgress.findUnique({
          where: { userId_missionId: { userId, missionId: mission.id } }
        });

        const currentVal = userProg?.currentValue || 0;
        const isAlreadyComp = userProg?.isCompleted || false;
        
        const newVal = Math.min(mission.targetValue, currentVal + incrementValue);
        const isCompNow = newVal >= mission.targetValue;

        const updatedProg = await (prisma as any).userGameMissionProgress.upsert({
          where: { userId_missionId: { userId, missionId: mission.id } },
          create: {
            userId,
            missionId: mission.id,
            currentValue: newVal,
            isCompleted: isCompNow,
            isClaimed: false
          },
          update: {
            currentValue: newVal,
            isCompleted: isCompNow
          }
        });

        missionUpdates.push({
          missionId: mission.id,
          currentValue: newVal,
          isCompleted: isCompNow && !isAlreadyComp // True solo si se completó justo en esta partida
        });
      }
    }

    // 3. Si hay récord, guardar en rankings globales
    if (isNewHighScore) {
      await (prisma as any).gameRanking.upsert({
        where: { id: `${userId}_${gameId}` }, // Identificador determinista opcional o manejar por upsert
        create: {
          id: `${userId}_${gameId}`,
          userId,
          gameId,
          score: results.score,
          level: newLevel
        },
        update: {
          score: results.score,
          level: newLevel
        }
      });
    }

    // 4. Si subió de nivel, registrar en logs de auditoría y enviar notificación
    if (didLevelUp) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "GAME_LEVEL_UP",
          description: `El usuario subió al nivel RPG ${newLevel} en el juego ${gameId}.`
        }
      });

      await prisma.notification.create({
        data: {
          userId,
          type: "GAME_LEVEL_UP",
          title: `¡Subiste de Nivel en ${gameId === "runner" ? "Endless Runner" : "Puzzle Match-3"}!`,
          message: `¡Felicitaciones! Has alcanzado el nivel ${newLevel}. Sigue jugando para ganar más recompensas.`,
          link: `/games/${gameId}`
        }
      });
    }

    revalidatePath(`/games/${gameId}`);
    return {
      success: true,
      progress: updatedProgress,
      didLevelUp,
      newLevel,
      isNewHighScore,
      missionUpdates
    };
  } catch (error) {
    console.error("Error al guardar progreso de juego:", error);
    return { success: false, error: "Error de servidor al guardar progreso" };
  }
}

/**
 * Reclamar la recompensa de una misión completada.
 * Otorga Monedas del Juego, XP, y lo más importante: PUNTOS REALES de la plataforma que se pueden canjear por dinero!
 */
export async function claimMissionReward(gameId: "runner" | "puzzle", missionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  const userId = session.user.id;
  const isMigrated = await checkTableExists("gameProgress");

  const mission = DEFAULT_MISSIONS[gameId].find(m => m.id === missionId);
  if (!mission) return { success: false, error: "Misión no encontrada" };

  if (!isMigrated) {
    // Modo Demo: Simular reclamo y otorgar puntos simulados
    return {
      success: true,
      isDemoMode: true,
      rewardCoins: mission.rewardCoins,
      rewardXp: mission.rewardXp,
      realPointsAdded: Math.round(mission.rewardCoins / 10), // Puntos proporcionales
      message: "¡Recompensa reclamada en modo Demo local!"
    };
  }

  try {
    // Verificar que la misión esté completa y no reclamada
    const userProg = await (prisma as any).userGameMissionProgress.findUnique({
      where: { userId_missionId: { userId, missionId } }
    });

    if (!userProg) return { success: false, error: "No hay progreso para esta misión" };
    if (!userProg.isCompleted) return { success: false, error: "La misión aún no ha sido completada" };
    if (userProg.isClaimed) return { success: false, error: "Esta misión ya fue reclamada" };

    // Calcular puntos de plataforma reales a acreditar (ej: 1 punto de plataforma por cada 5 monedas de juego ganadas)
    const platformPointsReward = Math.max(5, Math.round(mission.rewardCoins / 5));

    // Ejecutar transacción atómica
    await prisma.$transaction([
      // 1. Marcar misión como reclamada
      (prisma as any).userGameMissionProgress.update({
        where: { id: userProg.id },
        data: { isClaimed: true }
      }),
      // 2. Sumar monedas y XP al juego
      (prisma as any).gameProgress.update({
        where: { userId_gameId: { userId, gameId } },
        data: {
          coins: { increment: mission.rewardCoins },
          xp: { increment: mission.rewardXp }
        }
      }),
      // 3. Acreditar PUNTOS REALES en la cuenta del usuario para el canje general
      prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: platformPointsReward }
        }
      }),
      // 4. Crear log de auditoría
      prisma.auditLog.create({
        data: {
          userId,
          action: "GAME_MISSION_CLAIMED",
          description: `Reclamó misión '${mission.title}'. Ganó ${mission.rewardCoins} monedas del juego, ${mission.rewardXp} XP y +${platformPointsReward} puntos reales.`
        }
      })
    ]);

    revalidatePath(`/games/${gameId}`);
    revalidatePath("/juegos");
    
    return {
      success: true,
      rewardCoins: mission.rewardCoins,
      rewardXp: mission.rewardXp,
      realPointsAdded: platformPointsReward
    };
  } catch (error) {
    console.error("Error al reclamar recompensa de misión:", error);
    return { success: false, error: "Error de servidor al procesar recompensa" };
  }
}

/**
 * Comprar una skin de personaje usando las monedas ganadas en el juego.
 */
export async function buySkin(gameId: "runner" | "puzzle", skinId: string, cost: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autorizado" };

  const userId = session.user.id;
  const isMigrated = await checkTableExists("gameProgress");

  if (!isMigrated) {
    return { success: true, isDemoMode: true, message: "Skin comprada localmente" };
  }

  try {
    const progress = await (prisma as any).gameProgress.findUnique({
      where: { userId_gameId: { userId, gameId } }
    });

    if (!progress) return { success: false, error: "Progreso no encontrado" };
    if (progress.coins < cost) return { success: false, error: "Monedas insuficientes" };

    const skinsArray = progress.skinsUnlocked.split(",");
    if (skinsArray.includes(skinId)) return { success: false, error: "Ya posees esta skin" };

    skinsArray.push(skinId);
    const updatedSkins = skinsArray.join(",");

    const updatedProgress = await (prisma as any).gameProgress.update({
      where: { userId_gameId: { userId, gameId } },
      data: {
        coins: { decrement: cost },
        skinsUnlocked: updatedSkins,
        currentSkin: skinId // Seleccionar automáticamente al comprar
      }
    });

    revalidatePath(`/games/${gameId}`);
    return { success: true, progress: updatedProgress };
  } catch (error) {
    console.error("Error al comprar skin:", error);
    return { success: false, error: "Error en el servidor" };
  }
}

/**
 * Seleccionar una skin ya desbloqueada.
 */
export async function selectSkin(gameId: "runner" | "puzzle", skinId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autorizado" };

  const userId = session.user.id;
  const isMigrated = await checkTableExists("gameProgress");

  if (!isMigrated) {
    return { success: true, isDemoMode: true, message: "Skin seleccionada localmente" };
  }

  try {
    const progress = await (prisma as any).gameProgress.findUnique({
      where: { userId_gameId: { userId, gameId } }
    });

    if (!progress) return { success: false, error: "Progreso no encontrado" };
    
    const skinsArray = progress.skinsUnlocked.split(",");
    if (!skinsArray.includes(skinId)) return { success: false, error: "Skin no desbloqueada" };

    const updatedProgress = await (prisma as any).gameProgress.update({
      where: { userId_gameId: { userId, gameId } },
      data: { currentSkin: skinId }
    });

    revalidatePath(`/games/${gameId}`);
    return { success: true, progress: updatedProgress };
  } catch (error) {
    console.error("Error al seleccionar skin:", error);
    return { success: false, error: "Error en el servidor" };
  }
}
