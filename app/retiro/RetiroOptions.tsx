"use client";

import { motion } from "framer-motion";
import { Bitcoin, CreditCard, Play, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetiroOptionsProps {
  balance: number;
}

const cryptoOptions = [
  {
    id: "btc",
    name: "Bitcoin",
    min: 5,
    max: 1000,
    color: "bg-[#f7931a]",
    icon: <Bitcoin className="w-16 h-16 text-white" />,
  },
  {
    id: "ltc",
    name: "Litecoin",
    min: 5,
    max: 1000,
    color: "bg-[#64748b]", // Slate/gray blue for Litecoin
    icon: <span className="text-white text-6xl font-serif italic font-bold">Ł</span>,
  }
];

const fiatOptions = [
  {
    id: "paypal",
    name: "PayPal",
    min: 5,
    max: 1000,
    color: "bg-gradient-to-br from-[#003087] to-[#009cde]",
    icon: <span className="text-white text-5xl font-black italic">P</span>,
  },
  {
    id: "venmo",
    name: "Venmo",
    min: 5,
    max: 1000,
    color: "bg-[#008cff]",
    icon: <span className="text-white text-4xl font-black italic lowercase tracking-tighter">venmo</span>,
  },
  {
    id: "binance",
    name: "Binance",
    min: 5,
    max: 1000,
    color: "bg-[#fcd535]",
    icon: <CircleDollarSign className="w-16 h-16 text-slate-900" />,
  },
  {
    id: "googleplay",
    name: "Google Play",
    min: 5,
    max: 1000,
    color: "bg-slate-800",
    icon: <Play className="w-12 h-12 text-white fill-emerald-500" />,
  },
  {
    id: "visa",
    name: "Visa",
    min: 5,
    max: 1000,
    color: "bg-[#1a1f36]",
    icon: <CreditCard className="w-16 h-16 text-white" />,
  }
];

export const RetiroOptions = ({ balance }: RetiroOptionsProps) => {
  
  const renderCard = (option: any, delayIdx: number) => {
    const isEligible = balance >= option.min;
    const progress = Math.min((balance / option.min) * 100, 100);

    return (
      <motion.div
        key={option.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delayIdx * 0.1 }}
        className="bg-[#171c2e] rounded-2xl p-4 border border-white/5 flex flex-col gap-4 group cursor-pointer hover:border-emerald-500/30 transition-all"
        onClick={() => {
          if (isEligible) {
            alert(`Procesando retiro a ${option.name}...`);
            // Here you would open a modal or trigger a server action
          }
        }}
      >
        <div className="flex justify-between items-center px-1">
          <span className="text-white font-bold text-[11px] sm:text-sm">{option.name}</span>
          <span className="text-white font-bold text-[10px] sm:text-sm">
            {balance >= option.min ? `$${option.min}-$${balance.toFixed(2)}` : `$${option.min} Mínimo`}
          </span>
        </div>

        {/* Logo Card */}
        <div className={cn(
          "w-full h-32 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]",
          option.color
        )}>
          {option.icon}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#0f1423] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              isEligible ? "bg-[#00e676] shadow-[0_0_10px_rgba(0,230,118,0.5)]" : "bg-[#00e676]/50"
            )}
          />
        </div>

        {/* Action Text */}
        <div className="text-center pt-1">
          <span className={cn(
            "text-sm font-black transition-colors",
            isEligible ? "text-[#00e676] group-hover:text-emerald-400" : "text-[#00e676]/40"
          )}>
            {isEligible ? "Retirar ahora" : "Retirar"}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Crypto Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Crypto</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {cryptoOptions.map((opt, i) => renderCard(opt, i))}
        </div>
      </section>

      {/* Fiat / Gift Cards Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Venmo / PayPal / Tarjetas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {fiatOptions.map((opt, i) => renderCard(opt, i + cryptoOptions.length))}
        </div>
      </section>
    </div>
  );
};
