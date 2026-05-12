import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllRedemptions } from "@/app/ofertas/actions";
import { RedeemAdminClient } from "./RedeemAdminClient";

export const metadata = {
  title: "Gestión de Canjeos | Panel Administrativo",
};

export default async function AdminCanjeosPage() {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/login");
  }

  let initialRedemptions: any[] = [];
  let error = null;

  try {
    initialRedemptions = await getAllRedemptions();
  } catch (e) {
    console.error("Error getting redemptions:", e);
    error = "No se pudieron cargar los canjeos. Es posible que debas reiniciar el servidor de desarrollo (npm run dev).";
  }

  if (error) {
    return (
      <div className="p-10 text-center space-y-4">
        <h1 className="text-2xl font-black text-red-500 uppercase">Error de Sincronización</h1>
        <p className="text-slate-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tight text-white">
            Gestión de <span className="text-fuchsia-400">Canjeos</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
            Aprueba o niega las solicitudes de puntos de los jugadores
          </p>
        </div>
        <div className="bg-[#1a1c26] border border-white/5 px-6 py-3 rounded-2xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Pendientes de Revisión</span>
          <span className="text-2xl font-black text-fuchsia-500 tabular-nums">
            {initialRedemptions.filter((r: any) => r.status === "PENDING").length}
          </span>
        </div>
      </div>

      <RedeemAdminClient initialRedemptions={initialRedemptions as any} />
    </div>
  );
}
