"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Gamepad2, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background Image with Parallax-like effect */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=2000" 
          alt="Gaming Universe" 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-30 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a1f]/80 via-transparent to-[#050a1f]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050a1f] via-transparent to-transparent"></div>
      </div>

      {/* Decorative Animated Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-500/10 rounded-full animate-slow-spin -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-purple-500/10 rounded-full animate-slow-spin -z-10 [animation-direction:reverse]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-6 py-2 mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Battle Coins Enterprise v2.0</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-[110px] text-hero mb-8"
          >
            <span className="block text-white">Domina el</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              Juego Digital
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-3xl text-slate-300 mb-12 max-w-2xl font-light leading-tight"
          >
            Gana, progresa y desbloquea recompensas reales. <span className="text-white font-bold">La evolución del gaming</span> está aquí.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link href="/register">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(34,211,238,0.6)" }}
                whileTap={{ scale: 0.98 }}
                className="btn-gaming bg-cyan-400 text-slate-950 flex items-center gap-3 group"
              >
                Empezar Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <button className="flex items-center gap-4 group px-6 py-4 rounded-xl border border-white/10 hover:border-white/30 transition-all backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-white">Ver Tráiler</span>
            </button>
          </motion.div>

          {/* Social Proof Mini */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#050a1f] bg-slate-800 relative overflow-hidden">
                  <Image src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" fill className="object-cover" />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="text-white font-black">+25,000 Jugadores</div>
              <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Ya están ganando hoy</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating UI Elements (Modern/Elegant) */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[10%] top-[25%] hidden lg:block"
      >
        <div className="glass-premium p-6 rounded-[2rem] w-72">
          <div className="flex items-center justify-between mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Gamepad2 className="text-cyan-400 w-6 h-6" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Status</div>
          </div>
          <div className="space-y-4">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]"></div>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Progreso de Temporada</span>
              <span className="text-white">85%</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-green-400">Servidores Online</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
