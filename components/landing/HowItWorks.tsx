"use client";

import { motion } from "framer-motion";
import { UserPlus, Gamepad2, Coins, Crown, ChevronRight } from "lucide-react";

const steps = [
  {
    title: "Inicia tu Leyenda",
    desc: "Crea tu perfil en segundos y recibe un bono de bienvenida para comenzar tu aventura.",
    icon: UserPlus,
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    title: "Conquista Desafíos",
    desc: "Participa en misiones diarias y eventos especiales diseñados para poner a prueba tus habilidades.",
    icon: Gamepad2,
    gradient: "from-purple-500 to-indigo-600"
  },
  {
    title: "Cosecha Recompensas",
    desc: "Acumula Battle Coins por cada victoria. Tu tiempo ahora tiene un valor real y tangible.",
    icon: Coins,
    gradient: "from-yellow-500 to-orange-600"
  },
  {
    title: "Alcanza la Gloria",
    desc: "Escala en el ranking global y desbloquea el estatus de Leyenda con beneficios exclusivos.",
    icon: Crown,
    gradient: "from-pink-500 to-rose-600"
  }
];

export const HowItWorks = () => {
  return (
    <section id="cómo-funciona" className="py-32 relative overflow-hidden bg-[#050a1f]">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-grid-white opacity-5"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-6"
          >
            Tu Camino al Éxito
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl text-hero text-white"
          >
            Cómo <span className="text-cyan-400">Funciona</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-4 gap-12 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-16 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20"></div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="group text-center"
            >
              <div className="relative mb-10 inline-block">
                <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${step.gradient} p-[1px] group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                  <div className="w-full h-full bg-[#050a1f] rounded-[2.5rem] flex items-center justify-center">
                    <step.icon className="w-12 h-12 text-white" />
                  </div>
                </div>
                {/* Step Number Badge */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white text-slate-950 flex items-center justify-center font-black text-lg shadow-xl">
                  {idx + 1}
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-[250px] mx-auto font-medium">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
