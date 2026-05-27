"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Crown, 
  Timer, 
  Trophy, 
  Star, 
  Users, 
  Gift, 
  Target,
  Copy,
  CheckCircle2,
  Share2,
  X,
  Info,
  Clock,
  DollarSign,
  Coins,
  Share2 as Instagram,
  Share2 as Facebook,
  ExternalLink,
  UserPlus,
  Gamepad2,
  Gem,
  Award,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { completeSocialMission } from "./actions";
import { sendFriendRequest } from "@/app/mensajes/actions";
import { claimLevelReward } from "@/app/games/actions";
import { LEVEL_REWARDS } from "@/app/games/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { LevelRewardsTimeline } from "@/components/LevelRewardsTimeline";

interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  balance: number;
  playerId: string | null;
  points: number;
  wins: number;
}

interface RewardsClientProps {
  users: LeaderboardUser[];
  currentUserId: string;
  currentPlayerId: string;
  userRole: string;
  completedMissions: string[];
  userLevel?: number;
  userXp?: number;
  userGems?: number;
  referralCode?: string;
  claimedLevelRewards?: string;
  referralsCount?: number;
}

export const RewardsClient = ({ 
  users, 
  currentUserId, 
  currentPlayerId, 
  userRole, 
  completedMissions,
  userLevel = 1,
  userXp = 0,
  userGems = 0,
  referralCode = "",
  claimedLevelRewards = "",
  referralsCount = 0
}: RewardsClientProps) => {
  const [activeTab, setActiveTab] = useState<"misiones" | "adgem" | "level_rewards" | "referidos" | "bonos" | null>("level_rewards");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const [loadingMission, setLoadingMission] = useState<string | null>(null);
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null);
  const [claimedLevels, setClaimedLevels] = useState<string[]>(
    claimedLevelRewards ? claimedLevelRewards.split(",").map(c => c.trim()) : []
  );

  const isAdminOrMod = userRole === "ADMIN" || userRole === "MODERATOR";

  // Calcular tiempo restante de la temporada
  const calculateGlobalTimeLeft = () => {
    const referenceDate = new Date("2026-05-03T23:59:59-05:00").getTime();
    const now = new Date().getTime();
    const cycleMs = 15 * 24 * 60 * 60 * 1000; 
    let msSinceReference = now - referenceDate;
    if (msSinceReference < 0) msSinceReference = 0;
    const msIntoCurrentCycle = msSinceReference % cycleMs;
    const msRemaining = cycleMs - msIntoCurrentCycle;
    
    const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((msRemaining % (1000 * 60)) / 1000);
    
    return { days, hours, mins, secs };
  };

  useEffect(() => {
    setTimeLeft(calculateGlobalTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateGlobalTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCompleteMission = async (missionId: string, url: string) => {
    window.open(url, "_blank");
    setLoadingMission(missionId);
    const result = await completeSocialMission(missionId);
    if (result.success) {
      toast.success("¡Misión completada! Has ganado $0.02");
    } else if (result.error !== "Ya has reclamado esta recompensa.") {
      toast.error(result.error);
    }
    setLoadingMission(null);
  };

  const handleClaimLevel = async (lvl: number) => {
    setClaimingLevel(lvl);
    try {
      const res = await claimLevelReward(lvl);
      if (res.success) {
        toast.success(`¡Bono reclamado! +$${res.rewardAmount?.toFixed(2)} acreditados a tu balance.`);
        setClaimedLevels(prev => [...prev, lvl.toString()]);
      } else {
        toast.error(res.error || "No se pudo reclamar.");
      }
    } catch (e) {
      toast.error("Error de conexión.");
    } finally {
      setClaimingLevel(null);
    }
  };

  const handleAddFriend = async (playerId: string) => {
    if (!playerId) {
      toast.error("Este jugador no tiene un ID de batalla válido.");
      return;
    }
    const res = await sendFriendRequest(playerId);
    if (res.success) toast.success("¡Solicitud de amistad enviada!");
    else toast.error(res.error);
  };

  useEffect(() => {
    setActiveTab(null);
  }, [searchParams]);

  // Generar link con referralCode en lugar de ID
  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/register?ref=${referralCode || currentPlayerId}` 
    : "";

  const misionesList = [
    { 
      id: "ig_follow", 
      title: "Síguenos en Instagram", 
      desc: "Únete a nuestra comunidad en IG", 
      reward: "0.02 USD", 
      icon: Instagram, 
      color: "pink",
      url: "https://www.instagram.com/battlecoinss?igsh=cGF2bGltbmN1cW1i"
    },
    { 
      id: "fb_follow", 
      title: "Comunidad Facebook", 
      desc: "Dale like a nuestra página oficial", 
      reward: "0.02 USD", 
      icon: Facebook, 
      color: "blue",
      url: "https://www.facebook.com/share/1BdrkKCU21/"
    },
    { 
      id: "roulette_10", 
      title: "Veterano de Batalla", 
      desc: "Participa en 10 batallas de ruleta", 
      reward: "500 Coins", 
      icon: Target, 
      color: "cyan",
      progress: 7,
      total: 10
    },
    { 
      id: "refer_3", 
      title: "Llamado a las Armas", 
      desc: "Invita a 3 amigos con tu link", 
      reward: "1.00 USD", 
      icon: Users, 
      color: "purple",
      progress: 1,
      total: 3
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("¡Enlace de referido copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const podium = [users[1], users[0], users[2]].filter(Boolean);
  const restOfUsers = users.slice(3);

  const PlayerAvatar = ({ user, size = "md", color = "cyan" }: { user: LeaderboardUser, size?: "sm" | "md" | "lg", color?: string }) => {
    const initials = user.name?.substring(0, 2).toUpperCase() || "??";
    const sizeClasses = { sm: "w-8 h-8 text-[10px]", md: "w-14 h-14 text-sm", lg: "w-24 h-24 text-2xl" };

    return (
      <div className={cn(
        "rounded-full border-2 p-1 bg-[#0a102a] flex items-center justify-center overflow-hidden shadow-2xl",
        sizeClasses[size as keyof typeof sizeClasses],
        color === "gold" ? "border-yellow-500 shadow-yellow-500/20" : 
        color === "silver" ? "border-slate-400 shadow-slate-400/20" : 
        color === "bronze" ? "border-amber-700 shadow-amber-800/20" : "border-white/10"
      )}>
        {user.image ? (
          <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
        ) : (
          <span className="font-black text-slate-500 tracking-tighter">{initials}</span>
        )}
      </div>
    );
  };

  // Calcular la XP requerida para el nivel actual
  const nextLevelXp = Math.pow(userLevel, 2) * 500;
  const currentLevelXp = Math.pow(userLevel - 1, 2) * 500;
  const xpInCurrentLevel = userXp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  const xpPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  return (
    <div className="space-y-4 md:space-y-6 pb-32">
      {!isAdminOrMod && (
        <div className="sticky top-0 z-40 bg-[#050a1f]/85 backdrop-blur-xl border-b border-white/5 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-start md:justify-around max-w-4xl mx-auto h-16 md:h-20 px-4 gap-2 whitespace-nowrap">
            {[
              { id: "misiones", label: "Misiones" },
              { id: "adgem", label: "Gana Monedas" },
              { id: "level_rewards", label: "Premios por Nivel" },
              { id: "referidos", label: "Invitar Amigos" },
              { id: "bonos", label: "Bonos Especiales" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id as any)}
                className={cn(
                  "relative h-full px-4 flex items-center justify-center text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors flex-shrink-0",
                  activeTab === tab.id ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-400 rounded-t-full shadow-[0_-4px_10px_rgba(52,211,153,0.3)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!activeTab ? (
            <motion.div key="ranking-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 mt-4">
              
              {/* Box de Bienvenida RPG */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0b0e14]/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <div className="md:col-span-2 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center justify-center font-black text-cyan-400 italic">
                    <span className="text-[10px] not-italic text-slate-500">NIVEL</span>
                    <span className="text-2xl leading-none">{userLevel}</span>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black tracking-wider text-slate-400">
                      <span>RANGO GLOBAL BATTLECOINS</span>
                      <span className="text-cyan-400">{userXp} / {nextLevelXp} XP</span>
                    </div>
                    <div className="h-3 w-full bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                      <div className="h-full bg-cyan-400 shadow-[0_0_12px_#06b6d4]" style={{ width: `${xpPercent}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      ¡Llega al nivel 10 para reclamar tu primer premio de dinero real!
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-around border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 pl-0 md:pl-6">
                  <div className="flex items-center gap-2">
                    <Gem className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Gemas RPG</span>
                      <span className="text-base font-black text-purple-400">{userGems}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Retiros Invitados</span>
                      <span className="text-base font-black text-emerald-400">{referralsCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard/Podium */}
              <div className="flex flex-col gap-6">
                <div className="relative overflow-hidden bg-[#0b0e14] border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Trophy className="w-48 h-48 text-white" /></div>
                  <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="space-y-4 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em]">Temporada de Recompensas</span>
                      </div>
                      <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.8] drop-shadow-2xl">
                        Pirámide de <br /> <span className="text-yellow-400">Premios</span>
                      </h1>
                    </div>
                    <div className="flex flex-col items-center gap-6">
                      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 flex flex-col items-center min-w-[280px]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Timer className="w-3 h-3 text-cyan-500" /> El Tiempo se agota en:</p>
                        <div className="flex gap-4">
                          {[{ v: timeLeft.days, u: "D" }, { v: timeLeft.hours, u: "H" }, { v: timeLeft.mins, u: "M" }, { v: timeLeft.secs, u: "S" }].map((t, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{t.v.toString().padStart(2, '0')}</span>
                              <span className="text-[8px] font-black text-slate-600 uppercase mt-1">{t.u}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "1º Puesto", prize: "100.00", color: "text-yellow-400", bg: "bg-yellow-500/5" },
                    { label: "2º Puesto", prize: "50.00", color: "text-slate-300", bg: "bg-slate-400/5" },
                    { label: "3º Puesto", prize: "25.00", color: "text-amber-600", bg: "bg-amber-800/5" },
                    { label: "4-10º Puesto", prize: "5.00", color: "text-cyan-400", bg: "bg-cyan-500/5" },
                  ].map((p, i) => (
                    <div key={i} className={cn("p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 backdrop-blur-md", p.bg)}>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{p.label}</span>
                      <span className={cn("text-lg font-black italic", p.color)}>+${p.prize}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Podium display */}
              <div className="flex items-end justify-center w-full gap-3 md:gap-8 pt-10 px-2 max-w-3xl mx-auto">
                {users[1] && (
                  <div className="flex-1 flex flex-col items-center group">
                    <div className="relative mb-4 group-hover:scale-105 transition-transform duration-500">
                      <PlayerAvatar user={users[1]} size="md" color="silver" />
                      <div className="absolute -top-2 -right-2 bg-slate-400 text-slate-950 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg">2</div>
                    </div>
                    <div className="w-full h-32 md:h-48 bg-gradient-to-t from-slate-500/40 via-slate-500/10 to-transparent rounded-t-[2.5rem] border-x border-t border-slate-500/30 flex flex-col items-center justify-center p-4">
                      <div className="text-slate-300 font-black text-[10px] md:text-sm uppercase mb-2 font-black italic">+$50.00</div>
                      <span className="text-white font-black uppercase text-[9px] md:text-sm truncate w-full text-center mb-1">{users[1].name}</span>
                      <span className="text-slate-400 font-bold text-[8px] md:text-xs">{users[1].points} pts</span>
                    </div>
                  </div>
                )}
                {users[0] && (
                  <div className="flex-[1.2] flex flex-col items-center z-10 group">
                    <div className="relative mb-6 group-hover:scale-110 transition-transform duration-500">
                      <Crown className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 animate-pulse" />
                      <PlayerAvatar user={users[0]} size="lg" color="gold" />
                      <div className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-950 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-xl border-4 border-[#050a1f]">1</div>
                    </div>
                    <div className="w-full h-48 md:h-72 bg-gradient-to-t from-yellow-500/50 via-yellow-500/20 to-transparent rounded-t-[3rem] border-x border-t border-yellow-500/40 flex flex-col items-center justify-center p-6 shadow-[0_-30px_60px_rgba(234,179,8,0.2)]">
                      <div className="text-yellow-400 font-black text-xs md:text-xl uppercase mb-4 animate-pulse italic font-black">+$100.00</div>
                      <span className="text-white font-black uppercase text-[10px] md:text-2xl truncate w-full text-center mb-2">{users[0].name}</span>
                      <span className="text-yellow-100 font-bold text-[10px] md:text-base">{users[0].points} pts</span>
                    </div>
                  </div>
                )}
                {users[2] && (
                  <div className="flex-1 flex flex-col items-center group">
                    <div className="relative mb-4 group-hover:scale-105 transition-transform duration-500">
                      <PlayerAvatar user={users[2]} size="md" color="bronze" />
                      <div className="absolute -top-2 -right-2 bg-amber-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg">3</div>
                    </div>
                    <div className="w-full h-24 md:h-36 bg-gradient-to-t from-amber-700/40 via-amber-700/10 to-transparent rounded-t-[2.5rem] border-x border-t border-amber-800/30 flex flex-col items-center justify-center p-4">
                      <div className="text-amber-500 font-black text-[8px] md:text-xs uppercase mb-1 font-black italic text-center">+$25.00</div>
                      <span className="text-white font-black uppercase text-[9px] md:text-xs truncate w-full text-center mb-1">{users[2].name}</span>
                      <span className="text-amber-800 font-bold text-[7px] md:text-[10px]">{users[2].points} pts</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#0b0e14]/80 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {restOfUsers.map((user, idx) => (
                  <div key={user.id} className="px-8 py-5 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all">
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-black text-slate-700 italic">#{idx + 4}</span>
                      <PlayerAvatar user={user} size="sm" />
                      <span className="text-xs font-black text-white uppercase tracking-tight">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-white italic tracking-tighter">{user.points} pts</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] mt-1" />
                      </div>
                      {user.id !== currentUserId && (
                        <button onClick={() => handleAddFriend(user.playerId!)} className="p-2 bg-white/5 hover:bg-cyan-500 hover:text-slate-950 rounded-xl transition-all"><UserPlus className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="active-tab-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6 space-y-6">
              
              {/* TAB PREMIOS POR NIVEL */}
              {activeTab === "level_rewards" && (
                <LevelRewardsTimeline 
                  userLevel={userLevel} 
                  initialClaimedLevelRewards={claimedLevelRewards} 
                />
              )}

              {/* TAB INVITAR AMIGOS */}
              {activeTab === "referidos" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-white/10">
                    <div className="relative z-10 space-y-4">
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight uppercase italic">
                        ¡Gana <span className="text-emerald-400">$0.50 USD</span> <br /> por cada invitado!
                      </h2>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest max-w-[280px]">
                        El bono se acredita automáticamente en cuanto tu referido complete su primer retiro de $5.00+ USD.
                      </p>
                    </div>
                    <Gift className="absolute -right-4 -bottom-4 w-40 h-40 text-white/10 rotate-12" />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tu Enlace de Referido Personal</p>
                    <div className="bg-[#1a1c26] border border-white/10 rounded-2xl p-2 flex items-center justify-between gap-4 shadow-inner">
                      <div className="flex-1 px-4 overflow-hidden"><code className="text-emerald-400 font-bold text-xs truncate block">{referralLink}</code></div>
                      <button onClick={copyToClipboard} className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2">
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "¡Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0b0e14] border border-white/5 rounded-2xl p-6">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tus Referidos Totales</p>
                      <p className="text-3xl font-black text-white italic tracking-tighter tabular-nums">{referralsCount}</p>
                    </div>
                    <div className="bg-[#0b0e14] border border-white/5 rounded-2xl p-6">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Premio por Invitación</p>
                      <p className="text-3xl font-black text-emerald-400 italic tracking-tighter">$0.50 USD</p>
                    </div>
                  </div>

                  <div className="bg-[#0b0e14] border border-white/5 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                      <Info className="w-4 h-4 text-cyan-400" />
                      ¿Cómo funciona el sistema de referidos?
                    </h3>
                    <ul className="space-y-3 text-xs text-slate-400 font-medium">
                      <li className="flex gap-2">
                        <span className="text-cyan-400 font-bold">1.</span> Comparte tu enlace o código único (<span className="text-cyan-400 font-bold">{referralCode}</span>) con tus amigos.
                      </li>
                      <li className="flex gap-2">
                        <span className="text-cyan-400 font-bold">2.</span> Tus amigos se registran y reciben un **bono de bienvenida instantáneo de $0.02 USD**.
                      </li>
                      <li className="flex gap-2">
                        <span className="text-cyan-400 font-bold">3.</span> Juegan, recolectan puntos y retiran. Cuando su retiro sea aprobado por el administrador, **recibirás $0.50 USD** en tu balance directamente.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB BONOS */}
              {activeTab === "bonos" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-white/10 group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700"><Gift className="w-40 h-40 text-white" /></div>
                    <div className="relative z-10 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> <span className="text-[9px] font-black text-white uppercase tracking-widest">Premios Especiales</span></div>
                      <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Tu Centro de <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Bonificaciones</span></h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Bono de Racha Semanal", desc: "Extra por jugar 7 días seguidos", amount: "+$5.00 USD", status: "DISPONIBLE", color: "yellow" },
                      { title: "Bono de Registro", desc: "Regalo por crear tu cuenta", amount: "+$0.02 USD", status: "RECLAMADO", color: "emerald" },
                    ].map((bono, i) => (
                      <div key={i} className="bg-[#0b0e14] border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1"><h4 className="text-sm font-black text-white uppercase italic">{bono.title}</h4><p className="text-[10px] text-slate-500 font-bold">{bono.desc}</p></div>
                          <div className={cn("text-xs font-black italic", bono.color === "emerald" ? "text-emerald-500" : "text-yellow-500")}>{bono.amount}</div>
                        </div>
                        <button disabled={bono.status !== "DISPONIBLE"} className={cn("w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest", bono.status === "RECLAMADO" ? "bg-emerald-500/10 text-emerald-500" : "bg-white text-slate-900")}>{bono.status}</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB MISIONES */}
              {activeTab === "misiones" && (
                <div className="space-y-6">
                  <div className="bg-[#0b0e14] border border-white/10 rounded-3xl p-10 relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                      <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Desafíos <br /> <span className="text-emerald-400">Diarios</span></h2>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {misionesList.map((mision, i) => {
                      const isCompleted = completedMissions.includes(mision.id);
                      const Icon = mision.icon;
                      return (
                        <div key={i} className="bg-[#0b0e14]/60 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
                          <div className="flex-1 space-y-6 w-full">
                            <div className="flex items-center gap-5">
                              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", isCompleted ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-slate-500")}><Icon className="w-7 h-7" /></div>
                              <div><h4 className="text-xl font-black text-white uppercase italic leading-none mb-2">{mision.title}</h4><p className="text-xs text-slate-500 font-bold">{mision.desc}</p></div>
                            </div>
                            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5"><div className={cn("h-full rounded-full", isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-cyan-500 to-blue-600")} style={{ width: isCompleted ? "100%" : (mision.total ? `${((mision.progress || 0) / mision.total) * 100}%` : "0%") }} /></div>
                          </div>
                          <div className="text-center md:text-right flex flex-col items-center md:items-end gap-4 min-w-[150px]">
                            <div className="text-2xl font-black text-white italic tracking-tighter">{mision.reward}</div>
                            {mision.url ? (
                              <button onClick={() => handleCompleteMission(mision.id, mision.url!)} disabled={isCompleted || loadingMission === mision.id} className={cn("px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest", isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-white text-slate-900")}>
                                {isCompleted ? "Completado" : loadingMission === mision.id ? "Procesando..." : "Ir a Misión"}
                              </button>
                            ) : <div className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 text-slate-700">En Curso</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB ADGEM */}
              {activeTab === "adgem" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                      <ExternalLink className="w-48 h-48 text-cyan-400" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                        <Star className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Ofertas Disponibles</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Gana <span className="text-cyan-400">Coins Gratis</span> <br /> Probando Apps
                      </h2>
                      <p className="text-cyan-100/70 text-sm font-medium max-w-md">
                        Instala juegos, llega a niveles específicos y recibe recompensas automáticas en tu balance de batalla.
                      </p>
                      
                      <a 
                        href={`https://api.adgem.com/v1/wall?appid=TU_APP_ID&playerid=${currentPlayerId.replace("#", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 hover:bg-cyan-400 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                      >
                        Abrir Muro de Ofertas
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { step: "01", title: "Busca un Juego", desc: "Elige las ofertas que más monedas paguen." },
                      { step: "02", title: "Cumple la Meta", desc: "Sigue las instrucciones (ej: Nivel 10)." },
                      { step: "03", title: "¡Cobra tu Premio!", desc: "Tus monedas se suman al instante." },
                    ].map((step, i) => (
                      <div key={i} className="bg-[#0b0e14] border border-white/5 rounded-2xl p-6 space-y-2">
                        <span className="text-cyan-500 font-black italic text-lg">{step.step}</span>
                        <h4 className="text-xs font-black text-white uppercase">{step.title}</h4>
                        <p className="text-[10px] text-slate-500 font-bold">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setActiveTab(null)} className="w-full py-4 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors pt-10">Volver al Ranking Principal</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
