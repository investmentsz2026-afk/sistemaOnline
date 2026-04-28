"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface SettingsHeaderProps {
  title: string;
  subtitle: string;
  colorClass?: string;
  backHref?: string;
}

export function SettingsHeader({ 
  title, 
  subtitle, 
  colorClass = "text-white", 
  backHref = "/dashboard/settings" 
}: SettingsHeaderProps) {
  return (
    <div className="space-y-4 mb-8">
      <Link 
        href={backHref}
        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:-translate-x-1 transition-all border border-slate-200 dark:border-white/5">
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
        </div>
        Volver a Configuración
      </Link>
      
      <div>
        <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
          {title.split(' ')[0]} <span className={colorClass}>{title.split(' ').slice(1).join(' ')}</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
