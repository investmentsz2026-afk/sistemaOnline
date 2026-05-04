"use client";

import { useState, useEffect } from "react";
import { Bell, BellDot, X, Check, UserPlus, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  // Simulación de polling de notificaciones (En producción usarías WebSockets)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);
        setHasUnread(data.some((n: any) => !n.isRead));
      } catch (e) {
        console.error("Error fetching notifications");
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setHasUnread(false);
    } catch (e) {
      console.error("Error marking as read");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && hasUnread) markAllAsRead();
        }}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-all group"
      >
        <AnimatePresence mode="wait">
          {hasUnread ? (
            <motion.div
              key="bell-dot"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <BellDot className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </motion.div>
          ) : (
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-white" />
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 md:w-96 bg-[#0b0e14]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Notificaciones</h3>
                <span className="text-[10px] font-black bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full">
                  {notifications.filter(n => !n.isRead).length} Nuevas
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <Bell className="w-8 h-8 text-slate-800 mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-black text-slate-600 uppercase">Sin avisos tácticos</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <Link 
                      key={notif.id}
                      href={notif.link || "#"}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block p-5 border-b border-white/5 hover:bg-white/[0.03] transition-all relative",
                        !notif.isRead && "bg-cyan-500/[0.02]"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          notif.type === "FRIEND_REQUEST" ? "bg-amber-500/10 text-amber-500" :
                          notif.type === "REQUEST_ACCEPTED" ? "bg-emerald-500/10 text-emerald-500" :
                          "bg-blue-500/10 text-blue-500"
                        )}>
                          {notif.type === "FRIEND_REQUEST" ? <UserPlus className="w-5 h-5" /> :
                           notif.type === "REQUEST_ACCEPTED" ? <Check className="w-5 h-5" /> :
                           <MessageCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-white uppercase italic truncate">{notif.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">{notif.message}</p>
                          <p className="text-[8px] font-bold text-slate-700 uppercase mt-2 tracking-widest">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="p-4 bg-white/[0.02] text-center border-t border-white/5">
                <Link 
                  href="/mensajes" 
                  onClick={() => setIsOpen(false)}
                  className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]"
                >
                  Ver Centro de Mensajes
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
