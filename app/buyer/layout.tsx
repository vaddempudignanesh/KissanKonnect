// app/buyer/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ShoppingBasket, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/buyer",           label: "Dashboard", icon: LayoutDashboard },
  { href: "/buyer/listings",  label: "Browse",    icon: ShoppingBasket },
  { href: "/buyer/orders",    label: "Orders",    icon: Package },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
                  ? "bg-[var(--kk-amber)] text-[#0B0F19] border-[var(--kk-amber)] shadow-[0_0_20px_rgba(96,165,250,0.35)]"
                  : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-amber)] hover:text-[var(--kk-amber)]"
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