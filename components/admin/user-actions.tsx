"use client";

import { Button } from "@/components/ui/button";
import { deactivateUserAction, reactivateUserAction } from "@/lib/actions/user";
import { toast } from "sonner";
import { Power, PowerOff, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EditStaffModal } from "@/components/admin/edit-staff-modal";

interface UserActionsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export function UserActions({ user }: UserActionsProps) {
  const { id: userId, isActive } = user;
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { data: session } = useSession();

  const isSelf = session?.user?.id === userId;

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const result = isActive 
        ? await deactivateUserAction(userId)
        : await reactivateUserAction(userId);

      if (result.success) {
        toast.success(result.success);
        setShowConfirm(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = () => {
    if (isSelf && isActive) {
      toast.error("No puedes desactivar tu propia cuenta");
      return;
    }
    setShowConfirm(true);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <EditStaffModal user={user} />
      <Button
        variant={isActive ? "outline" : "default"}
        size="sm"
        disabled={loading || (isSelf && isActive)}
        onClick={handleActionClick}
        className={isActive ? "border-red-500/50 text-red-400 hover:bg-red-500/10 h-8" : "bg-emerald-600 hover:bg-emerald-700 h-8"}
      >
        {isActive ? (
          <>
            {isSelf ? <ShieldAlert className="h-4 w-4 mr-2" /> : <PowerOff className="h-4 w-4 mr-2" />}
            {isSelf ? "Protegido" : "Desactivar"}
          </>
        ) : (
          <>
            <Power className="h-4 w-4 mr-2" />
            Activar
          </>
        )}
      </Button>
    </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={toggleStatus}
        loading={loading}
        title={isActive ? "¿Desactivar Usuario?" : "¿Activar Usuario?"}
        description={isActive 
          ? "El usuario perderá el acceso al sistema inmediatamente hasta que sea reactivado."
          : "El usuario recuperará todos sus permisos de acceso al sistema."
        }
        variant={isActive ? "danger" : "success"}
      />
    </>
  );
}
