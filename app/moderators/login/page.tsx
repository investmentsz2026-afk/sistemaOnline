"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { 
  Lock, 
  Mail, 
  Loader2, 
  Fingerprint,
  Activity,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Auth3DFrame } from "@/components/ui/motion/auth-3d-frame";
import { MotionButton } from "@/components/ui/motion/motion-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ModeratorsLoginPage() {
  const [loading, setLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setShowErrorDialog(true);
      } else {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        const role = session?.user?.role;
        
        if (role === "ADMIN" || role === "MODERATOR") {
          router.push("/dashboard");
          router.refresh();
        } else {
          // Si es un usuario normal, cerramos sesión inmediatamente 
          // y le mostramos el error genérico de "credenciales incorrectas"
          await signOut({ redirect: false });
          setShowErrorDialog(true);
        }
      }
    } catch (error) {
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Botón Regresar al Inicio con limpieza de sesión */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 z-50"
      >
        <button 
          onClick={handleGoHome}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Regresar al inicio</span>
        </button>
      </motion.div>

      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <Auth3DFrame>
          <div className="text-center mb-8 pt-4">
            <div className="w-20 h-20 bg-[#0b0e14] border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Fingerprint className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">MODERADORES</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Terminal de Acceso Especial</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Moderador</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-400" />
                <Input name="email" type="email" required className="pl-12 h-14 bg-black/40 border-white/5 text-sm" placeholder="admin@battlecoins.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contraseña Única</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-400" />
                <Input name="password" type="password" required className="pl-12 h-14 bg-black/40 border-white/5 text-sm" />
              </div>
            </div>

            <MotionButton type="submit" glow className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl mt-4" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "SINCRONIZAR ACCESO"}
            </MotionButton>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-indigo-400" />
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">RED: EN LÍNEA</span>
            </div>
            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-right leading-none">
              ACCESO RESTRINGIDO<br />CENTRO DE COMANDO
            </div>
          </div>
        </Auth3DFrame>
      </motion.div>

      {/* Modal de Error Discreto */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="bg-[#0b0e14] border-white/5 rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tight">Error de Acceso</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Usuario o contraseña incorrectos. Por favor, verifique sus credenciales.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setShowErrorDialog(false)} 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl h-12"
            >
              ACEPTAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
