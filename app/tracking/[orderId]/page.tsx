"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Truck, MapPin, Phone, User, ShieldCheck, IndianRupee,
  ChevronLeft, Package,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TruckMap } from "@/components/TruckMap";
import { Timeline } from "@/components/Timeline";
import { AnimatedButton } from "@/components/AnimatedButton";
import { formatINR } from "@/lib/utils";
import type { DbOrder as Order, DbBuyer as Buyer, DbFarmer as Farmer } from "@/lib/types";

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = String(params?.orderId ?? "");

  const [order, setOrder] = useState<Order | null>(null);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) { setOrder(null); return; }
        const data = await res.json();
        setOrder(data.order);
        setBuyer(data.buyer);
        setFarmer(data.farmer);
      } catch (e) {
        console.error("[tracking] fetch failed", e);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-20 text-center text-[var(--kk-text-dim)]">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-[var(--kk-text-dim)] hover:text-[var(--kk-lime)] flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="kk-card p-12 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-[var(--kk-text-dim)]">
            Order not found. It may have been created in a different session.
          </p>
          <div className="mt-5">
            <AnimatedButton onClick={() => router.push("/market")}>
              Go to Market
            </AnimatedButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--kk-text-dim)] hover:text-[var(--kk-lime)] flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <PageHeader
        badge={`Order ${order.id}`}
        badgeIcon={Truck}
        title={`${order.crop ?? order.crop_name ?? "Order"} · ${order.quantityKg} kg`}
        subtitle={`${farmer?.village ?? "Farm"}, ${farmer?.state ?? ""} → ${buyer?.city ?? "Buyer"}, ${buyer?.state ?? ""}`}
        actions={
          <AnimatedButton size="md" variant="secondary">
            <Phone className="w-4 h-4" /> Contact Driver
          </AnimatedButton>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <InfoCard icon={Package} label="Total amount" value={formatINR(order.totalAmount)} accent="#A9E34B" />
        <InfoCard icon={IndianRupee} label="Net to farmer" value={formatINR(order.netToFarmer)} accent="#F4A300" />
        <InfoCard
          icon={ShieldCheck}
          label="Escrow status"
          value={order.status === "delivered" || order.status === "paid" ? "Released" : "Held"}
          accent="#2E8B57"
        />
        <InfoCard icon={Truck} label="Truck" value={order.truck.number} accent="#C75B39" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TruckMap truck={order.truck} />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="kk-card p-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--kk-green)] text-[var(--kk-lime)] flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[var(--kk-text-dim)]">Driver</div>
              <div className="font-semibold text-lg">{order.truck.driverName}</div>
              <div className="text-sm text-[var(--kk-text-dim)] flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5" /> {order.truck.driverPhone}
              </div>
            </div>
            <AnimatedButton variant="ghost" size="sm">
              <Phone className="w-4 h-4" /> Call
            </AnimatedButton>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="kk-card p-5">
              <div className="text-xs uppercase tracking-widest text-[var(--kk-text-dim)] mb-2">
                Pickup
              </div>
              <div className="font-semibold">{farmer?.village ?? "—"}</div>
              <div className="text-sm text-[var(--kk-text-dim)] flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {farmer?.district ?? ""}, {farmer?.state ?? ""}
              </div>
            </div>
            <div className="kk-card p-5">
              <div className="text-xs uppercase tracking-widest text-[var(--kk-text-dim)] mb-2">
                Delivery
              </div>
              <div className="font-semibold">{buyer?.name ?? "—"}</div>
              <div className="text-sm text-[var(--kk-text-dim)] flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {buyer?.city ?? ""}, {buyer?.state ?? ""}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Timeline status={order.status} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, accent }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="kk-card p-5"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: accent + "22", color: accent }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xs text-[var(--kk-text-dim)]">{label}</div>
      <div className="mt-1 font-bold text-lg" style={{ color: accent }}>{value}</div>
    </motion.div>
  );
}