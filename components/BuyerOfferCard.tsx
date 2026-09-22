// components/BuyerOfferCard.tsx
// PURPOSE: One buyer offer row on the farmer's "Buyers" page.
//          Shows the buyer's brand, rating, distance, offer price, and
//          a big Accept button. Accepting triggers a toast + navigates to
//          the tracking page for the new order.
"use client";

import { motion } from "framer-motion";
import { Star, MapPin, CheckCircle2, Truck, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Buyer, createOrder } from "@/lib/db";
import { AnimatedButton } from "./AnimatedButton";
import { useToast } from "./Toast";
import { formatINR, cn } from "@/lib/utils";

interface Props {
  buyer: Buyer;
  listingId: number | string;
  pricePerKg: number;
  quantityKg: number;
  message?: string;
  best?: boolean;
  delay?: number;
}

export function BuyerOfferCard({
  buyer, listingId, pricePerKg, quantityKg, message, best, delay = 0,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const total = pricePerKg * quantityKg;

  const onAccept = async () => {
    setAccepting(true);
    try {
          const order = await createOrder({
        listingId: Number(listingId),
        buyerId: buyer.id,
        pricePerKg,
        quantityKg,
      });
      setAccepted(true);
      toast(`Order placed with ${buyer.name} — ₹${total.toLocaleString("en-IN")}`);
      setTimeout(() => router.push(`/tracking/${order.id}`), 1200);
    } catch {
      toast("Could not create order");
      setAccepting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={cn(
        "kk-card p-6 flex flex-col gap-5 relative",
        best && "border-[var(--kk-lime)] shadow-[0_0_50px_rgba(169,227,75,0.25)]"
      )}
    >
      {best && (
        <div className="absolute -top-3 left-6">
          <span className="kk-badge">
            <Award className="w-3 h-3" /> Best Offer
          </span>
        </div>
      )}

      {/* Header: brand tile + name + meta */}
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{
            background: buyer.logoColor + "22",
            border: `1px solid ${buyer.logoColor}55`,
          }}
        >
          {buyer.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg truncate">{buyer.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--kk-text-dim)]">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-[var(--kk-amber)] text-[var(--kk-amber)]" />
              {buyer.rating}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {buyer.city} · {buyer.distanceKm} km
            </span>
            <span className="kk-badge text-[10px]">{buyer.type}</span>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <p className="text-sm text-[var(--kk-text-dim)] italic">
          "{message}"
        </p>
      )}

      {/* Numbers grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--kk-surface-2)] p-3">
          <div className="text-xs text-[var(--kk-text-dim)]">Offer per kg</div>
          <div className="mt-1 font-semibold text-[var(--kk-lime)]">
            ₹{pricePerKg}/kg
          </div>
        </div>
        <div className="rounded-xl bg-[var(--kk-surface-2)] p-3">
          <div className="text-xs text-[var(--kk-text-dim)]">Total deal</div>
          <div className="mt-1 font-semibold">
            {formatINR(total)}
          </div>
        </div>
      </div>

      {/* Accept */}
      <div className="mt-auto">
        {accepted ? (
          <div className="flex items-center gap-2 text-[var(--kk-lime)] text-sm font-medium py-3">
            <CheckCircle2 className="w-5 h-5" />
            Order placed — redirecting to tracking…
          </div>
        ) : (
          <AnimatedButton
            variant={best ? "primary" : "secondary"}
            size="md"
            onClick={onAccept}
            disabled={accepting}
            className="w-full"
          >
            <Truck className="w-4 h-4" />
            {accepting ? "Placing order…" : "Accept Offer"}
          </AnimatedButton>
        )}
      </div>
    </motion.div>
  );
}