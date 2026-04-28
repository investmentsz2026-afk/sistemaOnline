"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ModernCard } from "./modern-card";
import { cn } from "@/lib/utils";

interface Auth3DFrameProps {
  children: ReactNode;
  className?: string;
}

export const Auth3DFrame = ({ children, className }: Auth3DFrameProps) => {
  return (
    <div className="relative group" style={{ perspective: "2000px" }}>
      {/* Outer 3D Layer - The "Bevel" */}
      <div className="absolute -inset-4 bg-gradient-to-br from-white/10 via-transparent to-black/40 rounded-[3rem] blur-sm pointer-events-none" />
      
      <motion.div
        initial={{ rotateY: 20, opacity: 0, scale: 0.9 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn("relative z-10", className)}
      >
        <ModernCard className="!p-0 border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-visible">
          {/* Internal Bevel Effect */}
          <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 pointer-events-none" />
          
          <div className="p-8 relative z-20">
            {children}
          </div>

          {/* 3D Accent Light */}
          <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
        </ModernCard>
      </motion.div>

      {/* Floating 3D Elements */}
      <motion.div 
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"
      />
    </div>
  );
};
