"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  History, 
  LogOut,
  ShieldCheck,
  Menu,
  ChevronLeft,
  Coins,
  Bell,
  Search,
  UserCircle,
  Home,
  DollarSign,
  LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionButton } from "@/components/ui/motion/motion-button";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { UserMenu } from "@/components/ui/motion/user-menu";
import { useSession } from "next-auth/react";

const routes = [
  {
    label: "Inicio",
    icon: Home,
    href: "/inicio",
    color: "text-emerald-400",
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-cyan-400",
  },
  {
    label: "Moderadores",
    icon: ShieldCheck,
    href: "/dashboard/moderators",
    color: "text-blue-400",
  },
  {
    label: "Auditoría",
    icon: History,
    href: "/dashboard/audit",
    color: "text-indigo-400",
  },
  {
    label: "Usuarios",
    icon: Users,
    href: "/dashboard/users",
    color: "text-violet-400",
  },
  {
    label: "Retiros",
    icon: DollarSign,
    href: "/dashboard/withdrawals",
    color: "text-yellow-400",
  },
  {
    label: "Soporte",
    icon: LifeBuoy,
    href: "/dashboard/soporte",
    color: "text-emerald-400",
  },
  {
    label: "Mi Perfil",
    icon: UserCircle,
    href: "/dashboard/profile",
    color: "text-slate-400",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-slate-500",
  },
];

interface SidebarProps {
  onSelect?: () => void;
}

export function Sidebar({ onSelect }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative h-full bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-white/5 flex flex-col z-[100] transition-colors duration-300"
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-110 transition-transform z-50"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform duration-500", isCollapsed && "rotate-180")} />
      </button>

      {/* Header / Logo */}
      <div className="p-6 mb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative w-10 h-10 bg-black dark:bg-black rounded-lg flex items-center justify-center border border-white/10 group-hover:border-cyan-500/50 transition-colors">
              <Coins className="text-cyan-400 h-5 w-5" />
            </div>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="text-sm font-black tracking-tighter text-slate-900 dark:text-white leading-none">BATTLE</span>
                <span className="text-[10px] font-bold text-cyan-500 dark:text-cyan-400 tracking-[0.2em] leading-none mt-1">COINS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={() => onSelect?.()}
            className={cn(
              "group relative flex items-center h-11 px-3 rounded-xl transition-all duration-300",
              pathname === route.href 
                ? "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            )}
          >
            {/* Active Glow Indicator */}
            {pathname === route.href && (
              <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-5 bg-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              />
            )}
            
            <route.icon className={cn(
              "h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
              pathname === route.href ? "text-cyan-500 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500 group-hover:text-cyan-500/70"
            )} />
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                >
                  {route.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Hover Tooltip (if collapsed) */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none shadow-2xl whitespace-nowrap z-50">
                {route.label}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <div className={cn(
          "flex items-center transition-all duration-300",
          isCollapsed ? "justify-center" : "px-2"
        )}>
          {session?.user && (
            <UserMenu 
              user={session.user as any} 
              showName={!isCollapsed} 
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

