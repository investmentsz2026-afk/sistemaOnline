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
import { Loader2, Camera, Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateAvatarAction } from "@/lib/actions/user";
import { useRouter } from "next/navigation";

const PRESET_AVATARS = [
  { id: "A", name: "Alpha", color: "bg-cyan-500" },
  { id: "B", name: "Beta", color: "bg-blue-600" },
  { id: "G", name: "Gamma", color: "bg-purple-600" },
  { id: "D", name: "Delta", color: "bg-emerald-500" },
  { id: "E", name: "Epsilon", color: "bg-orange-500" },
  { id: "Z", name: "Zeta", color: "bg-pink-600" },
];

export function ChangeAvatarModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    
    try {
      const result = await updateAvatarAction(selected);
      if (result.success) {
        toast.success(result.success);
        router.refresh();
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al actualizar avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all outline-none">
          Cambiar Avatar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-[#020617]/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl ring-1 ring-white/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600" />
        
        <div className="p-8 md:p-10">
          <DialogHeader className="space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter italic">
                Elegir <span className="text-emerald-400">Avatar</span>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Selecciona tu identidad visual en el sistema
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 mt-10">
            {PRESET_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelected(avatar.id)}
                className={cn(
                  "relative aspect-square rounded-2xl flex items-center justify-center text-2xl font-black transition-all group overflow-hidden",
                  selected === avatar.id 
                    ? "ring-4 ring-emerald-500/50 scale-105" 
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                <div className={cn("absolute inset-0 opacity-20", avatar.color)} />
                <span className={cn("relative z-10", selected === avatar.id ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>
                  {avatar.id}
                </span>
                {selected === avatar.id && (
                  <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-white stroke-[4px]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <DialogFooter className="flex items-center gap-3 pt-10 bg-transparent border-none p-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading || !selected}
              className="flex-[2] h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Avatar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
