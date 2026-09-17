// app/farmer/page.tsx
// PURPOSE: Farmer dashboard.
//   Shows: stat cards, quick actions, current listings, latest order.
//   Every action button routes into a real page.
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus, TrendingUp, Package, Users, IndianRupee, ArrowRight,
  Sprout, Truck, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DashboardStat } from "@/components/DashboardStat";
import { ListingCard } from "@/components/ListingCard";
import { AnimatedButton } from "@/components/AnimatedButton";
import {
  getFarmer, getListings, getOrders, getOffersForListing,
  Farmer, Listing, Order, Offer,
} from "@/lib/db";
import { useSession } from "@/lib/session";
import { formatINR } from "@/lib/utils";

export default function FarmerDashboard() {
  const { farmer: sessionFarmer } = useSession();
  const router = useRouter();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    (async () => {
      // Use the logged-in farmer or fall back to the first seeded farmer
      const fid = sessionFarmer?.id ?? "F1";
      const f = await getFarmer(fid);
      setFarmer(f ?? null);

      const allL = await getListings();
      const mine = allL.filter(l => l.farmerId === fid);
      setMyListings(mine);

      // Offers across all my listings
      let allOffers: Offer[] = [];
      for (const l of mine) {
        const o = await getOffersForListing(l.id);
        allOffers = allOffers.concat(o);
      }
      setOffers(allOffers);

      const allO = await getOrders();
      setMyOrders(allO.filter(o => o.farmerId === fid));
    })();
  }, [sessionFarmer]);

  if (!farmer) {
    return (
      <div className="py-20 text-center text-[var(--kk-text-dim)]">
        Loading dashboard…
      </div>
    );
  }

  const totalSales = myOrders.reduce((s, o) => s + o.netToFarmer, 0);
  const liveListings = myListings.filter(l => l.status === "open").length;
  const pendingOffers = offers.filter(o => o.status === "pending").length;
  const trucksInTransit = myOrders.filter(o => o.status === "in_transit").length;

  return (
    <div>
      <PageHeader
        badge="Farmer Dashboard"
        badgeIcon={Sprout}
        title={`Namaste, ${farmer.name.split(" ")[0]} 🙏`}
        subtitle={`${farmer.village}, ${farmer.state} · Rating ${farmer.rating} ⭐`}
        actions={
          <>
            <AnimatedButton size="md" onClick={() => router.push("/farmer/list-produce")}>
              <Plus className="w-4 h-4" /> List Produce
            </AnimatedButton>
            <AnimatedButton variant="ghost" size="md" onClick={() => router.push("/market")}>
              <TrendingUp className="w-4 h-4" /> See Market
            </AnimatedButton>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStat
          emoji="💰" value={totalSales} label="Total sales"
          prefix="₹" accent="#A9E34B" delay={0}
        />
        <DashboardStat
          emoji="🌾" value={liveListings} label="Live listings"
          accent="#2E8B57" delay={0.05}
        />
        <DashboardStat
          emoji="📬" value={pendingOffers} label="Offers waiting"
          accent="#F4A300" delay={0.1}
        />
        <DashboardStat
          emoji="🚚" value={trucksInTransit} label="Trucks in transit"
          accent="#C75B39" delay={0.15}
        />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4 mt-10">
        {[
          { icon: Plus,    title: "List new produce",     desc: "Add a fresh harvest in 30 seconds", href: "/farmer/list-produce" },
          { icon: Users,   title: "Review buyer offers",  desc: `${pendingOffers} offers waiting`,    href: "/farmer/buyers" },
          { icon: Package, title: "Track your orders",    desc: `${myOrders.length} orders total`,   href: "/farmer/orders" },
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
            <div className="p-3 rounded-xl bg-[var(--kk-green)] text-[var(--kk-lime)] w-fit group-hover:scale-110 group-hover:rotate-6 transition-transform">
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

      {/* My listings */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--kk-lime)]" />
            Your current listings
          </h2>
          <button
            onClick={() => router.push("/farmer/list-produce")}
            className="text-sm text-[var(--kk-lime)] hover:underline flex items-center gap-1"
          >
            + Add new
          </button>
        </div>

        {myListings.length === 0 ? (
          <div className="kk-card p-10 text-center">
            <div className="text-5xl mb-3">🌱</div>
            <p className="text-[var(--kk-text-dim)]">No listings yet.</p>
            <div className="mt-5">
              <AnimatedButton onClick={() => router.push("/farmer/list-produce")}>
                <Plus className="w-4 h-4" /> List your first produce
              </AnimatedButton>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {myListings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                actionLabel="View Offers"
                actionHref="/farmer/buyers"
              />
            ))}
          </div>
        )}
      </div>

      {/* Latest order */}
      {myOrders.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--kk-lime)]" />
            Latest order
          </h2>
          {(() => {
            const o = myOrders[0];
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="kk-card p-6 flex flex-col sm:flex-row sm:items-center gap-5"
              >
                <div className="text-4xl">{o.crop === "Tomato" ? "🍅" : "🌾"}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{o.id}</span>
                    <span className="kk-badge">
                      {o.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--kk-text-dim)] mt-1">
                    {o.quantityKg} kg · ₹{o.pricePerKg}/kg · Truck {o.truck.number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[var(--kk-lime)]">
                    {formatINR(o.netToFarmer)}
                  </div>
                  <div className="text-xs text-[var(--kk-text-dim)]">Net to you</div>
                </div>
                <AnimatedButton size="sm" onClick={() => router.push(`/tracking/${o.id}`)}>
                  Track <ArrowRight className="w-4 h-4" />
                </AnimatedButton>
              </motion.div>
            );
          })()}
        </div>
      )}
    </div>
  );
}