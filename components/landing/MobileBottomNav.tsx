"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Percent, Layers, DollarSign, Medal, MessageSquare, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export const MobileBottomNav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) return null;

  const isAdminOrMod = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  
  // Si es staff, no mostramos el menú inferior de jugador
  if (isAdminOrMod) return null;

  const routes = [
    { label: "GANE", icon: Gamepad2, href: "/inicio" },
    { label: "BATALLA", icon: Percent, href: "/batalla" },
    { label: "CHAT", icon: MessageSquare, href: "/mensajes" },
    { label: "BILLETERA", icon: Wallet, href: "/retiro" },
    { label: "RANKING", icon: Medal, href: "/recompensas" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 lg:hidden bg-[#0a102a]/95 backdrop-blur-md border-t border-white/5 pb-safe pt-2 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center w-full max-w-md mx-auto">
        {routes.map((route) => {
          const isActive = pathname === route.href || (route.href === "/gane" && pathname === "/inicio");
          
          return (
            <Link 
              key={route.href} 
              href={route.href === "/recompensas" ? `${route.href}?t=${Date.now()}` : route.href}
              className="flex flex-col items-center gap-1 p-2 flex-1"
            >
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-300",
                isActive ? "bg-[#00e676] text-slate-900 shadow-[0_0_15px_rgba(0,230,118,0.5)] scale-110" : "text-slate-400 bg-white/5"
              )}>
                <route.icon className="w-5 h-5" strokeWidth={isActive ? 3 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-wider",
                isActive ? "text-[#00e676]" : "text-slate-400"
              )}>
                {route.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
