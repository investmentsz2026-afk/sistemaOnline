"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  History,
  LifeBuoy,
  ArrowLeft
} from "lucide-react";
import { createSupportTicket } from "./actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  createdAt: Date;
}

interface SupportClientProps {
  initialTickets: Ticket[];
}

export const SupportClient = ({ initialTickets }: SupportClientProps) => {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState(initialTickets);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    const result = await createSupportTicket(subject, message);
    
    if (result.success) {
      toast.success("Mensaje enviado a soporte, muy pronto tendrás respuesta de nuestra parte.");
      setSubject("");
      setMessage("");
      // Actualizar lista local (opcional, revalidatePath ya lo hará al refrescar)
      if (result.ticket) {
        setTickets([result.ticket as any, ...tickets]);
      }
    } else {
      toast.error(result.error || "Error al enviar el mensaje");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Botón de Regresar */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group mb-2"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Volver Atrás</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Formulario de Envío */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="bg-[#0b0e14] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <LifeBuoy className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-black text-white uppercase italic">Nuevo Ticket</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asunto del Reclamo</label>
              <input 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Problema con recarga..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mensaje Detallado</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos qué sucedió..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(6,182,212,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : (
                <>
                  Enviar Mensaje
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Historial de Tickets */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" /> Tus Mensajes Recientes
          </h3>
          <span className="text-[10px] font-black text-slate-600 uppercase">{tickets.length} TOTAL</span>
        </div>

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center">
              <p className="text-slate-500 font-bold text-sm">No tienes tickets creados todavía.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket.id}
                className={cn(
                  "bg-[#0b0e14]/60 border rounded-3xl transition-all overflow-hidden",
                  ticket.status === "RESOLVED" ? "border-emerald-500/20" : "border-white/5"
                )}
              >
                <button 
                  onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                  className="w-full p-6 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      ticket.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {ticket.status === "RESOLVED" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase truncate max-w-[150px] md:max-w-xs">{ticket.subject}</h4>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {expandedTicket === ticket.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                <AnimatePresence>
                  {expandedTicket === ticket.id && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="px-6 pb-6 space-y-4"
                    >
                      <div className="bg-white/5 rounded-2xl p-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Tu Mensaje:</p>
                        <p className="text-xs text-white leading-relaxed">{ticket.message}</p>
                      </div>

                      {ticket.reply && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-emerald-400" />
                            <p className="text-[10px] font-black text-emerald-400 uppercase">Respuesta de Soporte:</p>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed italic">{ticket.reply}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  </div>
);
};
