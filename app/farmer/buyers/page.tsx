"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowUpDown, IndianRupee, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerOfferCard } from "@/components/BuyerOfferCard";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { AnimatedButton } from "@/components/AnimatedButton";
import type {
  DbBuyer as Buyer,
  DbListing as Listing,
  DbOffer as Offer,
} from "@/lib/types";

type Sort = "price" | "distance" | "rating";

export default function FarmerBuyersPage() {
  const { farmer: sessionFarmer } = useSession();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [rows, setRows] = useState<{ offer: Offer; buyer: Buyer }[]>([]);
  const [sort, setSort] = useState<Sort>("price");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!sessionFarmer) { setLoading(false); return; }
      try {
        const lRes = await fetch("/api/listings");
        const lJson = await lRes.json();
        const mine = (lJson.listings ?? []).filter(
          (l: Listing) => l.farmer_id === sessionFarmer.id,
        );
        const first = mine[0] ?? null;
        setListing(first);
        if (!first) { setLoading(false); return; }

        const oRes = await fetch(`/api/offers?listingId=${first.id}`);
        const oJson = await oRes.json();
        const offers: Offer[] = oJson.offers ?? [];

        const withBuyers = await Promise.all(
          offers.map(async (o) => {
            const bRes = await fetch(`/api/buyers/${o.buyer_id}`);
            if (!bRes.ok) return null;
            const bJson = await bRes.json();
            return bJson.buyer ? { offer: o, buyer: bJson.buyer } : null;
          }),
        );
        setRows(withBuyers.filter((r): r is NonNullable<typeof r> => r !== null));
      } catch (e) {
        console.error("[farmer buyers] fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionFarmer]);

  const sorted = [...rows].sort((a, b) => {
    if (sort === "price")    return b.offer.pricePerKg - a.offer.pricePerKg;
    if (sort === "distance") return a.buyer.distanceKm - b.buyer.distanceKm;
    return b.buyer.rating - a.buyer.rating;
  });

  const bestId = sorted[0]?.buyer.id;

  if (loading) {
    return (
      <div className="py-20 text-center text-[var(--kk-text-dim)]">
        Loading…
      </div>
    );
  }

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
            variant="ghost"
            size="md"
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
                ? "bg-[var(--kk-lime)] text-white border-[var(--kk-lime)]"
                : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]",
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="kk-card p-12 text-center">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-[var(--kk-text-dim)]">No buyer offers yet.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}