import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserService } from "@/services/user.service";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/user-actions";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { AddStaffModal } from "@/components/admin/add-staff-modal";

export default async function ModeratorsPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MODERATOR") {
    redirect("/dashboard");
  }

  // Fetch all staff members using raw SQL to avoid stale enum validation in Prisma Client
  const users = await prisma.$queryRaw<any[]>`
    SELECT * FROM users 
    WHERE role != 'CLIENT' 
    ORDER BY "createdAt" DESC
  `;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase">
            Gestión de <span className="text-blue-400">Moderadores</span>
          </h2>
          <p className="text-slate-400 font-medium mt-2">
            Administra el equipo interno y los niveles de acceso al sistema.
          </p>
        </div>
        <AddStaffModal />
      </div>

      <div className="bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] py-6 pl-8">Nombre / Email</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Rol Administrativo</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Estado</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] pr-8 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="py-6 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-black border border-blue-500/20">
                      {user.name?.[0] || "S"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm uppercase tracking-tight">{user.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === "ADMIN" ? (
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-blue-400" />
                    )}
                    <Badge variant="outline" className={cn(
                      "font-black text-[10px] uppercase tracking-widest px-3",
                      user.role === "ADMIN" ? "border-cyan-500/50 text-cyan-400 bg-cyan-500/5" : 
                      user.role === "MODERATOR" ? "border-blue-500/50 text-blue-400 bg-blue-500/5" : 
                      "border-slate-500/50 text-slate-400 bg-slate-500/5"
                    )}>
                      {user.role}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[10px] uppercase tracking-widest px-3">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 font-bold text-[10px] uppercase tracking-widest px-3">
                      Suspendido
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right pr-8">
                  <UserActions user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
