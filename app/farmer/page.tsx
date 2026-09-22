// app/market/page.tsx
// PURPOSE: Market prices page — dynamic fetching by State + District.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, MapPin, IndianRupee, Filter, Sparkles, Search, Loader2,
  RefreshCw, WifiOff, ChevronDown, Check, X,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PriceCard } from "@/components/PriceCard";
import { DashboardStat } from "@/components/DashboardStat";
import { Crop, Price } from "@/lib/db";
import { INDIA_STATES_DATA } from "@/lib/geoData";
import { fuzzyFilterPrices } from "@/lib/mandiApi";
import { cn } from "@/lib/utils";

type SortMode = "distance" | "price" | "trend";
const CROPS: (Crop | "All")[] = ["All", "Tomato", "Onion", "Potato", "Wheat", "Rice"];

interface ApiResponse {
  ok: boolean;
  source: "govt" | "seed";
  count?: number;
  prices: Price[];
  note?: string;
}

export default function MarketPage() {
  const [all, setAll] = useState<Price[]>([]);
  const [source, setSource] = useState<"govt" | "seed" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackNote, setFallbackNote] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  const [crop, setCrop] = useState<Crop>("Tomato");
  const [sort, setSort] = useState<SortMode>("distance");

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [stateQuery, setStateQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const stateSuggestions = useMemo(() => {
    const q = stateQuery.trim().toLowerCase();
    if (!q) return INDIA_STATES_DATA;
    return INDIA_STATES_DATA.filter((s) => s.state.toLowerCase().includes(q));
  }, [stateQuery]);

  const districtsForState = useMemo(() => {
    if (!selectedState) return [];
    return INDIA_STATES_DATA.find((s) => s.state === selectedState)?.districts ?? [];
  }, [selectedState]);

  // -------------------------------------------------------------------------
  // Fetch
  // -------------------------------------------------------------------------
  const fetchPrices = useCallback(async (
    targetCrop: Crop,
    targetState: string | null,
    targetDistrict: string,
  ) => {
    setLoading(true);
    setError(null);
    setFallbackNote(null);

    try {
      const params = new URLSearchParams();
      params.set("crop", targetCrop);
      params.set("limit", "500");
      if (targetState) params.set("state", targetState);
      if (targetDistrict && targetDistrict !== "All") {
        params.set("district", targetDistrict);
      }

      const url = `/api/mandi?${params.toString()}`;
      console.log("[market] fetching", url);

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as ApiResponse;
      console.log("[market] received", data.count ?? data.prices.length, "records from", data.source);

      setAll(data.prices ?? []);
      setSource(data.source);
      setLastFetchedAt(Date.now());
      setFallbackNote(data.note ?? null);

      if (!data.prices || data.prices.length === 0) {
        setError(
          `No records found for ${targetCrop}${
            targetState ? ` in ${targetState}` : ""
          }${targetDistrict !== "All" ? ` / ${targetDistrict}` : ""}.`,
        );
      }
    } catch (err) {
      console.error("[market] fetch error:", err);
      setError("Could not fetch prices. Check your internet connection.");
      setAll([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices(crop, selectedState, selectedDistrict);
  }, [crop, selectedState, selectedDistrict, fetchPrices]);

  useEffect(() => {
    setSelectedDistrict("All");
  }, [selectedState]);

  // Client-side filter + sort
  const visible = useMemo(() => {
    let list = query.trim() ? fuzzyFilterPrices(all, query) : all;
    const sorted = [...list];
    if (sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sort === "price") sorted.sort((a, b) => b.price - a.price);
       else {
      const rank: Record<"up" | "down" | "flat", number> = { up: 0, flat: 1, down: 2 };
      sorted.sort((a, b) =>
        rank[a.trend as "up" | "down" | "flat"] -
        rank[b.trend as "up" | "down" | "flat"]
      );
    }
    return sorted;
  }, [all, sort, query]);

  const highest = useMemo(() => (visible.length ? Math.max(...visible.map((p) => p.price)) : 0), [visible]);
  const lowest = useMemo(() => (visible.length ? Math.min(...visible.map((p) => p.price)) : 0), [visible]);
  const avgPrice = useMemo(() => {
    if (!visible.length) return 0;
    return Math.round(visible.reduce((s, p) => s + p.price, 0) / visible.length);
  }, [visible]);

  const cacheAgeLabel = useMemo(() => {
    if (!lastFetchedAt) return "";
    const mins = Math.round((Date.now() - lastFetchedAt) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  }, [lastFetchedAt]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <PageHeader
        badge="Market Prices · Live"
        badgeIcon={TrendingUp}
        title="Real-time Mandi Prices"
        subtitle="Select a state and district to query precise agricultural market rates."
        actions={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border",
                loading
                  ? "bg-[rgba(244,163,0,0.1)] text-[var(--kk-amber)] border-[rgba(244,163,0,0.3)]"
                  : source === "govt"
                    ? "bg-[rgba(169,227,75,0.1)] text-[var(--kk-lime)] border-[rgba(169,227,75,0.3)]"
                    : "bg-[rgba(244,163,0,0.1)] text-[var(--kk-amber)] border-[rgba(244,163,0,0.3)]",
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {loading
                ? "Fetching…"
                : source === "govt"
                  ? `Live · ${visible.length} rows`
                  : `Cached · ${cacheAgeLabel}`}
            </span>
            <button
              onClick={() => fetchPrices(crop, selectedState, selectedDistrict)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                         border border-[var(--kk-border)] text-[var(--kk-text-dim)]
                         hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]
                         disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        }
      />

      {/* Fallback banner */}
      {fallbackNote && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 px-4 py-3 rounded-2xl border border-[var(--kk-amber)]
                     bg-[rgba(244,163,0,0.08)] text-sm text-[var(--kk-amber)]
                     flex items-start gap-2"
        >
          <span className="text-lg leading-none">💡</span>
          <span>{fallbackNote}</span>
        </motion.div>
      )}

      {/* State Picker */}
      <div className="mt-8 relative" ref={dropdownRef}>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--kk-text-dim)] mb-2">
          State (Type e.g., "Andhra", "Maharashtra", "delhi")
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)]" />
          <input
            type="text"
            value={stateQuery}
            onChange={(e) => { setStateQuery(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Type state name..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[var(--kk-surface-2)]
                       border border-[var(--kk-border)] text-[var(--kk-text)]
                       placeholder:text-[var(--kk-text-dim)]/60
                       focus:outline-none focus:border-[var(--kk-lime)] transition-all"
          />
          {selectedState ? (
            <button
              onClick={() => { setSelectedState(null); setStateQuery(""); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)] hover:text-[var(--kk-terracotta)]"
              title="Clear state"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)] pointer-events-none" />
          )}
        </div>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-2xl bg-[var(--kk-surface)] border border-[var(--kk-border)] shadow-2xl"
            >
              {stateSuggestions.length > 0 ? (
                stateSuggestions.map((item) => (
                  <button
                    key={item.state}
                    onClick={() => {
                      setSelectedState(item.state);
                      setStateQuery(item.state);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-[var(--kk-text)]
                               hover:bg-[var(--kk-surface-2)] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span>{item.state}</span>
                    {selectedState === item.state && <Check className="w-4 h-4 text-[var(--kk-lime)]" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[var(--kk-text-dim)]">
                  No states match "{stateQuery}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* District chips */}
      {selectedState && districtsForState.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--kk-text-dim)] mb-3">
            Select District in {selectedState}
          </label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-2xl bg-[var(--kk-surface)] border border-[var(--kk-border)]">
            <button
              onClick={() => setSelectedDistrict("All")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                selectedDistrict === "All"
                  ? "bg-[var(--kk-lime)] text-[#0A0F0D] border-[var(--kk-lime)] shadow-lg"
                  : "bg-[var(--kk-surface-2)] text-[var(--kk-text-dim)] border-[var(--kk-border)] hover:border-[var(--kk-lime)]"
              )}
            >
              All Districts
            </button>
            {districtsForState.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                  selectedDistrict === d
                    ? "bg-[var(--kk-lime)] text-[#0A0F0D] border-[var(--kk-lime)] shadow-lg"
                    : "bg-[var(--kk-surface-2)] text-[var(--kk-text-dim)] border-[var(--kk-border)] hover:border-[var(--kk-lime)]"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Crop chips */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--kk-text-dim)] flex items-center gap-1 mr-2">
          <Filter className="w-4 h-4" /> Crop:
        </span>
        {CROPS.map((c) => (
          <button
            key={c}
            onClick={() => setCrop(c === "All" ? "Tomato" : c)}
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

      {/* Client-side search */}
      <div className="mt-6 relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter loaded results — try 'Nashik', 'Nasik', 'Bengaluru'…"
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--kk-surface-2)]
                     border border-[var(--kk-border)] text-[var(--kk-text)]
                     placeholder:text-[var(--kk-text-dim)]/60
                     focus:outline-none focus:border-[var(--kk-lime)] transition-all"
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

      {/* Sort tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <DashboardStat emoji="🏬" value={visible.length} label="Mandis found" accent="#2E8B57" delay={0} />
        <DashboardStat emoji="💎" value={highest} label="Best ₹/kg" prefix="₹" accent="#A9E34B" delay={0.05} />
        <DashboardStat emoji="📊" value={avgPrice} label="Avg ₹/kg" prefix="₹" accent="#F4A300" delay={0.1} />
        <DashboardStat emoji="📉" value={lowest} label="Lowest ₹/kg" prefix="₹" accent="#C75B39" delay={0.15} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-16 flex items-center justify-center text-[var(--kk-text-dim)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Fetching live records for {crop}
          {selectedState ? ` in ${selectedState}` : ""}
          {selectedDistrict !== "All" ? ` / ${selectedDistrict}` : ""}…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-16 kk-card p-8 text-center border-[var(--kk-terracotta)]">
          <WifiOff className="w-8 h-8 text-[var(--kk-terracotta)] mx-auto mb-3" />
          <div className="text-sm text-[var(--kk-text-dim)]">{error}</div>
          <button
            onClick={() => fetchPrices(crop, selectedState, selectedDistrict)}
            className="mt-4 px-4 py-2 rounded-xl border border-[var(--kk-border)] text-sm hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)] transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <motion.div layout className="grid md:grid-cols-2 gap-4 mt-8">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <PriceCard key={p.id} price={p} best={sort === "price" && i === 0} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}