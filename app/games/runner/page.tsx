"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Trophy, Coins, Lock, Check, ShoppingBag, 
  Sparkles, ListTodo, User, Play, RefreshCw, Volume2, AlertTriangle, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { GameDetailScreen } from "@/components/games/GameDetailScreen";

import { 
  getGameProgress, 
  saveGameProgress, 
  claimMissionReward, 
  buySkin, 
  selectSkin 
} from "@/app/games/actions";
import { RewardedAd } from "@/components/games/AdsPlaceholder";

// Cargar Phaser de forma dinámica para evitar errores de Hydration en el SSR de Next.js
const RunnerGame = dynamic(() => import("@/components/games/RunnerGame"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full aspect-[2/1] bg-slate-950/80 rounded-[2rem] border border-white/10">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-cyan-400 text-xs font-black uppercase tracking-widest mt-4 animate-pulse">
        Cargando Motor Phaser 3...
      </p>
    </div>
  )
});

// Estructura de Skins disponibles para compra en el juego
const SKINS = [
  { id: "default", name: "Cyber Starter", cost: 0, color: "from-cyan-400 to-blue-500", desc: "Skin básica inicial" },
  { id: "cyber_runner", name: "Pink Cyber", cost: 250, color: "from-pink-500 to-purple-600", desc: "Estilo neon synthwave" },
  { id: "neon_runner", name: "Emerald Glider", cost: 600, color: "from-emerald-400 to-teal-500", desc: "Aceleradores cuánticos verdes" },
  { id: "gold_runner", name: "Hyper Gold", cost: 1200, color: "from-yellow-400 to-amber-500", desc: "Aspecto legendario dorado brillante" }
];

export default function RunnerPage() {
  // Estados de progreso del jugador
  const [progress, setProgress] = useState<any>({
    level: 1,
    xp: 0,
    coins: 100,
    highScore: 0,
    skinsUnlocked: "default",
    currentSkin: "default"
  });
  const [missions, setMissions] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de progresión RPG
  const [userLevel, setUserLevel] = useState<number>(1);
  const [claimedLevelRewards, setClaimedLevelRewards] = useState<string>("");
  const [showPreGame, setShowPreGame] = useState<boolean>(true);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userPoints, setUserPoints] = useState<number>(0);

  // Estados de Partida Activa
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastRunStats, setLastRunStats] = useState({ score: 0, coins: 0, distance: 0 });

  // Estados de Anuncios y Control de Escena
  const [isRewardedOpen, setIsRewardedOpen] = useState(false);
  const [revivesUsed, setRevivesUsed] = useState(0);
  const [triggerRevive, setTriggerRevive] = useState(false);
  const [triggerRestart, setTriggerRestart] = useState(false);

  // Estado de Pantalla Completa y Orientación
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const container = document.getElementById("runner-game-container");
    if (!container) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
      
      // Intentar forzar rotación horizontal a nivel de navegador
      const screenAny = screen as any;
      if (screenAny.orientation && screenAny.orientation.lock) {
        screenAny.orientation.lock("landscape").catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Cargar datos al montar la página
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await getGameProgress("runner");
      if (res.success) {
        setIsDemoMode(!!res.isDemoMode);
        if (res.isDemoMode) {
          // Leer de LocalStorage en modo Demo
          const localProg = localStorage.getItem("runner_progress");
          const localMissions = localStorage.getItem("runner_missions");
          
          if (localProg) {
            setProgress(JSON.parse(localProg));
          }
          if (localMissions) {
            setMissions(JSON.parse(localMissions));
          } else {
            setMissions(res.missions || []);
          }
          setRankings([]); // No hay ranking en demo
        } else {
          // Datos del servidor
          setProgress(res.progress);
          setMissions(res.missions || []);
          setRankings(res.rankings || []);
          setUserLevel(res.userLevel || 1);
          setClaimedLevelRewards(res.claimedLevelRewards || "");
          setUserBalance(res.userBalance || 0);
          setUserPoints(res.userPoints || 0);
        }
      }
    } catch (e) {
      toast.error("Error al cargar progreso. Iniciando en modo local.");
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  // Guardar datos tras partida
  const handleGameOver = async (stats: { score: number; coins: number; distance: number }) => {
    setGameOver(true);
    setGameActive(false);
    setLastRunStats(stats);

    if (isDemoMode) {
      // Guardar localmente
      const newXp = progress.xp + Math.floor(stats.distance / 2);
      const newCoins = progress.coins + stats.coins;
      const isNewRecord = stats.score > progress.highScore;
      const newHighScore = isNewRecord ? stats.score : progress.highScore;
      const newLevel = Math.floor(Math.sqrt(newXp / 200)) + 1;

      const updated = {
        ...progress,
        xp: newXp,
        coins: newCoins,
        highScore: newHighScore,
        level: newLevel
      };
      
      setProgress(updated);
      localStorage.setItem("runner_progress", JSON.stringify(updated));

      // Actualizar misiones locales
      const updatedMissions = missions.map(m => {
        let increment = 0;
        if (m.targetType === "distance") increment = stats.distance;
        if (m.targetType === "coins") increment = stats.coins;
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
      localStorage.setItem("runner_missions", JSON.stringify(updatedMissions));

      if (isNewRecord) {
        toast.success("¡NUEVO RÉCORD PERSONAL!", { icon: <Trophy className="text-yellow-400" /> });
      }
      if (newLevel > progress.level) {
        toast.success(`¡Subiste al Nivel ${newLevel}!`, { icon: <Sparkles className="text-cyan-400" /> });
      }
    } else {
      // Guardar en el servidor
      try {
        const res = await saveGameProgress("runner", {
          score: stats.score,
          coinsEarned: stats.coins,
          xpEarned: Math.floor(stats.distance / 2),
          distanceRun: stats.distance,
          timePlayed: Math.floor(stats.distance / 10) // Aproximación
        });

        if (res.success) {
          if (res.isNewHighScore) {
            toast.success("¡Nuevo Récord Global Guardado!", { icon: <Trophy className="text-yellow-400 animate-bounce" /> });
          }
          if (res.didLevelUp) {
            toast.success(`¡Subiste al Nivel RPG ${res.newLevel}!`, { icon: <Sparkles className="text-cyan-400" /> });
          }
          loadProgress(); // Recargar datos
        }
      } catch (e) {
        toast.error("No se pudo guardar el progreso en el servidor.");
      }
    }
  };

  // Reclamar recompensa de misión
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
      localStorage.setItem("runner_progress", JSON.stringify(updatedProgress));

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

      toast.success(`Ganaste ${mission.rewardCoins} monedas del juego y ${mission.rewardXp} XP (Demo Mode)`);
    } else {
      try {
        const res = await claimMissionReward("runner", missionId);
        if (res.success) {
          toast.success(`¡Misión reclamada! +${res.rewardCoins} monedas y +${res.realPointsAdded} puntos reales!`, {
            style: { background: "#064e3b", color: "#fff", border: "1px solid #059669" }
          });
          loadProgress();
        }
      } catch (e) {
        toast.error("Error al procesar la recompensa.");
      }
    }
  };

  // Comprar Aspecto / Skin
  const handleBuySkin = async (skin: typeof SKINS[0]) => {
    if (progress.coins < skin.cost) {
      toast.error("Monedas de juego insuficientes. ¡Sigue corriendo para recolectar más!");
      return;
    }

    if (isDemoMode) {
      const unlocked = progress.skinsUnlocked.split(",");
      unlocked.push(skin.id);
      
      const updated = {
        ...progress,
        coins: progress.coins - skin.cost,
        skinsUnlocked: unlocked.join(","),
        currentSkin: skin.id
      };
      
      setProgress(updated);
      localStorage.setItem("runner_progress", JSON.stringify(updated));
      toast.success(`¡Skin ${skin.name} desbloqueada!`);
    } else {
      try {
        const res = await buySkin("runner", skin.id, skin.cost);
        if (res.success) {
          toast.success(`¡Skin ${skin.name} comprada con éxito!`);
          loadProgress();
        } else {
          toast.error(res.error || "Error al comprar la skin.");
        }
      } catch (e) {
        toast.error("Error en la tienda.");
      }
    }
  };

  // Seleccionar Aspecto / Skin
  const handleSelectSkin = async (skinId: string) => {
    if (isDemoMode) {
      const updated = {
        ...progress,
        currentSkin: skinId
      };
      setProgress(updated);
      localStorage.setItem("runner_progress", JSON.stringify(updated));
      toast.success("Skin seleccionada");
    } else {
      try {
        const res = await selectSkin("runner", skinId);
        if (res.success) {
          toast.success("Skin equipada");
          loadProgress();
        }
      } catch (e) {
        toast.error("Error al equipar skin.");
      }
    }
  };

  // Iniciar nueva partida directamente sin anuncios automáticos
  const startNewRun = () => {
    confirmStartRun();
  };

  const confirmStartRun = () => {
    setGameOver(false);
    setGameActive(true);
    setRevivesUsed(0);
    setTriggerRestart(true); // Indicar a Phaser que reinicie la escena
  };

  // Ver anuncio recompensado real de Monetag para Revivir
  const watchAdToRevive = () => {
    // Abrir el enlace directo de anuncios de Monetag en nueva pestaña
    window.open("https://omg10.com/4/11056718", "_blank");
    // Mostrar overlay del conteo regresivo
    setIsRewardedOpen(true);
  };

  const handleReviveAwarded = () => {
    setIsRewardedOpen(false);
    setRevivesUsed(prev => prev + 1);
    setTriggerRevive(true); // Firing event into phaser canvas
    setGameOver(false);
    setGameActive(true);
    toast.success("¡Revivido! Tienes un escudo temporal de invulnerabilidad.", { icon: <Sparkles className="text-yellow-400" /> });
  };

  // Calcular porcentaje de XP para barra de nivel
  const nextLevelXp = Math.pow(progress.level, 2) * 200;
  const currentLevelXp = Math.pow(progress.level - 1, 2) * 200;
  const xpInCurrentLevel = progress.xp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  const xpPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  if (!loading && showPreGame) {
    return (
      <div className="relative z-10 pt-8 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col min-h-screen">
        <GameDetailScreen
          gameId="runner"
          title="Cyber Runner"
          category="Endless Runner"
          desc="Esquiva obstáculos a máxima velocidad, activa escudos, imanes de monedas y jetpacks para batir récords globales."
          userLevel={userLevel}
          claimedLevelRewards={claimedLevelRewards}
          thumbUrl="https://img.gamemonetize.com/xqxcsqazsozjzy71jb1hn0a54dorg91d/512x384.jpg"
          onPlay={() => setShowPreGame(false)}
          onRewardClaimed={loadProgress}
        />
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-8 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col min-h-screen">
      
      {/* Botones de navegación del Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Link 
          href="/juegos"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/5 px-4 py-2 rounded-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a Juegos
        </Link>

        {/* HUD RPG superior */}
        {!loading && (
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-3xl w-full sm:w-auto">
            {/* Nivel */}
            <div className="flex items-center gap-3 pr-4 border-r border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-black text-cyan-400 italic text-sm">
                Lvl {progress.level}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest gap-4">
                  <span>EXP PROGRESO</span>
                  <span>{progress.xp} / {nextLevelXp} XP</span>
                </div>
                <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" 
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Monedas del Juego */}
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Monedas</span>
                <span className="text-sm font-black text-white italic tracking-tighter tabular-nums">{progress.coins}</span>
              </div>
            </div>

            {/* Récord */}
            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
              <Trophy className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Récord</span>
                <span className="text-sm font-black text-cyan-400 italic tracking-tighter tabular-nums">{progress.highScore} Pts</span>
              </div>
            </div>

            {/* Saldo USD */}
            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Saldo</span>
                <span className="text-sm font-black text-white italic tracking-tighter tabular-nums">${userBalance.toFixed(2)} USD</span>
              </div>
            </div>
            
            {/* Flag de Modo Demo */}
            {isDemoMode && (
              <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                Demo
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Izquierda Canvas, Derecha RPG panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Columna del Juego (2/3 ancho) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            {/* Decoraciones Cyberpunk */}
            <div className="absolute top-0 left-12 w-24 h-1 bg-cyan-500/40"></div>
            
            {/* Header del juego */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter">
                  Cyber <span className="text-cyan-400">Runner</span>
                </h2>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium hidden sm:block">Corre, salta y esquiva obstáculos de neon para acumular monedas</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[9px] sm:text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all flex items-center gap-1 shadow-md"
                >
                  {isFullscreen ? "Pantalla Normal" : "Girar Pantalla 📱"}
                </button>
                <span className="text-[8px] md:text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 sm:px-3 rounded-full animate-pulse hidden xs:inline-block">
                  Phaser 3 Engine
                </span>
              </div>
            </div>

            {/* Canvas de Phaser */}
            <div 
              id="runner-game-container"
              className={`relative w-full overflow-hidden bg-slate-900 rounded-3xl transition-all ${
                isFullscreen ? "w-screen h-screen flex items-center justify-center bg-slate-950 rounded-none z-[9999]" : ""
              }`}
            >
              {!gameActive && !gameOver && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 text-center">
                  <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 sm:mb-4 animate-bounce">
                    <Play className="w-4 h-4 sm:w-8 sm:h-8 fill-current ml-1" />
                  </div>
                  <h2 className="text-xs sm:text-xl font-black text-white italic uppercase tracking-tighter mb-1 sm:mb-2">¿Estás listo, Runner?</h2>
                  <p className="text-slate-400 text-[8px] sm:text-xs max-w-sm mb-2 sm:mb-6 leading-tight">Usa ARRIBA o ESPACIO para saltar, y ABAJO para agacharse en PC. Toca los laterales de la pantalla en móvil.</p>
                  
                  <button
                    onClick={startNewRun}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-4 py-2 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs uppercase tracking-wider italic transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                  >
                    Iniciar Carrera
                  </button>
                </div>
              )}

              {/* Pantalla de Game Over */}
              <AnimatePresence>
                {gameOver && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 text-center"
                  >
                    <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-1 sm:mb-4">
                      <AlertTriangle className="w-4 h-4 sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-sm sm:text-3xl font-black text-red-500 italic uppercase tracking-tighter mb-0.5 sm:mb-1">¡FIN DE LA CARRERA!</h2>
                    <p className="text-slate-500 text-[7px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-6">Choque detectado contra obstáculos del sector</p>
                    
                    {/* Estadísticas de la partida */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-6 bg-white/5 border border-white/5 p-2 sm:p-5 rounded-xl sm:rounded-3xl mb-3 sm:mb-8 max-w-xs w-full">
                      <div>
                        <span className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest block">Distancia</span>
                        <span className="text-xs sm:text-lg font-black text-white italic tracking-tighter tabular-nums">{lastRunStats.distance}m</span>
                      </div>
                      <div>
                        <span className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest block">Monedas</span>
                        <span className="text-xs sm:text-lg font-black text-yellow-400 italic tracking-tighter tabular-nums">+{lastRunStats.coins}</span>
                      </div>
                      <div>
                        <span className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest block">Puntuación</span>
                        <span className="text-xs sm:text-lg font-black text-cyan-400 italic tracking-tighter tabular-nums">{lastRunStats.score}</span>
                      </div>
                    </div>

                    <div className="flex flex-row gap-2 w-full max-w-sm justify-center">
                      {revivesUsed < 10 ? (
                        <button
                          onClick={watchAdToRevive}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-2xl text-[8px] sm:text-xs uppercase tracking-wider italic transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Revivir ({10 - revivesUsed} restantes)
                        </button>
                      ) : (
                        <button
                          onClick={startNewRun}
                          className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black px-4 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-2xl text-[8px] sm:text-xs uppercase tracking-wider italic transition-all hover:scale-105 flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reintentar
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* El juego Phaser */}
              <RunnerGame 
                currentSkin={progress.currentSkin}
                onGameOver={handleGameOver}
                onGameActive={() => {
                  setGameOver(false);
                  setGameActive(true);
                }}
                revivesUsed={revivesUsed}
                triggerRevive={triggerRevive}
                onReviveComplete={() => setTriggerRevive(false)}
                triggerRestart={triggerRestart}
                onRestartComplete={() => setTriggerRestart(false)}
              />
            </div>
          </div>
        </div>

        {/* Columna de RPG y Paneles laterales (1/3 ancho) */}
        <div className="space-y-8">
          
          {/* Panel de Misiones */}
          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-cyan-400" />
              Misiones Diarias
            </h3>
            
            <div className="space-y-4">
              {missions.length === 0 ? (
                <p className="text-slate-500 text-xs italic text-center py-4">No hay misiones activas.</p>
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
                            ? "bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]" 
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
                          <span className="text-[9px] font-bold text-cyan-400 block whitespace-nowrap">+{mission.rewardXp} XP</span>
                          {!isDemoMode && (
                            <span className="text-[8px] font-black text-emerald-400 block whitespace-nowrap">
                              +{Math.round(mission.rewardCoins / 5)} Puntos Reales
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progreso */}
                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>PROGRESO</span>
                          <span>{mission.progress.currentValue} / {mission.targetValue}</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                          <div 
                            className={`h-full ${isCompleted ? "bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "bg-slate-700"}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Botón Reclamar */}
                      {isCompleted && !isClaimed && (
                        <button
                          onClick={() => handleClaimMission(mission.id)}
                          className="w-full mt-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase tracking-wider italic transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(6,182,212,0.3)]"
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

          {/* Panel Tienda de Skins */}
          <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              Tienda de Aspectos
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {SKINS.map(skin => {
                const unlockedSkins = progress.skinsUnlocked.split(",");
                const isUnlocked = unlockedSkins.includes(skin.id);
                const isEquipped = progress.currentSkin === skin.id;

                return (
                  <div 
                    key={skin.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      isEquipped 
                        ? "bg-cyan-500/5 border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.05)]" 
                        : "bg-white/5 border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar preview */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${skin.color} flex items-center justify-center text-slate-950 font-black shadow-md`}>
                        RUN
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-tighter flex items-center gap-1">
                          {skin.name}
                          {isEquipped && (
                            <span className="text-[8px] bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest scale-90">
                              Activo
                            </span>
                          )}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">{skin.desc}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isUnlocked ? (
                        isEquipped ? (
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectSkin(skin.id)}
                            className="bg-white/10 hover:bg-white/20 text-white font-black px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-wider transition-all"
                          >
                            Equipar
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleBuySkin(skin)}
                          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                        >
                          <Coins className="w-3 h-3" /> {skin.cost}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel de Clasificación (Global) */}
          {!isDemoMode && rankings.length > 0 && (
            <div className="bg-slate-950/50 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
              <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Clasificación Global
              </h3>
              
              <div className="space-y-2">
                {rankings.map((rank) => (
                  <div 
                    key={rank.rank}
                    className={`flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/2 flex items-center gap-2 ${
                      rank.rank === 1 ? "bg-yellow-500/5 border-yellow-500/15" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-black italic text-xs ${
                        rank.rank === 1 ? "bg-yellow-500 text-slate-950" : 
                        rank.rank === 2 ? "bg-slate-300 text-slate-950" : 
                        rank.rank === 3 ? "bg-amber-600 text-slate-950" : 
                        "text-slate-400"
                      }`}>
                        {rank.rank}
                      </span>
                      
                      <div className="text-left">
                        <h4 className="text-xs font-black text-white truncate max-w-[100px]">{rank.name}</h4>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">RPG Lvl {rank.level}</span>
                      </div>
                    </div>

                    <span className="text-xs font-black text-cyan-400 italic tabular-nums">{rank.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
