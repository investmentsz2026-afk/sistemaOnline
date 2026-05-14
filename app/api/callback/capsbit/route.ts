import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * Endpoint de Postback para Capsbit Media.
 * Recibe las conversiones y acredita los puntos al usuario.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Extraemos los parámetros enviados por Capsbit
  const transId = searchParams.get("txid");
  const userId = searchParams.get("uid");
  const payout = searchParams.get("payout");
  const offerId = searchParams.get("offer_id");
  const reward = searchParams.get("reward");
  const status = searchParams.get("status"); // approved / rejected
  const sig = searchParams.get("sig");

  // Tu Clave Secreta (Secret Key) de Capsbit Media
  const SECRET_KEY = "7455b7be6c80e74d20249983f7972b90";

  if (!transId || !userId || !payout || !sig) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  try {
    // 1. Verificación de Firma (Seguridad Anti-Fraude)
    // Orden: user_id + payout + offer_id + trans_id + secret_key
    const signatureRaw = userId + payout + offerId + transId + SECRET_KEY;
    const expectedSig = crypto.createHash("md5").update(signatureRaw).digest("hex");

    if (expectedSig !== sig) {
      console.error("[CAPSBIT ERROR]: Firma inválida detectada.");
      return new NextResponse("Invalid signature", { status: 403 });
    }

    // 2. Procesar solo si el estado es 'approved'
    if (status === "approved") {
      const pointsToReward = parseInt(reward || "0");

      if (pointsToReward > 0) {
        // Actualización atómica del balance de puntos del usuario
        await prisma.user.update({
          where: { id: userId },
          data: {
            points: { increment: pointsToReward }
          }
        });

        // Registrar en Auditoría para control administrativo
        await prisma.auditLog.create({
          data: {
            userId: userId,
            action: "CAPSBIT_REWARD",
            description: `Ganó ${pointsToReward} puntos por oferta ID: ${offerId}. Transacción: ${transId}`
          }
        });

        // Enviar notificación al usuario
        await prisma.notification.create({
          data: {
            userId: userId,
            type: "REWARD_EARNED",
            title: "¡Puntos Recibidos!",
            message: `Has ganado ${pointsToReward} puntos por completar una oferta en los juegos.`,
            link: "/ofertas"
          }
        });

        console.log(`[CAPSBIT SUCCESS]: Usuario ${userId} recibió ${pointsToReward} puntos.`);
      }
    }

    // 3. Responder OK (Status 200) para que Capsbit sepa que recibimos el aviso
    return new NextResponse("OK", { status: 200 });

  } catch (error) {
    console.error("[CAPSBIT ERROR]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
