import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import prisma from "@/lib/prisma";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { ChangeAvatarModal } from "@/components/profile/change-avatar-modal";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  
  // Fetch user using raw SQL to bypass stale Prisma Client cache
  const users = await prisma.$queryRaw<any[]>`SELECT * FROM users WHERE id = ${session?.user?.id}`;
  const user = users[0];

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase">
            Mi <span className="text-cyan-400">Perfil</span>
          </h2>
          <p className="text-slate-400 font-medium mt-2">
            Gestiona tu información personal y configuración de seguridad avanzada.
          </p>
        </div>
        <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 px-4 py-1.5 font-black uppercase tracking-widest">
          {user.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 text-center relative overflow-hidden group shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-md opacity-20 group-hover:opacity-60 transition-opacity" />
              <div className={cn(
                "relative h-32 w-32 rounded-full border-2 border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white text-5xl font-black shadow-2xl transition-all duration-500",
                user.image === 'A' ? "bg-cyan-100 dark:bg-cyan-500 shadow-cyan-500/20" :
                user.image === 'B' ? "bg-blue-100 dark:bg-blue-600 shadow-blue-600/20" :
                user.image === 'G' ? "bg-purple-100 dark:bg-purple-600 shadow-purple-600/20" :
                user.image === 'D' ? "bg-emerald-100 dark:bg-emerald-500 shadow-emerald-500/20" :
                user.image === 'E' ? "bg-orange-100 dark:bg-orange-500 shadow-orange-500/20" :
                user.image === 'Z' ? "bg-pink-100 dark:bg-pink-600 shadow-pink-600/20" :
                "bg-slate-100 dark:bg-[#020617]"
              )}>
                {user.image || user.name?.[0] || "U"}
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-[#0b0e14]" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{user.email}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</p>
                <p className="text-sm font-bold text-green-500 dark:text-green-400 mt-1">Activo</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rango</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">Élite</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 space-y-4 shadow-sm dark:shadow-none transition-colors duration-300">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Acciones Rápidas</h4>
            <EditProfileModal user={{ name: user.name, email: user.email }} />
            <ChangeAvatarModal />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <User className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Detalles de la Cuenta</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Información personal verificada</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Correo Electrónico
                </label>
                <p className="text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">{user.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Nivel de Acceso
                </label>
                <p className="text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">{user.role}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Miembro Desde
                </label>
                <p className="text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 uppercase">
                  {format(new Date(user.createdAt), "MMMM yyyy", { locale: es })}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Verificación 2FA
                </label>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Protegido</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
