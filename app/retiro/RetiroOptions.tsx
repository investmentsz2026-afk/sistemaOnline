"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bitcoin, CreditCard, Play, CircleDollarSign, Check, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createWithdrawalRequest } from "./actions";

interface RetiroOptionsProps {
  balance: number;
}

const AMOUNTS = [5, 10, 20, 50];

const cryptoOptions = [
  {
    id: "btc",
    name: "Bitcoin",
    min: 5,
    max: 50,
    color: "bg-[#f7931a]",
    icon: <Bitcoin className="w-16 h-16 text-white" />,
  },
  {
    id: "ltc",
    name: "Litecoin",
    min: 5,
    max: 50,
    color: "bg-[#64748b]",
    icon: <span className="text-white text-6xl font-serif italic font-bold">Ł</span>,
  }
];

const fiatOptions = [
  {
    id: "paypal",
    name: "PayPal",
    min: 5,
    max: 50,
    color: "bg-gradient-to-br from-[#003087] to-[#009cde]",
    icon: <span className="text-white text-5xl font-black italic">P</span>,
  },
  {
    id: "venmo",
    name: "Venmo",
    min: 5,
    max: 50,
    color: "bg-[#008cff]",
    icon: <span className="text-white text-4xl font-black italic lowercase tracking-tighter">venmo</span>,
  },
  {
    id: "binance",
    name: "Binance",
    min: 5,
    max: 50,
    color: "bg-[#fcd535]",
    icon: <CircleDollarSign className="w-16 h-16 text-slate-900" />,
  },
  {
    id: "googleplay",
    name: "Google Play",
    min: 5,
    max: 50,
    color: "bg-slate-800",
    icon: <Play className="w-12 h-12 text-white fill-emerald-500" />,
  },
  {
    id: "visa",
    name: "Visa",
    min: 5,
    max: 50,
    color: "bg-[#1a1f36]",
    icon: <CreditCard className="w-16 h-16 text-white" />,
  }
];

export const RetiroOptions = ({ balance }: RetiroOptionsProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [accountInfo, setAccountInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const balanceInUsd = balance;
  
  const handleWithdrawClick = (option: any) => {
    if (balanceInUsd < selectedAmount) {
      toast.error("No tienes saldo suficiente.");
      return;
    }
    setSelectedMethod(option);
    setIsModalOpen(true);
  };

  const onSubmit = async () => {
    if (!accountInfo) {
      toast.error("Por favor, ingresa los datos de cobro.");
      return;
    }

    setIsSubmitting(true);
    const result = await createWithdrawalRequest({
      amount: selectedAmount,
      method: selectedMethod.name,
      accountInfo: accountInfo
    });

    if (result.success) {
      toast.success("¡Solicitud enviada con éxito!");
      setIsModalOpen(false);
      setAccountInfo("");
    } else {
      toast.error(result.error || "Error al procesar el retiro.");
    }
    setIsSubmitting(false);
  };

  const renderCard = (option: any, delayIdx: number) => {
    const isEligible = balanceInUsd >= selectedAmount;
    const progress = Math.min((balanceInUsd / selectedAmount) * 100, 100);

    return (
      <motion.div
        key={option.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delayIdx * 0.1 }}
        className={cn(
          "bg-[#171c2e] rounded-2xl p-4 border transition-all group cursor-pointer",
          isEligible ? "border-white/5 hover:border-emerald-500/50" : "border-white/5 opacity-80"
        )}
        onClick={() => handleWithdrawClick(option)}
      >
        <div className="flex justify-between items-center px-1 mb-2">
          <span className="text-white font-bold text-[11px] sm:text-sm uppercase tracking-wider">{option.name}</span>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Límite</span>
            <span className="text-white font-black text-[10px] sm:text-xs tracking-tighter">$50.00</span>
          </div>
        </div>

        <div className={cn(
          "w-full h-32 rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]",
          option.color
        )}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          <div className="relative z-10 drop-shadow-2xl">{option.icon}</div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
            <span>Progreso para ${selectedAmount}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isEligible ? "bg-[#00e676] shadow-[0_0_10px_rgba(0,230,118,0.5)]" : "bg-cyan-500/50"
              )}
            />
          </div>
        </div>

        <div className={cn(
          "mt-4 py-3 rounded-xl text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all",
          isEligible 
            ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white" 
            : "bg-white/5 text-slate-600"
        )}>
          {isEligible ? `Retirar $${selectedAmount}` : `Faltan $${(selectedAmount - balanceInUsd).toFixed(2)}`}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="bg-[#171c2e] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 text-center">Selecciona el monto a retirar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setSelectedAmount(amt)}
              className={cn(
                "relative h-16 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center overflow-hidden group",
                selectedAmount === amt 
                  ? "bg-cyan-500 border-cyan-400 text-slate-950 scale-105 shadow-[0_0_20px_rgba(34,211,238,0.4)]" 
                  : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-white"
              )}
            >
              <span className="text-2xl tracking-tighter">${amt}</span>
              <span className="text-[8px] uppercase tracking-widest opacity-60">Dólares</span>
              {selectedAmount === amt && (
                <motion.div layoutId="check" className="absolute top-1 right-2">
                  <Check className="w-3 h-3" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.3em]">Criptomonedas</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cryptoOptions.map((opt, i) => renderCard(opt, i))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.3em]">Efectivo y Tarjetas</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fiatOptions.map((opt, i) => renderCard(opt, i + cryptoOptions.length))}
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#050a1f]/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[#171c2e] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden" >
              <div className={cn("absolute top-0 left-0 w-full h-2", selectedMethod?.color)} />
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Confirmar Retiro</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Estás retirando <span className="text-white">${selectedAmount}.00 USD</span> vía {selectedMethod?.name}</p>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {selectedMethod?.id === 'visa' ? 'Número de Tarjeta' : 
                     selectedMethod?.id === 'paypal' ? 'Correo Electrónico de PayPal' :
                     selectedMethod?.id === 'venmo' ? 'Usuario de Venmo' :
                     selectedMethod?.id === 'binance' || selectedMethod?.id === 'btc' || selectedMethod?.id === 'ltc' ? 'Dirección de Billetera (Wallet)' :
                     'Datos de Cobro'}
                  </label>
                  <div className="relative">
                    <input 
                      autoFocus 
                      type="text" 
                      value={accountInfo} 
                      onChange={(e) => setAccountInfo(e.target.value)} 
                      placeholder={
                        selectedMethod?.id === 'visa' ? 'xxxx xxxx xxxx xxxx' : 
                        selectedMethod?.id === 'paypal' ? 'tu-correo@paypal.com' :
                        selectedMethod?.id === 'venmo' ? '@usuario_venmo' :
                        selectedMethod?.id === 'binance' || selectedMethod?.id === 'btc' || selectedMethod?.id === 'ltc' ? '0x... o Wallet ID' :
                        'Ingresa tus datos aquí'
                      } 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all" 
                    />
                  </div>
                  <p className="text-[10px] text-yellow-500/70 font-bold italic text-center px-4"> * Asegúrate de que los datos sean correctos. El equipo de pagos no se hace responsable por datos erróneos. </p>
                </div>
                <button onClick={onSubmit} disabled={isSubmitting} className="w-full bg-emerald-500 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50" >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? "Procesando..." : "Enviar Solicitud"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
