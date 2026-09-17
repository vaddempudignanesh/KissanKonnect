// components/DashboardStat.tsx
// PURPOSE: A compact stat card used across dashboards.
//          Shows an emoji/icon, an animated counter, a label, and an
//          optional trend chip. Hover lifts and glows.
"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: LucideIcon;
  emoji?: string;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: { value: number; direction: "up" | "down" };
  accent?: string;
  delay?: number;
}

export function DashboardStat({
  icon: Icon, emoji, value, label, prefix = "", suffix = "",
  trend, accent = "var(--kk-lime)", delay = 0,
}: Props) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1000;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -30 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 60, damping: 14 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="kk-card p-6 relative overflow-hidden"
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 blur-3xl"
        style={{ background: accent }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: accent + "22", color: accent }}
          >
            {emoji ? <span className="text-xl">{emoji}</span> : Icon ? <Icon className="w-5 h-5" /> : null}
          </div>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                trend.direction === "up"
                  ? "text-[var(--kk-lime)] bg-[rgba(169,227,75,0.1)]"
                  : "text-[var(--kk-terracotta)] bg-[rgba(199,91,57,0.1)]"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}%
            </span>
          )}
        </div>
        <div className="mt-5 text-3xl font-bold" style={{ color: accent }}>
          {prefix}{n.toLocaleString("en-IN")}{suffix}
        </div>
        <div className="mt-1 text-sm text-[var(--kk-text-dim)]">{label}</div>
      </div>
    </motion.div>
  );
}