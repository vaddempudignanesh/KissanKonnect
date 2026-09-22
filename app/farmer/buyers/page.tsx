// app/farmer/buyers/page.tsx
// PURPOSE: Offers page. Farmer sees every buyer interested in their listing,
//          sorted by price (best first). Accepting an offer creates an order
//          and redirects to tracking.
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Users, ArrowUpDown, IndianRupee, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerOfferCard } from "@/components/BuyerOfferCard";
import { useSession } from "@/lib/session";
import {
  getFarmer, getListings, getOffersForListing, getBuyer,
  Buyer, Listing, Offer,
} from "@/lib/db";
import { cn } from "@/lib/utils";
import { AnimatedButton } from "@/components/AnimatedButton";

type Sort = "price" | "distance" | "rating";

export default function FarmerBuyersPage() {
  const { farmer: sessionFarmer } = useSession();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [rows, setRows] = useState<{ offer: Offer; buyer: Buyer }[]>([]);
  const [sort, setSort] = useState<Sort>("price");

  useEffect(() => {
    (async () => {
      const fid = sessionFarmer?.id ?? "F1";
      const myListings = (await getListings()).filter(l => l.farmerId === fid);
      const first = myListings[0] ?? null;
      setListing(first);
      if (!first) return;

            const offers = await getOffersForListing(first.id);
      const withBuyers = await Promise.all(
        offers.map(async (o) => {
          const b = await getBuyer(o.buyerId);
          return b ? { offer: o, buyer: b } : null;
        })
      );
      setRows(withBuyers.filter((r): r is NonNullable<typeof r> => r !== null));
    })();
  }, [sessionFarmer]);

  const sorted = [...rows].sort((a, b) => {
    if (sort === "price")    return b.offer.pricePerKg - a.offer.pricePerKg;
    if (sort === "distance") return a.buyer.distanceKm - b.buyer.distanceKm;
    return b.buyer.rating - a.buyer.rating;
  });

  const bestId = sorted[0]?.buyer.id;

  if (!listing) {
    return (
      <div className="py-20 text-center text-[var(--kk-text-dim)]">
        No active listing. Create one first.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        badge="Buyer Offers"
        badgeIcon={Users}
        title={`Offers on your ${listing.crop}`}
        subtitle={`${listing.quantityKg} kg · Grade ${listing.quality} · Expected ₹${listing.expectedPrice}/kg`}
        actions={
          <AnimatedButton
            variant="ghost" size="md"
            onClick={() => router.push("/farmer/list-produce")}
          >
            + New Listing
          </AnimatedButton>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm text-[var(--kk-text-dim)] flex items-center gap-1 mr-2">
          <Filter className="w-4 h-4" /> Sort by:
        </span>
        {([
          { id: "price",    label: "Best price", icon: IndianRupee },
          { id: "distance", label: "Nearest",    icon: ArrowUpDown },
          { id: "rating",   label: "Top rated",  icon: Users },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSort(id)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 border",
              sort === id
                ? "bg-[var(--kk-lime)] text-[#0A0F0D] border-[var(--kk-lime)]"
                : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {sorted.map((r, i) => (
                    <BuyerOfferCard
            key={r.offer.id}
            buyer={r.buyer}
            listingId={listing.id}
            pricePerKg={r.offer.pricePerKg}
            quantityKg={r.offer.quantityKg}
            message={r.offer.message}
            best={r.buyer.id === bestId}
            delay={i * 0.06}
          />
        ))}
      </div>
    </div>
  );
}