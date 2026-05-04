import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { MobileBottomNav } from "@/components/landing/MobileBottomNav";
import { SettingsForm } from "./SettingsForm";
import { Settings } from "lucide-react";
import { BackButton } from "@/components/ui/motion/back-button";

export default async function ConfiguracionPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true }
  });

  return (
    <main className="min-h-screen bg-[#050a1f] text-white overflow-x-hidden pb-24 transition-colors duration-500" id="config-main">
      {/* Navigation */}
      <Navbar />

      <div className="pt-32 px-4 max-w-3xl mx-auto">
        
        {/* Botón de Regreso */}
        <BackButton text="Volver al Inicio" href="/inicio" />

        {/* Header Config */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-50"></div>
            <div className="relative w-24 h-24 rounded-full bg-[#0a102a] border-2 border-indigo-400 flex items-center justify-center shadow-2xl">
              <Settings className="w-12 h-12 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Configuración</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Preferencias del Sistema</p>
        </div>

        {/* Config Card */}
        <div className="bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden transition-colors duration-500" id="config-card">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <SettingsForm 
              userId={session.user.id!} 
              initialImage={user?.image || null}
            />
          </div>
        </div>

      </div>

      <MobileBottomNav />
    </main>
  );
}
