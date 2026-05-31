"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createWithdrawalRequest(data: {
  amount: number;
  method: string;
  accountInfo: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  try {
    // 1. Verificar saldo actual
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true, welcomeGiftWithdrawn: true }
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado." };
    }

    if (data.method.toLowerCase() !== "paypal") {
      return { success: false, error: "Por el momento solo podemos hacer retiros por PayPal." };
    }

    if (data.amount !== 0.02 && data.amount < 5.00) {
      return { success: false, error: "El monto mínimo de retiro es de $5.00 USD." };
    }

    if (data.amount === 0.02) {
      if (user.welcomeGiftWithdrawn) {
        return { success: false, error: "Ya has retirado tu regalo de bienvenida." };
      }
    }

    if (user.balance < data.amount) {
      return { success: false, error: "Saldo insuficiente para este retiro." };
    }

    // 2. Crear la solicitud de retiro
    await prisma.withdrawal.create({
      data: {
        userId: session.user.id,
        amount: data.amount,
        method: data.method,
        accountInfo: data.accountInfo,
        status: "PENDING"
      }
    });

    // 3. Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SOLICITUD_RETIRO",
        description: `El usuario solicitó un retiro de $${data.amount} vía ${data.method}`
      }
    });

    // Opcional: Podrías descontar el saldo aquí o esperar a que el admin apruebe.
    // Para este sistema, esperaremos a la aprobación para descontar, o podemos "bloquearlo".
    // Vamos a descontarlo de una vez para que el usuario no gaste lo que ya pidió retirar.
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        balance: {
          decrement: data.amount
        },
        // Si retira los 0.02 de bienvenida, marcamos la casilla
        ...(data.amount === 0.02 ? { welcomeGiftWithdrawn: true } : {})
      }
    });

    revalidatePath("/retiro");
    revalidatePath("/dashboard/withdrawals");
    
    return { success: true };
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    return { success: false, error: "Error al procesar la solicitud. Intenta más tarde." };
  }
}
