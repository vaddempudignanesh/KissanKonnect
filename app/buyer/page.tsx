// app/buyer/page.tsx
// PURPOSE: Buyer dashboard. Stats, quick actions, recent orders.
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingBasket, Package, Users, IndianRupee, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DashboardStat } from "@/components/DashboardStat";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useSession } from "@/lib/session";
import { getOrders, getListings, Order, Listing } from "@/lib/db";
import { formatINR } from "@/lib/utils";

export default function BuyerDashboard() {
  const { buyer } = useSession();
  const router = useRouter();
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [openListings, setOpenListings] = useState<Listing[]>([]);

  useEffect(() => {
    (async () => {
      const bid = buyer?.id ?? "B1";
      const orders = (await getOrders()).filter(o => o.buyerId === bid);
      setMyOrders(orders);
      setOpenListings((await getListings()).filter(l => l.status === "open"));
    })();
  }, [buyer]);

  const totalSpent = myOrders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div>
      <PageHeader
        badge="Buyer Dashboard"
        badgeIcon={ShoppingBasket}
        title={`Welcome, ${buyer?.name ?? "Buyer"}`}
        subtitle={`${buyer?.city ?? "Delhi"} · ${buyer?.type ?? "MNC"} · Rating ${buyer?.rating ?? 5} ⭐`}
        actions={
          <>
            <AnimatedButton size="md" onClick={() => router.push("/buyer/listings")}>
              <Sparkles className="w-4 h-4" /> Browse Farmers
            </AnimatedButton>
            <AnimatedButton variant="ghost" size="md" onClick={() => router.push("/buyer/orders")}>
              <Package className="w-4 h-4" /> My Orders
            </AnimatedButton>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStat emoji="💸" value={totalSpent} label="Total spent" prefix="₹" accent="#F4A300" delay={0} />
        <DashboardStat emoji="📦" value={myOrders.length} label="Orders placed" accent="#A9E34B" delay={0.05} />
        <DashboardStat emoji="🌾" value={openListings.length} label="Listings available" accent="#2E8B57" delay={0.1} />
        <DashboardStat emoji="🚚" value={myOrders.filter(o => o.status === "in_transit").length} label="In transit" accent="#C75B39" delay={0.15} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-10">
        {[
          { icon: ShoppingBasket, title: "Browse all listings", desc: `${openListings.length} farmers selling now`, href: "/buyer/listings" },
          { icon: Package, title: "Track your orders", desc: `${myOrders.length} orders total`, href: "/buyer/orders" },
          { icon: Users, title: "Verified farmers", desc: "Quality-graded network", href: "/buyer/listings" },
        ].map((a, i) => (
          <motion.button
            key={a.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => router.push(a.href)}
            className="kk-card p-6 text-left group"
          >
            <div className="p-3 rounded-xl bg-[var(--kk-amber)]/20 text-[var(--kk-amber)] w-fit group-hover:scale-110 transition-transform">
              <a.icon className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-[var(--kk-text-dim)]">{a.desc}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-[var(--kk-amber)] opacity-60 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Recent orders */}
      {myOrders.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-5">Recent orders</h2>
          <div className="space-y-3">
            {myOrders.slice(0, 3).map((o) => (
              <motion.div
                key={o.id}
                whileHover={{ x: 4 }}
                onClick={() => router.push(`/tracking/${o.id}`)}
                className="kk-card p-5 flex items-center gap-4 cursor-pointer"
              >
                <div className="text-3xl">
                  {o.crop === "Tomato" ? "🍅" : o.crop === "Wheat" ? "🌾" : "🧅"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{o.id}</div>
                  <div className="text-sm text-[var(--kk-text-dim)]">
                    {o.quantityKg} kg {o.crop}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--kk-amber)]">
                    {formatINR(o.totalAmount)}
                  </div>
                  <div className="text-xs text-[var(--kk-text-dim)]">In transit</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--kk-text-dim)]" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}