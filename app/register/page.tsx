"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { 
  Coins, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  Database,
  Globe,
  Home,
  ChevronLeft,
  Gift
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
import { registerAction } from "@/lib/actions/auth";

function RegisterContent() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const refCode = formData.get("referralCode") as string;

    try {
      const result = await registerAction({ 
        name, 
        email, 
        password, 
        referralCode: refCode 
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Cuenta creada correctamente. ¡Bono de registro de $0.02 acreditado! Ya puedes iniciar sesión.");
        router.push("/login");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = (provider: 'google' | 'facebook') => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <PageTurn>
      <div className="relative min-h-screen flex flex-col lg:flex-row bg-[#020617] overflow-hidden selection:bg-cyan-500/30">
        {/* Left Side: Brand Experience */}
        <div className="hidden lg:flex relative w-1/2 h-full min-h-screen items-center justify-center p-12 overflow-hidden border-r border-white/5">
          {/* Animated Background for Left Side */}
          <div className="absolute inset-0 z-0">
             <Image 
              src="/gaming-bg-register.png" 
              alt="Gaming Background" 
              fill 
              className="object-cover opacity-40 grayscale-[0.3] pointer-events-none"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/40 via-[#020617] to-[#020617]"></div>
            
            {/* 3D Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
          </div>

          <div className="relative z-10 max-w-lg">
            <AnimatedContainer direction="right" delay={0.2}>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  {/* Neon Glow */}
                  <div className="absolute -inset-4 bg-cyan-500/25 rounded-full blur-3xl animate-pulse"></div>
                  
                  {/* Sphere Container */}
                  <div className="relative w-24 h-24 rounded-full border-4 border-white/10 p-1 bg-black overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.4)]">
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">Battle</h1>
                  <h1 className="text-5xl font-black tracking-tighter text-cyan-400 uppercase leading-none">Coins</h1>
                </div>
              </div>
              
              <h2 className="text-5xl font-black text-white leading-tight mb-6 uppercase tracking-tighter">
                Únete a la <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Revolución</span> Gaming
              </h2>
              
              <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                Crea tu cuenta hoy y obtén un bono de <span className="text-emerald-400 font-bold">$0.02 USD de inmediato</span>. ¡Juega, sube de nivel y compite con amigos!
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-cyan-500/30 transition-colors cursor-pointer">
                  <div className="h-8 w-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Database className="h-5 w-5 text-cyan-400" />
                  </div>
                  <p className="text-white font-bold uppercase tracking-widest text-[10px] mb-1">Escalabilidad</p>
                  <p className="text-slate-500 text-xs font-medium">Juegos optimizados a 60 FPS</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-blue-500/30 transition-colors cursor-pointer">
                  <div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Globe className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-white font-bold uppercase tracking-widest text-[10px] mb-1">Referidos</p>
                  <p className="text-slate-500 text-xs font-medium">Gana $0.50 por cada amigo</p>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="flex-1 min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
          {/* Mobile Background */}
          <div className="lg:hidden absolute inset-0 z-0">
             <Image 
              src="/gaming-bg-register.png" 
              alt="Gaming Background" 
              fill 
              className="object-cover opacity-20 grayscale-[0.3] pointer-events-none"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/70 to-[#020617]"></div>
          </div>

          <div className="relative z-10 w-full max-w-sm">
            {/* Mobile Only Logo */}
            <div className="lg:hidden flex flex-col items-center mb-4">
                <div className="relative mb-2">
                  <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-lg"></div>
                  <div className="relative w-12 h-12 rounded-full border-2 border-white/10 p-0.5 bg-black overflow-hidden shadow-lg">
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <h1 className="text-md font-black tracking-tighter text-white uppercase leading-none">Battle <span className="text-cyan-400">Coins</span></h1>
            </div>

            <Auth3DFrame>
              <div className="mb-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-0.5 leading-none">Comienza ahora</h3>
                <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">Registro Maestro</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre</Label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Tu nombre"
                      required
                      className="pl-12 h-10 text-xs bg-black/40 border-white/5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      className="pl-12 h-10 text-xs bg-black/40 border-white/5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Contraseña</Label>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-12 h-10 text-xs bg-black/40 border-white/5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="referralCode" className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Código de Referido (Opcional)</Label>
                  <div className="relative group/input">
                    <Gift className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                    <Input
                      id="referralCode"
                      name="referralCode"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Ej: REF-XXXXX"
                      className="pl-12 h-10 text-xs bg-black/40 border-white/5 text-cyan-400 font-bold uppercase tracking-wider"
                    />
                  </div>
                </div>

                <MotionButton
                  type="submit"
                  glow
                  className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg border-0 shadow-xl shadow-cyan-500/20 mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2 uppercase tracking-[0.2em] text-[9px]">
                      Crear cuenta
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </MotionButton>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
                    <span className="bg-[#0b0e14] px-3 text-slate-600">O regístrate con</span>
                  </div>
                </div>

                {/* Social Logins with Official Colors */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => handleSocialSignIn('google')}
                    className="flex items-center justify-center gap-2 h-10 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-all group"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/70 group-hover:text-white">Google</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSocialSignIn('facebook')}
                    className="flex items-center justify-center gap-2 h-10 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-all group"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/70 group-hover:text-white">Facebook</span>
                  </button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    ¿Ya eres parte?{" "}
                    <Link href="/login" className="text-cyan-500 font-black hover:text-cyan-400 ml-1 underline decoration-cyan-500/30 underline-offset-4">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </form>
            </Auth3DFrame>
          </div>
        </div>
      </div>
    </PageTurn>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
