"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, MapPin, IndianRupee, Loader2, RefreshCw, WifiOff,
  Search, X, Filter, ChevronDown, Check,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PriceCard } from "@/components/PriceCard";
import { DashboardStat } from "@/components/DashboardStat";
import { cn } from "@/lib/utils";

type SortMode = "distance" | "price" | "trend";

interface Price {
  id: string;
  crop: string;
  market: string;
  city: string;
  state: string;
  price: number;
  distanceKm: number;
  trend: "up" | "down" | "flat";
  updatedAt: string;
}

interface ApiResponse {
  ok: boolean;
  source: "db";
  count?: number;
  prices: Price[];
}

export default function MarketPage() {
  const [all, setAll] = useState<Price[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  // Filter metadata
  const [crops, setCrops] = useState<string[]>([]);
  const [cropCounts, setCropCounts] = useState<Record<string, number>>({});
  const [states, setStates] = useState<string[]>([]);
  const [districtsByState, setDistrictsByState] = useState<Record<string, string[]>>({});

  // Active filters
  const [crop, setCrop] = useState<string>("All");
  const [state, setState] = useState<string>("All");
  const [district, setDistrict] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("price");

  // ---- Fetch filter metadata once ----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mandi/crops");
        const json = await res.json();
        setCrops(json.crops ?? []);
        setCropCounts(json.cropCounts ?? {});
        setStates(json.states ?? []);
        setDistrictsByState(json.districtsByState ?? {});
      } catch (e) {
        console.error("[market] metadata fetch failed", e);
      }
    })();
  }, []);

  // ---- Fetch prices whenever any filter changes ----
  const fetchPrices = useCallback(
    async (targetCrop: string, targetState: string, targetDistrict: string, q: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (targetCrop && targetCrop !== "All") params.set("crop", targetCrop);
        if (targetState && targetState !== "All") params.set("state", targetState);
        if (targetDistrict && targetDistrict !== "All") params.set("district", targetDistrict);
        if (q.trim()) params.set("q", q.trim());
        params.set("limit", "1000");

        const res = await fetch(`/api/mandi?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        setAll(data.prices ?? []);
        setLastFetchedAt(Date.now());
      } catch (e: any) {
        console.error("[market] fetch failed", e);
        setError("Could not load prices.");
        setAll([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounce: fetch on any filter change
  useEffect(() => {
    const t = setTimeout(() => {
      fetchPrices(crop, state, district, query);
    }, 300);
    return () => clearTimeout(t);
  }, [crop, state, district, query, fetchPrices]);

  // Reset district when state changes
  useEffect(() => {
    setDistrict("All");
  }, [state]);

  // ---- Sort (client-side) ----
  const visible = useMemo(() => {
    const sorted = [...all];
    if (sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sort === "price") sorted.sort((a, b) => b.price - a.price);
    else {
      const rank = { up: 0, flat: 1, down: 2 } as const;
      sorted.sort((a, b) => rank[a.trend] - rank[b.trend]);
    }
    return sorted;
  }, [all, sort]);

  const highest = useMemo(
    () => (visible.length ? Math.max(...visible.map((p) => p.price)) : 0),
    [visible],
  );
  const lowest = useMemo(
    () => (visible.length ? Math.min(...visible.map((p) => p.price)) : 0),
    [visible],
  );
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

  // Districts available for the current state
  const availableDistricts = useMemo(() => {
    if (!state || state === "All") return [];
    return districtsByState[state] ?? [];
  }, [state, districtsByState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <PageHeader
        badge="Market Prices · Live"
        badgeIcon={TrendingUp}
        title="Real-time Mandi Prices"
        subtitle="Search by crop, state, district, or market. Data straight from the government mandi feed."
        actions={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border",
                loading
                  ? "bg-[rgba(96,165,250,0.1)] text-[var(--kk-amber)] border-[rgba(96,165,250,0.3)]"
                  : "bg-[rgba(59,130,246,0.1)] text-[var(--kk-lime)] border-[rgba(59,130,246,0.3)]",
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {loading ? "Loading…" : `${visible.length} rows · ${cacheAgeLabel}`}
            </span>
            <button
              onClick={() => fetchPrices(crop, state, district, query)}
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

      {/* ---- SEARCH BAR ---- */}
      <div className="mt-8 relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything — 'Tomato', 'Nashik', 'Azadpur', 'Punjab'…"
          className="w-full pl-11 pr-10 py-4 rounded-2xl bg-[var(--kk-surface-2)]
                     border border-[var(--kk-border)] text-[var(--kk-text)] text-base
                     placeholder:text-[var(--kk-text-dim)]/60
                     focus:outline-none focus:border-[var(--kk-lime)] focus:ring-2 focus:ring-[var(--kk-lime)]/20
                     transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)] hover:text-[var(--kk-terracotta)]"
            title="Clear"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ---- STATE + DISTRICT FILTERS ---- */}
      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {/* STATE */}
        <label className="block">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--kk-text-dim)] mb-2">
            State
          </div>
          <div className="relative">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-10 rounded-2xl bg-[var(--kk-surface-2)]
                         border border-[var(--kk-border)] text-[var(--kk-text)]
                         focus:outline-none focus:border-[var(--kk-lime)] cursor-pointer
                         transition-all"
            >
              <option value="All">All states ({states.length})</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)] pointer-events-none" />
            {state !== "All" && (
              <button
                onClick={(e) => { e.preventDefault(); setState("All"); }}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)] hover:text-[var(--kk-terracotta)]"
                title="Clear state"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </label>

        {/* DISTRICT */}
        <label className="block">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--kk-text-dim)] mb-2">
            District {state !== "All" && <span className="text-[var(--kk-lime)]">· {state}</span>}
          </div>
          <div className="relative">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={state === "All"}
              className={cn(
                "w-full appearance-none px-4 py-3 pr-10 rounded-2xl bg-[var(--kk-surface-2)]",
                "border border-[var(--kk-border)] text-[var(--kk-text)]",
                "focus:outline-none focus:border-[var(--kk-lime)] transition-all",
                state === "All" ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <option value="All">
                {state === "All" ? "Select a state first" : `All districts (${availableDistricts.length})`}
              </option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--kk-text-dim)] pointer-events-none" />
          </div>
        </label>
      </div>

      {/* ---- COMMODITY CHIPS ---- */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--kk-text-dim)] flex items-center gap-1 mr-2">
          <Filter className="w-4 h-4" /> Commodity:
        </span>

        <button
          onClick={() => setCrop("All")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border",
            crop === "All"
              ? "bg-[var(--kk-lime)] text-white border-[var(--kk-lime)] shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]",
          )}
        >
          All
        </button>

        {crops.slice(0, 20).map((c) => {
          const count = cropCounts[c] ?? 0;
          const active = crop === c;
          return (
            <button
              key={c}
              onClick={() => setCrop(c)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5",
                active
                  ? "bg-[var(--kk-lime)] text-white border-[var(--kk-lime)] shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                  : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]",
              )}
              title={`${count} records`}
            >
              {c}
              <span className={cn(
                "text-[10px] px-1.5 rounded-full",
                active ? "bg-white/20" : "bg-[var(--kk-surface-2)]",
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- SORT + CLEAR ---- */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--kk-text-dim)] mr-2">Sort by:</span>
        {([
          { id: "price",    label: "Highest ₹",     icon: IndianRupee },
          { id: "distance", label: "Nearest first", icon: MapPin },
          { id: "trend",    label: "Rising",        icon: TrendingUp },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSort(id)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 border",
              sort === id
                ? "bg-[var(--kk-green)] text-white border-[var(--kk-green)]"
                : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-green-light)]",
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}

        {(crop !== "All" || state !== "All" || district !== "All" || query) && (
          <button
            onClick={() => {
              setCrop("All");
              setState("All");
              setDistrict("All");
              setQuery("");
            }}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium
                       border border-[var(--kk-terracotta)] text-[var(--kk-terracotta)]
                       hover:bg-[var(--kk-terracotta)]/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>

      {/* ---- STATS ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <DashboardStat emoji="🏬" value={visible.length} label="Mandis found" accent="#3B82F6" delay={0} />
        <DashboardStat emoji="💎" value={highest} label="Best ₹/kg" prefix="₹" accent="#60A5FA" delay={0.05} />
        <DashboardStat emoji="📊" value={avgPrice} label="Avg ₹/kg" prefix="₹" accent="#93C5FD" delay={0.1} />
        <DashboardStat emoji="📉" value={lowest} label="Lowest ₹/kg" prefix="₹" accent="#64748B" delay={0.15} />
      </div>

      {/* ---- LOADING ---- */}
      {loading && (
        <div className="mt-16 flex items-center justify-center text-[var(--kk-text-dim)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading records…
        </div>
      )}

          {/* ---- EMPTY STATE ---- */}
      {!loading && !error && visible.length === 0 && (
        <div className="mt-16 kk-card p-12 text-center border-[var(--kk-amber)]/30">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">
            No mandis available
          </h3>
          <p className="text-sm text-[var(--kk-text-dim)] max-w-md mx-auto">
            {crop !== "All" && `No ${crop} `}
            {crop === "All" && `No prices `}
            {state !== "All" && `in ${state}`}
            {district !== "All" && ` / ${district}`}
            {state === "All" && district === "All" && ` across all states`}
            {query && ` matching "${query}"`}
            {" "}were found in the current dataset.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {(crop !== "All" || state !== "All" || district !== "All" || query) && (
              <button
                onClick={() => {
                  setCrop("All");
                  setState("All");
                  setDistrict("All");
                  setQuery("");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                           bg-[var(--kk-lime)] text-white hover:opacity-90 transition-opacity"
              >
                Clear all filters
              </button>
            )}
            {state !== "All" && (
              <button
                onClick={() => setState("All")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                           border border-[var(--kk-border)] text-[var(--kk-text-dim)]
                           hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)] transition-colors"
              >
                Show all states
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---- ERROR (only for real errors, not empty results) ---- */}
      {!loading && error && error !== "No records found." && (
        <div className="mt-16 kk-card p-8 text-center border-[var(--kk-terracotta)]">
          <WifiOff className="w-8 h-8 text-[var(--kk-terracotta)] mx-auto mb-3" />
          <div className="text-sm text-[var(--kk-text-dim)]">{error}</div>
          <button
            onClick={() => fetchPrices(crop, state, district, query)}
            className="mt-4 px-4 py-2 rounded-xl border border-[var(--kk-border)] text-sm hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)] transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* ---- GRID ---- */}
      {!loading && !error && visible.length > 0 && (
        <motion.div layout className="grid md:grid-cols-2 gap-4 mt-8">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <PriceCard key={p.id} price={p as any} best={sort === "price" && i === 0} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}