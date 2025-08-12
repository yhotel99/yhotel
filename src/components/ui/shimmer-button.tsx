import React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

interface ShimmerButtonProps extends ButtonProps {
  shimmerColor?: string;
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "hsl(var(--primary))",
  ...props
}: ShimmerButtonProps) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark",
        "before:absolute before:inset-0 before:bg-gradient-shimmer before:opacity-0",
        "hover:before:opacity-100 before:transition-opacity before:duration-500",
        "hover:shadow-glow transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-shimmer opacity-0 hover:opacity-100 transition-opacity duration-500 hover:animate-shimmer" />
    </Button>
  );
}