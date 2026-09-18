// app/market/page.tsx
// PURPOSE: The market prices page.
//          Now fetches LIVE data from /api/mandi (which proxies the govt API).
//          Includes a search input: type a state, district, or mandi name and
//          the grid filters instantly. Falls back to seed data if the govt API
//          is down.
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, MapPin, IndianRupee, Filter, Sparkles, Search, Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PriceCard } from "@/components/PriceCard";
import { DashboardStat } from "@/components/DashboardStat";
import { Crop, Price } from "@/lib/db";
import { cn } from "@/lib/utils";

type SortMode = "distance" | "price" | "trend";

const CROPS: Crop[] = ["Tomato", "Onion", "Potato", "Wheat", "Rice"];

export default function MarketPage() {
  const [all, setAll] = useState<Price[]>([]);
  const [source, setSource] = useState<"govt" | "seed" | null>(null);
  const [loading, setLoading] = useState(true);
  const [crop, setCrop] = useState<Crop>("Tomato");
  const [sort, setSort] = useState<SortMode>("distance");
  const [query, setQuery] = useState("");

  // Fetch from /api/mandi whenever the crop changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/mandi?crop=${encodeURIComponent(crop)}&limit=200`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setAll(data.prices ?? []);
        setSource(data.source ?? "seed");
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setAll([]);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [crop]);

  const filtered = useMemo(() => {
    // 1. Text search on market, city, district, state
    const q = query.trim().toLowerCase();
    let list = all;
    if (q) {
      list = list.filter((p) =>
        p.market.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
      );
    }

    // 2. Sort
    const sorted = [...list];
    if (sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sort === "price") sorted.sort((a, b) => b.price - a.price);
    else {
      const rank = { up: 0, flat: 1, down: 2 } as const;
      sorted.sort((a, b) => rank[a.trend] - rank[b.trend]);
    }
    return sorted;
  }, [all, sort, query]);

  const highest = useMemo(
    () => (filtered.length ? Math.max(...filtered.map((p) => p.price)) : 0),
    [filtered],
  );
  const lowest = useMemo(
    () => (filtered.length ? Math.min(...filtered.map((p) => p.price)) : 0),
    [filtered],
  );
  const highestRow = useMemo(
    () => [...filtered].sort((a, b) => b.price - a.price)[0],
    [filtered],
  );
  const avgPrice = useMemo(() => {
    if (!filtered.length) return 0;
    return Math.round(filtered.reduce((s, p) => s + p.price, 0) / filtered.length);
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <PageHeader
        badge="Market Prices · Live"
        badgeIcon={TrendingUp}
        title="Real-time mandi prices"
        subtitle="Live rates from mandis across India, straight from the government AGMARKNET feed."
        actions={
          <span
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border",
              source === "govt"
                ? "bg-[rgba(169,227,75,0.1)] text-[var(--kk-lime)] border-[rgba(169,227,75,0.3)]"
                : "bg-[rgba(244,163,0,0.1)] text-[var(--kk-amber)] border-[rgba(244,163,0,0.3)]"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {loading ? "Fetching live…" : source === "govt" ? "Govt feed · live" : "Cached"}
          </span>
        }
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStat emoji="🏬" value={filtered.length} label="Mandis listed" accent="#2E8B57" delay={0} />
        <DashboardStat emoji="💎" value={highest} label="Best ₹/kg" prefix="₹" accent="#A9E34B" delay={0.05} />
        <DashboardStat emoji="📊" value={avgPrice} label="Avg ₹/kg" prefix="₹" accent="#F4A300" delay={0.1} />
        <DashboardStat emoji="📉" value={lowest} label="Lowest ₹/kg" prefix="₹" accent="#C75B39" delay={0.15} />
      </div>

      {/* Search + filters */}
      <div className="mt-10 flex flex-col gap-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, district, state, or mandi — try 'Bengaluru' or 'Nashik'"
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--kk-surface-2)]
                       border border-[var(--kk-border)] text-[var(--kk-text)]
                       placeholder:text-[var(--kk-text-dim)]/60
                       focus:outline-none focus:border-[var(--kk-lime)]
                       focus:ring-1 focus:ring-[var(--kk-lime)]/40 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--kk-text-dim)] hover:text-[var(--kk-lime)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Crop chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--kk-text-dim)] flex items-center gap-1 mr-2">
            <Filter className="w-4 h-4" /> Crop:
          </span>
          {CROPS.map((c) => (
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

        {/* Sort tabs */}
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

      {/* Loading */}
      {loading && (
        <div className="mt-16 flex items-center justify-center text-[var(--kk-text-dim)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Fetching live mandi prices…
        </div>
      )}

      {/* Grid */}
      {!loading && (
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
      )}

      {!loading && filtered.length === 0 && (
        <div className="mt-16 text-center text-[var(--kk-text-dim)]">
          No mandis match your search. Try a different city or crop.
        </div>
      )}

      {/* Recommendation */}
      {!loading && highestRow && (
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
              <div className="font-semibold flex items-center gap-2">Recommendation</div>
              <p className="mt-1 text-sm text-[var(--kk-text-dim)]">
                The best-paying mandi for{" "}
                <b className="text-[var(--kk-lime)]">{crop}</b> is{" "}
                <b className="text-[var(--kk-lime)]">{highestRow.market}</b> in{" "}
                {highestRow.city}, {highestRow.state} at ₹{highestRow.price}/kg —{" "}
                about {highestRow.distanceKm} km from Nashik.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}