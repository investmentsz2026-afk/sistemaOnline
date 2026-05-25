"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Trophy, Coins, Lock, Check, ShoppingBag, 
  Sparkles, ListTodo, Star, Play, AlertCircle, Eye, Shield, Landmark, Activity
} from "lucide-react";
import { toast } from "sonner";

import { 
  getGameProgress, 
  saveGameProgress, 
  claimMissionReward 
} from "@/app/games/actions";
import { RewardedAd } from "@/components/games/AdsPlaceholder";

// Cargar Phaser de forma dinámica para evitar SSR errors
const JumpGame = dynamic(() => import("@/components/games/JumpGame"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full aspect-[16/9] bg-[#020617] rounded-[2.5rem] border border-white/10">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-pink-500 text-xs font-black uppercase tracking-widest mt-4 animate-pulse">
        Cargando Mundo Hardcore...
      </p>
    </div>
  )
});

// Boosters para Jump
const BOOSTERS = [
  { id: "checkpoint", name: "Checkpoint Premium", cost: 120, desc: "Guarda tu posición para no reiniciar desde cero si chocas.", icon: "🚩" },
  { id: "shield", name: "Escudo Temporal", cost: 180, desc: "Protección orbital que absorbe 1 colisión contra un pico.", icon: "🛡️" },
  { id: "slowmo", name: "Cámara Lenta (6s)", cost: 140, desc: "Reduce la velocidad a la mitad para realizar saltos milimétricos.", icon: "⏳" }
];

export default function JumpPage() {
  // RPG State
  const [progress, setProgress] = useState<any>({
    level: 1,
    xp: 0,
    coins: 100,
    highScore: 0,
    boosters: "",
  });
  const [missions, setMissions] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Gameplay State
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [levelSuccess, setLevelSuccess] = useState(false);
  const [levelFailed, setLevelFailed] = useState(false);
  const [activeBooster, setActiveBooster] = useState<string | null>(null);

  // HUD
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Ads
  const [isRewardedOpen, setIsRewardedOpen] = useState(false);
  const [revivesUsed, setRevivesUsed] = useState(0);
  const [triggerRestart, setTriggerRestart] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await getGameProgress("jump");
      if (res.success) {
        setIsDemoMode(!!res.isDemoMode);
        if (res.isDemoMode) {
          const localProg = localStorage.getItem("jump_progress");
          const localMissions = localStorage.getItem("jump_missions");

          if (localProg) setProgress(JSON.parse(localProg));
          if (localMissions) setMissions(JSON.parse(localMissions));
          else setMissions(res.missions || []);
        } else {
          setProgress(res.progress);
          setMissions(res.missions || []);
          setRankings(res.rankings || []);
        }
      }
    } catch (e) {
      toast.error("Error cargando progreso. Iniciando en modo Demo.");
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGameOver = async (stats: { score: number; coins: number; gravityFlips: number }) => {
    setGameActive(false);

    if (stats.score > 0) {
      // Ganó
      setLevelSuccess(true);
      setCoinsEarned(stats.coins);

      const xpEarned = 180 + selectedLevel * 15;

      if (isDemoMode) {
        const nextLevel = Math.max(progress.level, selectedLevel + 1);
        const newXp = progress.xp + xpEarned;
        const newCoins = progress.coins + stats.coins;
        const isNewRecord = stats.score > progress.highScore;
        const newHighScore = isNewRecord ? stats.score : progress.highScore;

        const updated = {
          ...progress,
          level: nextLevel,
          xp: newXp,
          coins: newCoins,
          highScore: newHighScore
        };
        setProgress(updated);
        localStorage.setItem("jump_progress", JSON.stringify(updated));
        
        toast.success(`¡Completado! +${stats.coins} monedas y +${xpEarned} XP (Demo)`);
      } else {
        try {
          const res = await saveGameProgress("jump", {
            score: stats.score,
            coinsEarned: stats.coins,
            xpEarned,
            levelsCompleted: 1,
            gravityFlips: stats.gravityFlips,
            timePlayed: 60
          });
          if (res.success) {
            toast.success(`¡Nivel ${selectedLevel} guardado en el servidor!`);
            loadProgress();
          }
        } catch (e) {
          toast.error("Error guardando progreso en el servidor.");
        }
      }
    } else {
      // Perdió (colisión con pico o caída al vacío)
      setLevelFailed(true);
    }
  };

  const handleClaimMission = async (missionId: string) => {
    if (isDemoMode) {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) return;

      const updated = {
        ...progress,
        coins: progress.coins + mission.rewardCoins,
        xp: progress.xp + mission.rewardXp
      };
      setProgress(updated);
      localStorage.setItem("jump_progress", JSON.stringify(updated));

      const updatedMissions = missions.map(m => (m.id === missionId ? { ...m, progress: { ...m.progress, isClaimed: true } } : m));
      setMissions(updatedMissions);
      localStorage.setItem("jump_missions", JSON.stringify(updatedMissions));

      toast.success(`Reclamaste ${mission.rewardCoins} monedas en modo Demo.`);
    } else {
      try {
        const res = await claimMissionReward("jump", missionId);
        if (res.success) {
          toast.success(`¡Misión reclamada! +${res.rewardCoins} monedas y +${res.realPointsAdded} puntos reales!`);
          loadProgress();
        }
      } catch (e) {
        toast.error("Error al reclamar misión.");
      }
    }
  };

  const getBoosterQty = (id: string) => {
    const list = progress.boosters || "";
    const item = list.split(",").find((b: string) => b.startsWith(`${id}:`));
    if (!item) return 0;
    return parseInt(item.split(":")[1]) || 0;
  };

  const updateBoosterQty = (id: string, delta: number) => {
    const list = progress.boosters || "";
    const items = list.split(",").filter((b: string) => b !== "");
    const index = items.findIndex((b: string) => b.startsWith(`${id}:`));

    if (index >= 0) {
      const qty = parseInt(items[index].split(":")[1]) || 0;
      const newQty = Math.max(0, qty + delta);
      items[index] = `${id}:${newQty}`;
    } else if (delta > 0) {
      items.push(`${id}:${delta}`);
    }

    const newList = items.join(",");
    const updatedProgress = { ...progress, boosters: newList };
    setProgress(updatedProgress);

    if (isDemoMode) {
      localStorage.setItem("jump_progress", JSON.stringify(updatedProgress));
    }
  };

  const handleBuyBooster = (booster: typeof BOOSTERS[0]) => {
    if (progress.coins < booster.cost) {
      toast.error("Monedas insuficientes.");
      return;
    }

    const updated = {
      ...progress,
      coins: progress.coins - booster.cost
    };
    setProgress(updated);
    updateBoosterQty(booster.id, 1);
    toast.success(`¡Compraste 1 ${booster.name}!`);
  };

  const handleUseBooster = (id: string) => {
    const qty = getBoosterQty(id);
    if (qty <= 0) {
      toast.error("No tienes este booster. ¡Cómpralo en la tienda!");
      return;
    }

    setActiveBooster(id);
    updateBoosterQty(id, -1);
  };

  const startLevel = (lvlNum: number) => {
    setSelectedLevel(lvlNum);
    setLevelSuccess(false);
    setLevelFailed(false);
    setGameActive(true);
    setRevivesUsed(0);
    setActiveBooster(null);
    setTriggerRestart(true);
  };

  const watchAdToRevive = () => {
    window.open("https://omg10.com/4/11056718", "_blank");
    setIsRewardedOpen(true);
  };

  const handleReviveAwarded = () => {
    setIsRewardedOpen(false);
    setRevivesUsed(prev => prev + 1);
    setLevelFailed(false);
    setGameActive(true);
    setActiveBooster("shield"); // le da escudo al revivir
    toast.success("¡Revivido! Tienes un escudo de protección activo.");
  };

  const nextLevelXp = Math.pow(progress.level, 2) * 200;
  const currentLevelXp = Math.pow(progress.level - 1, 2) * 200;
  const xpInCurrentLevel = progress.xp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  const xpPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  return (
    <div className="relative z-10 pt-8 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col min-h-screen bg-[#020617] text-white">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Link 
          href="/juegos"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/5 px-4 py-2 rounded-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>

        {!loading && (
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-3xl w-full sm:w-auto">
            <div className="flex items-center gap-3 pr-4 border-r border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center font-black text-pink-400 italic text-sm">
                Lvl {progress.level}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest gap-4">
                  <span>EXP PROGRESO</span>
                  <span>{progress.xp} / {nextLevelXp} XP</span>
                </div>
                <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-pink-500 shadow-[0_0_10px_#ec4899]" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Monedas</span>
                <span className="text-sm font-black text-white italic tracking-tighter tabular-nums">{progress.coins}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
              <Trophy className="w-5 h-5 text-pink-400" />
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Máximo</span>
                <span className="text-sm font-black text-pink-400 italic tracking-tighter tabular-nums">{progress.highScore} Pts</span>
              </div>
            </div>

            {isDemoMode && (
              <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                Demo
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Game Container (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-4 sm:p-6 rounded-[2.5rem] relative overflow-hidden shadow-2xl flex flex-col items-center">
            
            <div className="w-full flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter">
                  Impossible <span className="text-pink-500">Jump</span>
                </h2>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium">Geometry Dash Hardcore Platformer & Gravity Portals</p>
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] bg-pink-500/10 border border-pink-500/20 px-2.5 py-1.5 rounded-full">
                Nivel {selectedLevel}
              </span>
            </div>

            {/* Canvas wrapper (16:9 ratio) */}
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#020617] rounded-3xl flex items-center justify-center">
              
              {!gameActive && !levelSuccess && !levelFailed && (
                <div className="absolute inset-0 z-20 flex flex-col items-center bg-slate-950/95 backdrop-blur-md p-6 overflow-y-auto">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-pink-500 animate-pulse" />
                    HARDCORE ARENA (2000 Niveles)
                  </h2>
                  <p className="text-slate-400 text-xs text-center max-w-sm mb-6">Esquiva los picos letales y haz clic para saltar. ¡Entra en los portales de gravedad invertida!</p>
                  
                  <div className="grid grid-cols-5 gap-3 max-w-md w-full mb-8">
                    {Array.from({ length: 25 }, (_, i) => {
                      const lvlNum = i + 1;
                      const isUnlocked = lvlNum <= progress.level;
                      return (
                        <button
                          key={lvlNum}
                          disabled={!isUnlocked}
                          onClick={() => startLevel(lvlNum)}
                          className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-black transition-all ${
                            isUnlocked 
                              ? "bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-slate-950 cursor-pointer hover:scale-105 shadow-md shadow-pink-500/10" 
                              : "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          <span className="text-sm italic">{lvlNum}</span>
                          {!isUnlocked && <Lock className="w-3 h-3 mt-1 text-slate-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {levelSuccess && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4 animate-bounce">
                    <Star className="w-8 h-8 fill-current" />
                  </div>
                  <h2 className="text-2xl font-black text-pink-500 italic uppercase tracking-tighter mb-2">¡Nivel Superado!</h2>
                  <p className="text-slate-400 text-xs mb-6">Ganaste +{coinsEarned} monedas y +{180 + selectedLevel * 15} XP.</p>
                  
                  <div className="flex flex-row gap-4 justify-center">
                    <button
                      onClick={() => startLevel(selectedLevel + 1)}
                      className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider italic transition-all hover:scale-105"
                    >
                      Siguiente
                    </button>
                    <button
                      onClick={() => {
                        setLevelSuccess(false);
                        setGameActive(false);
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider italic transition-all hover:scale-105"
                    >
                      Volver
                    </button>
                  </div>
                </div>
              )}

              {levelFailed && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-red-500 italic uppercase tracking-tighter mb-2">¡HAS COLISIONADO!</h2>
                  <p className="text-slate-500 text-xs mb-6">Un pico de neón te ha desintegrado en el espacio.</p>

                  <div className="flex flex-row gap-4 justify-center">
                    {revivesUsed === 0 && (
                      <button
                        onClick={watchAdToRevive}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider italic transition-all hover:scale-105 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" /> Revivir (Checkpoint)
                      </button>
                    )}
                    <button
                      onClick={() => startLevel(selectedLevel)}
                      className="bg-white/10 hover:bg-white/20 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider italic transition-all hover:scale-105"
                    >
                      Reiniciar
                    </button>
                  </div>
                </div>
              )}

              {gameActive && (
                <JumpGame
                  level={selectedLevel}
                  onGameOver={handleGameOver}
                  onGameActive={() => {
                    setLevelSuccess(false);
                    setLevelFailed(false);
                    setGameActive(true);
                  }}
                  activeBooster={activeBooster}
                  onBoosterUsed={() => setActiveBooster(null)}
                  triggerRestart={triggerRestart}
                  onRestartComplete={() => setTriggerRestart(false)}
                />
              )}
            </div>

            {gameActive && (
              <div className="w-full max-w-md mt-6">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-center">Tus Ayudas de Gravedad</span>
                <div className="flex justify-center gap-3">
                  {BOOSTERS.map(booster => {
                    const qty = getBoosterQty(booster.id);
                    return (
                      <button
                        key={booster.id}
                        onClick={() => handleUseBooster(booster.id)}
                        className={`p-2.5 rounded-2xl border flex items-center gap-2 transition-all ${
                          qty > 0 
                            ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" 
                            : "bg-slate-950/20 border-white/5 text-slate-600 cursor-not-allowed"
                        }`}
                      >
                        <span className="text-xl">{booster.icon}</span>
                        <div className="text-left text-[9px] font-black uppercase tracking-tight">
                          <span>{booster.name.split(" ")[0]}</span>
                          <span className="block text-slate-400 font-bold">Cant: {qty}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Shop & Missions */}
        <div className="space-y-8">
          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-500" />
              Tienda de Saltos
            </h3>
            <div className="space-y-3">
              {BOOSTERS.map(booster => {
                const qty = getBoosterQty(booster.id);
                return (
                  <div key={booster.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{booster.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-tighter">{booster.name}</h4>
                        <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{booster.desc}</p>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">Tus items: {qty}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuyBooster(booster)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                    >
                      <Coins className="w-3 h-3" /> {booster.cost}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-pink-500" />
              Misiones Jump
            </h3>
            <div className="space-y-4">
              {missions.length === 0 ? (
                <p className="text-slate-500 text-xs italic text-center py-4">Cargando...</p>
              ) : (
                missions.map(mission => {
                  const percent = Math.min(100, (mission.progress.currentValue / mission.targetValue) * 100);
                  const isCompleted = mission.progress.isCompleted;
                  const isClaimed = mission.progress.isClaimed;

                  return (
                    <div 
                      key={mission.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        isClaimed ? "bg-slate-950/20 border-white/5 opacity-50" : isCompleted ? "bg-pink-500/5 border-pink-500/20" : "bg-white/5 border-white/5"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-tighter">{mission.title}</h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">{mission.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-yellow-400 block">+{mission.rewardCoins} Monedas</span>
                          <span className="text-[9px] font-bold text-pink-400 block">+{mission.rewardXp} XP</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>PROGRESO</span>
                          <span>{mission.progress.currentValue} / {mission.targetValue}</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full border border-white/5 relative">
                          <div className={`h-full ${isCompleted ? "bg-pink-400 shadow-[0_0_10px_#ec4899]" : "bg-slate-700"}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      {isCompleted && !isClaimed && (
                        <button
                          onClick={() => handleClaimMission(mission.id)}
                          className="w-full mt-3 bg-pink-500 hover:bg-pink-400 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider italic transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                        >
                          Reclamar Recompensa
                        </button>
                      )}

                      {isClaimed && (
                        <div className="mt-3 flex items-center justify-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <Check className="w-3.5 h-3.5 text-pink-500" /> Reclamado
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <RewardedAd isOpen={isRewardedOpen} onRewardClaimed={handleReviveAwarded} onClose={() => setIsRewardedOpen(false)} />
    </div>
  );
}
