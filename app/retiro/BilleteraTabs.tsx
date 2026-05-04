"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { CreditCard, Wallet, ArrowDownCircle, ArrowUpCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { RetiroOptions } from "./RetiroOptions";

interface BilleteraTabsProps {
  balance: number;
}

export function BilleteraTabs({ balance }: BilleteraTabsProps) {
  const [activeTab, setActiveTab] = useState<"recharge" | "withdraw">("recharge");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const rechargeAmounts = [5, 10, 20, 50, 100];

  const handlePaymentSuccess = async (details: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/recharge/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: details.id,
          amount: selectedAmount,
          coins: selectedAmount, // 1:1 ratio
          method: "PAYPAL"
        })
      });

      if (response.ok) {
        toast.success(`¡Recarga de $${selectedAmount} exitosa!`);
        window.location.reload(); 
      } else {
        toast.error("Hubo un problema al acreditar tus monedas.");
      }
    } catch (error) {
      toast.error("Error de conexión al verificar el pago.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PayPalScriptProvider options={{ clientId: "test" }}>
      <div className="space-y-6">
        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab("recharge")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all",
              activeTab === "recharge" ? "bg-[#00e676] text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <ArrowDownCircle className="w-4 h-4" /> Recargar
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all",
              activeTab === "withdraw" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <ArrowUpCircle className="w-4 h-4" /> Retirar
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "recharge" ? (
            <motion.div
              key="recharge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-[#111626] rounded-3xl p-6 border border-white/5 space-y-6">
                <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#00e676]" /> Seleccionar Monto
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {rechargeAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={cn(
                        "py-4 rounded-2xl border transition-all text-center group",
                        selectedAmount === amount 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                          : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20"
                      )}
                    >
                      <span className="text-lg font-black block">${amount}</span>
                      <span className="text-[10px] font-bold uppercase opacity-60">Monedas</span>
                    </button>
                  ))}
                </div>

                {selectedAmount && (
                  <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Métodos de Pago</p>
                      <button 
                        onClick={() => setSelectedAmount(null)}
                        className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                        title="Cancelar selección"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="relative z-0">
                      <PayPalButtons
                        style={{ layout: "vertical", shape: "pill", label: "pay" }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                              {
                                amount: {
                                  currency_code: "USD",
                                  value: selectedAmount!.toString(),
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const details = await actions.order?.capture();
                          if (details) {
                            handlePaymentSuccess(details);
                          }
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 text-center uppercase font-bold tracking-tighter">
                      Recarga instantánea • Sin comisiones ocultas • Seguro SSL
                    </p>
                  </div>
                )}
              </div>

              {/* Promo Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-24 h-24" />
                </div>
                <h4 className="text-white font-black uppercase italic text-lg mb-1">Bono de Primera Recarga</h4>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-tighter">Recibe un 10% extra en tu primera compra de monedas</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RetiroOptions balance={balance} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PayPalScriptProvider>
  );
}
