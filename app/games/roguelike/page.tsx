"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Trophy, Coins, Lock, Check, ShoppingBag, 
  Sparkles, ListTodo, Star, Play, AlertCircle, Eye, Swords, Heart, Shield
} from "lucide-react";
import { toast } from "sonner";
import { GameDetailScreen } from "@/components/games/GameDetailScreen";

import { 
  getGameProgress, 
  saveGameProgress, 
  claimMissionReward 
} from "@/app/games/actions";
import { RewardedAd } from "@/components/games/AdsPlaceholder";

// Cargar Phaser de forma dinámica para evitar SSR errors
const RoguelikeGame = dynamic(() => import("@/components/games/RoguelikeGame"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full aspect-[16/9] bg-[#020617] rounded-[2.5rem] border border-white/10">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-amber-400 text-xs font-black uppercase tracking-widest mt-4 animate-pulse">
        Cargando Mazmorra...
      </p>
    </div>
  )
});

// Tienda de Boosters para el Roguelike
const BOOSTERS = [
  { id: "health_potion", name: "Poción Curativa", cost: 120, desc: "Restaura la salud completa del héroe instantáneamente.", icon: "❤️" },
  { id: "shield_charm", name: "Amuleto de Hierro", cost: 160, desc: "Aumenta la defensa reduciendo el daño recibido a la mitad.", icon: "🛡️" },
  { id: "strength_scroll", name: "Pergamino de Fuerza", cost: 200, desc: "Duplica el daño infligido con la espada por 10 segundos.", icon: "⚔️" }
];

export default function RoguelikePage() {
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

  // Estados de progresión RPG
  const [userLevel, setUserLevel] = useState<number>(1);
  const [claimedLevelRewards, setClaimedLevelRewards] = useState<string>("");
  const [showPreGame, setShowPreGame] = useState<boolean>(true);

  // Gameplay State
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [levelSuccess, setLevelSuccess] = useState(false);
  const [levelFailed, setLevelFailed] = useState(false);
  const [activeBooster, setActiveBooster] = useState<string | null>(null);

  // HUD
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [killsCount, setKillsCount] = useState(0);

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
      const res = await getGameProgress("roguelike");
      if (res.success) {
        setIsDemoMode(!!res.isDemoMode);
        if (res.isDemoMode) {
          const localProg = localStorage.getItem("roguelike_progress");
          const localMissions = localStorage.getItem("roguelike_missions");

          if (localProg) setProgress(JSON.parse(localProg));
          if (localMissions) setMissions(JSON.parse(localMissions));
          else setMissions(res.missions || []);
        } else {
          setProgress(res.progress);
          setMissions(res.missions || []);
          setRankings(res.rankings || []);
          setUserLevel(res.userLevel || 1);
          setClaimedLevelRewards(res.claimedLevelRewards || "");
        }
      }
    } catch (e) {
      toast.error("Error cargando progreso. Usando modo Demo.");
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGameOver = async (stats: { score: number; coins: number; kills: number; chestsOpened: number; floorReached: number }) => {
    setGameActive(false);

    if (stats.score > 0) {
      // Completó con éxito (piso 5 superado)
      setLevelSuccess(true);
      setCoinsEarned(stats.coins);
      setKillsCount(stats.kills);

      const xpEarned = 250 + selectedLevel * 20;

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
        localStorage.setItem("roguelike_progress", JSON.stringify(updated));
        
        toast.success(`¡Completado! +${stats.coins} monedas y +${xpEarned} XP (Demo)`);
      } else {
        try {
          const res = await saveGameProgress("roguelike", {
            score: stats.score,
            coinsEarned: stats.coins,
            xpEarned,
            levelsCompleted: stats.floorReached,
            kills: stats.kills,
            chestsOpened: stats.chestsOpened,
            timePlayed: 120,
            selectedLevel
          });
          if (res.success) {
            toast.success(`¡Progreso de mazmorra guardado en el servidor!`);
            loadProgress();
          }
        } catch (e) {
          toast.error("Error guardando progreso en el servidor.");
        }
      }
    } else {
      // Perdió (vida llegó a 0)
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
      localStorage.setItem("roguelike_progress", JSON.stringify(updated));

      const updatedMissions = missions.map(m => (m.id === missionId ? { ...m, progress: { ...m.progress, isClaimed: true } } : m));
      setMissions(updatedMissions);
      localStorage.setItem("roguelike_missions", JSON.stringify(updatedMissions));

      toast.success(`Reclamaste ${mission.rewardCoins} monedas en modo Demo.`);
    } else {
      try {
        const res = await claimMissionReward("roguelike", missionId);
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
      localStorage.setItem("roguelike_progress", JSON.stringify(updatedProgress));
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
    setActiveBooster("heal"); // auto-cura la vida completa al revivir
    toast.success("¡Revivido! Recibiste curación completa para continuar tu aventura.");
  };

  const nextLevelXp = Math.pow(progress.level, 2) * 200;
  const currentLevelXp = Math.pow(progress.level - 1, 2) * 200;
  const xpInCurrentLevel = progress.xp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  const xpPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  if (!loading && showPreGame) {
    return (
      <div className="relative z-10 pt-8 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col min-h-screen bg-[#020617] text-white">
        <GameDetailScreen
          title="Mini Roguelike"
          category="Procedural Dungeon"
          desc="Combate criaturas con espada en mano, recoge tesoros, compra mejoras en el herrero y desciende pisos."
          userLevel={userLevel}
          claimedLevelRewards={claimedLevelRewards}
          thumbUrl="https://img.gamemonetize.com/l5s3o2it4qyzc217qldfio11urspud5r/512x384.jpg"
          onPlay={() => setShowPreGame(false)}
        />
      </div>
    );
  }

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
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 italic text-sm">
                Lvl {progress.level}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest gap-4">
                  <span>EXP PROGRESO</span>
                  <span>{progress.xp} / {nextLevelXp} XP</span>
                </div>
                <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-emerald-400 shadow-[0_0_10px_#10b981]" style={{ width: `${xpPercent}%` }} />
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
              <Trophy className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Máximo</span>
                <span className="text-sm font-black text-emerald-400 italic tracking-tighter tabular-nums">{progress.highScore} Pts</span>
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
                  Mini <span className="text-emerald-400">Roguelike</span>
                </h2>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium">Procedural 2D Dungeon Crawler & Real-Time Slash Combat</p>
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-full">
                Nivel {selectedLevel}
              </span>
            </div>

            {/* Canvas wrapper (custom dimension matching RoguelikeGame aspect ratio) */}
            <div className="relative w-full max-w-[550px] aspect-[11/8] overflow-hidden bg-[#020617] rounded-3xl flex items-center justify-center">
              
              {!gameActive && !levelSuccess && !levelFailed && (
                <div className="absolute inset-0 z-20 flex flex-col items-center bg-slate-950/95 backdrop-blur-md p-6 overflow-y-auto">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                    <Swords className="w-5 h-5 text-emerald-400" />
                    MAZMORRA DE MAESTROS (2000 Niveles)
                  </h2>
                  <p className="text-slate-400 text-xs text-center max-w-sm mb-6">Usa las flechas/WASD para moverte y ESPACIO para atacar. Avanza por los portales hasta el piso 5.</p>
                  
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
                              ? "bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 cursor-pointer hover:scale-105 shadow-md shadow-emerald-500/10" 
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
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                    <Star className="w-8 h-8 fill-current" />
                  </div>
                  <h2 className="text-2xl font-black text-emerald-400 italic uppercase tracking-tighter mb-2">¡Mazmorra Conquistada!</h2>
                  <p className="text-slate-400 text-xs mb-6">Completaste el Piso 5. Ganaste +{coinsEarned} monedas y eliminaste a {killsCount} monstruos.</p>
                  
                  <div className="flex flex-row gap-4 justify-center">
                    <button
                      onClick={() => startLevel(selectedLevel + 1)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider italic transition-all hover:scale-105"
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
                  <h2 className="text-2xl font-black text-red-500 italic uppercase tracking-tighter mb-2">¡HAS MUERTO!</h2>
                  <p className="text-slate-500 text-xs mb-6">Tu vida llegó a 0. Las criaturas de la mazmorra te derrotaron.</p>

                  <div className="flex flex-row gap-4 justify-center">
                    {revivesUsed < 10 ? (
                      <button
                        onClick={watchAdToRevive}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider italic transition-all hover:scale-105 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" /> Revivir ({10 - revivesUsed} restantes)
                      </button>
                    ) : (
                      <button
                        onClick={() => startLevel(selectedLevel)}
                        className="bg-white/10 hover:bg-white/20 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider italic transition-all hover:scale-105"
                      >
                        Reiniciar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {gameActive && (
                <RoguelikeGame
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
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-center">Tus Ayudas RPG</span>
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
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              Tienda de Mejoras
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
              <ListTodo className="w-5 h-5 text-emerald-400" />
              Misiones Roguelike
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
                        isClaimed ? "bg-slate-950/20 border-white/5 opacity-50" : isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-tighter">{mission.title}</h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">{mission.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-yellow-400 block">+{mission.rewardCoins} Monedas</span>
                          <span className="text-[9px] font-bold text-emerald-400 block">+{mission.rewardXp} XP</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>PROGRESO</span>
                          <span>{mission.progress.currentValue} / {mission.targetValue}</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full border border-white/5 relative">
                          <div className={`h-full ${isCompleted ? "bg-emerald-400 shadow-[0_0_10px_#10b981]" : "bg-slate-700"}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      {isCompleted && !isClaimed && (
                        <button
                          onClick={() => handleClaimMission(mission.id)}
                          className="w-full mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider italic transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          Reclamar Recompensa
                        </button>
                      )}

                      {isClaimed && (
                        <div className="mt-3 flex items-center justify-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Reclamado
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
