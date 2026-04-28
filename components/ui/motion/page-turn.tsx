"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export const PageTurn = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0, transformOrigin: "left" }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0, transformOrigin: "right" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full"
      style={{ perspective: "2000px" }}
    >
      {children}
    </motion.div>
  );
};
