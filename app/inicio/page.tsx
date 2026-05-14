import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Benefits } from "@/components/landing/Benefits";
import { Stats } from "@/components/landing/Stats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Showcase } from "@/components/landing/Showcase";
import { Footer } from "@/components/landing/Footer";
import { Offerwalls } from "@/components/landing/Offerwalls";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LifeBuoy, TrendingUp, ArrowRight, Gamepad2 } from "lucide-react";

export default async function InicioPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userCount = await prisma.user.count();
  const realUserCount = 25000 + userCount; // Base Marketing + Real Users
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true }
  });

  const balance = user?.balance || 0;
  
  return (
    <main className="min-h-screen bg-[#050a1f] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Layer */}
      <ParticlesBackground />
      
      {/* Navigation */}
      <Navbar />

      {/* Offerwalls Section */}
      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Balance Summary Header */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-[#0b0e14]/80 to-[#1a1f36]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-cyan-500/20 transition-all duration-700"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                    Mi <span className="text-cyan-400">Progreso</span>
                  </h1>
                  <p className="text-slate-400 text-sm font-medium">Sigue ganando monedas y canjéalas por premios reales.</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Ganado</p>
                    <div className="flex items-center gap-3 justify-end">
                      <span className="text-4xl font-black text-white tracking-tighter">
                        {balance.toFixed(2)} <span className="text-cyan-400">BC</span>
                      </span>
                    </div>
                  </div>
                  <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Valor Estimado</p>
                    <span className="text-2xl font-black text-emerald-400 tracking-tighter">
                      ${(balance / 1000).toFixed(2)} <span className="text-[10px] text-slate-500 uppercase ml-1">USD</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NUEVO: Banner de Ofertas de Anuncios (Monetización) */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] border border-cyan-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl hover:border-cyan-500/40 transition-all duration-500">
              {/* Animación de fondo */}
              <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid.svg')] opacity-10"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/20 blur-[60px] rounded-full group-hover:bg-cyan-500/30 transition-all"></div>
              
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6 text-center lg:text-left flex-col lg:flex-row">
                  <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                      ¡Gana <span className="text-cyan-400">Puntos Gratis</span> ahora!
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                      Mira anuncios especiales y canjea tus puntos por <span className="text-white">Dólares Reales</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                  <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md hidden sm:block">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">Tasa de Cambio</span>
                    <span className="text-sm font-black text-emerald-400">1000 Pts = $0.50 BC</span>
                  </div>
                  <Link href="/ofertas" className="w-full lg:w-auto">
                    <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_40px_rgba(34,211,238,0.2)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                      Ir a Mis Ofertas
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder Section requested by user */}
          {/* Banner Promocional de Juegos */}
          <Link href="/juegos" className="block group">
            <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-[2.5rem] p-8 md:p-12 transition-all hover:border-cyan-400 shadow-2xl shadow-cyan-500/10">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Gamepad2 className="w-32 h-32 text-cyan-400 rotate-12" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-cyan-500 text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-full">Nuevo</span>
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Play to Earn</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                  ¡Juega aquí los <br /> <span className="text-cyan-400">Mejores Juegos!</span>
                </h2>
                <p className="text-slate-400 text-sm md:text-base font-medium max-w-md">
                  Diviértete con títulos premium y gana puntos automáticamente por cada minuto de juego. Sin descargas.
                </p>
                <div className="pt-4 flex items-center gap-4">
                  <div className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-cyan-400 transition-colors shadow-xl">
                    Jugar Ahora
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+10 Pts cada 5 min</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Módulo de Juegos Reales: Capsbit Media */}
          <div className="bg-[#0b0e14]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-pulse"></div>
            
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Servidor de Juegos Activo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Capsbit Media Engine</span>
              </div>
            </div>

            <div className="relative w-full aspect-[9/16] md:aspect-video min-h-[600px]">
              <iframe 
                src={`https://offerwall.capsbit.com/d50f409faabee3a513bb2450233eee/${session.user.id}`}
                className="absolute inset-0 w-full h-full border-none"
                title="Capsbit Media Games"
                allow="clipboard-write; fullscreen"
                scrolling="yes"
              ></iframe>
            </div>
          </div>
          {/* Banner de Soporte */}
          <div className="mt-12 mb-12">
            <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="flex items-center gap-5 text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <LifeBuoy className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-black uppercase italic tracking-tight text-lg">¿Tienes algún reclamo o problema?</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Habla con soporte ahora mismo</p>
                </div>
              </div>
              <Link href="/soporte">
                <button className="w-full md:w-auto bg-white text-slate-950 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 hover:scale-105 transition-all shadow-xl active:scale-95">
                  Ir a Soporte
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats (Social Proof) */}
      <Stats userCount={realUserCount} />

      {/* Global Footer */}
      <Footer />

      {/* Floating Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-1 h-1 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]"></div>
        <div className="absolute top-[30%] right-[10%] w-1 h-1 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_#a855f7]"></div>
        <div className="absolute bottom-[20%] left-[15%] w-1 h-1 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
      </div>
    </main>
  );
}
