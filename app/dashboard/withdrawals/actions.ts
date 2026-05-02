"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateWithdrawalStatus(
  id: string, 
  status: "COMPLETED" | "REJECTED",
  notes?: string
) {
  try {
    const withdrawal = await prisma.withdrawal.update({
      where: { id },
      data: { 
        status,
        notes: notes || null
      },
      include: {
        user: true
      }
    });

    // Registramos la acción en el log de auditoría
    await prisma.auditLog.create({
      data: {
        userId: withdrawal.userId,
        action: `RETIRO_${status}`,
        description: `El retiro de $${withdrawal.amount} fue ${status === "COMPLETED" ? "Aprobado" : "Rechazado"}. Notas: ${notes || "Ninguna"}`
      }
    });

    revalidatePath("/dashboard/withdrawals");
    return { success: true };
  } catch (error) {
    console.error("Error updating withdrawal status:", error);
    return { success: false, error: "No se pudo actualizar el estado del retiro." };
  }
}
