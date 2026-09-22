// components/PriceCard.tsx
// PURPOSE: One mandi price row. Shows market, city, distance, price, trend.
//          Hover lifts and glows. Framer Motion handles layout animation so
//          the sort reshuffles smoothly.
"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, MapPin } from "lucide-react";
import { Price } from "@/lib/db";
import { cn } from "@/lib/utils";

interface Props {
  price: Price;
  best?: boolean;
}

export function PriceCard({ price, best }: Props) {
  const trendIcon =
    price.trend === "up"   ? <TrendingUp className="w-4 h-4 text-[var(--kk-lime)]" /> :
    price.trend === "down" ? <TrendingDown className="w-4 h-4 text-[var(--kk-terracotta)]" /> :
                             <Minus className="w-4 h-4 text-[var(--kk-text-dim)]" />;

  const trendColor =
    price.trend === "up"   ? "text-[var(--kk-lime)]" :
    price.trend === "down" ? "text-[var(--kk-terracotta)]" :
                             "text-[var(--kk-text-dim)]";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        "kk-card p-5 flex items-center justify-between gap-4",
        best && "border-[var(--kk-lime)] shadow-[0_0_40px_rgba(169,227,75,0.25)]"
      )}
    >
   
                  <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--kk-lime)]/15 text-[var(--kk-lime)] font-semibold uppercase tracking-wide">
            {price.crop}
          </span>
          <h3 className="font-semibold truncate">{price.market}</h3>
          {best && <span className="kk-badge">Best</span>}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-[var(--kk-text-dim)]">
          <span>{price.city}, {price.state}</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {price.distanceKm} km
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-2xl font-bold text-[var(--kk-lime)]">
          ₹{price.price}
          <span className="text-sm text-[var(--kk-text-dim)] font-normal"> /kg</span>
        </div>
        <div className={cn("mt-1 flex items-center justify-end gap-1 text-xs", trendColor)}>
          {trendIcon}
          <span>
            {price.trend === "up" ? "Rising" : price.trend === "down" ? "Falling" : "Stable"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}