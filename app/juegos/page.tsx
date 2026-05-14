import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { GameClient } from "./GameClient";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Zona de Juegos | Gana Jugando",
};

export default async function JuegosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true }
  });

  // Lista de juegos populares de GameMonetize
  const games = [
    { id: "g1", title: "Cyber Surfer", category: "Acción", thumb: "https://gamemonetize.com/token/cyber-surfer.png", url: "https://gamemonetize.com/cyber-surfer" },
    { id: "g2", title: "Moto X3M", category: "Carreras", thumb: "https://gamemonetize.com/token/moto-x3m.png", url: "https://gamemonetize.com/moto-x3m" },
    { id: "g3", title: "Penalty Challenge", category: "Deportes", thumb: "https://gamemonetize.com/token/penalty-challenge.png", url: "https://gamemonetize.com/penalty-challenge" },
    { id: "g4", title: "Bubble Shooter", category: "Puzzle", thumb: "https://gamemonetize.com/token/bubble-shooter.png", url: "https://gamemonetize.com/bubble-shooter" },
  ];

  return (
    <main className="min-h-screen bg-[#020617] relative overflow-hidden">
      <ParticlesBackground />
      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Arena de Combate</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
              Zona de <span className="text-cyan-400">Juegos</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl">
              Elige tu juego favorito, diviértete y acumula puntos por cada minuto de acción. 
              <span className="text-emerald-400 font-bold block mt-1">¡Gana +10 Puntos cada 5 minutos de juego!</span>
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tus Puntos</p>
              <p className="text-2xl font-black text-white italic tabular-nums">{user?.points || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <div className="w-6 h-6 text-cyan-400 font-black">P</div>
            </div>
          </div>
        </div>

        <GameClient initialGames={games} />
      </div>
    </main>
  );
}
