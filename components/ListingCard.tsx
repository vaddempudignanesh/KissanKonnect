// components/ListingCard.tsx
// PURPOSE: Shows one farmer listing (crop, qty, quality, price).
//          Has a context-specific action button (View Offers / Accept).
"use client";

import { motion } from "framer-motion";
import { MapPin, Scale, Award } from "lucide-react";
import { Listing } from "@/lib/db";
import { AnimatedButton } from "./AnimatedButton";
import { formatINR } from "@/lib/utils";

interface Props {
  listing: Listing;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function ListingCard({ listing, actionLabel = "View Offers", onAction, actionHref }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35 }}
      className="kk-card p-6 flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div className="text-5xl">{listing.photo}</div>
        <span className="kk-badge">
          <Award className="w-3 h-3" /> Grade {listing.quality}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-semibold">
        {listing.crop}
      </h3>

      <div className="mt-1 text-sm text-[var(--kk-text-dim)] flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5" />
        {listing.village}, {listing.state}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-[var(--kk-surface-2)] p-3">
          <div className="text-[var(--kk-text-dim)] text-xs flex items-center gap-1">
            <Scale className="w-3 h-3" /> Quantity
          </div>
          <div className="mt-1 font-semibold">{listing.quantityKg} kg</div>
        </div>
        <div className="rounded-xl bg-[var(--kk-surface-2)] p-3">
          <div className="text-[var(--kk-text-dim)] text-xs">Expected</div>
          <div className="mt-1 font-semibold text-[var(--kk-lime)]">
            ₹{listing.expectedPrice}/kg
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--kk-border)] flex items-center justify-between">
        <div>
          <div className="text-xs text-[var(--kk-text-dim)]">Total value</div>
          <div className="font-semibold">
            {formatINR(listing.quantityKg * listing.expectedPrice)}
          </div>
        </div>
        <AnimatedButton size="sm" onClick={onAction} href={actionHref}>
          {actionLabel}
        </AnimatedButton>
      </div>
    </motion.div>
  );
}