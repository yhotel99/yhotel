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
        "relative overflow-hidden",
        "hover:shadow-hover transition-all duration-500",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}