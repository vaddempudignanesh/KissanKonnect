// components/BuyerCard.tsx
"use client";

import { motion } from "framer-motion";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
import { Buyer } from "@/lib/db";
import { AnimatedButton } from "./AnimatedButton";
import { formatINR, cn } from "@/lib/utils";

interface Props {
  buyer: Buyer;
  pricePerKg: number;
  quantityKg: number;
  message?: string;
  best?: boolean;
  onAccept?: () => void;
  accepted?: boolean;
}

export function BuyerCard({
  buyer, pricePerKg, quantityKg, message, best, onAccept, accepted,
}: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "kk-card p-6 flex flex-col",
        best && "border-[#111111] shadow-[0_0_40px_rgba(0,0,0,0.15)]"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: buyer.logoColor + "22", border: `1px solid ${buyer.logoColor}55` }}
        >
          {buyer.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate text-[var(--kk-text)]">
              {buyer.name}
            </h3>
            {best && <span className="kk-badge">Best Price</span>}
          </div>
          <div className="mt-1 text-xs text-[var(--kk-text-dim)] flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#111111] text-[#111111]" />
              {buyer.rating}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {buyer.city} · {buyer.distanceKm} km
            </span>
            <span className="kk-badge">{buyer.type}</span>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-4 text-sm text-[var(--kk-text-dim)] italic">
          "{message}"
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--kk-surface-2)] p-3">
          <div className="text-xs text-[var(--kk-text-dim)]">Their offer</div>
          <div className="mt-1 font-semibold text-[var(--kk-text)]">
            ₹{pricePerKg}/kg
          </div>
        </div>
        <div className="rounded-xl bg-[var(--kk-surface-2)] p-3">
          <div className="text-xs text-[var(--kk-text-dim)]">Total deal</div>
          <div className="mt-1 font-semibold text-[var(--kk-text)]">
            {formatINR(pricePerKg * quantityKg)}
          </div>
        </div>
      </div>

      <div className="mt-5">
        {accepted ? (
          <div className="flex items-center gap-2 text-[#111111] text-sm font-medium">
            <CheckCircle2 className="w-5 h-5" /> Accepted
          </div>
        ) : (
          <AnimatedButton
            variant={best ? "primary" : "secondary"}
            size="md"
            onClick={onAccept}
            className="w-full"
          >
            Accept Offer
          </AnimatedButton>
        )}
      </div>
    </motion.div>
  );
}