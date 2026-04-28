"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coins, Menu, X, Globe, User } from "lucide-react";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 ${scrolled ? 'py-4' : 'py-8'}`}>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <div className={`transition-all duration-500 border border-white/5 shadow-2xl rounded-[1.5rem] px-8 py-4 flex items-center justify-between ${scrolled ? 'bg-[#050a1f]/80 backdrop-blur-2xl' : 'bg-transparent'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/40 transition-all"></div>
              <Coins className="w-8 h-8 text-cyan-400 relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white leading-none">BATTLE<span className="text-cyan-400">COINS</span></span>
              <span className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase">Enterprise</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {["Inicio", "Beneficios", "Cómo funciona", "Comunidad"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/login" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              <User className="w-4 h-4" />
              Login
            </Link>
            <Link href="/register">
              <button className="bg-white text-slate-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95">
                Empezar Ahora
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:hidden mt-4 glass-premium rounded-3xl p-8 flex flex-col gap-6"
          >
            {["Inicio", "Beneficios", "Cómo funciona", "Comunidad"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-xl font-black text-white hover:text-cyan-400 uppercase tracking-tighter"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            ))}
            <hr className="border-white/5" />
            <div className="flex flex-col gap-4">
              <Link href="/login" className="text-lg font-bold text-slate-400" onClick={() => setIsOpen(false)}>Login</Link>
              <Link href="/register">
                <button className="w-full py-4 rounded-xl font-black text-slate-950 bg-cyan-400" onClick={() => setIsOpen(false)}>
                  REGISTRARSE
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </nav>
  );
};
