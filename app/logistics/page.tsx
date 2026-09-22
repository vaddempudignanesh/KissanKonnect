"use client";
import { Truck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useSession } from "@/lib/session";

export default function LogisticsDashboard() {
  const { logistics } = useSession();
  return (
    <div>
      <PageHeader
        badge="Logistics Dashboard"
        badgeIcon={Truck}
        title={`Welcome, ${logistics?.company_name ?? "Logistics"}`}
        subtitle={`${logistics?.city ?? ""}, ${logistics?.state ?? ""} · ${logistics?.vehicle_count ?? 0} vehicles`}
      />
      <div className="kk-card p-12 text-center">
        <div className="text-5xl mb-3">🚚</div>
        <p className="text-[var(--kk-text-dim)]">
          No shipments assigned yet. Once orders are accepted, they'll appear here.
        </p>
      </div>
    </div>
  );
}