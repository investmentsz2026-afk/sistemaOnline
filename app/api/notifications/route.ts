import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    
    // Si no hay sesión o no hay ID de usuario, devolvemos lista vacía en lugar de error 401/500
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    // ACTUALIZAR PRESENCIA (Cada vez que el cliente busca notificaciones)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastSeen: new Date() }
    });

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    
    return NextResponse.json(notifications || []);
  } catch (error) {
    console.error("Error detallado en GET /api/notifications:", error);
    // Devolvemos lista vacía para no romper el componente visual
    return NextResponse.json([]);
  }
}

export async function PUT() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en PUT /api/notifications:", error);
    return NextResponse.json({ error: "Error al actualizar notificaciones" }, { status: 500 });
  }
}
