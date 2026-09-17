// app/buyer/orders/page.tsx
// PURPOSE: Buyer's purchase history.
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Package, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useSession } from "@/lib/session";
import { getOrders, getFarmer, Order, Farmer } from "@/lib/db";
import { formatINR, cn } from "@/lib/utils";

const STATUS_COLOR: Record<Order["status"], string> = {
  confirmed:  "bg-[rgba(244,163,0,0.12)] text-[var(--kk-amber)]",
  picked_up:  "bg-[rgba(46,139,87,0.15)]  text-[var(--kk-green-light)]",
  in_transit: "bg-[rgba(199,91,57,0.15)]  text-[var(--kk-terracotta)]",
  delivered:  "bg-[rgba(169,227,75,0.15)] text-[var(--kk-lime)]",
  paid:       "bg-[rgba(169,227,75,0.2)]  text-[var(--kk-lime)]",
};

export default function BuyerOrdersPage() {
  const { buyer } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<(Order & { farmer?: Farmer })[]>([]);

  useEffect(() => {
    (async () => {
      const bid = buyer?.id ?? "B1";
      const mine = (await getOrders()).filter(o => o.buyerId === bid);
      const enriched = await Promise.all(
        mine.map(async (o) => ({ ...o, farmer: await getFarmer(o.farmerId) }))
      );
      setRows(enriched);
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

      {rows.length === 0 ? (
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
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide", STATUS_COLOR[o.status])}>
                    {o.status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm text-[var(--kk-text-dim)] mt-1 truncate">
                  {o.crop} · {o.quantityKg} kg · from {o.farmer?.name ?? "farmer"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-[var(--kk-amber)]">
                  {formatINR(o.totalAmount)}
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