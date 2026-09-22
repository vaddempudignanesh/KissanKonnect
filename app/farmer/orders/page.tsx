// app/farmer/orders/page.tsx
// PURPOSE: List of all orders for the logged-in farmer.
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Package, Truck, ArrowRight, IndianRupee } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useSession } from "@/lib/session";
import {
  getOrders, getBuyer, Order, Buyer,
} from "@/lib/db";
import { formatINR, cn } from "@/lib/utils";

const STATUS_COLOR: Record<Order["status"], string> = {
  confirmed:  "bg-[rgba(96,165,250,0.12)] text-[var(--kk-amber)]",
  picked_up:  "bg-[rgba(59,130,246,0.15)] text-[var(--kk-lime)]",
  in_transit: "bg-[rgba(59,130,246,0.20)] text-[var(--kk-lime)]",
  delivered:  "bg-[rgba(59,130,246,0.25)] text-[var(--kk-lime)]",
  paid:       "bg-[rgba(59,130,246,0.30)] text-[var(--kk-lime)]",
};

export default function FarmerOrdersPage() {
  const { farmer } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<(Order & { buyer?: Buyer })[]>([]);

  useEffect(() => {
    (async () => {
      const fid = farmer?.id ?? "F1";
      const all = await getOrders();
           const mine = all.filter(o => o.farmerId === fid);
      const enriched = await Promise.all(
        mine.map(async (o) => ({ ...o, buyer: await getBuyer(o.buyerId) ?? undefined }))
      );
      setOrders(enriched);
    })();
  }, [farmer]);

  return (
    <div>
      <PageHeader
        badge="Order History"
        badgeIcon={Package}
        title="Your orders"
        subtitle="Every deal you've closed, with live tracking and payment status."
      />

      {orders.length === 0 ? (
        <div className="kk-card p-12 text-center">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-[var(--kk-text-dim)]">No orders yet.</p>
          <div className="mt-5">
            <AnimatedButton onClick={() => router.push("/farmer/list-produce")}>
              List produce to start selling
            </AnimatedButton>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ x: 4 }}
              className="kk-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
              onClick={() => router.push(`/tracking/${o.id}`)}
            >
              <div className="text-3xl shrink-0">
                {o.crop === "Tomato" ? "🍅" : o.crop === "Wheat" ? "🌾" : o.crop === "Onion" ? "🧅" : "🥔"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate">{o.id}</span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide", STATUS_COLOR[o.status])}>
                    {o.status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-sm text-[var(--kk-text-dim)] mt-1 truncate">
                  {o.crop} · {o.quantityKg} kg · to {o.buyer?.name ?? "buyer"}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bold text-[var(--kk-lime)]">
                  {formatINR(o.netToFarmer)}
                </div>
                <div className="text-xs text-[var(--kk-text-dim)]">Net to you</div>
              </div>

              <div className="flex items-center gap-2 text-[var(--kk-text-dim)]">
                <Truck className="w-4 h-4" />
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}