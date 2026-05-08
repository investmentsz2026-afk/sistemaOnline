import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { MobileBottomNav } from "@/components/landing/MobileBottomNav";
import { SupportClient } from "./SupportClient";
import { getMyTickets } from "./actions";

export default async function SoportePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const initialTickets = await getMyTickets();

  return (
    <main className="min-h-screen bg-[#050a1f] text-white overflow-x-hidden">
      <Navbar />

      <div className="pt-32 px-4 max-w-4xl mx-auto pb-32">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            Centro de <span className="text-cyan-400">Soporte</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            ¿Tienes algún problema o sugerencia? Envíanos un mensaje y te responderemos lo antes posible.
          </p>
        </div>

        <SupportClient initialTickets={initialTickets} />
      </div>

      <MobileBottomNav />
    </main>
  );
}
