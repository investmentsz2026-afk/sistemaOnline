"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- SISTEMA DE AMIGOS ---

export async function sendFriendRequest(targetPlayerId: string) {
  const session = await auth();
  if (!session) return { success: false, error: "No autorizado" };

  try {
    const receiver = await prisma.user.findUnique({
      where: { playerId: targetPlayerId }
    });

    if (!receiver) return { success: false, error: "Jugador no encontrado" };
    if (receiver.id === session.user.id) return { success: false, error: "No puedes agregarte a ti mismo" };

    // Verificar si ya existe una relación
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: session.user.id }
        ]
      }
    });

    if (existing) {
      if (existing.status === "ACCEPTED") return { success: false, error: "Ya son amigos" };
      return { success: false, error: "Solicitud ya enviada o pendiente" };
    }

    const friendship = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId: receiver.id,
        status: "PENDING"
      }
    });

    // Notificación para el receptor
    try {
      await prisma.notification.create({
        data: {
          userId: receiver.id,
          type: "FRIEND_REQUEST",
          title: "Nueva Solicitud",
          message: `${session.user.name} quiere ser tu aliado.`,
          link: "/mensajes"
        }
      });

      // NOTIFICACIÓN DE PRUEBA PARA EL EMISOR (TÚ)
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "INFO",
          title: "Solicitud Enviada",
          message: `Has enviado una solicitud a ${receiver.name}.`,
          link: "/mensajes"
        }
      });
    } catch (notifError) {
      console.error("Error al crear notificaciones:", notifError);
    }

    revalidatePath("/mensajes");
    return { success: true };
  } catch (error) {
    console.error("Error en sendFriendRequest:", error);
    return { success: false, error: "Error al enviar solicitud" };
  }
}

export async function respondToFriendRequest(requestId: string, status: "ACCEPTED" | "REJECTED") {
  const session = await auth();
  if (!session) return { success: false, error: "No autorizado" };

  try {
    const friendship = await prisma.friendship.update({
      where: { id: requestId },
      data: { status },
      include: { sender: true }
    });

    if (status === "ACCEPTED") {
      // Crear la conversación automáticamente
      await getOrCreateConversation(friendship.senderId);

      // Notificación para el emisor original
      try {
        await prisma.notification.create({
          data: {
            userId: friendship.senderId,
            type: "REQUEST_ACCEPTED",
            title: "¡Solicitud Aceptada!",
            message: `${session.user.name} ha aceptado tu solicitud de amistad. ¡Ya pueden chatear!`,
            link: "/mensajes"
          }
        });
      } catch (notifError) {
        console.error("Error al crear notificación de aceptación:", notifError);
      }
    }

    revalidatePath("/mensajes");
    return { success: true };
  } catch (error) {
    console.error("Error en respondToFriendRequest:", error);
    return { success: false, error: "Error al responder solicitud" };
  }
}

// --- SISTEMA DE CHAT ---

export async function sendMessage(conversationId: string, text?: string, imageUrl?: string) {
  const session = await auth();
  if (!session) return { success: false, error: "No autorizado" };

  try {
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        text,
        imageUrl
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    revalidatePath(`/mensajes/${conversationId}`);
    return { success: true, message };
  } catch (error) {
    return { success: false, error: "Error al enviar mensaje" };
  }
}

export async function getOrCreateConversation(targetUserId: string) {
  const session = await auth();
  if (!session) return null;

  try {
    // Buscar si ya existe una conversación entre ambos de forma más robusta
    const existingConv = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: targetUserId } } }
        ]
      },
      include: {
        participants: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 }
      }
    });

    if (existingConv) return existingConv;

    // Si no existe, crearla
    const newConv = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.user.id },
            { userId: targetUserId }
          ]
        }
      },
      include: {
        participants: { include: { user: true } }
      }
    });

    return newConv;
  } catch (error) {
    console.error("Error getOrCreateConversation:", error);
    return null;
  }
}

export async function deleteConversation(conversationId: string) {
  const session = await auth();
  if (!session || !session.user) return { error: "No autorizado" };

  try {
    const conv = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId: session.user.id }
        }
      }
    });

    if (!conv) return { error: "Conversación no encontrada" };

    await prisma.conversation.delete({
      where: { id: conversationId }
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return { error: "Error al eliminar el chat" };
  }
}

// --- SISTEMA DE REGALOS ---

export async function initGifts() {
  const gifts = [
    { name: "Prueba Táctica", price: 0, icon: "🎁" },
    { name: "Cofre de Bronce", price: 0.03, icon: "📦" },
    { name: "Moneda de Oro", price: 1.0, icon: "🪙" },
    { name: "Diamante Elite", price: 5.0, icon: "💎" },
    { name: "Trofeo Legendario", price: 10.0, icon: "🏆" },
  ];

  for (const gift of gifts) {
    await prisma.gift.upsert({
      where: { id: gift.name }, // Usamos el nombre como id temporal o buscamos por nombre
      update: { price: gift.price, icon: gift.icon },
      create: { id: gift.name, name: gift.name, price: gift.price, icon: gift.icon }
    });
  }
  return { success: true };
}

export async function getGifts() {
  return await prisma.gift.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" }
  });
}

export async function sendGift(conversationId: string, giftId: string) {
  const session = await auth();
  if (!session || !session.user) return { error: "No autorizado" };

  try {
    const gift = await prisma.gift.findUnique({ where: { id: giftId } });
    if (!gift) return { error: "Regalo no encontrado" };

    // Buscar el destinatario en la conversación
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: { include: { user: true } } }
    });

    if (!conv) return { error: "Conversación no encontrada" };
    const receiver = conv.participants.find(p => p.userId !== session.user.id)?.user;
    if (!receiver) return { error: "Destinatario no encontrado" };

    // Verificar saldo del emisor
    const sender = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!sender) return { error: "Usuario no encontrado" };
    if (sender.balance < gift.price) return { error: "Saldo insuficiente" };

    // Lógica de Comisión
    let platformFee = 0;
    if (gift.price === 1.0) {
      platformFee = 0.40;
    } else if (gift.price === 0.03) {
      platformFee = 0.01;
    } else if (gift.price > 0) {
      // Regla general: 40% de comisión (ajustable)
      platformFee = gift.price * 0.4;
    }

    const recipientGets = gift.price - platformFee;

    // Transacción Atómica
    await prisma.$transaction([
      // Descontar al emisor
      prisma.user.update({
        where: { id: sender.id },
        data: { balance: { decrement: gift.price } }
      }),
      // Sumar al receptor
      prisma.user.update({
        where: { id: receiver.id },
        data: { balance: { increment: recipientGets } }
      }),
      // Registrar la transacción
      prisma.giftTransaction.create({
        data: {
          giftId: gift.id,
          senderId: sender.id,
          receiverId: receiver.id,
          amount: gift.price,
          recipientGets,
          platformFee
        }
      }),
      // Enviar mensaje automático al chat
      prisma.message.create({
        data: {
          conversationId,
          senderId: sender.id,
          text: `🎁 Ha enviado un regalo: ${gift.name} (${gift.icon})`,
        }
      })
    ]);

    return { success: true, balance: sender.balance - gift.price };
  } catch (error) {
    console.error("Error sending gift:", error);
    return { error: "Error al procesar el regalo" };
  }
}
