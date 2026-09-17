// components/AnimatedButton.tsx
// PURPOSE: The single button used across the entire app.
//          Grows on hover, glows on hover, works as both <button> and <Link>.
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--kk-lime)] text-[#0A0F0D] hover:shadow-[0_0_40px_rgba(169,227,75,0.6)]",
  secondary:
    "bg-[var(--kk-green)] text-white hover:bg-[var(--kk-green-light)] hover:shadow-[0_0_40px_rgba(46,139,87,0.5)]",
  ghost:
    "bg-transparent border border-[var(--kk-border)] text-[var(--kk-text)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]",
  danger:
    "bg-[var(--kk-terracotta)] text-white hover:shadow-[0_0_40px_rgba(199,91,57,0.5)]",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-2xl",
};

export function AnimatedButton({
  children, href, onClick, variant = "primary", size = "md",
  className, disabled,
}: Props) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 font-semibold",
    "transition-all duration-300 ease-out will-change-transform",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    variants[variant], sizes[size], className
  );

  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.06, y: -2 },
    whileTap:   disabled ? {} : { scale: 0.97 },
    transition: { type: "spring" as const, stiffness: 400, damping: 22 },
  };

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link href={href} className={base}>{children}</Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      onClick={onClick}
      disabled={disabled}
      className={base}
    >
      {children}
    </motion.button>
  );
}