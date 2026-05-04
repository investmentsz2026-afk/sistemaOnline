import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId es requerido" }, { status: 400 });
  }

  try {
    // Marcamos como leídos todos los mensajes donde el usuario actual es el RECEPTOR
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: "Error al actualizar mensajes" }, { status: 500 });
  }
}
