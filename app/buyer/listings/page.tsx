// app/buyer/listings/page.tsx
// PURPOSE: Browse all farmer listings. Filter by crop.
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ShoppingBasket } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ListingCard } from "@/components/ListingCard";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { getListings, Listing, Crop, createOrder } from "@/lib/db";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const CROPS: (Crop | "All")[] = ["All", "Tomato", "Onion", "Potato", "Wheat", "Rice"];

export default function BuyerListingsPage() {
  const [all, setAll] = useState<Listing[]>([]);
  const [crop, setCrop] = useState<Crop | "All">("All");
  const { buyer } = useSession();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => { getListings().then(setAll); }, []);

  const filtered = useMemo(
    () => crop === "All" ? all : all.filter(l => l.crop === crop),
    [all, crop]
  );

  const onBid = async (l: Listing) => {
    if (!buyer) { toast("Log in as a buyer first"); return; }
    try {
      const order = await createOrder({
        listingId: l.id,
        buyerId: buyer.id,
        pricePerKg: l.expectedPrice,
        quantityKg: l.quantityKg,
      });
      toast(`Order placed for ${l.quantityKg} kg ${l.crop}`);
      setTimeout(() => router.push(`/tracking/${order.id}`), 1000);
    } catch {
      toast("Could not place order");
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
        {CROPS.map(c => (
          <button
            key={c}
            onClick={() => setCrop(c)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
              crop === c
                ? "bg-[var(--kk-amber)] text-[#0B0F19] border-[var(--kk-amber)]"
                : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-amber)] hover:text-[var(--kk-amber)]"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div layout className="grid md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              actionLabel="Place Order"
              onAction={() => onBid(l)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center text-[var(--kk-text-dim)]">
          No listings for this crop right now.
        </div>
      )}
    </div>
  );
}