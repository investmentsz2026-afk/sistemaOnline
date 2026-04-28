"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Trophy, Rocket } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 right-[10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-[10%] w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-premium rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden border-white/5"
        >
          {/* Animated corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400 to-transparent opacity-20"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-6 py-2 mb-10"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Acceso Anticipado Disponible</span>
            </motion.div>

            <h2 className="text-5xl md:text-8xl text-hero text-white mb-12">
              ¿Estás listo para <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Reclamar tu Trono?</span>
            </h2>

            <p className="text-xl md:text-3xl text-slate-400 mb-16 font-light leading-tight max-w-2xl mx-auto">
              Únete a miles de jugadores que ya están transformando su pasión en <span className="text-white font-bold">beneficios legendarios</span>.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link href="/register">
                <button className="bg-white text-slate-950 px-16 py-8 rounded-[2rem] font-black text-2xl uppercase tracking-tighter hover:bg-cyan-400 transition-all shadow-[0_30px_60px_-15px_rgba(255,255,255,0.3)] flex items-center gap-6 group">
                  ¡EMPEZAR AHORA!
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
            </motion.div>

            <div className="mt-20 grid grid-cols-3 gap-8 border-t border-white/5 pt-12">
              {[
                { icon: Trophy, label: "Logros" },
                { icon: Rocket, label: "Velocidad" },
                { icon: Zap, label: "Energía" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <item.icon className="w-6 h-6 text-slate-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
