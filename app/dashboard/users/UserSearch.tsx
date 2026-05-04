"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function UserSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    startTransition(() => {
      router.push(`/dashboard/users?${params.toString()}`);
    });
  };

  return (
    <div className="relative group">
      <Search className={`absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isPending ? 'text-violet-400 animate-pulse' : 'text-slate-500 group-focus-within:text-violet-400'}`} />
      <input 
        type="text" 
        defaultValue={searchParams.get("query")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por nombre o email del jugador..." 
        className="w-full h-16 pl-16 pr-6 bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all"
      />
    </div>
  );
}
