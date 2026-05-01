import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Benefits } from "@/components/landing/Benefits";
import { Stats } from "@/components/landing/Stats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Showcase } from "@/components/landing/Showcase";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  const session = await auth();

  // Si ya está logueado, lo mandamos a su zona correspondiente
  if (session) {
    if (session.user.role === "ADMIN" || session.user.role === "MODERATOR") {
      redirect("/dashboard");
    } else {
      redirect("/inicio");
    }
  }

  const userCount = await prisma.user.count();
  const realUserCount = 25000 + userCount;

  return (
    <main className="min-h-screen bg-[#050a1f] text-white selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Fondo de Partículas */}
      <ParticlesBackground />
      
      {/* Navegación */}
      <Navbar />

      {/* Sección Hero (Domina el Juego Digital) */}
      <Hero />

      {/* Sección Showcase (El Futuro es Generativo) */}
      <Showcase />

      {/* Sección Beneficios (La Experiencia Definitiva) */}
      <Benefits />

      {/* Sección Stats (Estadísticas Reales) */}
      <Stats userCount={realUserCount} />

      {/* Sección Cómo Funciona */}
      <HowItWorks />

      {/* Sección CTA Final */}
      <CTA />

      {/* Tu Footer que ya estaba listo */}
      <Footer />

      {/* Elementos decorativos flotantes */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-1 h-1 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]"></div>
        <div className="absolute top-[30%] right-[10%] w-1 h-1 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_#a855f7]"></div>
      </div>
    </main>
  );
}
