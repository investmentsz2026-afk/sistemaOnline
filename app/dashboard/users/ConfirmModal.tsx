"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: "danger" | "warning" | "success";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  variant = "danger"
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay con desenfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0b0e14] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Efecto de luz de fondo */}
            <div className={cn(
              "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20",
              variant === "danger" ? "bg-red-500" : variant === "warning" ? "bg-amber-500" : "bg-emerald-500"
            )} />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-3",
                variant === "danger" ? "bg-red-500/10 text-red-500 border border-red-500/20" : 
                variant === "warning" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              )}>
                {variant === "danger" ? <ShieldAlert className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
              </div>

              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">
                {title}
              </h3>
              
              <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 px-6 py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg",
                    variant === "danger" ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" : 
                    variant === "warning" ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" : 
                    "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            {/* Botón Cerrar (X) */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
