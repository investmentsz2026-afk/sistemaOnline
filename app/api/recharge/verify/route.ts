import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const data = await response.json();
  return data.access_token;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { orderId, amount, coins, method } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Faltan datos de transacción" }, { status: 400 });
    }

    // 1. Obtener Token de PayPal
    const accessToken = await getPayPalAccessToken();

    // 2. Verificar la orden con PayPal
    const verifyRes = await fetch(`${process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const orderData = await verifyRes.json();

    if (orderData.status !== "COMPLETED" && orderData.status !== "APPROVED") {
      // Intentar capturar si está solo aprobada
      if (orderData.status === "APPROVED") {
        const captureRes = await fetch(`${process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders/${orderId}/capture`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        const captureData = await captureRes.json();
        if (captureData.status !== "COMPLETED") {
          return NextResponse.json({ error: "El pago no pudo ser completado" }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: "El pago no ha sido aprobado" }, { status: 400 });
      }
    }

    // Transacción atómica en la base de datos
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el registro de recarga
      const recharge = await tx.recharge.create({
        data: {
          userId: session.user.id,
          amount: parseFloat(amount),
          coins: parseFloat(coins),
          method: method || "PAYPAL",
          status: "COMPLETED",
          transactionId: orderId,
        }
      });

      // 2. Aumentar el saldo del usuario
      await tx.user.update({
        where: { id: session.user.id },
        data: { balance: { increment: parseFloat(coins) } }
      });

      return recharge;
    });

    return NextResponse.json({ success: true, recharge: result });
  } catch (error) {
    console.error("Error al verificar recarga:", error);
    return NextResponse.json({ error: "Error interno al procesar el pago" }, { status: 500 });
  }
}
