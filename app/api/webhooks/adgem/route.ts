import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ADGEM POSTBACK RECEIVER
// URL para AdGem: https://tu-dominio.com/api/webhooks/adgem?player_id={player_id}&amount={amount}&transaction_id={transaction_id}&status={status}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const playerId = searchParams.get("player_id"); // Ejemplo: #0001
    const amount = searchParams.get("amount");     // Ejemplo: 500
    const transactionId = searchParams.get("transaction_id");
    const status = searchParams.get("status");     // 1 = Success, 0 = Reversal
    
    if (!playerId || !amount || !transactionId) {
      return new NextResponse("Missing Parameters", { status: 400 });
    }

    // 1. Buscar al usuario por su PlayerID corto
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { playerId: playerId },
          { id: playerId } // Por si acaso pasamos el UUID
        ]
      }
    });

    if (!user) {
      return new NextResponse("User Not Found", { status: 404 });
    }

    const coinAmount = parseFloat(amount);

    // 2. Procesar el pago o la reversión
    if (status === "0") {
      // Reversión (Fraude o cancelación)
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: coinAmount } }
      });
      return new NextResponse("Reversed", { status: 200 });
    }

    // 3. Sumar saldo (Éxito)
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: coinAmount } }
    });

    console.log(`[ADGEM SUCCESS] +${coinAmount} monedas para ${user.name} (${user.playerId})`);

    // AdGem requiere una respuesta OK (200) para dejar de reintentar
    return new NextResponse("OK", { status: 200 });

  } catch (error) {
    console.error("[ADGEM ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
