import React from "react";
import { cn } from "@/lib/utils";

interface TextShimmerProps {
  children: React.ReactNode;
  className?: string;
  speed?: "slow" | "normal" | "fast";
}

export function TextShimmer({
  children,
  className,
  speed = "normal"
}: TextShimmerProps) {
  const speedClass = {
    slow: "animate-text-glow",
    normal: "animate-text-glow",
    fast: "animate-text-glow"
  }[speed];

  return (
    <span
      className={cn(
        "bg-gradient-to-r from-primary via-gold to-primary bg-clip-text text-transparent",
        speedClass,
        className
      )}
    >
      {children}
    </span>
  );
}