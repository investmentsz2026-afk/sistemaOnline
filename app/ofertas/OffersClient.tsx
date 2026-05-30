"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Coins, 
  PlayCircle, 
  Gift, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Bell,
  Check
} from "lucide-react";
import Script from "next/script";
import { addPoints, requestRedeemPoints, claimNotificationPoints } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OffersClientProps {
  initialPoints: number;
  initialBalance: number;
  watchedAdsToday?: Record<string, boolean>;
  hasClaimedNotifications: boolean;
}

export const OffersClient = ({ initialPoints, initialBalance, watchedAdsToday, hasClaimedNotifications }: OffersClientProps) => {
  const [points, setPoints] = useState(initialPoints);
  const [balance, setBalance] = useState(initialBalance);
  const [activeTab, setActiveTab] = useState<"EARN" | "REDEEM">("EARN");
  const [loadingOffer, setLoadingOffer] = useState<string | null>(null);
  const [watchedToday, setWatchedToday] = useState<Record<string, boolean>>(watchedAdsToday || {});
  const [showStatusModal, setShowStatusModal] = useState<{ show: boolean, type: "SUCCESS" | "ERROR", title: string, message: string }>({
    show: false,
    type: "SUCCESS",
    title: "",
    message: ""
  });

  const [pushClaimed, setPushClaimed] = useState(hasClaimedNotifications);
  const [loadingPush, setLoadingPush] = useState(false);
  const [permissionState, setPermissionState] = useState<string>("default");

  const injectMonetagScript = () => {
    if (typeof window === "undefined") return;
    if (document.getElementById("monetag-push-dynamic")) return;
    const s = document.createElement("script");
    s.id = "monetag-push-dynamic";
    s.dataset.zone = "10997142";
    s.src = "https://nap5k.com/tag.min.js";
    const parent = [document.documentElement, document.body].filter(Boolean).pop();
    if (parent) {
      parent.appendChild(s);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionState(Notification.permission);
      if (Notification.permission === "granted") {
        injectMonetagScript();
      }
    }
  }, []);

  const handleRequestPushPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Tu navegador no soporta notificaciones push.");
      return;
    }

    if (Notification.permission === "denied") {
      toast.error("Has bloqueado las notificaciones. Por favor, habilítalas en la configuración de tu navegador.");
      return;
    }

    setLoadingPush(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === "granted") {
        injectMonetagScript();

        if (pushClaimed) {
          toast.success("Notificaciones activas.");
          setLoadingPush(false);
          return;
        }

        const res = await claimNotificationPoints();
        if (res.success) {
          toast.success("¡Notificaciones activadas! +100 Puntos sumados.");
          setPoints(prev => prev + 100);
          setPushClaimed(true);
        } else {
          toast.error(res.error || "Error al procesar la recompensa.");
        }
      } else if (permission === "denied") {
        toast.error("Notificaciones rechazadas. Habilítalas para poder recibir la recompensa.");
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      toast.error("Ocurrió un error al solicitar permisos de notificación.");
    } finally {
      setLoadingPush(false);
    }
  };

  const earnOptions = [
    { id: "v1", title: "Anuncio de Video", pts: 50, desc: "Mira un video corto y suma puntos al instante.", icon: PlayCircle, color: "from-cyan-500 to-blue-600", url: "https://omg10.com/4/11056718" },
    { id: "v2", title: "Oferta Especial", pts: 100, desc: "Anuncio de alto valor para usuarios premium.", icon: Sparkles, color: "from-purple-500 to-indigo-600", url: "https://omg10.com/4/11056718" },
    { id: "v3", title: "Mega Bono", pts: 500, desc: "Completa la visualización para un bono masivo.", icon: Trophy, color: "from-orange-500 to-red-600", url: "https://omg10.com/4/11056718" },
  ];

  const handleEarn = async (opt: any) => {
    setLoadingOffer(opt.id);
    
    // Abrir anuncio en nueva pestaña para que Monetag registre la visita
    window.open(opt.url, "_blank");

    // Simulamos la carga/visualización
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const result = await addPoints(opt.pts, `Viendo ${opt.title}`);
    if (result.success) {
      toast.success(`+${opt.pts} Puntos acreditados!`);
      setPoints(prev => prev + opt.pts);
      setWatchedToday(prev => ({ ...prev, [opt.id]: true }));
    } else {
      toast.error(result.error);
    }
    setLoadingOffer(null);
  };

  const handleRedeem = async (option: "BASIC" | "PREMIUM", cost: number, value: number) => {
    const result = await requestRedeemPoints(option);
    
    if (result.success) {
      setShowStatusModal({
        show: true,
        type: "SUCCESS",
        title: "Solicitud Enviada",
        message: "Tu solicitud de canje ha sido enviada al administrador. Recibirás una notificación cuando sea aprobada."
      });
    } else {
      if (result.error === "PUNTOS_INSUFICIENTES") {
        setShowStatusModal({
          show: true,
          type: "ERROR",
          title: "Puntos Insuficientes",
          message: `Todavía no tienes los ${cost} puntos necesarios para este canje. ¡Sigue viendo anuncios!`
        });
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Monetag Scripts */}
      <Script src="https://n6wxm.com/vignette.min.js" data-zone="11056724" async data-cfasync="false" />

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-cyan-400" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Tus Puntos Acumulados</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-white italic tracking-tighter tabular-nums">{points}</span>
            <span className="text-cyan-400 font-bold mb-2">PTS</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coins className="w-24 h-24 text-emerald-400" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Balance en Billetera</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-white italic tracking-tighter tabular-nums">${balance.toFixed(2)}</span>
            <span className="text-emerald-400 font-bold mb-2">BC</span>
          </div>
        </motion.div>
      </div>

      {/* Banner Destacado para Notificaciones Push (Soft Opt-in) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-cyan-950/40 via-slate-950/60 to-purple-950/40 border border-cyan-500/20 rounded-[2.5rem] p-8 backdrop-blur-xl overflow-hidden group shadow-2xl"
      >
        {/* Glow decorativo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6 flex-col md:flex-row text-center md:text-left">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all">
                <Bell className="w-8 h-8 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              {/* Efecto de pulso si no ha sido reclamado */}
              {!pushClaimed && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2 justify-center md:justify-start">
                🔔 Alertas de Batalla
                <span className="bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase not-italic">
                  Recomendado
                </span>
              </h3>
              <p className="text-slate-400 text-xs font-medium max-w-xl leading-relaxed">
                Activa las notificaciones del navegador para recibir códigos de regalo diarios, alertas de nuevas ruletas y promociones de Battle Coins en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0 justify-end">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center w-full sm:w-auto">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Recompensa Única</p>
              <span className="text-xl font-black text-cyan-400 tracking-tight">+100 <span className="text-xs uppercase text-slate-400">Pts</span></span>
            </div>
            
            <button
              onClick={handleRequestPushPermission}
              disabled={pushClaimed || loadingPush}
              className={cn(
                "w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all select-none active:scale-95",
                pushClaimed
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed flex items-center justify-center gap-2"
                  : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
              )}
            >
              {loadingPush ? (
                "Procesando..."
              ) : pushClaimed ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Activado & Reclamado
                </span>
              ) : (
                "Activar y Reclamar"
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Internal Sub-menu */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative bg-white/[0.03] border border-white/10 p-1.5 rounded-[2rem] flex items-center backdrop-blur-xl shadow-2xl">
          <button 
            onClick={() => setActiveTab("EARN")}
            className={cn(
              "relative px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 z-10",
              activeTab === "EARN" ? "text-slate-950" : "text-slate-500 hover:text-white"
            )}
          >
            {activeTab === "EARN" && (
              <motion.div 
                layoutId="active-bg"
                className="absolute inset-0 bg-cyan-400 rounded-[1.5rem] shadow-[0_0_25px_rgba(34,211,238,0.4)]"
              />
            )}
            <span className="relative z-10">Ver Anuncios</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("REDEEM")}
            className={cn(
              "relative px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 z-10",
              activeTab === "REDEEM" ? "text-slate-950" : "text-slate-500 hover:text-white"
            )}
          >
            {activeTab === "REDEEM" && (
              <motion.div 
                layoutId="active-bg"
                className="absolute inset-0 bg-emerald-400 rounded-[1.5rem] shadow-[0_0_25px_rgba(16,185,129,0.4)]"
              />
            )}
            <span className="relative z-10">Canjear Puntos</span>
          </button>
        </div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em] animate-pulse">
          {activeTab === "EARN" ? "Genera riqueza viendo publicidad" : "Convierte tu esfuerzo en saldo real"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "EARN" ? (
          <motion.div 
            key="earn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {earnOptions.map((opt) => (
              <div 
                key={opt.id}
                className="bg-[#0b0e14] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center text-center group hover:border-cyan-500/30 transition-all relative overflow-hidden"
              >
                <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-tr flex items-center justify-center mb-6 shadow-lg", opt.color)}>
                  <opt.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">{opt.title}</h3>
                <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed px-4">{opt.desc}</p>
                
                <div className="mt-auto w-full">
                  <div className="bg-white/5 rounded-2xl py-3 mb-4">
                    <span className="text-lg font-black text-cyan-400">+{opt.pts} <span className="text-[10px] uppercase">Pts</span></span>
                  </div>
                  
                  <button 
                    onClick={() => handleEarn(opt)}
                    disabled={loadingOffer !== null || watchedToday[opt.id]}
                    className={cn(
                      "w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all select-none active:scale-95 disabled:opacity-50",
                      watchedToday[opt.id] 
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed" 
                        : "bg-white text-slate-950 hover:bg-cyan-400"
                    )}
                  >
                    {loadingOffer === opt.id ? "Cargando..." : watchedToday[opt.id] ? "Completado hoy" : "Ver Ahora"}
                  </button>
                </div>

                {/* Decorative particles */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors" />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="redeem"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="bg-[#0b0e14] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/30" />
              <div className="w-20 h-20 rounded-3xl bg-yellow-500/10 flex items-center justify-center mb-6">
                <Gift className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Canje Básico</h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">Convierte tus puntos en saldo para jugar batallas.</p>
              
              <div className="space-y-2 mb-10 w-full">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 bg-white/5 p-4 rounded-xl">
                  <span>Puntos</span>
                  <span className="text-white">1000</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 bg-white/5 p-4 rounded-xl">
                  <span>Recibes</span>
                  <span className="text-emerald-400">$0.50 BC</span>
                </div>
              </div>

              <button 
                onClick={() => handleRedeem("BASIC", 1000, 0.50)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] active:scale-95"
              >
                Canjear Ahora
              </button>
            </div>

            <div className="bg-[#0b0e14] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center relative overflow-hidden group border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.05)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50" />
              <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-6">
                <Trophy className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Canje Premium</h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">¡Mejor tasa de cambio para usuarios frecuentes!</p>
              
              <div className="space-y-2 mb-10 w-full">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 bg-white/5 p-4 rounded-xl border border-cyan-500/10">
                  <span>Puntos</span>
                  <span className="text-white">2000</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 bg-white/5 p-4 rounded-xl border border-cyan-500/10">
                  <span>Recibes</span>
                  <span className="text-emerald-400">$1.00 BC</span>
                </div>
              </div>

              <button 
                onClick={() => handleRedeem("PREMIUM", 2000, 1.00)}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(6,182,212,0.2)] active:scale-95"
              >
                Canjear Ahora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Section */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
        <div className="bg-cyan-500/10 p-6 rounded-full">
          <AlertCircle className="w-12 h-12 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-xl font-black text-white italic uppercase mb-2">¿Cómo funciona?</h4>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Por cada anuncio que veas, el sistema te otorga puntos. Una vez acumules la cantidad suficiente, podrás canjearlos por <span className="text-white font-bold">Battle Coins (BC)</span>. Los BC se añaden automáticamente a tu balance y puedes usarlos para entrar en batallas de ruleta o retirarlos si alcanzas el mínimo.
          </p>
        </div>
      </div>
      {/* Status Modal */}
      <AnimatePresence>
        {showStatusModal.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatusModal({ ...showStatusModal, show: false })}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0b0e14] border border-white/10 rounded-[3rem] p-10 max-w-md w-full relative z-10 text-center space-y-6 shadow-2xl"
            >
              <div className={cn(
                "w-20 h-20 rounded-full mx-auto flex items-center justify-center",
                showStatusModal.type === "SUCCESS" ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
              )}>
                {showStatusModal.type === "SUCCESS" ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{showStatusModal.title}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{showStatusModal.message}</p>
              </div>
              <button 
                onClick={() => setShowStatusModal({ ...showStatusModal, show: false })}
                className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
