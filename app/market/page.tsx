// app/market/page.tsx
// PURPOSE: The market prices page — the heart of KisanKonnect for farmers.
//   Shows mandi prices across India with three sort modes:
//     • Nearest first (distance ascending)
//     • Highest ₹/kg (price descending)
//     • Rising (trend = up first)
//   Crop chips at the top filter by crop.
//   Stat strip animates on mount.
//   Recommendation banner picks the highest-paying market for the current crop.
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, MapPin, IndianRupee, Filter, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PriceCard } from "@/components/PriceCard";
import { DashboardStat } from "@/components/DashboardStat";
import { getPrices, Crop, Price } from "@/lib/db";
import { cn } from "@/lib/utils";

type SortMode = "distance" | "price" | "trend";

const CROPS: (Crop | "All")[] = ["All", "Tomato", "Onion", "Potato", "Wheat", "Rice"];

export default function MarketPage() {
  const [all, setAll] = useState<Price[]>([]);
  const [crop, setCrop] = useState<Crop | "All">("Tomato");
  const [sort, setSort] = useState<SortMode>("distance");

  useEffect(() => {
    getPrices().then(setAll);
  }, []);

  const filtered = useMemo(() => {
    const list = crop === "All" ? all : all.filter(p => p.crop === crop);
    const sorted = [...list];
    if (sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sort === "price") sorted.sort((a, b) => b.price - a.price);
    else {
      const rank = { up: 0, flat: 1, down: 2 } as const;
      sorted.sort((a, b) => rank[a.trend] - rank[b.trend]);
    }
    return sorted;
  }, [all, crop, sort]);

  const highest = useMemo(
    () => (filtered.length ? Math.max(...filtered.map(p => p.price)) : 0),
    [filtered]
  );
  const highestRow = useMemo(
    () => [...filtered].sort((a, b) => b.price - a.price)[0],
    [filtered]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <PageHeader
        badge="Market Prices"
        badgeIcon={TrendingUp}
        title="Real-time mandi prices"
        subtitle="Live rates from mandis across India. Sorted by distance so you can see the nearest buyer paying the most."
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStat emoji="🏬" value={filtered.length} label="Markets listed" accent="#2E8B57" delay={0} />
        <DashboardStat emoji="💎" value={highest} label="Best ₹/kg" prefix="₹" accent="#A9E34B" delay={0.05} />
        <DashboardStat emoji="📍" value={1250} label="Avg. distance (km)" suffix=" km" accent="#F4A300" delay={0.1} />
        <DashboardStat emoji="📈" value={22} label="National avg ₹/kg" prefix="₹" accent="#C75B39" delay={0.15} />
      </div>

      {/* Filters */}
      <div className="mt-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--kk-text-dim)] flex items-center gap-1 mr-2">
            <Filter className="w-4 h-4" /> Crop:
          </span>
          {CROPS.map(c => (
            <button
              key={c}
              onClick={() => setCrop(c)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border",
                crop === c
                  ? "bg-[var(--kk-lime)] text-[#0A0F0D] border-[var(--kk-lime)] shadow-[0_0_20px_rgba(169,227,75,0.4)]"
                  : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--kk-text-dim)] mr-2">Sort by:</span>
          {([
            { id: "distance", label: "Nearest first", icon: MapPin },
            { id: "price",    label: "Highest ₹",     icon: IndianRupee },
            { id: "trend",    label: "Rising",        icon: TrendingUp },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSort(id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 border",
                sort === id
                  ? "bg-[var(--kk-green)] text-white border-[var(--kk-green)]"
                  : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-green-light)]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div layout className="grid md:grid-cols-2 gap-4 mt-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <PriceCard
              key={p.id}
              price={p}
              best={sort === "price" && i === 0}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center text-[var(--kk-text-dim)]">
          No prices for this crop yet.
        </div>
      )}

      {/* Recommendation */}
      {highestRow && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 kk-card p-6 border-[var(--kk-lime)] shadow-[0_0_60px_rgba(169,227,75,0.2)]"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[var(--kk-lime)] text-[#0A0F0D]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2">
                Recommendation
              </div>
              <p className="mt-1 text-sm text-[var(--kk-text-dim)]">
                The best-paying market for{" "}
                <b className="text-[var(--kk-lime)]">{crop}</b> is{" "}
                <b className="text-[var(--kk-lime)]">{highestRow.market}</b>{" "}
                at ₹{highestRow.price}/kg — {highestRow.distanceKm} km away.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}