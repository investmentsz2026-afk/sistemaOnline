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
import { Edit3, Loader2, ShieldCheck, Mail, Lock, User } from "lucide-react";
import { updateStaffAction } from "@/lib/actions/user";
import { toast } from "sonner";

interface EditStaffModalProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export function EditStaffModal({ user }: EditStaffModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    try {
      const result = await updateStaffAction(user.id, values);
      if (result.success) {
        toast.success(result.success);
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al actualizar miembro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all">
          <Edit3 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-[#020617]/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl ring-1 ring-white/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
        
        <div className="p-8 md:p-10">
          <DialogHeader className="space-y-4">
            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/30">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter italic">
                Editar <span className="text-cyan-400">Perfil</span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Actualizar credenciales de {user.name || user.email}
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
                    placeholder="Nombre Completo" 
                    required 
                    className="bg-white/5 border-white/5 pl-12 h-14 rounded-2xl focus:bg-white/[0.08] focus:border-cyan-500/50 transition-all text-xs font-bold tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    defaultValue={user.email}
                    placeholder="correo@sistema.com" 
                    required 
                    className="bg-white/5 border-white/5 pl-12 h-14 rounded-2xl focus:bg-white/[0.08] focus:border-blue-500/50 transition-all text-xs font-bold tracking-widest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nueva Clave</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Rol</Label>
                  <select 
                    id="role" 
                    name="role" 
                    defaultValue={user.role}
                    required 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-5 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:bg-white/[0.08] focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '0.75rem' }}
                  >
                    <option value="MODERATOR" className="bg-[#020617] text-white">MODERADOR</option>
                    <option value="ADMIN" className="bg-[#020617] text-white">ADMINISTRADOR</option>
                    <option value="EMPLOYEE" className="bg-[#020617] text-white">EMPLEADO</option>
                  </select>
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
                Cerrar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-[2] h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
