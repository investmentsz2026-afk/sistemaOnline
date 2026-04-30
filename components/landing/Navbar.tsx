"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Coins, Menu, X, Globe, User } from "lucide-react";
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
            {(() => {
              const baseItems = session?.user 
                ? ["Gane", "Batalla", "Mis Ofertas", "Retiro", "Recompensas"]
                : ["Inicio", "Beneficios", "Cómo funciona", "Comunidad"];
              
              const navItems = [...baseItems];
              if (session?.user && (session.user.role === "ADMIN" || session.user.role === "MODERATOR")) {
                navItems.push("Panel Admin");
              }

              return navItems.map((item) => {
                let targetPath = item === "Gane" ? "/inicio" : `/${item.toLowerCase().replace(" ", "-")}`;
                if (item === "Panel Admin") targetPath = "/dashboard";
                
                const href = session?.user ? targetPath : `#${item.toLowerCase().replace(" ", "-")}`;
                const isActive = session?.user && pathname === targetPath;
                
                return (
                  <Link 
                    key={item} 
                    href={href}
                    className="group relative"
                  >
                    <span className={`text-xs font-black uppercase tracking-[0.2em] transition-all ${isActive ? "text-cyan-400" : item === "Panel Admin" ? "text-indigo-400 hover:text-indigo-300" : "text-slate-400 hover:text-white"}`}>
                      {item}
                    </span>
                    <span className={`absolute -bottom-1 left-0 h-0.5 transition-all group-hover:w-full ${isActive ? "w-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "w-0 bg-indigo-500"}`}></span>
                  </Link>
                );
              });
            })()}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-8">
            {session?.user ? (
              <UserMenu user={session.user as any} showName={true} />
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                  Login
                </Link>
                <Link href="/register">
                  <button className="bg-white text-slate-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95">
                    Empezar Ahora
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle or User Profile */}
          <div className="lg:hidden">
            {session?.user ? (
              <UserMenu user={session.user as any} showName={false} />
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

        {/* Mobile Nav (Only for guests) */}
        {isOpen && !session?.user && (
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
