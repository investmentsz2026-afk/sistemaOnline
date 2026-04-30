"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Bell, Globe, Save, Loader2, Volume2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface SettingsFormProps {
  userId: string;
}

export const SettingsForm = ({ userId }: SettingsFormProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Theme from next-themes
  const { theme, setTheme } = useTheme();

  // States
  const [language, setLanguage] = useState("es");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedSettings = localStorage.getItem(`settings_${userId}`);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.pushNotifications !== undefined) setPushNotifications(parsed.pushNotifications);
        if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
      } catch (e) {
        console.error("Error loading settings", e);
      }
    }
  }, [userId]);

  const handleSave = () => {
    setIsSubmitting(true);

    const newSettings = {
      language,
      pushNotifications,
      soundEnabled,
    };

    // Simulate network delay for realism
    setTimeout(() => {
      localStorage.setItem(`settings_${userId}`, JSON.stringify(newSettings));
      toast.success("Configuración guardada exitosamente.");
      setIsSubmitting(false);
    }, 800);
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <div className="space-y-8">
      
      {/* Aspecto / Tema */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Moon className="w-5 h-5 text-indigo-400" />
          Apariencia
        </h3>
        
        <div className="flex gap-4">
          <button 
            onClick={() => {
              console.log("Cambiando a modo oscuro...");
              setTheme("dark");
              document.documentElement.classList.add("dark");
              document.documentElement.classList.remove("light");
            }}
            className={cn(
              "flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
              theme === "dark" 
                ? "bg-indigo-500/20 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] text-indigo-300" 
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-400"
            )}
          >
            <Moon className="w-8 h-8" />
            <span className="text-xs font-black uppercase tracking-widest">Oscuro</span>
          </button>
          
          <button 
            onClick={() => {
              console.log("Cambiando a modo claro...");
              setTheme("light");
              document.documentElement.classList.remove("dark");
              document.documentElement.classList.add("light");
            }}
            className={cn(
              "flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
              theme === "light" 
                ? "bg-indigo-500/20 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] text-indigo-300" 
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-400"
            )}
          >
            <Sun className="w-8 h-8" />
            <span className="text-xs font-black uppercase tracking-widest">Claro</span>
          </button>
        </div>
      </section>

      {/* Idioma */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 mt-8">
          <Globe className="w-5 h-5 text-indigo-400" />
          Idioma
        </h3>
        <div className="relative group">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-[#0a102a] border border-white/5 rounded-xl py-4 px-4 text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-bold"
          >
            <option value="es">Español (Latinoamérica)</option>
            <option value="en">English (US)</option>
            <option value="pt">Português (Brasil)</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Globe className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </section>

      {/* Notificaciones */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 mt-8">
          <Bell className="w-5 h-5 text-indigo-400" />
          Notificaciones y Sonidos
        </h3>
        
        <div className="space-y-3">
          {/* Push Notifs */}
          <div 
            onClick={() => setPushNotifications(!pushNotifications)}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-lg", pushNotifications ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400")}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Notificaciones Push</p>
                <p className="text-xs text-slate-400">Recibe alertas sobre tu saldo y ofertas</p>
              </div>
            </div>
            {/* Toggle */}
            <div className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", pushNotifications ? "bg-emerald-500" : "bg-slate-700")}>
              <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md", pushNotifications ? "left-7" : "left-1")}></div>
            </div>
          </div>

          {/* Sound */}
          <div 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-lg", soundEnabled ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-400")}>
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Efectos de Sonido</p>
                <p className="text-xs text-slate-400">Sonidos al completar misiones</p>
              </div>
            </div>
            {/* Toggle */}
            <div className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", soundEnabled ? "bg-indigo-500" : "bg-slate-700")}>
              <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md", soundEnabled ? "left-7" : "left-1")}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting}
        className="w-full mt-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all flex justify-center items-center gap-3 disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Guardar Configuración
          </>
        )}
      </motion.button>
    </div>
  );
};
