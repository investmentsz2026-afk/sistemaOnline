"use client";

import { Search, Bell } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/ui/motion/user-menu";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-8 bg-white/80 dark:bg-black/20 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-40 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <MobileNav />
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar activos, usuarios o registros..." 
            className="w-full h-11 pl-12 pr-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-8">
        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full border-2 border-white dark:border-[#020617]"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/5"></div>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
