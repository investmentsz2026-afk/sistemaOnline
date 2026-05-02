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
  ExternalLink
} from "lucide-react";
import { completeSocialMission } from "./actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useSearchParams } from "next/navigation";

interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  balance: number;
}

interface RewardsClientProps {
  users: LeaderboardUser[];
  currentUserId: string;
  userRole: string;
  completedMissions: string[];
}

export const RewardsClient = ({ users, currentUserId, userRole, completedMissions }: RewardsClientProps) => {
  const [activeTab, setActiveTab] = useState<"misiones" | "bonos" | "referidos" | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, mins: 30, secs: 45 });
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const [loadingMission, setLoadingMission] = useState<string | null>(null);

  const isAdminOrMod = userRole === "ADMIN" || userRole === "MODERATOR";

  const handleCompleteMission = async (missionId: string, url: string) => {
    // Abrir el link en una nueva pestaña
    window.open(url, "_blank");

    // Procesar la recompensa
    setLoadingMission(missionId);
    const result = await completeSocialMission(missionId);
    
    if (result.success) {
      toast.success("¡Misión completada! Has ganado $0.02");
    } else {
      if (result.error !== "Ya has reclamado esta recompensa.") {
        toast.error(result.error);
      }
    }
    setLoadingMission(null);
  };

  // Resetear pestaña cuando cambia la URL (al presionar el menú inferior)
  useEffect(() => {
    setActiveTab(null);
  }, [searchParams]);

  // Reseteo de pestaña al entrar (Simulación de navegación limpia)
  useEffect(() => {
    const handleReset = () => setActiveTab(null);
    window.addEventListener('popstate', handleReset);
    return () => window.removeEventListener('popstate', handleReset);
  }, []);

  // URL real de referido
  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/register?ref=${currentUserId}` 
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("¡Link de referido copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const podium = [users[1], users[0], users[2]].filter(Boolean); // 2, 1, 3
  const restOfUsers = users.slice(3);

  // Simulación de referidos reales para que no de error
  const mockReferrals = [
    { name: "Juan***", date: "01/05/2026", status: "PENDIENTE", detail: "Esperando primer retiro" },
    { name: "Maria***", date: "28/04/2026", status: "COMPLETADO", detail: "¡$1.00 ganado!" },
    { name: "Pedro***", date: "25/04/2026", status: "PENDIENTE", detail: "Usuario registrado" },
  ];

  // Componente de Avatar mejorado para que NUNCA se vea roto
  const PlayerAvatar = ({ user, size = "md", color = "cyan" }: { user: LeaderboardUser, size?: "sm" | "md" | "lg", color?: string }) => {
    const initials = user.name?.substring(0, 2).toUpperCase() || "??";
    const sizeClasses = {
      sm: "w-8 h-8 text-[10px]",
      md: "w-14 h-14 text-sm",
      lg: "w-24 h-24 text-2xl"
    };

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

  return (
    <div className="space-y-4 md:space-y-6 pb-32">
      
      {/* MENÚ SUPERIOR DE 3 OPCIONES - SOLO PARA JUGADORES */}
      {!isAdminOrMod && (
        <div className="sticky top-0 z-40 bg-[#050a1f]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-around max-w-2xl mx-auto h-16 md:h-20">
            {[
              { id: "misiones", label: "Misiones" },
              { id: "bonos", label: "Bonos" },
              { id: "referidos", label: "Invita a Amigos" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id as any)}
                className={cn(
                  "relative h-full px-4 flex items-center justify-center text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors",
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
              
              {/* HEADER PIRÁMIDE CON CONTADOR Y TABLA DE PREMIOS */}
              <div className="flex flex-col gap-6">
                <div className="relative overflow-hidden bg-[#0b0e14] border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Trophy className="w-48 h-48 text-white" />
                  </div>
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
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Timer className="w-3 h-3 text-cyan-500" /> El Tiempo se agota en:
                        </p>
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

                {/* TARJETA DE DESGLOSE DE PREMIOS (NUEVA) */}
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

              {/* PODIO DINÁMICO ORDENADO (2, 1, 3) */}
              <div className="flex items-end justify-center w-full gap-3 md:gap-8 pt-10 px-2 max-w-3xl mx-auto">
                {/* 2º PUESTO */}
                {users[1] && (
                  <div className="flex-1 flex flex-col items-center group">
                    <div className="relative mb-4 group-hover:scale-105 transition-transform duration-500">
                      <PlayerAvatar user={users[1]} size="md" color="silver" />
                      <div className="absolute -top-2 -right-2 bg-slate-400 text-slate-950 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg">2</div>
                    </div>
                    <div className="w-full h-32 md:h-48 bg-gradient-to-t from-slate-500/40 via-slate-500/10 to-transparent rounded-t-[2.5rem] border-x border-t border-slate-500/30 flex flex-col items-center justify-center p-4 shadow-[0_-20px_40px_rgba(148,163,184,0.1)]">
                      <div className="text-slate-300 font-black text-[10px] md:text-sm uppercase mb-2">Premio: +$50.00</div>
                      <span className="text-white font-black uppercase text-[9px] md:text-sm truncate w-full text-center leading-none mb-1">{users[1].name}</span>
                      <span className="text-slate-400 font-bold text-[8px] md:text-xs">{(users[1].balance/1000).toFixed(2)} pts</span>
                    </div>
                  </div>
                )}

                {/* 1º PUESTO */}
                {users[0] && (
                  <div className="flex-[1.2] flex flex-col items-center z-10 group">
                    <div className="relative mb-6 group-hover:scale-110 transition-transform duration-500">
                      <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}>
                        <Crown className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                      </motion.div>
                      <PlayerAvatar user={users[0]} size="lg" color="gold" />
                      <div className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-950 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-xl border-4 border-[#050a1f]">1</div>
                    </div>
                    <div className="w-full h-48 md:h-72 bg-gradient-to-t from-yellow-500/50 via-yellow-500/20 to-transparent rounded-t-[3rem] border-x border-t border-yellow-500/40 flex flex-col items-center justify-center p-6 shadow-[0_-30px_60px_rgba(234,179,8,0.2)]">
                      <div className="text-yellow-400 font-black text-xs md:text-xl uppercase mb-4 animate-pulse drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">Premio: +$100.00</div>
                      <span className="text-white font-black uppercase text-xs md:text-2xl truncate w-full text-center leading-none mb-2 drop-shadow-xl">{users[0].name}</span>
                      <span className="text-yellow-100 font-bold text-[10px] md:text-base">{(users[0].balance/1000).toFixed(2)} pts</span>
                    </div>
                  </div>
                )}

                {/* 3º PUESTO */}
                {users[2] && (
                  <div className="flex-1 flex flex-col items-center group">
                    <div className="relative mb-4 group-hover:scale-105 transition-transform duration-500">
                      <PlayerAvatar user={users[2]} size="md" color="bronze" />
                      <div className="absolute -top-2 -right-2 bg-amber-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg">3</div>
                    </div>
                    <div className="w-full h-24 md:h-36 bg-gradient-to-t from-amber-700/40 via-amber-700/10 to-transparent rounded-t-[2.5rem] border-x border-t border-amber-800/30 flex flex-col items-center justify-center p-4 shadow-[0_-20px_40px_rgba(180,83,9,0.1)]">
                      <div className="text-amber-500 font-black text-[8px] md:text-xs uppercase mb-1">Premio: +$25.00</div>
                      <span className="text-white font-black uppercase text-[9px] md:text-xs truncate w-full text-center leading-none mb-1">{users[2].name}</span>
                      <span className="text-amber-800 font-bold text-[7px] md:text-[10px]">{(users[2].balance/1000).toFixed(2)} pts</span>
                    </div>
                  </div>
                )}
              </div>

              {/* LISTA DE PUESTOS RESTANTES */}
              <div className="bg-[#0b0e14]/80 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                {restOfUsers.map((user, idx) => (
                  <div key={user.id} className="px-8 py-5 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all">
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-black text-slate-700 italic">#{idx + 4}</span>
                      <PlayerAvatar user={user} size="sm" />
                      <span className="text-xs font-black text-white uppercase tracking-tight">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-white italic tracking-tighter">${(user.balance/1000).toFixed(2)}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            
            <motion.div key="active-tab-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6 space-y-6">
              
              {/* CONTENIDO: INVITA A AMIGOS (FUNCIONAL) */}
              {activeTab === "referidos" && (
                <div className="space-y-6">
                  {/* Banner Principal */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-white/10">
                    <div className="relative z-10 space-y-4">
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight uppercase italic">¡Gana <span className="text-emerald-400">$1.00 USD</span> <br /> por amigo invitado!</h2>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest max-w-[200px]">El premio se acredita cuando tu amigo haga su primer retiro.</p>
                    </div>
                    <Gift className="absolute -right-4 -bottom-4 w-40 h-40 text-white/10 rotate-12" />
                  </div>

                  {/* Sección de Link */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tu Enlace de Referido Personal</p>
                    <div className="bg-[#1a1c26] border border-white/10 rounded-2xl p-2 flex items-center justify-between gap-4 shadow-inner">
                      <div className="flex-1 px-4 overflow-hidden">
                        <code className="text-emerald-400 font-bold text-xs truncate block">{referralLink}</code>
                      </div>
                      <button onClick={copyToClipboard} className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2">
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "¡Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>

                  {/* Estadísticas Rápidas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0b0e14] border border-white/5 rounded-2xl p-6">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Ganado</p>
                      <p className="text-3xl font-black text-white italic tracking-tighter">$1.00</p>
                    </div>
                    <div className="bg-[#0b0e14] border border-white/5 rounded-2xl p-6">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Pendiente</p>
                      <p className="text-3xl font-black text-yellow-500 italic tracking-tighter">$2.00</p>
                    </div>
                  </div>

                  {/* HISTORIAL DE REFERIDOS (FUNCIONAL) */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Historial de Invitados
                    </h3>
                    <div className="space-y-2">
                      {mockReferrals.map((ref, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-white text-xs">{ref.name[0]}</div>
                            <div>
                              <p className="text-sm font-black text-white uppercase">{ref.name}</p>
                              <p className="text-[9px] font-bold text-slate-500 italic">Unido el {ref.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={cn("text-[9px] font-black px-3 py-1 rounded-full border mb-1 inline-block", 
                              ref.status === "COMPLETADO" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20")}>
                              {ref.status}
                            </div>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{ref.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* CONTENIDO: BONOS (RECOMPENSAS ESPECIALES) */}
              {activeTab === "bonos" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-white/10 group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Gift className="w-40 h-40 text-white" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Premios Especiales</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Tu Centro de <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Bonificaciones</span></h2>
                      <p className="text-indigo-100/70 text-sm font-medium max-w-md">Multiplica tus ganancias y recibe premios exclusivos por tu lealtad a la plataforma.</p>
                    </div>
                  </div>

                  {/* Lista de Bonos Disponibles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Bono de Racha Semanal", desc: "Extra por jugar 7 días seguidos", amount: "+$5.00 USD", status: "DISPONIBLE", color: "yellow" },
                      { title: "Bono de Registro", desc: "Regalo por crear tu cuenta", amount: "+500 coins", status: "RECLAMADO", color: "emerald" },
                      { title: "Bono de Nivel 5", desc: "Premio por tu primer rango alto", amount: "+1000 coins", status: "BLOQUEADO", color: "slate" },
                      { title: "Bono Especial de Fin de Mes", desc: "Solo para jugadores activos", amount: "+$3.00 USD", status: "BLOQUEADO", color: "slate" },
                    ].map((bono, i) => (
                      <div key={i} className="bg-[#0b0e14] border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:bg-white/[0.03] transition-all">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-white uppercase italic">{bono.title}</h4>
                            <p className="text-[10px] text-slate-500 font-bold">{bono.desc}</p>
                          </div>
                          <div className={cn("text-xs font-black italic", bono.color === "emerald" ? "text-emerald-500" : bono.color === "yellow" ? "text-yellow-500" : "text-slate-600")}>
                            {bono.amount}
                          </div>
                        </div>
                        <button 
                          disabled={bono.status !== "DISPONIBLE"}
                          className={cn(
                            "w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            bono.status === "RECLAMADO" ? "bg-emerald-500/10 text-emerald-500 cursor-default" :
                            bono.status === "DISPONIBLE" ? "bg-white text-slate-900 hover:scale-105 shadow-xl" : "bg-white/5 text-slate-600 cursor-not-allowed"
                          )}
                        >
                          {bono.status}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Canje de Código Promocional */}
                  <div className="bg-[#1a1c26] border border-white/10 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                        <Coins className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white uppercase italic">¿Tienes un código?</h3>
                        <p className="text-xs text-slate-500">Ingresa cupones especiales para recibir bonos instantáneos.</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3">
                      <input 
                        type="text" 
                        placeholder="EJ: BATTLE2026"
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-black placeholder:text-slate-800 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                      <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 md:py-0 md:px-8 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-cyan-500/20 w-full md:w-auto">
                        Canjear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO: MISIONES (DESAFÍOS DINÁMICOS) */}
              {activeTab === "misiones" && (
                <div className="space-y-6">
                  {/* Banner de Misiones */}
                  <div className="bg-[#0b0e14] border border-white/10 rounded-3xl p-10 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                      <Target className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Desafíos <br /> <span className="text-emerald-400">Diarios</span></h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Completa retos y acumula coins gratis</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-8 py-4 text-center">
                        <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Misiones Hoy</p>
                        <p className="text-2xl font-black text-white italic">2 / 5</p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Misiones Reales */}
                  <div className="space-y-4">
                    {misionesList.map((mision, i) => {
                      const isCompleted = completedMissions.includes(mision.id);
                      const Icon = mision.icon;

                      return (
                        <div key={i} className="bg-[#0b0e14]/60 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-white/[0.02] transition-all">
                          <div className="flex-1 space-y-6 w-full">
                            <div className="flex items-center gap-5">
                              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", 
                                isCompleted ? "bg-emerald-500/20 text-emerald-500 shadow-emerald-500/10" : "bg-white/5 text-slate-500")}>
                                <Icon className="w-7 h-7" />
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-white uppercase italic tracking-tight leading-none mb-2">{mision.title}</h4>
                                <p className="text-xs text-slate-500 font-bold">{mision.desc}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-600">Progreso de Misión</span>
                                <span className={cn(isCompleted ? "text-emerald-400" : "text-white")}>
                                  {mision.total ? `${mision.progress || 0} / ${mision.total}` : (isCompleted ? "1 / 1" : "0 / 1")}
                                </span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: isCompleted ? "100%" : (mision.total ? `${((mision.progress || 0) / mision.total) * 100}%` : "0%") }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className={cn("h-full rounded-full", 
                                    isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-cyan-500 to-blue-600")} 
                                />
                              </div>
                            </div>
                          </div>

                          <div className="text-center md:text-right flex flex-col items-center md:items-end gap-4 min-w-[150px]">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recompensa</p>
                              <div className="text-2xl font-black text-white italic tracking-tighter">{mision.reward}</div>
                            </div>
                            
                            {mision.url ? (
                              <button 
                                onClick={() => handleCompleteMission(mision.id, mision.url!)}
                                disabled={isCompleted || loadingMission === mision.id}
                                className={cn(
                                  "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2",
                                  isCompleted 
                                    ? "bg-emerald-500/10 text-emerald-500 cursor-default" 
                                    : "bg-white text-slate-900 hover:scale-105"
                                )}
                              >
                                {isCompleted ? "Completado" : loadingMission === mision.id ? "Procesando..." : (
                                  <>
                                    Ir a {mision.color === "pink" ? "Instagram" : "Facebook"}
                                    <ExternalLink className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 text-slate-700">
                                En Curso
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
