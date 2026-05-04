"use client";

import Link from "next/link";
import { 
  Coins, 
  GitBranch as Github, 
  Send as Twitter, 
  MessageSquare as Discord, 
  Video as Youtube,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="relative bg-[#050a1f] pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-4 mb-8 group">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-1.5 bg-cyan-500/20 rounded-full blur-lg group-hover:bg-cyan-500/40 transition-all"></div>
                
                {/* Shiny Circular Container */}
                <div className="relative w-14 h-14 rounded-full border-2 border-white/10 p-0.5 bg-[#0a102a] overflow-hidden shadow-2xl group-hover:border-cyan-500/50 transition-all">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-white uppercase">Battle<span className="text-cyan-400">Coins</span></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Enterprise</span>
              </div>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed mb-8 max-w-xs">
              Redefiniendo la economía digital a través de experiencias gaming inmersivas y recompensas de alta fidelidad.
            </p>
            <div className="flex gap-4">
              {[Twitter, Discord, Youtube, Github].map((Icon, i) => (
                <motion.a 
                  key={i}
                  href="#"
                  whileHover={{ y: -5, color: '#22d3ee' }}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-8">Navegación</h4>
            <ul className="space-y-4">
              {["Inicio", "Beneficios", "Cómo funciona", "Comunidad", "Seguridad"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-500 hover:text-cyan-400 font-bold transition-colors flex items-center group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-8">Recursos</h4>
            <ul className="space-y-4">
              {["Documentación", "API", "Auditorías", "Soporte", "Blog"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-500 hover:text-cyan-400 font-bold transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Status Section */}
          <div className="glass-premium p-8 rounded-[2rem] border-white/5">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Network Status
            </h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold">Latencia Global</span>
                <span className="text-cyan-400 font-black text-xs">24ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold">Uptime 24h</span>
                <span className="text-white font-black text-xs">99.99%</span>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-slate-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Certificado SSL v3.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">
            © 2026 Battle Coins Enterprise Solutions
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-slate-600">
              <Globe className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Global / ES</span>
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
              <Link href="#" className="hover:text-white transition-colors">Legal</Link>
              <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
