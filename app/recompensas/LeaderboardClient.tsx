"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Medal, ArrowUp, Crown, Timer, Trophy, Star, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  balance: number;
}

interface LeaderboardClientProps {
  users: LeaderboardUser[];
}

const WEEKLY_PRIZES = [
  { rank: "1º", prize: 100, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { rank: "2º", prize: 50, color: "text-slate-300", bg: "bg-slate-400/10" },
  { rank: "3º", prize: 25, color: "text-amber-600", bg: "bg-amber-600/10" },
  { rank: "4-10º", prize: 5, color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

export const LeaderboardClient = ({ users }: LeaderboardClientProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, mins: 30, secs: 45 });

  // Simulación de cuenta regresiva
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        return { ...prev, secs: 59, mins: prev.mins - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const podium = [
    users[2], // 3er Puesto
    users[0], // 1er Puesto
    users[1], // 2do Puesto
  ].filter(Boolean);

  const restOfUsers = users.slice(3);

  return (
    <div className="space-y-12 md:space-y-16 px-4 pb-20 max-w-5xl mx-auto">
      
      {/* HEADER DE PREMIACIÓN SEMANAL */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#020617] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl mt-8">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-40 h-40 text-yellow-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Premios de Temporada</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
              Pirámide de <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Recompensas</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-md">Los mejores de la semana se llevan el botín. ¡Escala puestos y asegura tu premio en efectivo!</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-xl">
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <Timer className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cierre de Semana</span>
            </div>
            <div className="flex gap-4">
              {[
                { val: timeLeft.days, unit: "D" },
                { val: timeLeft.hours, unit: "H" },
                { val: timeLeft.mins, unit: "M" },
                { val: timeLeft.secs, unit: "S" }
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-3xl md:text-4xl font-black text-white tabular-nums">{t.val.toString().padStart(2, '0')}</div>
                  <div className="text-[8px] font-black text-slate-600 uppercase mt-1">{t.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE PREMIOS (La Pirámide) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {WEEKLY_PRIZES.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={cn("p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center gap-2", p.bg)}
          >
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.rank} LUGAR</span>
            <span className={cn("text-2xl md:text-3xl font-black italic", p.color)}>${p.prize}.00 USD</span>
          </motion.div>
        ))}
      </div>

      {/* PODIO VISUAL */}
      <div className="flex items-end justify-center w-full max-w-2xl mx-auto pt-16 gap-2 md:gap-6">
        
        {/* 3º Puesto */}
        {podium[0] && (
          <div className="flex-1 flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-amber-700 p-1 bg-slate-950 overflow-hidden">
                {podium[0].image ? <img src={podium[0].image} className="w-full h-full object-cover" /> : <User className="w-full h-full text-amber-900/50" />}
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px]">3</div>
            </div>
            <div className="h-24 md:h-40 w-full bg-gradient-to-t from-amber-900/40 to-transparent rounded-t-[2rem] border-x border-t border-white/10 flex flex-col items-center justify-center p-4">
              <span className="text-white font-black uppercase text-[8px] md:text-xs truncate w-full text-center">{podium[0].name || "User"}</span>
              <span className="text-amber-500 font-black text-[10px] md:text-lg mt-1">+$25.00</span>
            </div>
          </div>
        )}

        {/* 1º Puesto */}
        {podium[1] && (
          <div className="flex-1 flex flex-col items-center z-10">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="relative mb-4">
              <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
              <div className="w-16 h-16 md:w-28 md:h-28 rounded-full border-[4px] border-yellow-500 p-1 bg-slate-950 overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.3)]">
                {podium[1].image ? <img src={podium[1].image} className="w-full h-full object-cover" /> : <User className="w-full h-full text-yellow-900/50" />}
              </div>
              <div className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-950 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-xl">1</div>
            </motion.div>
            <div className="h-40 md:h-64 w-full bg-gradient-to-t from-yellow-600/40 to-transparent rounded-t-[3rem] border-x border-t border-yellow-500/30 flex flex-col items-center justify-center p-6 shadow-[0_-20px_40px_rgba(234,179,8,0.1)]">
              <span className="text-white font-black uppercase text-[10px] md:text-xl truncate w-full text-center">{podium[1].name || "Champion"}</span>
              <span className="text-yellow-400 font-black text-sm md:text-3xl mt-1">+$100.00</span>
              <div className="mt-3 px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                <span className="text-[7px] md:text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">LÍDER</span>
              </div>
            </div>
          </div>
        )}

        {/* 2º Puesto */}
        {podium[2] && (
          <div className="flex-1 flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-14 h-14 md:w-24 md:h-24 rounded-full border-2 border-slate-400 p-1 bg-slate-950 overflow-hidden">
                {podium[2].image ? <img src={podium[2].image} className="w-full h-full object-cover" /> : <User className="w-full h-full text-slate-700/50" />}
              </div>
              <div className="absolute -top-1 -right-1 bg-slate-400 text-slate-950 w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px]">2</div>
            </div>
            <div className="h-32 md:h-52 w-full bg-gradient-to-t from-slate-500/40 to-transparent rounded-t-[2rem] border-x border-t border-white/10 flex flex-col items-center justify-center p-4">
              <span className="text-white font-black uppercase text-[8px] md:text-sm truncate w-full text-center">{podium[2].name || "User"}</span>
              <span className="text-slate-300 font-black text-[10px] md:text-2xl mt-1">+$50.00</span>
            </div>
          </div>
        )}
      </div>

      {/* LISTA GLOBAL */}
      <div className="bg-[#0b0e14]/50 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-xl">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ranking en Tiempo Real</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter italic">Live Update</span>
          </div>
        </div>
        
        <div className="divide-y divide-white/5">
          {restOfUsers.map((user, idx) => (
            <div key={user.id} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-6">
                <span className="w-4 text-sm font-black text-slate-700 group-hover:text-slate-400 transition-colors">{idx + 4}</span>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                  {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-700" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white uppercase tracking-tight">{user.name || "Player"}</span>
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" /> +$45.10 hoy
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white tracking-tighter">{(user.balance / 1000).toFixed(2)} USD</p>
                {idx < 7 && (
                  <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mt-0.5">Próx. Premio: +$5.00</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INFORMACIÓN DE PREMIACIÓN */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-14 h-14 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
          <Info className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-white font-black uppercase italic tracking-tighter mb-1">¿Cómo funcionan los premios?</h4>
          <p className="text-slate-400 text-sm leading-relaxed">Cada domingo a las 00:00 UTC, el sistema acredita automáticamente los premios a las cuentas de los ganadores basándose en su saldo acumulado de la semana. ¡Sigue ganando batallas para subir!</p>
        </div>
      </div>

    </div>
  );
};
