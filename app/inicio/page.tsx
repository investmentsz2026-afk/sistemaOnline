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
import { LifeBuoy } from "lucide-react";

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

          {/* Placeholder Section requested by user */}
          <div className="bg-[#0b0e14]/60 border border-white/10 border-dashed rounded-[2.5rem] p-12 md:p-20 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-[#050a1f] border border-white/10 rounded-3xl flex items-center justify-center">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">
                Sincronizando <span className="text-cyan-400">Nuevos Juegos</span>
              </h2>
              <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                Nuestros ingenieros están instalando las mejores ofertas y juegos exclusivos para ti. 
                Vuelve en unos minutos para empezar a ganar monedas reales.
              </p>
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instalación en curso</span>
                </div>
              </div>
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
