"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- ACCIONES PARA EL USUARIO (CLIENTE) ---

export async function createSupportTicket(subject: string, message: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    console.error("[SOPORTE] Intento de crear ticket sin sesión válida");
    return { success: false, error: "Debes iniciar sesión para enviar un reclamo." };
  }

  try {
    const ticket = await (prisma as any).supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        message,
        status: "PENDING"
      }
    });

    console.log(`[SOPORTE] Ticket creado con éxito: ${ticket.id} por usuario ${session.user.id}`);
    revalidatePath("/soporte");
    return { success: true, ticket };
  } catch (error: any) {
    console.error("[SOPORTE ERROR DETALLADO]:", error?.message || error);
    return { success: false, error: "Error técnico al guardar el reclamo. Intenta de nuevo." };
  }
}

export async function getMyTickets() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await (prisma as any).supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: [{ createdAt: "desc" }]
    });
  } catch (error: any) {
    console.error("[SOPORTE ERROR] Error getting user tickets:", error?.message || error);
    return [];
  }
}

// --- ACCIONES PARA EL ADMINISTRADOR / MODERADOR ---

export async function getAllTickets() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    throw new Error("No autorizado");
  }

  try {
    return await (prisma as any).supportTicket.findMany({
      include: {
        user: {
          select: {
            name: true,
            playerId: true,
            email: true
          }
        }
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" }
      ]
    });
  } catch (error) {
    console.error("Error getting all tickets:", error);
    return [];
  }
}

export async function replyToTicket(ticketId: string, reply: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return { success: false, error: "No autorizado" };
  }

  try {
    // 1. Obtener el ticket para saber quién es el dueño
    const ticket = await (prisma as any).supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true }
    });

    if (!ticket) return { success: false, error: "Ticket no encontrado" };

    // 2. Actualizar el ticket
    await (prisma as any).supportTicket.update({
      where: { id: ticketId },
      data: {
        reply,
        status: "RESOLVED",
        updatedAt: new Date()
      }
    });

    // 3. Crear notificación para el usuario
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        type: "SUPPORT_REPLY",
        title: "Soporte Técnico",
        message: "Soporte te envió un mensaje sobre tu reclamo.",
        link: "/soporte"
      }
    });

    revalidatePath("/dashboard/soporte");
    revalidatePath("/soporte");
    return { success: true };
  } catch (error) {
    console.error("Error replying to ticket:", error);
    return { success: false, error: "Error al enviar la respuesta" };
  }
}
