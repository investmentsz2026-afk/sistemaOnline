"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export const BackButton = ({ text = "Volver", href = "/inicio" }: { text?: string, href?: string }) => {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.push(href)}
      className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group mb-8"
    >
      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{text}</span>
    </button>
  );
};
