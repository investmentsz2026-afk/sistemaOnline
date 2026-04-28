"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const ModernCard = ({ children, className, hoverEffect = true }: ModernCardProps) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { 
        y: -5, 
        rotateX: 2, 
        rotateY: -2,
        transition: { duration: 0.3, ease: "easeOut" } 
      } : {}}
      style={{ perspective: "1000px" }}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f172a]/40 p-6 backdrop-blur-2xl transition-all duration-500",
        hoverEffect && "hover:border-cyan-500/40 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.1)]",
        className
      )}
    >
      {/* 3D Border Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 opacity-50 pointer-events-none" />
      <div className="absolute -inset-[1px] bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] pointer-events-none opacity-50" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
