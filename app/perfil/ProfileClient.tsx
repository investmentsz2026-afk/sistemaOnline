"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Star, Trophy, Settings2, ArrowRight, CheckCircle2, Mail, Edit3, ChevronRight, Zap, ArrowLeft, Hash, Copy, Camera, Loader2 } from "lucide-react";
import { BackButton } from "@/components/ui/motion/back-button";
import { ProfileForm } from "./ProfileForm";
import { updateProfileImage } from "../configuracion/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    balance: number;
    image: string | null;
    playerId: string | null;
  };
}

export const ProfileClient = ({ user }: ProfileClientProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(user.image);

  const handleCopyId = () => {
    if (user.playerId) {
      navigator.clipboard.writeText(user.playerId);
      toast.success("¡Player ID copiado!");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande (máx 2MB)");
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setCurrentImage(base64);
        
        const res = await updateProfileImage(base64);
        if (res.success) {
          toast.success("¡Foto de perfil actualizada!");
        } else {
          toast.error("Error al guardar la foto");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Lógica de Niveles: Cada 1000 monedas = 1 Nivel
  const level = Math.floor(user.balance / 1000);
  const coinsForNextLevel = 1000 - (user.balance % 1000);
  const progressPercent = (user.balance % 1000) / 10;

  const getRankName = (lvl: number) => {
    if (lvl < 5) return { name: "BRONCE", color: "text-amber-600", bg: "bg-amber-600/10" };
    if (lvl < 15) return { name: "PLATA", color: "text-slate-400", bg: "bg-slate-400/10" };
    if (lvl < 30) return { name: "ORO", color: "text-yellow-400", bg: "bg-yellow-400/10" };
    return { name: "LEYENDA", color: "text-cyan-400", bg: "bg-cyan-400/10" };
  };

  const rank = getRankName(level);

  return (
    <div className="w-full space-y-8">
      
      {/* VISTA PRINCIPAL (NIVEL Y ESTADÍSTICAS) */}
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div 
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Botón de Volver al Inicio */}
            <BackButton text="Volver al Inicio" href="/inicio" />

            {/* CARD DE NIVEL PROFESIONAL */}
            <div className="bg-[#0b0e14]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Trophy className="w-40 h-40 text-white" />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                <div className="relative group/avatar cursor-pointer" onClick={() => document.getElementById('profile-photo-upload')?.click()}>
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative w-32 h-32 rounded-full border-4 border-white/10 p-1 bg-slate-950 overflow-hidden group-hover/avatar:border-cyan-500/50 transition-all">
                    {isUploading ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                      </div>
                    ) : currentImage ? (
                      <img src={currentImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <User className="w-16 h-16 text-slate-700" />
                      </div>
                    )}
                    
                    {/* Overlay de cámara */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Botón flotante de cámara */}
                  <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-[#050a1f] z-20">
                    <Camera className="w-4 h-4" />
                  </div>

                  {/* Nivel del usuario (Restaurado) */}
                  <div className="absolute -bottom-2 -left-2 bg-[#050a1f] text-white w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl border-2 border-white/10 z-20">
                    {level}
                  </div>

                  <input 
                    type="file" 
                    id="profile-photo-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{user.name || "Usuario"}</h1>
                    <div className="flex items-center gap-2">
                      <div className={cn("px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest", rank.bg, rank.color)}>
                        Rango {rank.name}
                      </div>
                      
                      {/* PLAYER ID BADGE */}
                      <button 
                        onClick={handleCopyId}
                        className="group/id flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full hover:bg-cyan-500 hover:border-cyan-500 transition-all"
                        title="Copiar Player ID"
                      >
                        <Hash className="w-3 h-3 text-cyan-400 group-hover/id:text-slate-950" />
                        <span className="text-[10px] font-black text-cyan-400 group-hover/id:text-slate-950 tracking-[0.2em]">
                          {user.playerId || "------"}
                        </span>
                        <Copy className="w-2.5 h-2.5 text-cyan-600 group-hover/id:text-slate-950 opacity-0 group-hover/id:opacity-100 transition-all" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center md:justify-start gap-2">
                    <Shield className="w-3.5 h-3.5" /> {user.role} <span className="mx-2">•</span> <Mail className="w-3.5 h-3.5" /> {user.email}
                  </p>
                </div>
              </div>

              {/* BARRA DE PROGRESO DE NIVEL */}
              <div className="space-y-6 bg-black/20 p-8 rounded-[2rem] border border-white/5">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel Actual</p>
                    <p className="text-2xl font-black text-white italic">Nivel {level}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Siguiente Nivel</p>
                    <p className="text-sm font-black text-slate-400">{coinsForNextLevel} monedas restantes</p>
                  </div>
                </div>
                
                <div className="relative h-6 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-full relative"
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-12 bg-white/20 blur-md"></div>
                  </motion.div>
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  <span>{user.balance % 1000} EXP</span>
                  <span>1000 EXP TOTAL</span>
                </div>
              </div>
            </div>

            {/* ACCIONES Y ESTADÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0b0e14]/60 border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-all"
                   onClick={() => setIsEditing(true)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic">Editar Perfil</h3>
                    <p className="text-[10px] font-medium text-slate-500">Cambia tu nombre o foto</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-all group-hover:translate-x-1" />
              </div>

              <div className="bg-[#0b0e14]/60 border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic">Ganancias Totales</h3>
                    <p className="text-[10px] font-medium text-slate-500">Balance: {(user.balance / 1000).toFixed(2)} USD</p>
                  </div>
                </div>
                <div className="text-xl font-black text-white italic">{(user.balance / 1000).toFixed(2)}</div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* FORMULARIO DE EDICIÓN */
          <motion.div 
            key="edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-[#0b0e14] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
              <div className="mb-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volver al Perfil</span>
                </button>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Ajustes de Cuenta</h2>
                    <p className="text-xs text-slate-500 font-medium">Actualiza tu información personal</p>
                  </div>
                </div>

                <ProfileForm user={{ name: user.name, email: user.email }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
