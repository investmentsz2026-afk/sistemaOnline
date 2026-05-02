"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal, 
  User as UserIcon,
  CreditCard,
  Calendar,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateWithdrawalStatus } from "./actions";
import { motion, AnimatePresence } from "framer-motion";

interface WithdrawalData {
  id: string;
  userId: string;
  amount: number;
  method: string;
  accountInfo: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  notes: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export const WithdrawalTable = ({ data }: { data: WithdrawalData[] }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (id: string, status: "COMPLETED" | "REJECTED") => {
    const confirmMsg = status === "COMPLETED" 
      ? "¿Estás seguro de marcar este pago como COMPLETADO?" 
      : "¿Estás seguro de RECHAZAR esta solicitud?";
    
    if (!confirm(confirmMsg)) return;

    setLoading(id);
    const result = await updateWithdrawalStatus(id, status);
    
    if (result.success) {
      toast.success(status === "COMPLETED" ? "¡Pago procesado con éxito!" : "Solicitud rechazada.");
    } else {
      toast.error("Error al procesar la acción.");
    }
    setLoading(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Usuario</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Monto</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Método</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-bold italic">
                  No hay solicitudes de retiro registradas.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <motion.tr 
                  layout
                  key={item.id} 
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {item.user.image ? (
                          <img src={item.user.image} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase italic leading-none mb-1">{item.user.name || "Usuario Anon"}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{item.user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="text-lg font-black text-white italic tracking-tighter">
                      ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase italic">
                        <CreditCard className="w-3.5 h-3.5" />
                        {item.method}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{item.accountInfo}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      item.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                      item.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {item.status === "PENDING" && <Clock className="w-3 h-3 animate-spin-slow" />}
                      {item.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                      {item.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                      {item.status}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === "PENDING" ? (
                        <>
                          <button 
                            onClick={() => handleAction(item.id, "COMPLETED")}
                            disabled={!!loading}
                            className="p-2 bg-emerald-500 text-slate-950 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                            title="Aprobar Pago"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleAction(item.id, "REJECTED")}
                            disabled={!!loading}
                            className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                            title="Rechazar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="text-[10px] font-black text-slate-700 uppercase italic tracking-widest border border-white/5 px-3 py-2 rounded-lg">
                          Procesado
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};
