import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { RouletteArena } from "./RouletteArena";
import { Swords, Info, ShieldCheck } from "lucide-react";

export default async function BatallaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Obtener balance real del usuario
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true }
  });

  // Obtener batallas reales en espera
  let formattedBattles: any[] = [];
  
  try {
    // Usamos el acceso directo de Prisma (singularizado y en minúscula según el estándar)
    const battleModel = (prisma as any).battle || (prisma as any).Battle;
    
    if (battleModel) {
      const waitingBattles = await battleModel.findMany({
        where: { status: "WAITING" },
        include: {
          creator: { select: { name: true } },
          participants: true
        },
        orderBy: { createdAt: "desc" },
        take: 10
      });

      formattedBattles = waitingBattles.map((b: any) => ({
        id: b.id,
        creator: b.creator.name || "Jugador",
        priceUsd: b.priceUsd,
        priceCoins: b.priceCoins,
        joinedCount: b.participants.length,
        color: b.priceUsd >= 5 ? "from-yellow-500 to-amber-600" : 
               b.priceUsd >= 1 ? "from-slate-400 to-slate-600" : "from-amber-700 to-amber-900"
      }));
    }
  } catch (err) {
    console.error("Error al obtener batallas:", err);
  }

  const balance = user?.balance || 0;

  return (
    <main className="min-h-screen bg-[#050a1f] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      <ParticlesBackground />
      <Navbar />

      <div className="pt-24 md:pt-32 pb-32 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header de Batalla */}
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full mb-6">
              <Swords className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Arena de Combate</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
              BATALLA DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">RULETAS</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg font-medium px-4">
              Elige tu apuesta, únete a la sala y que la suerte decida. 6 jugadores, un solo ganador se lo lleva todo.
            </p>
          </div>

          {/* Área de Juego (Client Side) */}
          <RouletteArena 
            initialBalance={balance} 
            initialBattles={formattedBattles} 
            currentUserId={session.user.id}
          />

          {/* Información de Juego Justo */}
          <div className="mt-20 max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="bg-cyan-500/20 p-3 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase mb-2 italic">Sistema de Juego Justo</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Utilizamos un algoritmo de generación de números aleatorios (RNG) certificado para asegurar que cada giro sea 100% impredecible. El dinero se acredita instantáneamente al balance del ganador una vez que la flecha marca el segmento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
