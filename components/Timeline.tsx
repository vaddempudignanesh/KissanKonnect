// components/Timeline.tsx
// PURPOSE: Vertical order status timeline.
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Truck, Package, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/lib/db";

interface Props {
  status: Order["status"];
}

const STAGES: { key: Order["status"]; label: string; desc: string; icon: any }[] = [
  { key: "confirmed",  label: "Order confirmed",  desc: "Buyer accepted, truck assigned",       icon: Package },
  { key: "picked_up",  label: "Picked up",        desc: "Cargo loaded at farm",                 icon: Truck },
  { key: "in_transit", label: "In transit",       desc: "Truck on the way to destination",      icon: Truck },
  { key: "delivered",  label: "Delivered",        desc: "Received at buyer's warehouse",        icon: CheckCircle2 },
  { key: "paid",       label: "Payment released", desc: "Escrow released to farmer's account",  icon: DollarSign },
];

export function Timeline({ status }: Props) {
  const current = STAGES.findIndex(s => s.key === status);

  return (
    <div className="kk-card p-6">
      <h3 className="font-semibold mb-5">Order progress</h3>
      <div className="relative">
        {STAGES.map((s, i) => {
          const done = i <= current;
          const active = i === current;
          const Icon = s.icon;
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-start gap-4 relative pb-6 last:pb-0"
            >
              {/* Vertical line */}
              {i < STAGES.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[15px] top-[30px] w-0.5 h-full",
                    i < current ? "bg-[var(--kk-lime)]" : "bg-[var(--kk-border)]"
                  )}
                />
              )}

              {/* Dot */}
              <div
                className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                  done
                    ? "bg-[var(--kk-lime)] border-[var(--kk-lime)] text-[#0A0F0D]"
                    : "bg-[var(--kk-surface)] border-[var(--kk-border)] text-[var(--kk-text-dim)]"
                )}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
                {active && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-[var(--kk-lime)]"
                    animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </div>

              <div className="flex-1 pt-0.5">
                <div className={cn("font-medium", done && "text-[var(--kk-lime)]")}>
                  {s.label}
                </div>
                <div className="text-sm text-[var(--kk-text-dim)]">{s.desc}</div>
              </div>

              <Icon className={cn("w-5 h-5", done ? "text-[var(--kk-lime)]" : "text-[var(--kk-text-dim)]")} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}