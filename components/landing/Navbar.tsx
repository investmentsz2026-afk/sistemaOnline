"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/ui/motion/user-menu";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getNavItems = () => {
    if (session?.user) {
      const isAdminOrMod = session.user.role === "ADMIN" || session.user.role === "MODERATOR";
      
      if (isAdminOrMod) {
        return [
          { label: "INICIO", href: "/inicio" },
          { label: "RECOMPENSAS", href: "/recompensas" },
          { label: "PANEL ADMIN", href: "/dashboard" },
        ];
      }

      return [
        { label: "GANE", href: "/inicio" },
        { label: "BATALLA", href: "/batalla" },
        { label: "MIS OFERTAS", href: "/ofertas" },
        { label: "RETIRO", href: "/retiro" },
        { label: "RECOMPENSAS", href: "/recompensas" },
      ];
    }

    return [
      { label: "INICIO", href: "#inicio" },
      { label: "BENEFICIOS", href: "#beneficios" },
      { label: "CÓMO FUNCIONA", href: "#como-funciona" },
      { label: "COMUNIDAD", href: "#comunidad" },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 px-4 md:px-6 ${scrolled ? 'py-2 md:py-4' : 'py-4 md:py-8'}`}>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <div className={`transition-all duration-500 border border-white/5 shadow-2xl rounded-[1.2rem] md:rounded-[1.5rem] px-4 md:px-8 py-2 md:py-4 flex items-center justify-between ${scrolled ? 'bg-[#050a1f]/80 backdrop-blur-2xl' : 'bg-[#050a1f]/40 backdrop-blur-md'}`}>
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
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isSpecial = item.label === "PANEL ADMIN";
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className="group relative"
                >
                  <span className={`text-xs font-black uppercase tracking-[0.2em] transition-all ${
                    isActive 
                      ? "text-cyan-400" 
                      : isSpecial 
                        ? "text-indigo-400 hover:text-indigo-300" 
                        : "text-slate-400 hover:text-white"
                  }`}>
                    {item.label}
                  </span>
                  <span className={`absolute -bottom-1 left-0 h-0.5 transition-all group-hover:w-full ${isActive ? "w-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "w-0 bg-cyan-500"}`}></span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons / Counter */}
          <div className="hidden lg:flex items-center gap-8">
            {session?.user ? (
              <div className="flex items-center gap-6">
                {/* Coin Counter */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:border-cyan-500/30 transition-all group"
                >
                  <div className="bg-cyan-500/20 p-1.5 rounded-full group-hover:bg-cyan-500/40 transition-colors">
                    <Coins className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance</span>
                    <span className="text-sm font-black text-white tracking-tighter">
                      {(session.user as any).balance || 0} <span className="text-cyan-400">BC</span>
                    </span>
                  </div>
                </motion.div>

                <UserMenu user={session.user as any} showName={true} />
              </div>
            ) : (
              <>
                <a 
                  href="/moderators/login" 
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  LOGIN
                </a>
                <Link href="/login">
                  <button className="bg-white text-slate-950 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95">
                    JUGAR AHORA
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle (Left side for staff) or User Profile */}
          <div className="lg:hidden flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-3">
                {(session.user.role === "ADMIN" || session.user.role === "MODERATOR") && (
                  <button 
                    className="text-white p-2 hover:bg-white/5 rounded-xl transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                )}
                
                {/* Mobile Coin Counter */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <Coins className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-black text-white tracking-tighter">
                    {(session.user as any).balance || 0}
                  </span>
                </div>
                <UserMenu user={session.user as any} showName={false} />
              </div>
            ) : (
              <button 
                className="text-white p-2"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 bg-[#0b0e14]/95 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col gap-6 overflow-hidden"
            >
              {navItems.map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className="text-xl font-black text-white hover:text-cyan-400 uppercase tracking-tighter"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="border-white/5" />
              <div className="flex flex-col gap-4">
                <a href="/moderators/login" className="text-lg font-bold text-slate-400" onClick={() => setIsOpen(false)}>LOGIN STAFF</a>
                <Link href="/login">
                  <button className="w-full py-4 rounded-xl font-black text-slate-950 bg-cyan-400 uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                    JUGAR AHORA
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
};
