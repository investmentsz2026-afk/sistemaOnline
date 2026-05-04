import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, ShieldAlert } from "lucide-react";
import AdminChatsClient from "./AdminChatsClient";

export default async function AdminChatsPage() {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/login");
  }

  // Obtener todas las conversaciones con sus últimos mensajes
  const conversations = await prisma.conversation.findMany({
    include: {
      participants: {
        include: { user: true }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/20 rounded-2xl">
          <MessageSquare className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic">Supervisión de Chats</h1>
          <p className="text-slate-500 text-sm font-medium">Monitorea las conversaciones entre usuarios para prevenir fraude y abusos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {conversations.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
            <ShieldAlert className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest">No hay conversaciones activas aún</p>
          </div>
        ) : (
          <AdminChatsClient conversations={conversations} />
        )}
      </div>
    </div>
  );
}
