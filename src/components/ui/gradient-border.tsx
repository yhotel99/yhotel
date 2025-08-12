import React from "react";
import { cn } from "@/lib/utils";

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
  containerClassName?: string;
}

export function GradientBorder({
  children,
  className,
  borderClassName,
  containerClassName,
}: GradientBorderProps) {
  return (
    <div className={cn("group relative", containerClassName)}>
      <div
        className={cn(
          "absolute -inset-0.5 bg-gradient-luxury rounded-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-aurora",
          borderClassName
        )}
      />
      <div className={cn("relative bg-background rounded-lg", className)}>
        {children}
      </div>
    </div>
  );
}