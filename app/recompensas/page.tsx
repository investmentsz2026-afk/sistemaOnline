import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { MobileBottomNav } from "@/components/landing/MobileBottomNav";
import { RewardsClient } from "./RewardsClient";

export default async function RecompensasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // SOLO traemos a los usuarios con rol 'CLIENT' para el Ranking
  const users = await prisma.user.findMany({
    where: { 
      role: "CLIENT", // Filtramos para excluir Admin, Mod, etc.
      isActive: true 
    },
    orderBy: { balance: "desc" },
    take: 10,
    select: { 
      id: true, 
      name: true, 
      image: true, 
      balance: true 
    }
  });

  // Traemos las misiones completadas del usuario actual (Con protección contra errores de caché)
  let completedIds: string[] = [];
  
  if ((prisma as any).userMission) {
    const completedMissions = await (prisma as any).userMission.findMany({
      where: { userId: session.user.id },
      select: { missionId: true }
    });
    completedIds = completedMissions.map((m: any) => m.missionId);
  } else {
    console.warn("AVISO: El modelo 'userMission' aún no está disponible en la caché de Prisma.");
  }

  return (
    <main className="min-h-screen bg-[#050a1f] text-white overflow-x-hidden">
      {/* Navigation */}
      <Navbar />

      <div className="pt-32">
        <RewardsClient 
          users={users} 
          currentUserId={session.user.id!} 
          userRole={session.user.role}
          completedMissions={completedIds}
        />
      </div>

      <MobileBottomNav />
    </main>
  );
}
