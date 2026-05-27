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

    // Si el retiro es rechazado, reembolsamos el dinero al balance del usuario y re-habilitamos el bono si es de $0.02
    if (status === "REJECTED") {
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: { increment: withdrawal.amount },
          ...(withdrawal.amount === 0.02 ? { welcomeGiftWithdrawn: false } : {})
        }
      });
    }

    // Si el retiro es aprobado y es de al menos $5.00, y el usuario fue referido por alguien:
    if (status === "COMPLETED" && withdrawal.amount >= 5.0 && withdrawal.user.referredById) {
      const referrerId = withdrawal.user.referredById;
      await prisma.user.update({
        where: { id: referrerId },
        data: { balance: { increment: 0.50 } }
      });
      await prisma.auditLog.create({
        data: {
          userId: referrerId,
          action: "REFERRAL_BONUS_RECEIVED",
          description: `Bono de referido recibido: $0.50 USD por el retiro exitoso de su referido ${withdrawal.user.name || withdrawal.user.email}`
        }
      });
      await prisma.notification.create({
        data: {
          userId: referrerId,
          type: "REFERRAL_BONUS",
          title: "¡Bono de Referido Acreditado!",
          message: `Has ganado $0.50 USD porque tu referido ${withdrawal.user.name || withdrawal.user.email} completó un retiro de al menos $5.00 USD.`,
          link: "/retiro"
        }
      });
    }

    revalidatePath("/dashboard/withdrawals");
    return { success: true };
  } catch (error) {
    console.error("Error updating withdrawal status:", error);
    return { success: false, error: "No se pudo actualizar el estado del retiro." };
  }
}
