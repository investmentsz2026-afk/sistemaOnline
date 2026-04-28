"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, Lock } from "lucide-react";

interface LoginOverlayProps {
  isVisible: boolean;
  status: "loading" | "success" | "error" | "closing";
  message: string;
}

export const LoginOverlay = ({ isVisible, status, message }: LoginOverlayProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="flex flex-col items-center gap-8 p-12 text-center"
          >
            {/* Animated Icon Container */}
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: (status === "loading" || status === "closing") ? 360 : 0,
                  scale: (status === "loading" || status === "closing") ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
                className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${
                  status === "success" ? "border-green-500 bg-green-500/10" : 
                  status === "error" ? "border-red-500 bg-red-500/10" : 
                  status === "closing" ? "border-amber-500/30 border-t-amber-500 bg-amber-500/5" :
                  "border-cyan-500/30 border-t-cyan-500"
                }`}
              >
                {(status === "loading" || status === "closing") && (
                  <Loader2 className={`w-10 h-10 animate-spin ${status === "closing" ? "text-amber-400" : "text-cyan-400"}`} />
                )}
                {status === "success" && <ShieldCheck className="w-10 h-10 text-green-400" />}
                {status === "error" && <Lock className="w-10 h-10 text-red-400" />}
              </motion.div>
              
              {/* Pulse Effect for Loading/Closing */}
              {(status === "loading" || status === "closing") && (
                <motion.div
                  animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`absolute inset-0 rounded-full -z-10 ${status === "closing" ? "bg-amber-500/20" : "bg-cyan-500/20"}`}
                />
              )}
            </div>

            <div className="space-y-3">
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-black text-white uppercase tracking-tighter"
              >
                {message}
              </motion.h3>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className={`h-1 mx-auto opacity-50 bg-gradient-to-r from-transparent via-current to-transparent ${
                  status === "closing" ? "text-amber-500" : "text-cyan-500"
                }`}
              />
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] animate-pulse">
                {status === "closing" ? "Desconectando de la red segura" : "Accediendo a la red segura"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
