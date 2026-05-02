import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { MobileBottomNav } from "@/components/landing/MobileBottomNav";
import { ProfileClient } from "./ProfileClient";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Traemos todos los datos necesarios para el sistema de niveles
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      id: true,
      name: true, 
      email: true, 
      role: true,
      balance: true,
      image: true
    }
  });

  if (!dbUser) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#050a1f] text-white overflow-x-hidden pb-24">
      {/* Navigation */}
      <Navbar />

      <div className="pt-24 md:pt-32 px-4 max-w-4xl mx-auto">
        
        {/* Título de la Sección */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Dashboard de Usuario</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter italic">Online</span>
          </div>
        </div>

        {/* Componente de Perfil con Niveles y Edición */}
        <ProfileClient user={{
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role.toString(),
          balance: dbUser.balance,
          image: dbUser.image
        }} />

      </div>

      <MobileBottomNav />
    </main>
  );
}
