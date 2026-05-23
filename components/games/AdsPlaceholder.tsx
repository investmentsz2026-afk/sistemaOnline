"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, ShieldAlert, Sparkles, Tv } from "lucide-react";

interface BannerAdProps {
  position: "top" | "bottom";
}

export function BannerAd({ position }: BannerAdProps) {
  const [activeAd, setActiveAd] = useState(0);
  
  const ads = [
    { title: "¡Bono de Bienvenida 200%!", desc: "Regístrate hoy en la mejor arena de batallas.", action: "Jugar Ahora" },
    { title: "Gana Criptomonedas Jugando", desc: "Participa en torneos semanales y retira al instante.", action: "Unirse" },
    { title: "Skins Exclusivas Cyberpunk", desc: "Desbloquea aspectos legendarios con 50% de descuento.", action: "Ver Tienda" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAd(prev => (prev + 1) % ads.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const ad = ads[activeAd];

  return (
    <div className={`w-full bg-slate-950/80 backdrop-blur-md border-t border-b border-white/5 py-3 px-4 flex items-center justify-between text-xs relative overflow-hidden z-20 ${position === "bottom" ? "mt-auto" : "mb-4"}`}>
      {/* Indicador de anuncio */}
      <div className="absolute top-0 right-4 bg-cyan-500/10 border-b border-l border-cyan-500/20 px-2 py-0.5 rounded-bl-lg">
        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Anuncio Patrocinado</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.3)]">
          AD
        </div>
        <div>
          <h4 className="font-black text-white italic uppercase tracking-tighter text-[11px] md:text-sm">
            {ad.title}
          </h4>
          <p className="text-slate-400 text-[9px] md:text-xs line-clamp-1">{ad.desc}</p>
        </div>
      </div>

      <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-4 py-1.5 rounded-full text-[10px] md:text-xs uppercase tracking-wider italic transition-all hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
        {ad.action}
      </button>
    </div>
  );
}

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InterstitialAd({ isOpen, onClose }: InterstitialAdProps) {
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(3);

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 p-8 rounded-[2.5rem] text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
        >
          {/* Fondo decorativo */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

          {/* Botón Cerrar */}
          <div className="absolute top-6 right-6">
            {secondsLeft > 0 ? (
              <div className="w-8 h-8 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-[10px] font-black text-cyan-400">
                {secondsLeft}s
              </div>
            ) : (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-cyan-500/20 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 flex items-center justify-center text-cyan-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mb-6 mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
            <Tv className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>

          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] block mb-2">Anuncio de Patrocinador</span>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">
            ¿Buscas el próximo reto?
          </h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Consigue multiplicadores de recompensas ilimitados uniendo tu cuenta de Discord hoy mismo.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (secondsLeft === 0) onClose();
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-2xl uppercase tracking-wider italic text-sm transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            >
              Visitar Enlace Patrocinado
            </a>
            {secondsLeft > 0 ? (
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Podrás cerrar en {secondsLeft} segundos
              </span>
            ) : (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors py-2"
              >
                Omitir Anuncio
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface RewardedAdProps {
  isOpen: boolean;
  onRewardClaimed: () => void;
  onClose: () => void;
}

export function RewardedAd({ isOpen, onRewardClaimed, onClose }: RewardedAdProps) {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      return;
    }
    setSecondsLeft(5);
    setIsPlaying(true);

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onRewardClaimed(); // Auto-completa el premio tras el conteo
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-lg bg-slate-950 border border-cyan-500/20 p-8 rounded-[3rem] text-center shadow-[0_0_100px_rgba(6,182,212,0.2)] overflow-hidden"
        >
          {/* Animación del reproductor de video simulado */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_60%)]"></div>

          <div className="absolute top-6 right-6">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-red-400 transition-colors text-xs font-black uppercase tracking-wider flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full"
            >
              <X className="w-3 h-3" /> Cancelar Revivir
            </button>
          </div>

          <div className="mb-6 text-cyan-400">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
              Anuncio Recompensado
            </span>
          </div>

          {/* Caja de video simulado */}
          <div className="w-full aspect-video bg-slate-900 border border-white/5 rounded-2xl mb-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Cargador en círculo */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="6"
                  fill="transparent"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#06b6d4"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: (5 - secondsLeft) / 5 * 251.2 }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              <span className="absolute text-xl font-black text-white italic">{secondsLeft}s</span>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Reproduciendo Video Patrocinado...
              </p>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-wider">
              <span>Calidad HD</span>
              <span>Monetag Ads Player v3.2</span>
            </div>
          </div>

          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
            ¡No te rindas ahora!
          </h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
            Visualiza este breve anuncio comercial completo para revivir en el mismo punto con un escudo de inmunidad temporal.
          </p>

          <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
              initial={{ width: "0%" }}
              animate={{ width: `${(5 - secondsLeft) / 5 * 100}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            Recompensa acreditada al finalizar el conteo
          </span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
