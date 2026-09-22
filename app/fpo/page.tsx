"use client";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useSession } from "@/lib/session";

export default function FpoDashboard() {
  const { fpo } = useSession();
  return (
    <div>
      <PageHeader
        badge="FPO Dashboard"
        badgeIcon={Users}
        title={`Welcome, ${fpo?.fpo_name ?? "FPO"}`}
        subtitle={`${fpo?.village ?? ""}, ${fpo?.district ?? ""}, ${fpo?.state ?? ""} · ${fpo?.member_count ?? 0} members`}
      />
      <div className="kk-card p-12 text-center">
        <div className="text-5xl mb-3">🏘️</div>
        <p className="text-[var(--kk-text-dim)]">
          No aggregated produce yet. Add member harvests here.
        </p>
      </div>
    </div>
  );
}