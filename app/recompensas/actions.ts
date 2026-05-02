"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function completeSocialMission(missionId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Debes iniciar sesión para ganar premios." };
  }

  try {
    const userMissionModel = (prisma as any).userMission;

    if (!userMissionModel) {
      return { success: false, error: "El sistema de misiones está sincronizando. Reintenta en unos segundos." };
    }

    // 1. Verificar si ya completó la misión
    const existing = await userMissionModel.findUnique({
      where: {
        userId_missionId: {
          userId: session.user.id,
          missionId: missionId
        }
      }
    });

    if (existing) {
      return { success: false, error: "Ya has reclamado esta recompensa." };
    }

    // 2. Registrar la misión y sumar el premio ($0.02)
    await prisma.$transaction([
      userMissionModel.create({
        data: {
          userId: session.user.id,
          missionId: missionId
        }
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          balance: {
            increment: 0.02
          }
        }
      }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "MISION_COMPLETADA",
          description: `El usuario ganó $0.02 por completar la misión: ${missionId}`
        }
      })
    ]);

    revalidatePath("/recompensas");
    revalidatePath("/inicio");
    
    return { success: true };
  } catch (error) {
    console.error("Error completing mission:", error);
    return { success: false, error: "No se pudo procesar la recompensa." };
  }
}
