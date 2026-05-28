"use client";

import { useState, useEffect } from "react";
import { Award, Coins, CheckCircle2 } from "lucide-react";
import { claimLevelReward } from "@/app/games/actions";
import { LEVEL_REWARDS } from "@/app/games/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LevelRewardsTimelineProps {
  gameId: string;
  userLevel: number;
  initialClaimedLevelRewards: string;
  onRewardClaimed?: () => void;
}

export function LevelRewardsTimeline({ 
  gameId,
  userLevel, 
  initialClaimedLevelRewards,
  onRewardClaimed
}: LevelRewardsTimelineProps) {
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null);
  const [claimedLevels, setClaimedLevels] = useState<string[]>(
    initialClaimedLevelRewards ? initialClaimedLevelRewards.split(",").map(c => c.trim()) : []
  );

  useEffect(() => {
    setClaimedLevels(initialClaimedLevelRewards ? initialClaimedLevelRewards.split(",").map(c => c.trim()) : []);
  }, [initialClaimedLevelRewards]);

  const handleClaimLevel = async (lvl: number) => {
    setClaimingLevel(lvl);
    try {
      const res = await claimLevelReward(gameId, lvl);
      if (res.success) {
        toast.success(`¡Bono reclamado! +$${res.rewardAmount?.toFixed(2)} acreditados a tu balance.`);
        setClaimedLevels(prev => [...prev, lvl.toString()]);
        if (onRewardClaimed) onRewardClaimed();
      } else {
        toast.error(res.error || "No se pudo reclamar.");
      }
    } catch (e) {
      toast.error("Error de conexión.");
    } finally {
      setClaimingLevel(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight uppercase italic">
            Premios por <span className="text-cyan-400">Nivel RPG</span>
          </h2>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest max-w-lg leading-relaxed">
            Sube de nivel general jugando cualquiera de nuestros 5 juegos AAA. ¡Alcanza la meta y desbloquea dinero directo a tu balance!
          </p>
        </div>
        <Award className="absolute -right-4 -bottom-4 w-40 h-40 text-white/10 rotate-12" />
      </div>

      {/* Línea de Tiempo */}
      <div className="relative space-y-6">
        {/* Línea vertical discontinua para la línea de tiempo */}
        <div className="absolute left-[23px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-white/10 pointer-events-none"></div>

        {Object.entries(LEVEL_REWARDS).map(([lvlStr, reward]) => {
          const lvl = parseInt(lvlStr);
          const isReached = userLevel >= lvl;
          const isClaimed = claimedLevels.includes(lvlStr);
          
          return (
            <div key={lvl} className="flex items-center gap-4 sm:gap-6 relative">
              {/* Círculo indicador de nivel */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-black z-10 text-xs border-2 shadow-md flex-shrink-0 transition-all duration-300",
                isClaimed 
                  ? "bg-slate-900 border-slate-800 text-slate-500 shadow-none" 
                  : isReached 
                    ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-cyan-500/25 animate-pulse" 
                    : "bg-slate-950 border-white/5 text-slate-600"
              )}>
                {lvl}
              </div>

              {/* Tarjeta tipo cápsula */}
              <div className={cn(
                "flex-1 bg-[#111626] border p-4 sm:p-5 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:bg-[#151c30] hover:border-white/10",
                isClaimed 
                  ? "border-slate-800 opacity-60 bg-[#111626]/40" 
                  : isReached 
                    ? "border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)] bg-cyan-950/5" 
                    : "border-white/5"
              )}>
                <div className="text-center sm:text-left">
                  <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                    {lvl === 1 ? "¡Instala el Juego!" : `Completar Mundo ${lvl}`}
                  </h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {isClaimed 
                      ? "Recompensa reclamada" 
                      : isReached 
                        ? "¡Meta alcanzada! Reclama tu efectivo." 
                        : `Faltan ${lvl - userLevel} niveles para desbloquear.`}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-emerald-400 italic tabular-nums">
                      +${reward.toFixed(2)}
                    </span>
                    <Coins className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  </div>

                  {isClaimed ? (
                    <span className="text-[9px] font-black uppercase text-slate-600 bg-slate-950/50 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" /> Reclamado
                    </span>
                  ) : isReached ? (
                    <button
                      onClick={() => handleClaimLevel(lvl)}
                      disabled={claimingLevel !== null}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    >
                      {claimingLevel === lvl ? "Cargando..." : "Reclamar"}
                    </button>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-slate-600 bg-slate-950 border border-white/5 px-4 py-2 rounded-xl">
                      Bloqueado
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
