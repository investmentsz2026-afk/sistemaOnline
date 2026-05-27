"use client";

import { ChevronLeft, Trophy, Smartphone, Sparkles, Gamepad2, Play } from "lucide-react";
import Link from "next/link";
import { LevelRewardsTimeline } from "@/components/LevelRewardsTimeline";
import { motion } from "framer-motion";

interface GameDetailScreenProps {
  title: string;
  category: string;
  desc: string;
  userLevel: number;
  claimedLevelRewards: string;
  thumbUrl: string;
  onPlay: () => void;
}

export function GameDetailScreen({
  title,
  category,
  desc,
  userLevel,
  claimedLevelRewards,
  thumbUrl,
  onPlay
}: GameDetailScreenProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-32">
      {/* Cabecera con Botón de Atrás */}
      <div className="flex items-center gap-4">
        <Link 
          href="/juegos" 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Detalles del Desafío</span>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Información del Juego</h1>
        </div>
      </div>

      {/* Tarjeta de Información Principal del Juego */}
      <div className="bg-[#0b0e14]/60 border border-white/10 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
          {/* Miniatura del Juego */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 flex-shrink-0 shadow-lg">
            {thumbUrl ? (
              <img src={thumbUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400">
                <Gamepad2 className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Información del Título y Tags */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{title}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-cyan-400" /> Web / Celular
                </span>
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Multi-Premio RPG
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cajas de Estadísticas / Recompensas y Botón Jugar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-2 gap-4">
          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Premios Totales</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 italic tracking-tighter">+$35.55 USD</span>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Duración Meta</span>
            <span className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter">Permanente</span>
          </div>
        </div>

        {/* Botón Jugar y Ganar */}
        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlay}
            className="w-full py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 font-black text-sm sm:text-base uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_10px_40px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            {/* Brillo dinámico de fondo */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
            <Play className="w-5 h-5 fill-current" /> Jugar y Ganar
          </motion.button>
        </div>

        {/* Breve descripción */}
        <div className="mt-6 text-center md:text-left">
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
            ✨ {desc} ¡Sube de nivel tu cuenta de BattleCoins completando las metas de RPG mostradas en las instrucciones de abajo!
          </p>
        </div>
      </div>

      {/* Sección de Instrucciones y Línea de Tiempo */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-lg font-black text-white uppercase tracking-widest italic">Instrucciones de Reto</h3>
          <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
            Progreso Sincronizado
          </span>
        </div>

        {/* Renderizado de la línea de tiempo de recompensas */}
        <LevelRewardsTimeline 
          userLevel={userLevel} 
          initialClaimedLevelRewards={claimedLevelRewards} 
        />
      </div>
    </div>
  );
}
