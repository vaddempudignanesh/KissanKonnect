// components/Stat.tsx
// PURPOSE: A single animated number.
//          Counts up from 0 to `value` when it enters the viewport.
//          Used everywhere we want to feel "alive" (sales, farmers, ₹ paid).
"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  label: string;
  prefix?: string;   // "₹"
  suffix?: string;   // "+", "kg", "%"
  decimals?: number;
  className?: string;
}

export function Stat({ value, label, prefix = "", suffix = "", decimals = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      if (displayRef.current) {
        displayRef.current.textContent =
          prefix +
          new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals,
          }).format(v) +
          suffix;
      }
    });
    return () => unsub();
  }, [spring, prefix, suffix, decimals]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "kk-card p-6 text-center",
        className
      )}
    >
      <span
        ref={displayRef}
        className="block text-3xl sm:text-4xl font-bold text-[var(--kk-lime)]"
      >
        {prefix}0{suffix}
      </span>
      <span className="mt-2 block text-sm text-[var(--kk-text-dim)]">
        {label}
      </span>
    </motion.div>
  );
}