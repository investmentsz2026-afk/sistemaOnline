import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id }
        }
      },
      include: {
        participants: {
          include: { user: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 50
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: session.user.id },
                isRead: false
              }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Invertimos mensajes para que el cliente los reciba en orden cronológico
    const formatted = conversations.map(conv => ({
      ...conv,
      messages: [...conv.messages].reverse()
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Error al obtener conversaciones" }, { status: 500 });
  }
}
