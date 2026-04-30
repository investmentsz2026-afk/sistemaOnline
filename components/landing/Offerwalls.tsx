"use client";

import { motion } from "framer-motion";
import { Gamepad2, Puzzle, Target, Star, Rocket, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const partners = [
  {
    name: "Playtime Rewards",
    icon: Gamepad2,
    iconColor: "text-blue-500",
    iconBg: "bg-white",
    description: "🎮 Win instant rewards ⚡ 🔄 Transfer your credits for free, anytime, with no limits 💸 🎁 Get a bonus for starting a game + many more as you progress 🚀",
    stars: 5,
    tag: "INSTANT PAYOUTS",
    tagColor: "bg-fuchsia-900/50 text-fuchsia-200 border-fuchsia-700/50",
    featured: true,
  },
  {
    name: "MyChips",
    icon: Puzzle,
    iconColor: "text-amber-500",
    iconBg: "bg-white",
    description: "🧩 Best Tracking, Best Support and highest paying Offerwall as of 2026. Join MyChips to play games and earn nearly instant rewards 🧩",
    stars: 5,
    featured: true,
  },
  {
    name: "HangMyAds",
    icon: Target,
    iconColor: "text-emerald-500",
    iconBg: "bg-black",
    description: "🚀 Exceptional tracking & high-paying advertisers 💰 🏆 HMA is one of the oldest and highest performers in the industry 🔥",
    stars: 5,
    featured: true,
  }
];

export const Offerwalls = () => {
  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
        <h2 className="text-white font-bold text-lg md:text-xl tracking-tight">Featured Partners - Best Offers</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {partners.map((partner, idx) => (
          <motion.div
            key={partner.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1a1f3c] to-[#0d132b] border border-white/5 p-6 shadow-xl hover:shadow-cyan-500/10 transition-all cursor-pointer group"
          >
            {/* Featured Sash */}
            {partner.featured && (
              <div className="absolute -top-6 -right-6 w-24 h-24 flex items-end justify-center rotate-45 z-10">
                <div className="bg-[#ffb067] text-[#542a00] font-black text-[10px] uppercase tracking-widest py-1.5 w-32 text-center shadow-lg">
                  FEATURED
                </div>
              </div>
            )}

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex items-start gap-4 mb-4 relative z-10">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg", partner.iconBg)}>
                <partner.icon className={cn("w-8 h-8", partner.iconColor)} />
              </div>
              <div className="pt-2">
                <h3 className="text-white font-bold text-xl">{partner.name}</h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium relative z-10">
              {partner.description}
            </p>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex gap-1">
                {[...Array(partner.stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#ffce5c] text-[#ffce5c]" />
                ))}
              </div>

              {partner.tag && (
                <div>
                  <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest border",
                    partner.tagColor
                  )}>
                    {partner.tag}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
