import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { MobileBottomNav } from "@/components/landing/MobileBottomNav";
import { ProfileForm } from "./ProfileForm";
import { UserCircle } from "lucide-react";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true }
  });

  return (
    <main className="min-h-screen bg-[#050a1f] text-white overflow-x-hidden pb-24">
      {/* Navigation */}
      <Navbar />

      <div className="pt-32 px-4 max-w-3xl mx-auto">
        
        {/* Header Profile */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-xl opacity-50"></div>
            <div className="relative w-24 h-24 rounded-full bg-[#0a102a] border-2 border-cyan-400 flex items-center justify-center shadow-2xl">
              <UserCircle className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight">{dbUser?.name || "Usuario"}</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">{dbUser?.role}</p>
        </div>

        {/* Profile Card */}
        <div className="bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-8 text-white border-b border-white/10 pb-4">
              Información Personal
            </h2>

            <ProfileForm user={{ name: dbUser?.name || null, email: dbUser?.email || null }} />
          </div>
        </div>

      </div>

      <MobileBottomNav />
    </main>
  );
}
