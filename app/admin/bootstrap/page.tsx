"use client";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useSession } from "@/lib/session";

export default function AdminDashboard() {
  const { user } = useSession();
  return (
    <div>
      <PageHeader
        badge="Admin"
        badgeIcon={ShieldCheck}
        title={`Welcome, ${user?.name ?? "Admin"}`}
        subtitle={user?.email ?? ""}
      />
      <div className="kk-card p-12 text-center">
        <div className="text-5xl mb-3">🛡️</div>
        <p className="text-[var(--kk-text-dim)]">
          User management coming soon. Total users, delete, edit — to be built next.
        </p>
      </div>
    </div>
  );
}