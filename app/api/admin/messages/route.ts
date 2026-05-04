import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "Falta conversationId" }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, image: true, playerId: true }
        }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages for admin:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
