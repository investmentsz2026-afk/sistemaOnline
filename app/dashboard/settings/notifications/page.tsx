import { Bell, Mail, MessageSquare, Monitor } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SettingsHeader } from "@/components/admin/settings-header";

export default function NotificationsSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SettingsHeader 
        title="Ajustes de Notificaciones" 
        subtitle="Controla cómo y cuándo recibes alertas sobre el sistema."
        colorClass="text-blue-400"
      />

      <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 divide-y divide-slate-100 dark:divide-white/5 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="pb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Alertas por Email</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Resúmenes diarios y actividad crítica</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Resumen Semanal de Actividad</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Nuevos Accesos de Seguridad</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Alertas de Auditoría</Label>
              <Switch />
            </div>
          </div>
        </div>

        <div className="py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
              <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Push en Tiempo Real</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Alertas directas en tu navegador</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Nuevos Miembros Registrados</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Cambios en Configuración</Label>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
