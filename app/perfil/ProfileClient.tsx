"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Star, Trophy, Settings2, ArrowRight, CheckCircle2, Mail, Edit3, ChevronRight, Zap, ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/ui/motion/back-button";
import { ProfileForm } from "./ProfileForm";
import { cn } from "@/lib/utils";

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    balance: number;
    image: string | null;
  };
}

export const ProfileClient = ({ user }: ProfileClientProps) => {
  const [isEditing, setIsEditing] = useState(false);

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
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative w-32 h-32 rounded-full border-4 border-white/10 p-1 bg-slate-950 overflow-hidden">
                    {user.image ? (
                      <img src={user.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <User className="w-16 h-16 text-slate-700" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl border-4 border-[#0b0e14]">
                    {level}
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">{user.name || "Usuario"}</h1>
                    <div className={cn("px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest", rank.bg, rank.color)}>
                      Rango {rank.name}
                    </div>
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center md:justify-start gap-2">
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
