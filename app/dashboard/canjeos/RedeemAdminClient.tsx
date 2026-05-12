"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  ArrowRight,
  Gift,
  Coins,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { approveRedeem, rejectRedeem } from "@/app/ofertas/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Redemption {
  id: string;
  pointsAmount: number;
  bcAmount: number;
  status: string;
  adminNotes: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    playerId: string | null;
    points: number;
  };
}

interface RedeemAdminClientProps {
  initialRedemptions: Redemption[];
}

export const RedeemAdminClient = ({ initialRedemptions }: RedeemAdminClientProps) => {
  const [redemptions, setRedemptions] = useState(initialRedemptions);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = redemptions.filter(r => {
    const matchesSearch = 
      r.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user.playerId?.includes(searchTerm);
    
    if (activeFilter === "ALL") return matchesSearch;
    return matchesSearch && r.status === activeFilter;
  });

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const result = await approveRedeem(id);
    
    if (result.success) {
      toast.success("Canje aprobado y saldo acreditado");
      setRedemptions(prev => prev.map(r => r.id === id ? { ...r, status: "APPROVED" } : r));
    } else {
      toast.error(result.error);
    }
    setProcessingId(null);
  };

  const handleReject = async () => {
    if (!showRejectModal || !rejectReason.trim()) return;

    setProcessingId(showRejectModal);
    const result = await rejectRedeem(showRejectModal, rejectReason);
    
    if (result.success) {
      toast.success("Solicitud rechazada correctamente");
      setRedemptions(prev => prev.map(r => r.id === showRejectModal ? { ...r, status: "REJECTED", adminNotes: rejectReason } : r));
      setShowRejectModal(null);
      setRejectReason("");
    } else {
      toast.error(result.error);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative bg-[#0b0e14] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar por nombre o ID de jugador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0 flex-1"
          />
        </div>
        <div className="flex bg-[#0b0e14] border border-white/5 p-1 rounded-xl">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={cn(
                "px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                activeFilter === f ? "bg-fuchsia-500 text-slate-950" : "text-slate-500 hover:text-white"
              )}
            >
              {f === "PENDING" ? "Pendientes" : f === "APPROVED" ? "Aprobados" : f === "REJECTED" ? "Rechazados" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Redemptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((r) => (
            <motion.div 
              key={r.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0b0e14] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-fuchsia-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">{r.user.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">ID: {r.user.playerId}</p>
                      <span className="text-[10px] text-slate-600">•</span>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Balance: {r.user.points} Pts</p>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                  r.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500" :
                  r.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" :
                  "bg-red-500/10 text-red-500"
                )}>
                  {r.status === "PENDING" ? "Pendiente" : r.status === "APPROVED" ? "Aprobado" : "Rechazado"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-3xl p-6 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Puntos a Canjear</p>
                  <p className="text-2xl font-black text-white italic">{r.pointsAmount}</p>
                </div>
                <div className="bg-white/5 rounded-3xl p-6 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Recibirá (Balance)</p>
                  <p className="text-2xl font-black text-emerald-400 italic">${r.bcAmount} <span className="text-[10px]">BC</span></p>
                </div>
              </div>

              {r.status === "PENDING" ? (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleApprove(r.id)}
                    disabled={processingId !== null}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {processingId === r.id ? "Procesando..." : "Aprobar Canje"}
                  </button>
                  <button 
                    onClick={() => setShowRejectModal(r.id)}
                    disabled={processingId !== null}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-500/20 active:scale-95 disabled:opacity-50"
                  >
                    Negar
                  </button>
                </div>
              ) : r.status === "REJECTED" && (
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Motivo del Rechazo:</p>
                  <p className="text-xs text-slate-400 font-medium italic">"{r.adminNotes}"</p>
                </div>
              )}

              <p className="mt-4 text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                Solicitado el: {new Date(r.createdAt).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0b0e14] border border-white/10 rounded-[3rem] p-10 max-w-md w-full relative z-10 space-y-6"
            >
              <div className="text-center space-y-2">
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Negar Solicitud</h3>
                <p className="text-slate-500 text-sm font-medium">Explica al usuario por qué no se puede realizar el canje.</p>
              </div>

              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: No se detectó actividad real en los anuncios..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-red-500/50 transition-all min-h-[120px] resize-none"
              />

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowRejectModal(null)}
                  className="flex-1 bg-white/5 text-slate-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processingId !== null}
                  className="flex-1 bg-red-500 text-slate-950 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-400 transition-all disabled:opacity-50"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
