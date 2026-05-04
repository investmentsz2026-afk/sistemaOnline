import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId es requerido" }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 100
    });

    // También traemos los participantes para ver su estado "En línea"
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                lastSeen: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ messages, participants: conversation?.participants });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Error al obtener mensajes" }, { status: 500 });
  }
}
