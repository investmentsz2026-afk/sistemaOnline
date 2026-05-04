import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { MobileBottomNav } from "@/components/landing/MobileBottomNav";
import { MessagesClient } from "./MessagesClient";

export default async function MensajesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Cargar amigos aceptados
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { senderId: session.user.id, status: "ACCEPTED" },
        { receiverId: session.user.id, status: "ACCEPTED" }
      ]
    },
    include: {
      sender: true,
      receiver: true
    }
  });

  const friends = friendships.map(f => 
    f.senderId === session.user.id ? f.receiver : f.sender
  );

  // Cargar solicitudes pendientes
  const pendingRequests = await prisma.friendship.findMany({
    where: {
      receiverId: session.user.id,
      status: "PENDING"
    },
    include: {
      sender: true
    }
  });

  // Cargar conversaciones con conteo de no leídos
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

  const initialConversations = conversations.map(conv => ({
    ...conv,
    messages: [...conv.messages].reverse()
  }));

  return (
    <main className="h-[100dvh] bg-[#050a1f] text-white overflow-hidden flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-20 md:pt-28 pb-20 md:pb-0 flex overflow-hidden">
        <MessagesClient 
          initialFriends={friends} 
          initialPending={pendingRequests}
          initialConversations={initialConversations}
          currentUser={session.user}
        />
      </div>

      <MobileBottomNav />
    </main>
  );
}
