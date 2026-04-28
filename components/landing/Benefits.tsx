"use client";

import { motion } from "framer-motion";
import { 
  Trophy, 
  Target, 
  Zap, 
  Coins, 
  Crown, 
  Rocket,
  ShieldCheck,
  BarChart3
} from "lucide-react";

const benefits = [
  {
    title: "Recompensas Reales",
    desc: "Convierte tus logros en Battle Coins canjeables por beneficios exclusivos en todo el ecosistema.",
    icon: Coins,
    color: "cyan",
    stat: "+15k Coins"
  },
  {
    title: "Progresión de Élite",
    desc: "Sube de nivel y desbloquea rangos legendarios que te otorgan estatus y acceso prioritario.",
    icon: Crown,
    color: "purple",
    stat: "Nivel 100+"
  },
  {
    title: "Seguridad Blindada",
    desc: "Tus activos y datos están protegidos por tecnología de encriptación de grado militar.",
    icon: ShieldCheck,
    color: "blue",
    stat: "100% Seguro"
  }
];

export const Benefits = () => {
  return (
    <section id="beneficios" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-cyan-400 font-black uppercase tracking-[0.4em] text-xs mb-4"
            >
              ¿Por qué elegirnos?
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl text-hero text-white"
            >
              La Experiencia <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Definitiva</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-400 text-xl max-w-sm font-medium leading-relaxed"
          >
            Hemos redefinido las reglas para ofrecerte una plataforma donde tu tiempo se traduce en valor real.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="glass-premium p-10 rounded-[2.5rem] h-full flex flex-col hover:border-cyan-500/50 transition-all duration-500 relative overflow-hidden">
                {/* Accent background */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${benefit.color}-500/10 blur-3xl group-hover:bg-${benefit.color}-500/20 transition-all`}></div>

                <div className="mb-10 flex items-start justify-between">
                  <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500`}>
                    <benefit.icon className={`w-8 h-8 text-${benefit.color}-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]`} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                    {benefit.stat}
                  </div>
                </div>

                <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed font-medium mb-10 flex-grow">
                  {benefit.desc}
                </p>

                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors cursor-pointer">
                  Saber más <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
