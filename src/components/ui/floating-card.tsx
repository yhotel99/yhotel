import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function FloatingCard({
  children,
  className,
  delay = 0,
  direction = "up"
}: FloatingCardProps) {
  const directionVariants = {
    up: { y: -10 },
    down: { y: 10 },
    left: { x: -10 },
    right: { x: 10 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionVariants[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.3 }
      }}
      className={cn(
        "backdrop-blur-sm bg-background/80 border border-border/50",
        "shadow-glass hover:shadow-glow transition-all duration-300",
        "hover:border-primary/30",
        className
      )}
    >
      {children}
    </motion.div>
  );
}