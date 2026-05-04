"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Bell, Globe, Save, Loader2, Volume2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { updateProfileImage } from "./actions";
import { Camera, User as UserIcon } from "lucide-react";

interface SettingsFormProps {
  userId: string;
  initialImage: string | null;
}

export const SettingsForm = ({ userId, initialImage }: SettingsFormProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Theme from next-themes
  const { theme, setTheme } = useTheme();

  // States
  const [language, setLanguage] = useState("es");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Profile Image States
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // 1. Guardar ajustes locales
      const newSettings = {
        language,
        pushNotifications,
        soundEnabled,
      };
      localStorage.setItem(`settings_${userId}`, JSON.stringify(newSettings));

      // 2. Si hay una nueva imagen, subirla al servidor
      if (imagePreview) {
        const result = await updateProfileImage(imagePreview);
        if (!result.success) {
          toast.error("Error al guardar la foto de perfil");
        }
      }

      toast.success("Configuración guardada exitosamente.");
    } catch (error) {
      toast.error("Ocurrió un error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Límite de 2MB
        toast.error("La imagen es demasiado grande (máx 2MB)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <div className="space-y-10">
      
      {/* SECCIÓN: FOTO DE PERFIL */}
      <section className="space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Camera className="w-5 h-5 text-indigo-400" />
          Foto de Perfil
        </h3>
        
        <div className="flex flex-col items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 group relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative group/avatar cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
            <div className="w-32 h-32 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-slate-700" />
                </div>
              )}
              
              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-2 bg-indigo-500 rounded-full shadow-xl border-2 border-[#0b0e14]">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <input 
              type="file" 
              id="photo-upload" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <button 
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest transition-all"
            >
              Cambiar Foto
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Formato JPG, PNG (Máx 2MB)</p>
          </div>
        </div>
      </section>

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
