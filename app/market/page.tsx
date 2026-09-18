// app/market/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, MapPin, IndianRupee, Filter, Sparkles, Search, Loader2,
  RefreshCw, WifiOff, ChevronDown, Check
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PriceCard } from "@/components/PriceCard";
import { DashboardStat } from "@/components/DashboardStat";
import { Crop, Price } from "@/lib/db";
import { INDIA_STATES_DATA, StateData } from "@/lib/geoData";
import { cn } from "@/lib/utils";

type SortMode = "distance" | "price" | "trend";
const CROPS: (Crop | "All")[] = ["All", "Tomato", "Onion", "Potato", "Wheat", "Rice"];

const CACHE_KEY = "kk-mandi-cache-v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CachedPayload {
  fetchedAt: number;
  source: "govt" | "seed";
  prices: Price[];
}

export default function MarketPage() {
  const [all, setAll] = useState<Price[]>([]);
  const [source, setSource] = useState<"govt" | "seed" | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [crop, setCrop] = useState<Crop | "All">("Tomato");
  const [sort, setSort] = useState<SortMode>("distance");
  
  // State and District filtering parameters
  const [stateQuery, setStateQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter state suggestions case-insensitively
  const filteredStates = useMemo(() => {
    if (!stateQuery.trim()) return INDIA_STATES_DATA;
    const q = stateQuery.toLowerCase();
    return INDIA_STATES_DATA.filter(item => item.state.toLowerCase().includes(q));
  }, [stateQuery]);

  // Get current state districts object
  const currentStateObj = useMemo(() => {
    return INDIA_STATES_DATA.find(item => item.state === selectedState);
  }, [selectedState]);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data with query params every time state or district changes
  const fetchPrices = useCallback(async (force = false, targetState?: string | null, targetDistrict?: string) => {
    setLoading(true);
    setOffline(false);

    try {
      // Build dynamic API query params
      const params = new URLSearchParams();
      params.append("crop", crop);
      params.append("limit", "500");
      if (targetState) params.append("state", targetState);
      if (targetDistrict && targetDistrict !== "All") params.append("district", targetDistrict);

      const res = await fetch(`/api/mandi?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      const prices: Price[] = data.prices ?? [];

      setAll(prices);
      setSource(data.source === "govt" ? "govt" : "seed");
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [crop]);

  // Trigger API query every time selectedState or selectedDistrict changes
  useEffect(() => {
    fetchPrices(false, selectedState, selectedDistrict);
  }, [selectedState, selectedDistrict, crop, fetchPrices]);

  const filtered = useMemo(() => {
    let list = [...all];
    const sorted = [...list];
    if (sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sort === "price") sorted.sort((a, b) => b.price - a.price);
    else {
      const rank = { up: 0, flat: 1, down: 2 } as const;
      sorted.sort((a, b) => rank[a.trend] - rank[b.trend]);
    }
    return sorted;
  }, [all, sort]);

  const highest = useMemo(() => (filtered.length ? Math.max(...filtered.map((p) => p.price)) : 0), [filtered]);
  const lowest = useMemo(() => (filtered.length ? Math.min(...filtered.map((p) => p.price)) : 0), [filtered]);
  const avgPrice = useMemo(() => {
    if (!filtered.length) return 0;
    return Math.round(filtered.reduce((s, p) => s + p.price, 0) / filtered.length);
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <PageHeader
        badge="Market Prices · Live"
        badgeIcon={TrendingUp}
        title="Real-time Mandi Prices"
        subtitle="Filter by state, explore districts dynamically, and view live market pricing."
        actions={
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border",
              offline ? "bg-[rgba(199,91,57,0.1)] text-[var(--kk-terracotta)] border-[rgba(199,91,57,0.3)]"
                : "bg-[rgba(169,227,75,0.1)] text-[var(--kk-lime)] border-[rgba(169,227,75,0.3)]"
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {loading ? "Querying API..." : "Live AGMARKNET Sync"}
            </span>
          </div>
        }
      />

      {/* State Search Input with Case-Insensitive Suggestions Dropdown */}
      <div className="mt-8 relative" ref={dropdownRef}>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--kk-text-dim)] mb-2">
          Select State (Type e.g., "Andhra", "maharashtra")
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)]" />
          <input
            type="text"
            value={stateQuery}
            onChange={(e) => {
              setStateQuery(e.target.value);
              setIsStateDropdownOpen(true);
            }}
            onFocus={() => setIsStateDropdownOpen(true)}
            placeholder="Type state name..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[var(--kk-surface-2)]
                       border border-[var(--kk-border)] text-[var(--kk-text)]
                       placeholder:text-[var(--kk-text-dim)]/60
                       focus:outline-none focus:border-[var(--kk-lime)] transition-all"
          />
          <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)] pointer-events-none" />
        </div>

        {/* Suggestion Dropdown List */}
        {isStateDropdownOpen && (
          <div className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl bg-[var(--kk-surface)] border border-[var(--kk-border)] shadow-2xl">
            {filteredStates.length > 0 ? (
              filteredStates.map((item) => (
                <div
                  key={item.state}
                  onClick={() => {
                    setSelectedState(item.state);
                    setStateQuery(item.state);
                    setSelectedDistrict("All"); // Reset district on state change
                    setIsStateDropdownOpen(false);
                  }}
                  className="px-4 py-3 text-sm text-[var(--kk-text)] hover:bg-[var(--kk-surface-2)] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span>{item.state}</span>
                  {selectedState === item.state && <Check className="w-4 h-4 text-[var(--kk-lime)]" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[var(--kk-text-dim)]">No states found</div>
            )}
          </div>
        )}
      </div>

      {/* District Cards Selector Grid (Appears after selecting a state) */}
      {selectedState && currentStateObj && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--kk-text-dim)] mb-3">
            Select District in {selectedState} (Query updates instantly)
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-[var(--kk-surface)] border border-[var(--kk-border)]">
            {/* "All" Card Option */}
            <button
              onClick={() => setSelectedDistrict("All")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                selectedDistrict === "All"
                  ? "bg-[var(--kk-lime)] text-[#0A0F0D] border-[var(--kk-lime)] shadow-lg"
                  : "bg-[var(--kk-surface-2)] text-[var(--kk-text-dim)] border-[var(--kk-border)] hover:border-[var(--kk-lime)]"
              )}
            >
              All Districts
            </button>
            {currentStateObj.districts.map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                  selectedDistrict === dist
                    ? "bg-[var(--kk-lime)] text-[#0A0F0D] border-[var(--kk-lime)] shadow-lg"
                    : "bg-[var(--kk-surface-2)] text-[var(--kk-text-dim)] border-[var(--kk-border)] hover:border-[var(--kk-lime)]"
                )}
              >
                {dist}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Crop Filter Bar */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
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

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <DashboardStat emoji="🏬" value={filtered.length} label="Mandis Found" accent="#2E8B57" delay={0} />
        <DashboardStat emoji="💎" value={highest} label="Best ₹/kg" prefix="₹" accent="#A9E34B" delay={0.05} />
        <DashboardStat emoji="📊" value={avgPrice} label="Avg ₹/kg" prefix="₹" accent="#F4A300" delay={0.1} />
        <DashboardStat emoji="📉" value={lowest} label="Lowest ₹/kg" prefix="₹" accent="#C75B39" delay={0.15} />
      </div>

      {loading && (
        <div className="mt-16 flex items-center justify-center text-[var(--kk-text-dim)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Querying API endpoint with params (State: {selectedState || "All"}, District: {selectedDistrict})...
        </div>
      )}

      {!loading && (
        <motion.div layout className="grid md:grid-cols-2 gap-4 mt-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <PriceCard key={p.id} price={p} best={sort === "price" && i === 0} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="mt-16 text-center text-[var(--kk-text-dim)]">
          No records found for State: <b>{selectedState || "None selected"}</b> and District: <b>{selectedDistrict}</b>.
        </div>
      )}
    </div>
  );
}