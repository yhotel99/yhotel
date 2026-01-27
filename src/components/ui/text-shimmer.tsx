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
}: TextShimmerProps) {

  return (
    <span
      className={cn(
        "bg-gradient-to-r from-white via-primary-light via-gold to-white bg-clip-text text-transparent animate-gradient-shift",
        className
      )}
      style={{ 
        backgroundSize: '400% 400%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}
    >
      {children}
    </span>
  );
}