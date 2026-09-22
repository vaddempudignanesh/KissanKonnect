"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ShoppingBasket } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ListingCard } from "@/components/ListingCard";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Crop, DbListing as Listing } from "@/lib/types";

const CROPS: (Crop | "All")[] = ["All", "Tomato", "Onion", "Potato", "Wheat", "Rice"];

export default function BuyerListingsPage() {
  const [all, setAll] = useState<Listing[]>([]);
  const [crop, setCrop] = useState<Crop | "All">("All");
  const [loading, setLoading] = useState(true);
  const { buyer } = useSession();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/listings");
        const json = await res.json();
        setAll(json.listings ?? []);
      } catch (e) {
        console.error("[buyer listings] fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => (crop === "All" ? all : all.filter((l) => l.crop === crop)),
    [all, crop],
  );

  const onPlaceOrder = async (l: Listing) => {
    if (!buyer) {
      toast("Log in as a buyer first");
      return;
    }
    try {
      // 1. Create an offer
      const offerRes = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: l.id,
          buyerId: buyer.id,
          pricePerKg: l.expectedPrice,
          quantityKg: l.quantityKg,
          message: "Direct purchase from buyer listing page",
        }),
      });
      if (!offerRes.ok) throw new Error("Could not create offer");
      const { offer } = await offerRes.json();

      // 2. Accept it → creates the order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id }),
      });
      if (!orderRes.ok) throw new Error("Could not create order");
      const { order } = await orderRes.json();

      toast(`Order placed for ${l.quantityKg} kg ${l.crop}`);
      setTimeout(() => router.push(`/tracking/${order.order_number}`), 1000);
    } catch (e: any) {
      toast(e.message ?? "Could not place order");
    }
  };

  return (
    <div>
      <PageHeader
        badge="Browse Farmers"
        badgeIcon={ShoppingBasket}
        title="Fresh from Indian farms"
        subtitle="Every listing is quality-graded, origin-traced, and ready to ship."
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm text-[var(--kk-text-dim)] flex items-center gap-1 mr-2">
          <Filter className="w-4 h-4" /> Crop:
        </span>
        {CROPS.map((c) => (
          <button
            key={c}
            onClick={() => setCrop(c)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
              crop === c
                ? "bg-[var(--kk-amber)] text-[#0B0F19] border-[var(--kk-amber)]"
                : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-amber)] hover:text-[var(--kk-amber)]",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-16 text-center text-[var(--kk-text-dim)]">
          Loading listings…
        </div>
      ) : (
        <>
          <motion.div layout className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  actionLabel="Place Order"
                  onAction={() => onPlaceOrder(l)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="mt-16 text-center text-[var(--kk-text-dim)]">
              No listings for this crop right now.
            </div>
          )}
        </>
      )}
    </div>
  );
}