"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=1200",
    title: "Arenas Legendarias",
    desc: "Explora entornos hiper-realistas diseñados con IA para una inmersión total."
  },
  {
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1200",
    title: "Equipo Avanzado",
    desc: "Desbloquea ítems únicos con estadísticas dinámicas generadas en tiempo real."
  },
  {
    image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=1200",
    title: "Economía Viva",
    desc: "Un ecosistema financiero que evoluciona con tus decisiones y logros."
  }
];

export const Showcase = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-32 relative overflow-hidden bg-slate-950/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Text Content */}
          <div className="flex-1 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: -0 }}
              viewport={{ once: true }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-[0.3em] mb-8">
                <Sparkles className="w-4 h-4" />
                Innovación Visual
              </div>
              
              <h2 className="text-5xl md:text-7xl text-hero text-white mb-8">
                El Futuro es <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Generativo</span>
              </h2>

              <div className="space-y-8">
                {slides.map((slide, idx) => (
                  <motion.div 
                    key={idx}
                    className={`p-6 rounded-3xl transition-all duration-500 cursor-pointer ${current === idx ? 'bg-white/5 border-l-4 border-purple-500' : 'opacity-40 grayscale'}`}
                    onClick={() => setCurrent(idx)}
                  >
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{slide.title}</h3>
                    <p className="text-slate-400 font-medium">{slide.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Carousel Image */}
          <div className="flex-1 order-1 lg:order-2 w-full">
            <div className="relative aspect-video lg:aspect-square group">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative w-full h-full"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 1.1, rotateY: -30 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)] border border-white/10"
                  >
                    <Image 
                      src={slides[current].image} 
                      alt={slides[current].title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    
                    {/* Scanner Line Effect */}
                    <motion.div 
                      animate={{ 
                        top: ["0%", "100%", "0%"]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20 z-20 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                    />

                    {/* Digital Noise/Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    
                    {/* Floating Badge */}
                    <div className="absolute bottom-8 left-8 right-8 p-8 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2rem] shadow-2xl z-30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400 mb-2">Módulo 0{current + 1}</div>
                          <div className="text-2xl font-black text-white uppercase tracking-tight">{slides[current].title}</div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Navigation Arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={prev}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all"
                >
                  <ChevronLeft />
                </button>
                <button 
                  onClick={next}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
