import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Benefits } from "@/components/landing/Benefits";
import { Stats } from "@/components/landing/Stats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Showcase } from "@/components/landing/Showcase";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import prisma from "@/lib/prisma";

export default async function Home() {
  const userCount = await prisma.user.count();
  const realUserCount = 25000 + userCount; // Base Marketing + Real Users
  return (
    <main className="min-h-screen bg-[#050a1f] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Layer */}
      <ParticlesBackground />
      
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Stats (Social Proof) */}
      <Stats userCount={realUserCount} />

      {/* Showcase Section (Carousel with Text) */}
      <Showcase />

      {/* Benefits Section */}
      <Benefits />

      {/* How it Works Section */}
      <HowItWorks />

      {/* Final CTA */}
      <CTA />

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
