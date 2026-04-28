"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MotionButtonInner = motion.create(Button);

interface MotionButtonProps extends ButtonProps, Omit<HTMLMotionProps<"button">, keyof ButtonProps> {
  glow?: boolean;
}

export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, glow, ...props }, ref) => {
    return (
      <MotionButtonInner
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative transition-shadow duration-300",
          glow && "hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.35)]",
          className
        )}
        {...props}
      />
    );
  }
);

MotionButton.displayName = "MotionButton";
