import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { OffersClient } from "./OffersClient";

export const metadata = {
  title: "Mis Ofertas | Gana Puntos y Canjea Recompensas",
  description: "Mira anuncios especiales para ganar puntos y canjearlos por saldo real en Battle Coins.",
};

export default async function OffersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Obtenemos datos frescos del usuario
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      points: true,
      balance: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Obtener los anuncios vistos hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logs = await prisma.auditLog.findMany({
    where: {
      userId: session.user.id,
      action: "POINTS_EARNED",
      createdAt: { gte: today }
    },
    select: { description: true }
  });

  const watchedAdsToday = {
    v1: logs.some(l => l.description.includes("Anuncio de Video")),
    v2: logs.some(l => l.description.includes("Oferta Especial")),
    v3: logs.some(l => l.description.includes("Mega Bono"))
  };

  return (
    <main className="min-h-screen bg-[#050a1f] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Layer */}
      <ParticlesBackground />
      
      {/* Navigation */}
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-12 pt-32 pb-20 px-4 md:px-10 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            Panel de <span className="text-cyan-400">Ofertas</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs px-6">
            Multiplica tus ganancias viendo anuncios especiales
          </p>
        </div>

        <OffersClient 
          initialPoints={user.points || 0} 
          initialBalance={user.balance || 0} 
          watchedAdsToday={watchedAdsToday}
        />
      </div>
    </main>
  );
}
