"use client";

import React from "react";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PrintButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: "default" | "outline" | "ghost" | "hero" | "secondary" | "subtle";
  size?: "xs" | "sm" | "md" | "lg";
  iconClassName?: string;
  hideTextOnMobile?: boolean;
}

export function PrintButton({
  label = "Cetak / Simpan PDF",
  variant = "outline",
  size = "sm",
  className,
  iconClassName,
  hideTextOnMobile = false,
  onClick,
  ...props
}: PrintButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    } else {
      window.print();
    }
  };

  const variantStyles = {
    default:
      "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent shadow-xs",
    outline:
      "bg-card hover:bg-muted border-border text-foreground shadow-xs",
    hero:
      "bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md shadow-xs",
    secondary:
      "bg-secondary hover:brightness-95 text-secondary-foreground border-transparent shadow-xs",
    ghost:
      "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground border-transparent",
    subtle:
      "bg-muted/60 hover:bg-muted text-foreground border-border",
  };

  const sizeStyles = {
    xs: "min-h-[32px] h-8 px-2.5 py-1 text-xs gap-1.5 rounded-lg",
    sm: "min-h-[36px] sm:min-h-[40px] px-3 sm:px-3.5 py-1.5 text-xs font-bold gap-2 rounded-lg",
    md: "min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold gap-2 rounded-lg",
    lg: "min-h-[48px] px-5 sm:px-6 py-2.5 text-sm sm:text-base font-bold gap-2.5 rounded-xl",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Cetak / Simpan PDF"
      aria-label="Cetak / Simpan PDF"
      className={cn(
        "inline-flex items-center justify-center border font-bold transition-all cursor-pointer active:scale-98 select-none print:hidden",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <Printer className={cn("h-4 w-4 shrink-0", iconClassName)} />
      <span className={cn(hideTextOnMobile ? "hidden sm:inline" : "inline")}>
        {label}
      </span>
    </button>
  );
}
