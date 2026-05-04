import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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
import { Users as UsersIcon, Filter, UserPlus, ShieldAlert } from "lucide-react";
import { UserSearch } from "./UserSearch";
import { BlockUserButton } from "./BlockUserButton";
import { cn } from "@/lib/utils";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const query = searchParams?.query || "";

  // Buscamos usuarios CLIENT con el filtro aplicado
  const users = await prisma.user.findMany({
    where: { 
      role: "CLIENT",
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase">
            Control de <span className="text-red-400">Jugadores</span>
          </h2>
          <p className="text-slate-400 font-medium mt-2">
            Gestiona la seguridad y el acceso de los usuarios a la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
            Total: {users.length}
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
            <ShieldAlert className="w-4 h-4" /> Alertas
          </button>
        </div>
      </div>

      {/* Search Bar Area */}
      <UserSearch />

      <div className="bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] py-6 pl-8">Usuario / Jugador</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Estado Cuenta</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Acciones de Seguridad</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] pr-8 text-right">Información</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <td colSpan={4} className="py-20 text-center text-slate-500 font-bold italic">
                  No se encontraron usuarios con el término "{query}"
                </td>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className={cn(
                  "border-white/5 hover:bg-white/5 transition-colors group",
                  !user.isActive && "bg-red-500/[0.02]"
                )}>
                  <TableCell className="py-6 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border transition-transform group-hover:scale-105",
                          user.isActive ? "bg-violet-500/10 text-violet-400 border-violet-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {user.name?.[0] || "U"}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className={cn("font-bold text-base uppercase tracking-tight", user.isActive ? "text-white" : "text-red-400 line-through")}>
                          {user.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium lowercase">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", user.isActive ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", user.isActive ? "text-green-500" : "text-red-500")}>
                        {user.isActive ? "ACTIVO" : "BLOQUEADO"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <BlockUserButton userId={user.id} isActive={user.isActive} />
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Registrado
                      </span>
                      <span className="text-[11px] text-white font-black">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

