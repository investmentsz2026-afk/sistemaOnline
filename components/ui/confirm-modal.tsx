"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
  variant?: "danger" | "success";
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  loading = false,
  variant = "danger"
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-[#020617]/95 backdrop-blur-3xl border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-2xl ring-1 ring-white/10">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${variant === 'danger' ? 'from-red-500 to-orange-600' : 'from-emerald-500 to-teal-600'}`} />
        
        <div className="p-8">
          <DialogHeader className="space-y-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
              variant === 'danger' 
                ? 'bg-red-500/10 border-red-500/30 shadow-red-500/10' 
                : 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10'
            }`}>
              <AlertTriangle className={`w-7 h-7 ${variant === 'danger' ? 'text-red-400' : 'text-emerald-400'}`} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">
                {title}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogFooter className="flex items-center gap-3 pt-8 bg-transparent border-none p-0 -mx-0 -mb-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all"
            >
              No, cancelar
            </Button>
            <Button 
              type="button" 
              onClick={onConfirm}
              disabled={loading}
              className={`flex-[1.5] h-12 rounded-xl text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${
                variant === 'danger' 
                  ? 'bg-red-600 shadow-red-500/20 hover:bg-red-500' 
                  : 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-500'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sí, confirmar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
