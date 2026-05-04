"use client";

import { useState } from "react";
import { MessageSquare, User, Clock, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdminChatsClientProps {
  conversations: any[];
}

export default function AdminChatsClient({ conversations }: AdminChatsClientProps) {
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const openChatModal = async (conv: any) => {
    setSelectedConv(conv);
    setIsLoading(true);
    setMessages([]);
    try {
      const res = await fetch(`/api/admin/messages?conversationId=${conv.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error al cargar chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {conversations.map((conv) => (
        <div key={conv.id} className="bg-[#0b0e14]/60 backdrop-blur-sm border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-500/30 transition-all group">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {conv.participants.map((p: any) => (
                <div key={p.id} className="w-12 h-12 rounded-full border-4 border-[#0b0e14] bg-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-white/5" title={p.user.name}>
                  {p.user.image ? <img src={p.user.image} className="w-full h-full object-cover" /> : <User className="text-slate-500 w-6 h-6" />}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black uppercase text-sm">{conv.participants[0]?.user.name}</span>
                <span className="text-slate-600 font-bold text-xs">y</span>
                <span className="text-white font-black uppercase text-sm">{conv.participants[1]?.user.name}</span>
              </div>
              <p className="text-slate-500 text-xs mt-1 italic truncate max-w-md">
                "{conv.messages[0]?.text || (conv.messages[0]?.imageUrl ? "📷 Foto" : "Sin mensajes aún")}"
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Actividad</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: es })}
              </p>
            </div>
            <button 
              onClick={() => openChatModal(conv)}
              className="px-6 py-4 bg-white/5 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              Ver Chat Completo
            </button>
          </div>
        </div>
      ))}

      {/* Modal de Supervisión */}
      <AnimatePresence>
        {selectedConv && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedConv(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0b0e14] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Header Modal */}
              <header className="p-6 border-b border-white/5 flex items-center justify-between bg-indigo-500/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <ShieldCheck className="text-indigo-400 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase italic leading-none">Inspección Táctica</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      {selectedConv.participants[0]?.user.name} + {selectedConv.participants[1]?.user.name}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedConv(null)}
                  className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </header>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase text-slate-600 animate-pulse">Cargando bitácora...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-xs font-black uppercase">No hay registros en esta frecuencia</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        msg.senderId === selectedConv.participants[0].userId ? "items-start" : "items-end ml-auto"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1 px-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                          {msg.sender.name}
                        </span>
                        <span className="text-[8px] font-medium text-slate-700">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm font-medium shadow-xl relative overflow-hidden",
                        msg.senderId === selectedConv.participants[0].userId 
                          ? "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5" 
                          : "bg-indigo-600 text-white rounded-tr-none shadow-indigo-900/20"
                      )}>
                        {msg.imageUrl && (
                          <div className="mb-2 -mx-1 -mt-1 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                            <img src={msg.imageUrl} alt="" className="w-full max-h-60 object-cover" />
                          </div>
                        )}
                        {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Modal */}
              <footer className="p-6 border-t border-white/5 bg-black/40 text-center">
                <p className="text-[9px] font-black uppercase text-slate-600 tracking-[0.2em]">
                  Modo de Auditoría • Solo Lectura • Registro IP: 192.168.1.X
                </p>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
