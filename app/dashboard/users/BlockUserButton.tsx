"use client";

import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { toggleUserStatus } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "./ConfirmModal";

interface BlockUserButtonProps {
  userId: string;
  isActive: boolean;
}

export function BlockUserButton({ userId, isActive }: BlockUserButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleUserStatus(userId, isActive);
    
    if (result.success) {
      toast.success(isActive ? "Usuario bloqueado por seguridad" : "Usuario desbloqueado correctamente");
    } else {
      toast.error(result.error || "Error al procesar la acción");
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
          isActive 
            ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white" 
            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
        )}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isActive ? (
          <ShieldAlert className="w-3 h-3" />
        ) : (
          <ShieldCheck className="w-3 h-3" />
        )}
        {isActive ? "Bloquear" : "Activar"}
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleToggle}
        title={isActive ? "Confirmar Bloqueo" : "Reactivar Usuario"}
        message={isActive 
          ? "¿Estás seguro de BLOQUEAR a este usuario? Perderá el acceso inmediato a la plataforma y todos sus fondos quedarán congelados hasta nuevo aviso."
          : "¿Deseas restaurar el acceso de este usuario a la plataforma?"
        }
        confirmText={isActive ? "Bloquear Ahora" : "Activar Ahora"}
        variant={isActive ? "danger" : "success"}
      />
    </>
  );
}
