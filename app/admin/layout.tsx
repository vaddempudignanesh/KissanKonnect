"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, ready } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Don't guard the bootstrap page
  const isBootstrap = pathname === "/admin/bootstrap";

  useEffect(() => {
    if (isBootstrap) return;
    if (ready && role !== "admin") {
      router.replace("/login?next=" + encodeURIComponent(pathname));
    }
  }, [ready, role, router, pathname, isBootstrap]);

  // Bootstrap page renders naked (no nav, no auth check)
  if (isBootstrap) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="py-20 text-center text-[var(--kk-text-dim)]">Loading…</div>;
  }
  if (role !== "admin") {
    return <div className="py-20 text-center text-[var(--kk-text-dim)]">Redirecting…</div>;
  }

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
                  ? "bg-[#111111] text-white border-[#111111]"
                  : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[#111111] hover:text-[#111111]",
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