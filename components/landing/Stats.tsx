"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const Counter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export const Stats = ({ userCount }: { userCount: number }) => {
  return (
    <section className="py-20 relative overflow-hidden bg-[#050a1f]">
      {/* Background Vivid Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="glass-premium rounded-[3rem] p-12 md:p-20 grid grid-cols-2 lg:grid-cols-4 gap-12 border-cyan-500/20">
          {[
            { label: "Usuarios Activos", value: userCount, suffix: "", color: "cyan" },
            { label: "Coins Generadas", value: 120, suffix: "M", color: "purple" },
            { label: "Logros Épicos", value: 450, suffix: "k", color: "pink" },
            { label: "Países", value: 15, suffix: "+", color: "blue" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center group"
            >
              <div className={`text-5xl md:text-7xl font-black mb-4 tracking-tighter text-white group-hover:scale-110 transition-transform duration-500`}>
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className={`w-2 h-2 rounded-full bg-${stat.color}-500 animate-pulse`}></div>
                <div className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
