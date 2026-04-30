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
  const [userCount, auditCount] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.auditLog.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

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
        <ModernCard className="!p-8">
           <ShieldCheck className="h-6 w-6 text-indigo-400 mb-4" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-500">Seguridad</p>
           <h3 className="text-3xl font-black text-white">Activa</h3>
        </ModernCard>
        <ModernCard className="!p-8">
           <Zap className="h-6 w-6 text-amber-400 mb-4" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-500">Estado</p>
           <h3 className="text-3xl font-black text-white">Online</h3>
        </ModernCard>
      </div>
    </div>
  );
}
