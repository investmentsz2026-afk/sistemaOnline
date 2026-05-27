"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Trophy, Coins, Lock, Check, ShoppingBag, 
  Sparkles, ListTodo, Star, Play, RefreshCw, AlertCircle, Trash2, HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { GameDetailScreen } from "@/components/games/GameDetailScreen";

import { 
  getGameProgress, 
  saveGameProgress, 
  claimMissionReward 
} from "@/app/games/actions";
import { RewardedAd } from "@/components/games/AdsPlaceholder";

// Cargar Phaser de forma dinámica
const PuzzleGame = dynamic(() => import("@/components/games/PuzzleGame"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full max-w-[450px] sm:max-w-[480px] aspect-square bg-slate-950/80 rounded-[2.5rem] border border-white/10">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mt-4 animate-pulse">
        Cargando Tablero Cuántico...
      </p>
    </div>
  )
});

// Catálogo de boosters para compra
const BOOSTERS = [
  { id: "hammer", name: "Martillo Destructor", cost: 150, desc: "Elimina cualquier gema inmediatamente del tablero sin usar movimiento.", icon: "🔨" },
  { id: "color_bomb", name: "Bomba de Color", cost: 300, desc: "Explota y elimina todas las gemas del mismo color seleccionado.", icon: "🔮" },
  { id: "extra_moves", name: "Movimientos Extra (+5)", cost: 200, desc: "Añade 5 movimientos extra inmediatamente a tu partida actual.", icon: "➕" }
];

export default function PuzzlePage() {
  // RPG State
  const [progress, setProgress] = useState<any>({
    level: 1, // Nivel actual en la saga (1-100)
    xp: 0,
    coins: 150,
    highScore: 0,
    boosters: "hammer:1", // formato "boosterId:qty,boosterId:qty"
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

  // HUD de la partida activa
  const [currentScore, setCurrentScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(20);
  const [combosActive, setCombosActive] = useState(0);

  // Ads y Control de Escena
  const [isRewardedOpen, setIsRewardedOpen] = useState(false);
  const [revivesUsed, setRevivesUsed] = useState(0);
  const [triggerRestart, setTriggerRestart] = useState(false);

  // Carga inicial
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await getGameProgress("puzzle");
      if (res.success) {
        setIsDemoMode(!!res.isDemoMode);
        if (res.isDemoMode) {
          const localProg = localStorage.getItem("puzzle_progress");
          const localMissions = localStorage.getItem("puzzle_missions");

          if (localProg) {
            setProgress(JSON.parse(localProg));
          }
          if (localMissions) {
            setMissions(JSON.parse(localMissions));
          } else {
            setMissions(res.missions || []);
          }
          setRankings([]);
        } else {
          // Servidor
          // Formatear boosters desde stats del server si aplica, o guardarlos
          setProgress(res.progress);
          setMissions(res.missions || []);
          setRankings(res.rankings || []);
          setUserLevel(res.userLevel || 1);
          setClaimedLevelRewards(res.claimedLevelRewards || "");
        }
      }
    } catch (e) {
      toast.error("Error cargando el progreso. Usando modo Demo.");
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  // Dinámica de nivel (metas con menos movimientos para mayor dificultad)
  const getLevelConfig = (lvl: number) => {
    let movesLimit = 15;
    if (lvl === 1) movesLimit = 4;
    else if (lvl === 2) movesLimit = 6;
    else if (lvl === 3) movesLimit = 8;
    else if (lvl === 4) movesLimit = 9;
    else if (lvl === 5) movesLimit = 10;
    else if (lvl === 6) movesLimit = 11;
    else if (lvl === 7) movesLimit = 12;
    else if (lvl === 8) movesLimit = 13;
    else if (lvl === 9) movesLimit = 14;
    else {
      movesLimit = Math.max(8, 15 - Math.floor((lvl - 10) / 4));
    }
    return {
      scoreGoal: lvl * 1000,
      movesLimit
    };
  };

  const currentLevelConfig = getLevelConfig(selectedLevel);

  // Sincronizar el final exitoso del nivel
  const handleLevelSuccess = async (stats: { score: number; stars: number }) => {
    setGameActive(false);
    setLevelSuccess(true);

    const coinsEarned = 30 + stats.stars * 10 + selectedLevel * 2;
    const xpEarned = 100 + selectedLevel * 10;

    if (isDemoMode) {
      // Guardar localmente
      const nextLevel = Math.max(progress.level, selectedLevel + 1);
      const newXp = progress.xp + xpEarned;
      const newCoins = progress.coins + coinsEarned;
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
      localStorage.setItem("puzzle_progress", JSON.stringify(updated));

      // Misiones locales
      const updatedMissions = missions.map(m => {
        let increment = 0;
        if (m.targetType === "levelsCompleted") increment = 1;
        if (m.targetType === "score" && stats.score >= m.targetValue) increment = m.targetValue;
        if (m.targetType === "gamesPlayed") increment = 1;

        const val = Math.min(m.targetValue, m.progress.currentValue + increment);
        return {
          ...m,
          progress: {
            ...m.progress,
            currentValue: val,
            isCompleted: val >= m.targetValue
          }
        };
      });

      setMissions(updatedMissions);
      localStorage.setItem("puzzle_missions", JSON.stringify(updatedMissions));

      toast.success(`Nivel ${selectedLevel} Completado! +${coinsEarned} monedas y +${xpEarned} XP!`, {
        icon: <Star className="text-yellow-400 fill-current animate-spin" />
      });
    } else {
      // Servidor
      try {
        const res = await saveGameProgress("puzzle", {
          score: stats.score,
          coinsEarned,
          xpEarned,
          levelsCompleted: 1,
          timePlayed: 120,
          selectedLevel
        });

        if (res.success) {
          toast.success(`¡Nivel ${selectedLevel} completado en el servidor!`);
          // Aumentar el nivel desbloqueado del usuario si superó su nivel máximo
          const nextLvl = Math.max(progress.level, selectedLevel + 1);
          setProgress((prev: any) => ({ ...prev, level: nextLvl }));
          loadProgress();
        }
      } catch (e) {
        toast.error("Error al persistir el nivel en el servidor.");
      }
    }
  };

  // Nivel fallido
  const handleLevelFailed = () => {
    setGameActive(false);
    setLevelFailed(true);
  };

  // Reclamar misiones
  const handleClaimMission = async (missionId: string) => {
    if (isDemoMode) {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) return;

      const updatedProgress = {
        ...progress,
        coins: progress.coins + mission.rewardCoins,
        xp: progress.xp + mission.rewardXp
      };

      setProgress(updatedProgress);
      localStorage.setItem("puzzle_progress", JSON.stringify(updatedProgress));

      const updatedMissions = missions.map(m => {
        if (m.id === missionId) {
          return {
            ...m,
            progress: { ...m.progress, isClaimed: true }
          };
        }
        return m;
      });

      setMissions(updatedMissions);
      localStorage.setItem("runner_missions", JSON.stringify(updatedMissions));

      toast.success(`Ganaste ${mission.rewardCoins} monedas y ${mission.rewardXp} XP (Demo)`);
    } else {
      try {
        const res = await claimMissionReward("puzzle", missionId);
        if (res.success) {
          toast.success(`¡Misión reclamada! +${res.rewardCoins} monedas del juego y +${res.realPointsAdded} puntos reales!`, {
            style: { background: "#064e3b", color: "#fff", border: "1px solid #059669" }
          });
          loadProgress();
        }
      } catch (e) {
        toast.error("Error procesando recompensa.");
      }
    }
  };

  // Tienda de Boosters
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
      localStorage.setItem("puzzle_progress", JSON.stringify(updatedProgress));
    }
    // NOTA: Para producción real, se guardaría en stats del ServerAction
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
      toast.error("No tienes este booster en tu inventario. ¡Cómpralo en la tienda!");
      return;
    }

    if (id === "extra_moves") {
      // El de movimientos extra se consume inmediatamente y suma +5 en React
      setMovesLeft(prev => prev + 5);
      updateBoosterQty(id, -1);
      toast.success("¡+5 Movimientos añadidos!");
    } else {
      // Activar booster para que Phaser lo gestione
      setActiveBooster(id);
      toast.info(`Booster ${id === "hammer" ? "Martillo" : "Bomba de Color"} activo. ¡Toca una gema en el tablero para aplicarlo!`);
    }
  };

  // Iniciar nivel directamente sin anuncios automáticos
  const startLevel = (lvlNum: number) => {
    setSelectedLevel(lvlNum);
    confirmStartLevel();
  };

  const confirmStartLevel = () => {
    setLevelSuccess(false);
    setLevelFailed(false);
    setCurrentScore(0);
    setCombosActive(0);
    
    const config = getLevelConfig(selectedLevel);
    setMovesLeft(config.movesLimit);
    
    setGameActive(true);
    setRevivesUsed(0);
    setActiveBooster(null);
    setTriggerRestart(true); // Indicar a Phaser que reinicie el tablero
  };

  // Revivir en el Puzzle (conseguir 5 movimientos extra por ver un anuncio recompensado de Monetag)
  const watchAdToRevive = () => {
    // Abrir el enlace directo de anuncios de Monetag en nueva pestaña
    window.open("https://omg10.com/4/11056718", "_blank");
    // Mostrar overlay del conteo regresivo
    setIsRewardedOpen(true);
  };

  const handleReviveAwarded = () => {
    setIsRewardedOpen(false);
    setRevivesUsed(prev => prev + 1);
    setMovesLeft(5); // otorga 5 movimientos
    setLevelFailed(false);
    setGameActive(true);
    toast.success("¡Revivido! Has ganado 5 movimientos extra para intentar completar la meta.", { icon: <Sparkles className="text-yellow-400" /> });
  };

  // Calcular porcentaje de XP general
  const nextLevelXp = Math.pow(progress.level, 2) * 200;
  const currentLevelXp = Math.pow(progress.level - 1, 2) * 200;
  const xpInCurrentLevel = progress.xp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  const xpPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  // Meta barra de progreso
  const goalPercent = Math.min(100, (currentScore / currentLevelConfig.scoreGoal) * 100);

  if (!loading && showPreGame) {
    return (
      <div className="relative z-10 pt-8 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col min-h-screen">
        <GameDetailScreen
          title="Match-3 Puzzle"
          category="Match-3 Saga"
          desc="Supera más de 100 niveles desafiantes. Consigue combos masivos y compra boosters especiales para estallar el tablero."
          userLevel={userLevel}
          claimedLevelRewards={claimedLevelRewards}
          thumbUrl="https://img.gamemonetize.com/uevrcg9lfez7iipsw4z91s5inewmeso5/512x384.jpg"
          onPlay={() => setShowPreGame(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-8 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col min-h-screen">
      
      {/* Header HUD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Link 
          href="/juegos"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/5 px-4 py-2 rounded-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a Juegos
        </Link>

        {!loading && (
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-3xl w-full sm:w-auto">
            {/* XP */}
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
                  <div 
                    className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]" 
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Monedas */}
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Monedas</span>
                <span className="text-sm font-black text-white italic tracking-tighter tabular-nums">{progress.coins}</span>
              </div>
            </div>

            {/* Récord */}
            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Récord</span>
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

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Tablero de Juego (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden shadow-2xl flex flex-col items-center">
            
            {/* Header del tablero */}
            <div className="w-full flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter">
                  Match-3 <span className="text-emerald-400">Puzzle</span>
                </h2>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:block">Intercambia gemas y destruye bloques en racha para superar la meta</p>
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 sm:px-3 rounded-full">
                Nivel {selectedLevel}
              </span>
            </div>

            {/* Marcadores de partida en la parte superior del tablero */}
            {gameActive && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md bg-white/5 border border-white/5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 text-center">
                <div>
                  <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest block">Meta Nivel</span>
                  <span className="text-[10px] sm:text-sm font-black text-emerald-400 italic tabular-nums">{currentScore} / {currentLevelConfig.scoreGoal} Pts</span>
                  <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-1 border border-white/5">
                    <div className="h-full bg-emerald-400" style={{ width: `${goalPercent}%` }} />
                  </div>
                </div>

                <div>
                  <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest block">Movimientos</span>
                  <span className={`text-sm sm:text-lg font-black italic tabular-nums ${movesLeft <= 5 ? "text-red-500 animate-pulse" : "text-white"}`}>
                    {movesLeft}
                  </span>
                </div>

                <div>
                  <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest block">Combo</span>
                  <span className="text-[10px] sm:text-sm font-black text-cyan-400 italic tabular-nums">
                    {combosActive > 1 ? `${combosActive}x` : "1x"}
                  </span>
                </div>
              </div>
            )}

            {/* Canvas de Phaser */}
            <div className="relative w-full max-w-[450px] sm:max-w-[480px] aspect-square overflow-hidden bg-[#090d16] rounded-3xl flex items-center justify-center">
              
              {/* Pantalla de Selección de Niveles (Mapa) */}
              {!gameActive && !levelSuccess && !levelFailed && (
                <div className="absolute inset-0 z-20 flex flex-col items-center bg-slate-950/95 backdrop-blur-md p-6 overflow-y-auto">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    Saga de Niveles
                  </h2>
                  <p className="text-slate-400 text-xs text-center max-w-sm mb-6">Completa niveles en orden para avanzar y desbloquear jugosas recompensas.</p>
                  
                  {/* Grid de mapa de niveles */}
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
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 cursor-pointer hover:scale-105 shadow-md shadow-emerald-500/10" 
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

              {/* Pantalla Victoria */}
              <AnimatePresence>
                {levelSuccess && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 text-center"
                  >
                    <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 sm:mb-4 animate-bounce">
                      <Star className="w-5 h-5 sm:w-10 sm:h-10 fill-current" />
                    </div>
                    <h2 className="text-sm sm:text-3xl font-black text-emerald-400 italic uppercase tracking-tighter mb-1 sm:mb-2">¡Nivel {selectedLevel} Superado!</h2>
                    <p className="text-slate-400 text-[10px] sm:text-xs mb-3 sm:mb-6">Has alcanzado el puntaje objetivo en este nivel.</p>
                    
                    <div className="flex flex-row gap-2 sm:gap-4 mb-2 sm:mb-8 justify-center">
                      <button
                        onClick={() => startLevel(selectedLevel + 1)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 sm:px-8 sm:py-3.5 rounded-lg sm:rounded-2xl text-[9px] sm:text-xs uppercase tracking-wider italic transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      >
                        Siguiente
                      </button>
                      <button
                        onClick={() => {
                          setLevelSuccess(false);
                          setGameActive(false);
                        }}
                        className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black px-4 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-2xl text-[9px] sm:text-xs uppercase tracking-wider italic transition-all hover:scale-105"
                      >
                        Mapa
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pantalla Derrota */}
              <AnimatePresence>
                {levelFailed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 text-center"
                  >
                    <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2 sm:mb-4">
                      <AlertCircle className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-sm sm:text-3xl font-black text-red-500 italic uppercase tracking-tighter mb-1 sm:mb-2">¡MOVIMIENTOS AGOTADOS!</h2>
                    <p className="text-slate-500 text-[10px] sm:text-xs mb-3 sm:mb-6">No alcanzaste la meta de {currentLevelConfig.scoreGoal} puntos</p>

                    <div className="flex flex-row gap-2 sm:gap-4 w-full max-w-sm justify-center">
                      {revivesUsed < 10 ? (
                        <button
                          onClick={watchAdToRevive}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-2xl text-[8px] sm:text-xs uppercase tracking-wider italic transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Revivir ({10 - revivesUsed} restantes)
                        </button>
                      ) : (
                        <button
                          onClick={() => startLevel(selectedLevel)}
                          className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black px-4 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-2xl text-[8px] sm:text-xs uppercase tracking-wider italic transition-all hover:scale-105"
                        >
                          Reiniciar
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Canvas de Phaser */}
              {gameActive && (
                <PuzzleGame 
                  level={selectedLevel}
                  movesLimit={currentLevelConfig.movesLimit}
                  movesLeft={movesLeft}
                  scoreGoal={currentLevelConfig.scoreGoal}
                  activeBooster={activeBooster}
                  onBoosterUsed={() => setActiveBooster(null)}
                  onScoreChanged={(stats) => {
                    setCurrentScore(stats.score);
                    setMovesLeft(stats.movesLeft);
                    setCombosActive(stats.combos);
                  }}
                  onLevelComplete={handleLevelSuccess}
                  onLevelFailed={handleLevelFailed}
                  onGameActive={() => {
                    setLevelSuccess(false);
                    setLevelFailed(false);
                    setGameActive(true);
                  }}
                  triggerRestart={triggerRestart}
                  onRestartComplete={() => setTriggerRestart(false)}
                />
              )}
            </div>
            
            {/* Bandeja de Boosters activos (en partida) */}
            {gameActive && (
              <div className="w-full max-w-md mt-6">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-center">Tus Boosters</span>
                <div className="flex justify-center gap-4">
                  {BOOSTERS.map(booster => {
                    const qty = getBoosterQty(booster.id);
                    const isActive = activeBooster === booster.id;
                    
                    return (
                      <button
                        key={booster.id}
                        onClick={() => handleUseBooster(booster.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-2 transition-all hover:scale-105 ${
                          isActive 
                            ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-white" 
                            : qty > 0 
                              ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" 
                              : "bg-slate-950/20 border-white/5 text-slate-600 cursor-not-allowed"
                        }`}
                      >
                        <span className="text-xl">{booster.icon}</span>
                        <div className="text-left text-[9px] font-black uppercase tracking-tight">
                          <span>{booster.name.split(" ")[0]}</span>
                          <span className="block text-slate-400 font-bold">Qty: {qty}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Paneles laterales de RPG (1/3) */}
        <div className="space-y-8">
          
          {/* Tienda de Boosters */}
          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              Tienda de Boosters
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
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">Inventario: {qty}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyBooster(booster)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.2)] whitespace-nowrap"
                    >
                      <Coins className="w-3 h-3" /> {booster.cost}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Misiones del Puzzle */}
          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-emerald-400" />
              Misiones Diarias
            </h3>
            
            <div className="space-y-4">
              {missions.length === 0 ? (
                <p className="text-slate-500 text-xs italic text-center py-4">Cargando misiones...</p>
              ) : (
                missions.map(mission => {
                  const percent = Math.min(100, (mission.progress.currentValue / mission.targetValue) * 100);
                  const isCompleted = mission.progress.isCompleted;
                  const isClaimed = mission.progress.isClaimed;

                  return (
                    <div 
                      key={mission.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        isClaimed 
                          ? "bg-slate-950/20 border-white/5 opacity-50" 
                          : isCompleted 
                            ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                            : "bg-white/5 border-white/5"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-tighter">{mission.title}</h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">{mission.description}</p>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-yellow-400 block whitespace-nowrap">+{mission.rewardCoins} Monedas</span>
                          <span className="text-[9px] font-bold text-emerald-400 block whitespace-nowrap">+{mission.rewardXp} XP</span>
                          {!isDemoMode && (
                            <span className="text-[8px] font-black text-emerald-400 block whitespace-nowrap">
                              +{Math.round(mission.rewardCoins / 5)} Puntos Reales
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>PROGRESO</span>
                          <span>{mission.progress.currentValue} / {mission.targetValue}</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                          <div 
                            className={`h-full ${isCompleted ? "bg-emerald-400 shadow-[0_0_10px_#10b981]" : "bg-slate-700"}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {isCompleted && !isClaimed && (
                        <button
                          onClick={() => handleClaimMission(mission.id)}
                          className="w-full mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider italic transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          Reclamar Recompensa
                        </button>
                      )}

                      {isClaimed && (
                        <div className="mt-3 flex items-center justify-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Recompensado
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

      {/* Ads Overlays */}
      <RewardedAd 
        isOpen={isRewardedOpen} 
        onRewardClaimed={handleReviveAwarded} 
        onClose={() => setIsRewardedOpen(false)} 
      />

    </div>
  );
}
