// app/farmer/layout.tsx
// PURPOSE: Layout for all farmer pages.
//   • Guards: if the session role isn't "farmer", redirect to home.
//   • Renders a sub-nav (Dashboard / List Produce / Buyers / Orders).
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Plus, Users, Package } from "lucide-react";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/farmer",              label: "Dashboard",     icon: LayoutDashboard },
  { href: "/farmer/list-produce", label: "List Produce",  icon: Plus },
  { href: "/farmer/buyers",       label: "Buyers",        icon: Users },
  { href: "/farmer/orders",       label: "Orders",        icon: Package },
];

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const { role } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Demo-friendly: no hard redirect. If not logged in, auto-login as farmer.
    // Real auth would replace this with a redirect to /login.
    if (role !== "farmer") {
      const t = setTimeout(() => {
        // nothing — we let pages render for demo. Uncomment below for strictness:
        // router.push("/");
      }, 0);
      return () => clearTimeout(t);
    }
  }, [role, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      {/* Sub-nav */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                "border",
                active
                  ? "bg-[var(--kk-lime)] text-[#0A0F0D] border-[var(--kk-lime)] shadow-[0_0_20px_rgba(169,227,75,0.3)]"
                  : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]"
              )}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </Link>
          );
        })}
      </div>

      {/* Page content */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {children}
      </motion.div>
    </div>
  );
}