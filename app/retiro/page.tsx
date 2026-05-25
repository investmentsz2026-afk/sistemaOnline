import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { Wallet, Flame, Bell, ChevronRight } from "lucide-react";
import { RetiroOptions } from "./RetiroOptions";
import { BilleteraTabs } from "./BilleteraTabs";

export default async function RetiroPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch real balance and referral data
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      balance: true, 
      name: true, 
      referralCode: true,
      playerId: true
    }
  });

  const referralsCount = await prisma.user.count({
    where: { referredById: session.user.id }
  });

  const balance = dbUser?.balance || 0;
  const initial = dbUser?.name ? dbUser.name.charAt(0).toUpperCase() : "U";

  return (
    <main className="min-h-screen bg-[#050a1f] text-white overflow-x-hidden pb-24">
      {/* Desktop Navigation */}
      <Navbar />

      {/* Top App Header (Mainly for Mobile or App view) */}
      <header className="pt-28 pb-4 px-4 max-w-7xl mx-auto flex items-center justify-between">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center font-bold text-lg">
          {initial}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="font-bold text-sm">0</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
            <span className="font-bold text-emerald-400 text-sm">${balance.toFixed(2)}</span>
          </div>
        </div>

        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <Bell className="w-6 h-6 fill-slate-400/20" />
        </button>
      </header>

      <div className="p-4 max-w-7xl mx-auto space-y-8">
        {/* Wallet Balance Card */}
        <section className="bg-[#171c2e] rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="space-y-1 mb-4">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Mi Saldo Táctico</p>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Billetera de Combate</h1>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Wallet className="w-6 h-6 text-emerald-950" />
            </div>
            <h1 className="text-4xl font-black">${balance.toFixed(2)}</h1>
          </div>

          <div className="space-y-3">
            <p className="text-slate-400 text-sm font-medium">
              Estado de cuenta: <span className="text-[#00e676] font-bold">Verificado</span>
            </p>
          </div>
        </section>

        {/* Financial Operations Tabs (Recharge / Withdraw / Referrals) */}
        <BilleteraTabs 
          balance={balance} 
          referralCode={dbUser?.referralCode || ""}
          referralsCount={referralsCount}
          playerId={dbUser?.playerId || ""}
        />
      </div>

    </main>
  );
}
