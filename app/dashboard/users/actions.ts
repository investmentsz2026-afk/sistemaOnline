"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const session = await auth();

  // Solo ADMIN o MODERATOR pueden bloquear usuarios
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No tienes permisos para realizar esta acción." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !currentStatus }
    });

    // Registrar en auditoría
    if ((prisma as any).auditLog) {
      await (prisma as any).auditLog.create({
        data: {
          userId: session.user.id,
          action: !currentStatus ? "BLOCK_USER" : "UNBLOCK_USER",
          description: `Usuario afectado: ${userId}`,
        }
      });
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return { success: false, error: "Error al actualizar el estado del usuario." };
  }
}
