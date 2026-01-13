"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export const FloatingCard = memo(function FloatingCard({
  children,
  className,
  delay = 0,
  direction = "up"
}: FloatingCardProps) {
  // Use CSS animations instead of Framer Motion for better performance
  const directionClass = {
    up: "animate-fade-in-up",
    down: "animate-fade-in-down",
    left: "animate-fade-in-left",
    right: "animate-fade-in-right"
  }[direction];

  return (
    <div
      className={cn(
        "backdrop-blur-sm bg-card border border-border",
        "shadow-card hover:shadow-hover transition-all duration-300",
        "hover:border-primary/30 rounded-xl hover:-translate-y-0.5",
        directionClass,
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
});