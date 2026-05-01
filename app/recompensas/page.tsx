import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { LeaderboardClient } from "./LeaderboardClient";
import { Trophy, Gift, Target, ShieldCheck } from "lucide-react";

export default async function RecompensasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Obtener los top 10 ganadores reales de la base de datos
  const topUsers = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      image: true,
      balance: true,
    },
    orderBy: {
      balance: "desc",
    },
    take: 10,
  });

  return (
    <main className="min-h-screen bg-[#050a1f] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      <ParticlesBackground />
      <Navbar />

      <div className="pt-24 md:pt-32 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Header de la Sección */}
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full mb-6">
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Salón de la Fama</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
              RECOMPENSAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ÉLITE</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed px-2">
              Premiamos la lealtad y el esfuerzo de nuestros mejores jugadores semanalmente.
            </p>
          </div>

          {/* Componente de la Pirámide y Tabla (Client Side para animaciones) */}
          <LeaderboardClient users={topUsers} />

          {/* Sección de Información sobre Premios */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.08] transition-all group">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gift className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-3">Premios Semanales</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Cada domingo a las 00:00 UTC, los 3 mejores jugadores reciben un multiplicador de sus ganancias totales del 15%.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.08] transition-all group">
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-3">Retos Diarios</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Completa tareas específicas para subir puestos en el ranking. La competitividad es la clave del éxito.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.08] transition-all group">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-3">Seguridad Garantizada</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Nuestro sistema de auditoría verifica cada moneda ganada para asegurar un juego justo y premios legítimos.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
