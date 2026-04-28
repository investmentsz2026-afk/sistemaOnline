import { auth } from "@/lib/auth";
import { ModernCard } from "@/components/ui/motion/modern-card";
import { AnimatedContainer } from "@/components/ui/motion/animated-container";
import { 
  Users, 
  CreditCard, 
  Activity, 
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Zap,
  History
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await auth();

  // Fetch real data from DB
  const [userCount, auditCount, recentAudits] = await Promise.all([
    prisma.user.count({
      where: { role: "CLIENT" }
    }),
    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
        },
      },
    }),
    prisma.auditLog.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  const stats = [
    {
      title: "Usuarios Totales",
      value: userCount.toString(),
      change: "Registrados en sistema",
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10"
    },
    {
      title: "Acciones Hoy",
      value: auditCount.toString(),
      change: "Eventos detectados",
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "Nivel de Seguridad",
      value: "Máximo",
      change: "Auditoría activa",
      icon: ShieldCheck,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10"
    },
    {
      title: "Plan Activo",
      value: "Enterprise",
      change: "Suscripción Vitalicia",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">
            Sistema <span className="text-cyan-400">Activo</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg">
            Bienvenido, <span className="text-white font-bold">{session?.user?.name || "Comandante"}</span>. Todo bajo control.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Estado: Operativo</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <ModernCard key={stat.title} className="!p-8 group">
            <div className="flex items-start justify-between mb-6">
              <div className={cn("p-4 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{stat.title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
              </div>
              <p className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest pt-2">{stat.change}</p>
            </div>
          </ModernCard>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <ModernCard className="col-span-4 !p-10" hoverEffect={false}>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Flujo de Actividad</h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <TrendingUp className="h-3 w-3 text-cyan-400" />
              <span>Tiempo Real</span>
            </div>
          </div>
          <div className="h-[350px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[2rem] bg-black/20">
            <Activity className="h-12 w-12 text-slate-800 mb-4 animate-pulse" />
            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Analizando Movimientos...</p>
          </div>
        </ModernCard>

        <ModernCard className="col-span-3 !p-10" hoverEffect={false}>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Registros Recientes</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300">Ver Todo</button>
          </div>
          <div className="space-y-6">
            {recentAudits.length === 0 ? (
              <div className="py-20 text-center">
                <History className="w-10 h-10 text-slate-800 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sin actividad reciente</p>
              </div>
            ) : (
              recentAudits.map((log) => (
                <ActivityLogItem 
                  key={log.id}
                  title={log.action} 
                  time={formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: es })} 
                  desc={`${log.user?.name || "Sistema"}: ${log.description}`} 
                  status={log.action.includes("DELETE") ? "danger" : log.action.includes("UPDATE") ? "warning" : "success"}
                />
              ))
            )}
          </div>
        </ModernCard>
      </div>
    </div>
  );
}

function ActivityLogItem({ title, time, desc, status }: { title: string, time: string, desc: string, status: string }) {
  const statusColors = {
    secure: "bg-cyan-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  return (
    <div className="group flex gap-5 items-start p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
      <div className={cn("mt-1 w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]", statusColors[status as keyof typeof statusColors] || "bg-slate-500")} />
      <div className="space-y-1 overflow-hidden">
        <div className="flex items-center justify-between w-full">
          <p className="text-xs font-black text-white uppercase tracking-tight truncate mr-2">{title}</p>
          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{time}</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium leading-tight line-clamp-1">{desc}</p>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

