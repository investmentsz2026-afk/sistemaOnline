import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllTickets } from "@/app/soporte/actions";
import { SupportAdminClient } from "./SupportAdminClient";

export default async function AdminSupportPage() {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/login");
  }

  const initialTickets = await getAllTickets();

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tight text-white">
            Gestión de <span className="text-cyan-400">Soporte</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
            Responde los reclamos y mensajes de los jugadores
          </p>
        </div>
        <div className="bg-[#1a1c26] border border-white/5 px-6 py-3 rounded-2xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Total Pendientes</span>
          <span className="text-2xl font-black text-yellow-500 tabular-nums">
            {initialTickets.filter((t: any) => t.status === "PENDING").length}
          </span>
        </div>
      </div>

      <SupportAdminClient initialTickets={initialTickets as any} />
    </div>
  );
}
