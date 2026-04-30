"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { 
  Coins, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { PageTurn } from "@/components/ui/motion/page-turn";
import { Auth3DFrame } from "@/components/ui/motion/auth-3d-frame";
import { AnimatedContainer } from "@/components/ui/motion/animated-container";
import { MotionButton } from "@/components/ui/motion/motion-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginOverlay } from "@/components/ui/motion/login-overlay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<"loading" | "success" | "error">("loading");
  const [overlayMessage, setOverlayMessage] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Show initial loading overlay
    setShowOverlay(true);
    setOverlayStatus("loading");
    setOverlayMessage("Iniciando Sesión");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setOverlayStatus("error");
        setOverlayMessage("Acceso Denegado");
        
        setTimeout(() => {
          setShowOverlay(false);
          setShowErrorDialog(true);
        }, 1500);
      } else {
        setOverlayStatus("success");
        setOverlayMessage("Acceso Concedido");
        
        setTimeout(() => {
          router.push("/inicio");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setShowOverlay(false);
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = (provider: 'google' | 'facebook') => {
    signIn(provider, { callbackUrl: '/inicio' });
  };

  return (
    <PageTurn>
      <div className="relative min-h-screen flex flex-col lg:flex-row bg-[#020617] overflow-hidden selection:bg-cyan-500/30">
        
        {/* Left Side: Brand Experience */}
        <div className="hidden lg:flex relative w-1/2 h-full min-h-screen items-center justify-center p-12 overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 z-0">
             <Image 
              src="/gaming-bg-login.png" 
              alt="Gaming Background" 
              fill 
              className="object-cover opacity-40 grayscale-[0.5] pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/40 via-[#020617] to-[#020617]"></div>
          </div>

          <div className="relative z-10 max-w-lg">
            <AnimatedContainer direction="right" delay={0.2}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-black rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
                  <Coins className="text-cyan-400 h-10 w-10" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">Battle</h1>
                  <h1 className="text-4xl font-black tracking-tighter text-cyan-400 uppercase leading-none">Coins</h1>
                </div>
              </div>
              
              <h2 className="text-5xl font-black text-white leading-tight mb-6 uppercase tracking-tighter">
                Gestiona tus activos con <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Poder Total</span>
              </h2>
            </AnimatedContainer>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
          <div className="relative z-10 w-full max-w-sm">
            <Auth3DFrame>
              <div className="mb-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-0.5 leading-none">Bienvenido de nuevo</h3>
                <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">Acceso Elite</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                    <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="pl-12 h-10 text-xs bg-black/40 border-white/5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" title="Contraseña" className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Contraseña</Label>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                    <Input id="password" name="password" type="password" required className="pl-12 h-10 text-xs bg-black/40 border-white/5" />
                  </div>
                </div>

                <MotionButton type="submit" glow className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg mt-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="flex items-center gap-2 uppercase tracking-[0.2em] text-[9px]">Entrar ahora <ArrowRight className="h-3 w-3" /></span>}
                </MotionButton>

                <div className="text-center pt-2">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    No tienes cuenta? <Link href="/register" className="text-cyan-500 font-black ml-1">Regístrate</Link>
                  </p>
                </div>
              </form>
            </Auth3DFrame>
          </div>
        </div>

        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent className="bg-[#0b0e14] border-white/5 rounded-[2rem] max-w-sm">
            <DialogHeader className="items-center text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
              <DialogTitle className="text-xl font-black text-white uppercase">Error de Acceso</DialogTitle>
              <DialogDescription className="text-slate-400">Credenciales incorrectas.</DialogDescription>
            </DialogHeader>
            <DialogFooter><Button onClick={() => setShowErrorDialog(false)} className="w-full bg-white/5 text-white">Aceptar</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <LoginOverlay isVisible={showOverlay} status={overlayStatus} message={overlayMessage} />
      </div>
    </PageTurn>
  );
}
