"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Package, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useSession } from "@/lib/session";
import { formatINR, cn } from "@/lib/utils";
import type { DbOrder as Order, DbFarmer as Farmer } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  confirmed:  "bg-[rgba(96,165,250,0.12)] text-[var(--kk-amber)]",
  picked_up:  "bg-[rgba(59,130,246,0.15)] text-[var(--kk-lime)]",
  in_transit: "bg-[rgba(59,130,246,0.20)] text-[var(--kk-lime)]",
  delivered:  "bg-[rgba(59,130,246,0.25)] text-[var(--kk-lime)]",
  paid:       "bg-[rgba(59,130,246,0.30)] text-[var(--kk-lime)]",
};

interface Row extends Order {
  farmer?: Farmer;
}

export default function BuyerOrdersPage() {
  const { buyer } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!buyer) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders?buyerId=${buyer.id}`);
        const json = await res.json();
        const orders: Order[] = json.orders ?? [];

        // Fetch farmer for each order
        const enriched = await Promise.all(
          orders.map(async (o) => {
            try {
              const fRes = await fetch(`/api/farmers/${o.farmer_id}`);
              if (!fRes.ok) return { ...o };
              const fJson = await fRes.json();
              return { ...o, farmer: fJson.farmer ?? undefined };
            } catch {
              return { ...o };
            }
          }),
        );
        setRows(enriched);
      } catch (e) {
        console.error("[buyer orders] fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [buyer]);

  return (
    <div>
      <PageHeader
        badge="Purchase History"
        badgeIcon={Package}
        title="Your orders"
        subtitle="Every deal you've closed, with live tracking and payment status."
      />

      {loading ? (
        <div className="py-20 text-center text-[var(--kk-text-dim)]">
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="kk-card p-12 text-center">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-[var(--kk-text-dim)]">No orders yet.</p>
          <div className="mt-5">
            <AnimatedButton onClick={() => router.push("/buyer/listings")}>
              Browse farmers
            </AnimatedButton>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ x: 4 }}
              onClick={() => router.push(`/tracking/${o.id}`)}
              className="kk-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
            >
              <div className="text-3xl shrink-0">
                {o.crop === "Tomato" ? "🍅" : o.crop === "Wheat" ? "🌾" : "🧅"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate">{o.id}</span>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide",
                      STATUS_COLOR[o.status] ?? "",
                    )}
                  >
                    {o.status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm text-[var(--kk-text-dim)] mt-1 truncate">
                  {o.crop} · {o.quantityKg} kg · from{" "}
                  {o.farmer?.name ?? "farmer"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-[var(--kk-amber)]">
                  {formatINR(Number(o.totalAmount))}
                </div>
                <div className="text-xs text-[var(--kk-text-dim)]">Total</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--kk-text-dim)]" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}