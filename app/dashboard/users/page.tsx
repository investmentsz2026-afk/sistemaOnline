import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserService } from "@/services/user.service";
import prisma from "@/lib/prisma";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users as UsersIcon, Filter, UserPlus } from "lucide-react";

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch only regular users (CLIENT)
  const users = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase">
            Directorio de <span className="text-violet-400">Usuarios</span>
          </h2>
          <p className="text-slate-400 font-medium mt-2">
            Visualiza y gestiona la red de jugadores y personal administrativo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20">
            <UserPlus className="w-4 h-4" /> Nuevo
          </button>
        </div>
      </div>

      {/* Search Bar Area */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, email o rol..." 
          className="w-full h-16 pl-16 pr-6 bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all"
        />
      </div>

      <div className="bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] py-6 pl-8">Usuario</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Rol / Nivel</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Estado</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] pr-8 text-right">Actividad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="py-6 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-black text-lg border border-violet-500/20 group-hover:scale-105 transition-transform">
                        {user.name?.[0] || "U"}
                      </div>
                      <div className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0b0e14]",
                        user.isActive ? "bg-green-500" : "bg-red-500"
                      )} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-base uppercase tracking-tight">{user.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium lowercase">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "font-black text-[10px] uppercase tracking-widest px-3 py-1",
                    user.role === "ADMIN" ? "border-violet-500/50 text-violet-400 bg-violet-500/5" : 
                    user.role === "EMPLOYEE" ? "border-blue-500/50 text-blue-400 bg-blue-500/5" : 
                    "border-slate-500/50 text-slate-400 bg-slate-500/5"
                  )}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", user.isActive ? "text-green-500" : "text-red-500")}>
                      {user.isActive ? "Online" : "Offline"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">
                    Ver Detalles
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
