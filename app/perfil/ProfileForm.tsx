"use client";

import { useState } from "react";
import { User, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { updateProfile } from "./actions";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ProfileFormProps {
  user: {
    name: string | null;
    email: string | null;
  };
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      await update(); // Refresca la sesión de NextAuth
      router.refresh(); // Refresca los componentes del servidor (Server Components)
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
          Nombre de Usuario
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          <input
            type="text"
            name="name"
            defaultValue={user.name || ""}
            className="w-full bg-[#0a102a] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            placeholder="Tu nombre"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
          Correo Electrónico
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          <input
            type="email"
            name="email"
            defaultValue={user.email || ""}
            required
            className="w-full bg-[#0a102a] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            placeholder="tu@correo.com"
          />
        </div>
      </div>

      <hr className="border-white/5 my-8" />
      
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          Seguridad
        </h3>
        <p className="text-sm text-slate-400 mt-1">Si deseas cambiar tu contraseña, llena los campos a continuación.</p>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
            Contraseña Actual
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="password"
              name="password"
              className="w-full bg-[#0a102a] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
            Nueva Contraseña
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="password"
              name="newPassword"
              className="w-full bg-[#0a102a] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="Nueva ••••••••"
            />
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSubmitting}
        type="submit"
        className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all flex justify-center items-center gap-3 disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Guardando Cambios...
          </>
        ) : (
          "Guardar Cambios"
        )}
      </motion.button>
    </form>
  );
};
