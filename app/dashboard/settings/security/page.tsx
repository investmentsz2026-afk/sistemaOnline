import { auth } from "@/lib/auth";
import { Shield, Lock, Smartphone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsHeader } from "@/components/admin/settings-header";

export default async function SecuritySettingsPage() {
  const session = await auth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SettingsHeader 
        title="Ajustes de Seguridad" 
        subtitle="Protege tu cuenta con autenticación avanzada y gestión de claves."
        colorClass="text-purple-400"
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Password Section */}
        <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Cambiar Contraseña</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Se recomienda actualizarla cada 90 días</p>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña Actual</label>
              <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl h-14 px-6 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl h-14 px-6 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all" />
            </div>
            <Button className="h-14 px-10 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-500/20">
              Actualizar Clave
            </Button>
          </div>
        </div>

        {/* 2FA Section */}
        <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Doble Factor (2FA)</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Añade una capa extra de protección</p>
              </div>
            </div>
            <Button variant="outline" className="h-12 border-slate-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-black uppercase tracking-widest text-[10px] rounded-xl px-8">
              Configurar 2FA
            </Button>
          </div>
        </div>

        {/* Sessions Section */}
        <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sesiones Activas</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Gestiona tus dispositivos conectados</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Sesión Actual (Windows PC)</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lima, Perú • Ahora</p>
                </div>
              </div>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full">En Línea</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
