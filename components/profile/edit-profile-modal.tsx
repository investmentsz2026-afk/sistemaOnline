"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Loader2, UserEdit } from "lucide-react";
import { updateProfileAction } from "@/lib/actions/user";
import { toast } from "sonner";

interface EditProfileModalProps {
  user: {
    name: string | null;
    email: string;
  };
}

export function EditProfileModal({ user }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    try {
      const result = await updateProfileAction(values);
      if (result.success) {
        toast.success(result.success);
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all outline-none">
          Editar Perfil
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-[#020617]/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl ring-1 ring-white/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
        
        <div className="p-8 md:p-10">
          <DialogHeader className="space-y-4">
            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/30">
              <User className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter italic">
                Ajustar <span className="text-cyan-400">Perfil</span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Actualiza tus datos de identidad en el sistema
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nombre</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={user.name || ""}
                    placeholder="Tu nombre" 
                    required 
                    className="bg-white/5 border-white/5 pl-12 h-14 rounded-2xl focus:bg-white/[0.08] focus:border-cyan-500/50 transition-all text-xs font-bold tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Correo</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    defaultValue={user.email}
                    placeholder="tu@correo.com" 
                    required 
                    className="bg-white/5 border-white/5 pl-12 h-14 rounded-2xl focus:bg-white/[0.08] focus:border-blue-500/50 transition-all text-xs font-bold tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Cambiar Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="DEJAR VACÍO SI NO CAMBIA" 
                    className="bg-white/5 border-white/5 pl-12 h-14 rounded-2xl focus:bg-white/[0.08] focus:border-purple-500/50 transition-all text-[9px] font-bold tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)}
                className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-[2] h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Perfil"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
