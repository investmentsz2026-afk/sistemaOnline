"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Send, 
  User, 
  Hash,
  ExternalLink,
  CheckCircle2,
  Clock,
  Reply
} from "lucide-react";
import { replyToTicket } from "@/app/soporte/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    playerId: string | null;
    email: string;
  };
}

interface SupportAdminClientProps {
  initialTickets: Ticket[];
}

export const SupportAdminClient = ({ initialTickets }: SupportAdminClientProps) => {
  const [tickets, setTickets] = useState(initialTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("PENDING");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTickets = tickets.filter(t => {
    const userName = t.user?.name || "Usuario Desconocido";
    const playerId = t.user?.playerId || "N/A";
    const subject = t.subject || "";

    const matchesSearch = 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playerId.includes(searchTerm) ||
      subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "ALL") return matchesSearch;
    return matchesSearch && t.status === activeFilter;
  });

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    setIsSubmitting(true);
    const result = await replyToTicket(selectedTicket.id, replyText);

    if (result.success) {
      toast.success("Respuesta enviada y ticket resuelto");
      // Actualizar estado local
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id 
          ? { ...t, status: "RESOLVED", reply: replyText } 
          : t
      ));
      setSelectedTicket(null);
      setReplyText("");
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Lista de Tickets */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-3 bg-[#0b0e14] border border-white/5 rounded-2xl px-4 py-2">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar por nombre, ID o asunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0 placeholder:text-slate-600"
          />
        </div>

        <div className="flex gap-2">
          {["PENDING", "RESOLVED", "ALL"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={cn(
                "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                activeFilter === f 
                  ? "bg-cyan-500 border-cyan-400 text-slate-950" 
                  : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
              )}
            >
              {f === "PENDING" ? "Pendientes" : f === "RESOLVED" ? "Resueltos" : "Todos"}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={cn(
                "w-full p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
                selectedTicket?.id === ticket.id 
                  ? "bg-cyan-500/10 border-cyan-500/30" 
                  : "bg-[#0b0e14] border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white uppercase italic truncate max-w-[120px]">{ticket.user?.name || "Usuario"}</span>
                    <span className="text-[8px] font-bold text-cyan-400 bg-cyan-500/10 px-2 rounded-md">ID: {ticket.user?.playerId || "N/A"}</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-300 line-clamp-1 uppercase">{ticket.subject}</h4>
                  <p className="text-[8px] font-black text-slate-600 uppercase">{new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  ticket.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"
                )}>
                  {ticket.status === "RESOLVED" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                </div>
              </div>
              {selectedTicket?.id === ticket.id && (
                <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Detalle y Respuesta */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {selectedTicket ? (
            <motion.div 
              key={selectedTicket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0b0e14] border border-white/5 rounded-[2.5rem] flex flex-col h-full min-h-[500px] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{selectedTicket.user?.name || "Usuario"}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedTicket.user?.email || "Sin Email"}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                    selectedTicket.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {selectedTicket.status === "RESOLVED" ? "Cerrado" : "Abierto"}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Hash className="w-3.5 h-3.5" />
                    <span className="text-xs font-black uppercase">Ticket: {selectedTicket.id.substring(0, 8)}</span>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-3 italic tracking-widest">Mensaje del Jugador:</p>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">{selectedTicket.message}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col justify-end gap-6 bg-gradient-to-b from-transparent to-black/20">
                {selectedTicket.status === "PENDING" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <Reply className="w-4 h-4 text-emerald-400" />
                      <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Escribir Respuesta</p>
                    </div>
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe la solución aquí..."
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none shadow-inner"
                    />
                    <button 
                      onClick={handleReply}
                      disabled={isSubmitting || !replyText.trim()}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? "Enviando..." : (
                        <>
                          Responder y Resolver
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-8 space-y-4 text-center">
                    <div className="flex justify-center mb-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest italic">Ticket Resuelto</p>
                    <div className="text-left bg-black/20 rounded-2xl p-4">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Respuesta Enviada:</p>
                      <p className="text-sm text-slate-400 italic">"{selectedTicket.reply}"</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#0b0e14] border border-dashed border-white/10 rounded-[3rem] h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Selecciona un Ticket</h3>
              <p className="text-slate-500 font-medium text-sm max-w-xs">Escoge un reclamo de la lista de la izquierda para ver el detalle y enviar una respuesta.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
