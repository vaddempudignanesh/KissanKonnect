// components/AnimatedButton.tsx
// PURPOSE: Reusable animated button. Variants: primary (black bg / white text),
// ghost (transparent bg / black text), secondary (dark gray bg / white text).
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[#111111] text-white border border-[#111111] hover:bg-[#333333] hover:border-[#333333]",
  secondary:
    "bg-[#333333] text-white border border-[#333333] hover:bg-[#111111] hover:border-[#111111]",
  ghost:
    "bg-transparent text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-white",
};

const SIZES: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-2xl gap-2.5",
};

export function AnimatedButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className,
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center font-semibold",
    "transition-colors duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <motion.span
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={classes}
    >
      {children}
    </motion.span>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className="inline-flex">
      {content}
    </button>
  );
}