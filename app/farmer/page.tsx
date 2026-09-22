"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sprout, Package, Plus, ArrowRight, Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DashboardStat } from "@/components/DashboardStat";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useSession } from "@/lib/session";
import { formatINR } from "@/lib/utils";
import type { DbOrder as Order, DbListing as Listing } from "@/lib/types";

export default function FarmerDashboard() {
  const { farmer } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!farmer) { setLoading(false); return; }
      try {
        const [oRes, lRes] = await Promise.all([
          fetch(`/api/orders?farmerId=${farmer.id}`),
          fetch(`/api/listings`),
        ]);
        const oJson = await oRes.json();
        const lJson = await lRes.json();
        setOrders(oJson.orders ?? []);
        setListings(
          (lJson.listings ?? []).filter(
            (l: Listing) => l.farmer_id === farmer.id,
          ),
        );
      } catch (e) {
        console.error("[farmer dashboard] fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [farmer]);

  const totalEarned = orders.reduce(
    (s, o) => s + Number(o.netToFarmer ?? 0),
    0,
  );
  const activeListings = listings.filter((l) => l.status === "active").length;

  return (
    <div>
      <PageHeader
        badge="Farmer Dashboard"
        badgeIcon={Sprout}
        title={`Welcome, ${farmer?.name ?? "Farmer"}`}
        subtitle={`${farmer?.village ?? "Village"}, ${farmer?.state ?? "India"} · Rating ${farmer?.rating ?? 5} ⭐`}
        actions={
          <>
            <AnimatedButton
              size="md"
              onClick={() => router.push("/farmer/list-produce")}
            >
              <Plus className="w-4 h-4" /> New Listing
            </AnimatedButton>
            <AnimatedButton
              variant="ghost"
              size="md"
              onClick={() => router.push("/farmer/buyers")}
            >
              <Users className="w-4 h-4" /> View Buyers
            </AnimatedButton>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStat
          emoji="💰"
          value={totalEarned}
          label="Total earned"
          prefix="₹"
          accent="#3B82F6"
          delay={0}
        />
        <DashboardStat
          emoji="📦"
          value={orders.length}
          label="Total orders"
          accent="#60A5FA"
          delay={0.05}
        />
        <DashboardStat
          emoji="🌾"
          value={activeListings}
          label="Active listings"
          accent="#93C5FD"
          delay={0.1}
        />
        <DashboardStat
          emoji="🚚"
          value={orders.filter((o) => o.status === "in_transit").length}
          label="In transit"
          accent="#64748B"
          delay={0.15}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-10">
        {[
          {
            icon: Plus,
            title: "List new produce",
            desc: "Add your harvest to the marketplace",
            href: "/farmer/list-produce",
          },
          {
            icon: Users,
            title: "See buyer offers",
            desc: "Compare and accept the best bid",
            href: "/farmer/buyers",
          },
          {
            icon: Package,
            title: "Track your orders",
            desc: "Live status of every shipment",
            href: "/farmer/orders",
          },
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
            <div className="p-3 rounded-xl bg-[var(--kk-lime)]/10 text-[var(--kk-lime)] w-fit group-hover:scale-110 transition-transform">
              <a.icon className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-[var(--kk-text-dim)]">{a.desc}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-[var(--kk-lime)] opacity-60 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </div>

      {!loading && orders.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-5">Recent orders</h2>
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <motion.div
                key={o.id}
                whileHover={{ x: 4 }}
                onClick={() => router.push(`/tracking/${o.id}`)}
                className="kk-card p-5 flex items-center gap-4 cursor-pointer"
              >
                <div className="text-3xl">
                  {o.crop === "Tomato"
                    ? "🍅"
                    : o.crop === "Wheat"
                      ? "🌾"
                      : o.crop === "Onion"
                        ? "🧅"
                        : "🥔"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{o.id}</div>
                  <div className="text-sm text-[var(--kk-text-dim)]">
                    {o.quantityKg} kg · to {o.company_name ?? "buyer"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--kk-lime)]">
                    {formatINR(Number(o.netToFarmer))}
                  </div>
                  <div className="text-xs text-[var(--kk-text-dim)]">
                    Net to you
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--kk-text-dim)]" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="mt-12 kk-card p-12 text-center">
          <div className="text-5xl mb-3">🌱</div>
          <p className="text-[var(--kk-text-dim)]">
            No orders yet. List your produce to start selling.
          </p>
          <div className="mt-5">
            <AnimatedButton onClick={() => router.push("/farmer/list-produce")}>
              <Plus className="w-4 h-4" /> List Produce
            </AnimatedButton>
          </div>
        </div>
      )}
    </div>
  );
}