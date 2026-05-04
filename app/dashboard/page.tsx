import { auth } from "@/lib/auth";
import { ModernCard } from "@/components/ui/motion/modern-card";
import { AnimatedContainer } from "@/components/ui/motion/animated-container";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Activity, 
  ShieldCheck,
  Zap,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  // Si es un cliente, lo mandamos a inicio de inmediato
  if (session?.user?.role === "CLIENT") {
    redirect("/inicio");
  }

  // Si no hay sesión, al login
  if (!session) {
    redirect("/login");
  }

  // Carga de datos básica para asegurar que no falle por timeout
  const userCount = await prisma.user.count({ where: { role: "CLIENT" } });
  
  let auditCount = 0;
  if ((prisma as any).auditLog) {
    auditCount = await (prisma as any).auditLog.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">
            Sistema <span className="text-cyan-400">Activo</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg">
            Bienvenido, <span className="text-white font-bold">{session?.user?.name || "Admin"}</span>.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ModernCard className="!p-8">
           <Users className="h-6 w-6 text-cyan-400 mb-4" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-500">Usuarios</p>
           <h3 className="text-3xl font-black text-white">{userCount}</h3>
        </ModernCard>
        <ModernCard className="!p-8">
           <Activity className="h-6 w-6 text-blue-400 mb-4" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-500">Acciones Hoy</p>
           <h3 className="text-3xl font-black text-white">{auditCount}</h3>
        </ModernCard>
        <Link href="/dashboard/users" className="block group">
          <ModernCard className="!p-8 border-indigo-500/20 group-hover:border-indigo-500/50 transition-all hover:bg-indigo-500/[0.02]">
            <div className="flex justify-between items-start">
              <div>
                <ShieldCheck className="h-6 w-6 text-indigo-400 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Seguridad</p>
                <h3 className="text-3xl font-black text-white">Activa</h3>
              </div>
              <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase mt-4 flex items-center gap-2">
              Gestionar Bloqueos <Zap className="w-3 h-3" />
            </p>
          </ModernCard>
        </Link>
        <Link href="/dashboard/chats" className="block group">
          <ModernCard className="!p-8 border-blue-500/20 group-hover:border-blue-500/50 transition-all hover:bg-blue-500/[0.02]">
            <div className="flex justify-between items-start">
              <div>
                <Activity className="h-6 w-6 text-blue-400 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Moderación</p>
                <h3 className="text-3xl font-black text-white">Chats</h3>
              </div>
              <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-blue-400 uppercase mt-4 flex items-center gap-2">
              Supervisar Mensajes <Zap className="w-3 h-3" />
            </p>
          </ModernCard>
        </Link>
      </div>
    </div>
  );
}
