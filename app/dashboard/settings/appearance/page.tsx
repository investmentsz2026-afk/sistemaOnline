"use client";

import { Palette, Sun, Moon, Monitor, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/components/admin/settings-header";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { id: "dark", name: "Oscuro Profundo", icon: Moon },
    { id: "light", name: "Luz Solar", icon: Sun },
    { id: "system", name: "Sistema", icon: Monitor },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SettingsHeader 
        title="Personalizar Apariencia" 
        subtitle="Ajusta los colores y el estilo visual de tu entorno de trabajo."
        colorClass="text-pink-500"
      />

      <div className="space-y-12">
        {/* Theme Selection */}
        <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm dark:shadow-none transition-colors duration-300">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8">Selección de Tema</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "relative group aspect-[4/3] rounded-[2rem] border-2 flex flex-col items-center justify-center gap-4 transition-all overflow-hidden",
                  theme === t.id 
                    ? "border-pink-500 bg-pink-500/5 dark:bg-pink-500/10 shadow-lg shadow-pink-500/10" 
                    : "border-slate-100 dark:border-white/5 hover:border-pink-200 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/5"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", 
                  theme === t.id ? "bg-pink-500/20" : "bg-slate-200/50 dark:bg-white/10"
                )}>
                  <t.icon className={cn("w-6 h-6", theme === t.id ? "text-pink-500" : "text-slate-400 dark:text-slate-500")} />
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-widest", theme === t.id ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500")}>
                  {t.name}
                </span>
                
                {theme === t.id && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Layout Density */}
        <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm dark:shadow-none transition-colors duration-300">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8">Densidad de Interfaz</h3>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <button className="flex-1 w-full p-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl border-2 border-pink-500 flex items-center justify-between transition-all">
              <div className="flex items-center gap-4">
                <Layout className="w-5 h-5 text-pink-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Modo Confortable</span>
              </div>
              <div className="w-4 h-4 rounded-full border-4 border-pink-500" />
            </button>
            <button className="flex-1 w-full p-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <Layout className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Modo Compacto</span>
              </div>
              <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-white/20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
