import { AuditService } from "@/services/audit.service";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExportAuditButton } from "@/components/export-audit-button";

export default async function AuditPage() {
  const logs = await AuditService.getAll();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase">
            Registro de <span className="text-purple-400">Auditoría</span>
          </h2>
          <p className="text-slate-400 font-medium mt-2">
            Historial completo de acciones y movimientos críticos del sistema.
          </p>
        </div>
        <ExportAuditButton data={logs} />
      </div>

      <div className="bg-[#0b0e14]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] py-6 pl-8">Usuario</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Acción</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Descripción</TableHead>
              <TableHead className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] pr-8">Fecha y Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-slate-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <History className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest">No hay registros de auditoría disponibles.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="py-6 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-sm border border-purple-500/20">
                        {log.user?.name?.[0] || "S"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm uppercase tracking-tight">{log.user?.name || "Sistema"}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{log.user?.email || "internal@battlecoins.com"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-black text-[10px] uppercase tracking-widest px-3">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 font-medium text-sm max-w-md truncate group-hover:text-white transition-colors">
                    {log.description}
                  </TableCell>
                  <TableCell className="text-slate-500 font-bold text-xs pr-8 uppercase tracking-tighter">
                    {format(new Date(log.createdAt), "dd MMM, yyyy · HH:mm", { locale: es })}
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

// Ensure History is imported
import { History } from "lucide-react";
