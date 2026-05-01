import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Benefits } from "@/components/landing/Benefits";
import { Stats } from "@/components/landing/Stats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Showcase } from "@/components/landing/Showcase";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { Offerwalls } from "@/components/landing/Offerwalls";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

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
                        {balance} <span className="text-cyan-400">BC</span>
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

          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            Featured Partners - Best Offers
          </h2>
          <Offerwalls />
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
