import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe,
  Lock,
  ChevronRight
} from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const sections = [
    {
      title: "Perfil",
      desc: "Información personal y visibilidad pública.",
      icon: User,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      href: "/dashboard/profile"
    },
    {
      title: "Seguridad",
      desc: "Contraseñas, 2FA y sesiones activas.",
      icon: Shield,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      href: "/dashboard/settings/security"
    },
    {
      title: "Notificaciones",
      desc: "Alertas de sistema, email y móvil.",
      icon: Bell,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      href: "/dashboard/settings/notifications"
    },
    {
      title: "Apariencia",
      desc: "Temas, colores y efectos visuales.",
      icon: Palette,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      href: "/dashboard/settings/appearance"
    },
    {
      title: "Idioma",
      desc: "Configuración regional y zona horaria.",
      icon: Globe,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      href: "/dashboard/settings/language"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
          Configuración del <span className="text-slate-500 dark:text-slate-400">Sistema</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
          Personaliza tu experiencia y ajusta los parámetros de seguridad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <Link 
            key={idx}
            href={section.href}
            className="group flex items-center justify-between p-8 bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] hover:border-slate-300 dark:hover:border-white/20 transition-all text-left relative overflow-hidden shadow-sm dark:shadow-none"
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${section.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <section.icon className={`w-7 h-7 ${section.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{section.title}</h3>
                <p className="text-slate-500 text-xs font-medium mt-1">{section.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-700 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all relative z-10" />
            
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 ${section.bg} blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity`} />
          </Link>
        ))}

        {/* Security Quick Action Card */}
        <div className="md:col-span-2 mt-4 p-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border border-purple-200 dark:border-white/10 rounded-[3rem] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 dark:bg-white/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-purple-600 dark:text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Tu cuenta está protegida</h3>
                <p className="text-purple-600/80 dark:text-slate-300 text-sm font-medium">Último cambio de contraseña hace 3 meses.</p>
              </div>
            </div>
            <button className="px-8 py-3 bg-purple-600 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
              Verificar Seguridad
            </button>
          </div>
          
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_black_1px,_transparent_1px)] dark:bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]" />
        </div>
      </div>
    </div>
  );
}
