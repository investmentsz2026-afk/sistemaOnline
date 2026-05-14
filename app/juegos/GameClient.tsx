"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Clock, Trophy, Gamepad2, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { addPoints } from "@/app/ofertas/actions";

interface Game {
  id: string;
  title: string;
  category: string;
  thumb: string;
  url: string;
}

interface GameClientProps {
  initialGames: Game[];
}

export const GameClient = ({ initialGames }: GameClientProps) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [playTime, setPlayTime] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sistema de recompensas: +10 puntos cada 300 segundos (5 min)
  const REWARD_INTERVAL = 300; 
  const REWARD_AMOUNT = 10;

  useEffect(() => {
    if (selectedGame) {
      setPlayTime(0);
      timerRef.current = setInterval(() => {
        setPlayTime(prev => {
          const next = prev + 1;
          if (next % REWARD_INTERVAL === 0) {
            handleReward();
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setPlayTime(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedGame]);

  const handleReward = async () => {
    const result = await addPoints(REWARD_AMOUNT, `Jugando ${selectedGame?.title}`);
    if (result.success) {
      setPointsEarned(prev => prev + REWARD_AMOUNT);
      toast.success(`+${REWARD_AMOUNT} Puntos por tu tiempo de juego!`, {
        icon: <Trophy className="w-4 h-4 text-emerald-400" />,
        style: { background: "#064e3b", color: "#fff", border: "1px solid #059669" }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-12">
      {/* Grid de Juegos optimizado para móvil (3 columnas) */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {initialGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedGame(game)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0b0e14] mb-2 md:mb-4">
              <img 
                src={game.thumb} 
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-40 group-hover:opacity-80 transition-opacity"></div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                  <Play className="w-5 h-5 md:w-8 md:h-8 text-slate-950 fill-current ml-1" />
                </div>
              </div>
            </div>
            <h3 className="text-[9px] md:text-xl font-black text-white italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors text-center line-clamp-1">
              {game.title}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Modal de Juego Activo - Z-INDEX SUPREMO para que nada lo tape */}
      <AnimatePresence>
        {selectedGame && (
          <div className="fixed inset-0 z-[9999] flex flex-col bg-black/98 backdrop-blur-3xl overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col h-full w-full"
            >
              {/* Header del Juego - Optimizado para NO ser tapado */}
              <div className="pt-safe px-4 pb-4 border-b border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedGame(null)}
                    className="w-10 h-10 md:w-12 md:h-12 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-xl md:rounded-2xl flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-sm md:text-xl font-black text-white italic uppercase tracking-tighter truncate max-w-[150px] md:max-w-none">
                      {selectedGame.title}
                    </h2>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-cyan-400" />
                        <span className="text-[8px] md:text-[10px] font-black text-white uppercase tabular-nums">
                          {formatTime(playTime)}
                        </span>
                      </div>
                      <span className="text-slate-800">|</span>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                          +{pointsEarned} Pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="text-[7px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest whitespace-nowrap">Acreditación Activa</span>
                </div>
              </div>

              {/* Iframe del Juego - CENTRADO Y RESPONSIVE TOTAL */}
              <div className="flex-1 w-full h-full bg-black relative flex items-center justify-center p-0">
                <iframe 
                  src={selectedGame.url}
                  className="w-full h-full border-none"
                  title={selectedGame.title}
                  allow="clipboard-write; fullscreen"
                  scrolling="no"
                ></iframe>
              </div>

              {/* Barra de Progreso Inferior - Fuera del área de botones del celular */}
              <div className="h-1 bg-white/5 w-full relative mb-safe">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                  style={{ width: `${(playTime % REWARD_INTERVAL) / REWARD_INTERVAL * 100}%` }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
