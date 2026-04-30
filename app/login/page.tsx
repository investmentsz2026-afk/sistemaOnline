"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      alert("Error: " + result.error);
    } else {
      router.push("/inicio");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0b0e14] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-white uppercase mb-8 text-center">Acceso <span className="text-cyan-400">Elite</span></h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl h-12 px-4 text-white focus:border-cyan-500 outline-none transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl h-12 px-4 text-white focus:border-cyan-500 outline-none transition-all"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full h-14 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            Entrar Ahora
          </button>
        </form>
      </div>
    </div>
  );
}
