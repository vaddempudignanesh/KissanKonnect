// app/farmer/layout.tsx
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
    if (role !== "farmer") {
      const t = setTimeout(() => {}, 0);
      return () => clearTimeout(t);
    }
  }, [role, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                active
                  ? "bg-[var(--kk-lime)] text-white border-[var(--kk-lime)] shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                  : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]"
              )}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </Link>
          );
        })}
      </div>

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