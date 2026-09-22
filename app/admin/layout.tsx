"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/logistics", label: "Dashboard", icon: LayoutDashboard },
];

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  const { role, ready } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && role !== "logistics") {
      router.replace("/login?next=" + encodeURIComponent(pathname));
    }
  }, [ready, role, router, pathname]);

  if (!ready) return <div className="py-20 text-center text-[var(--kk-text-dim)]">Loading…</div>;
  if (role !== "admin") return <div className="py-20 text-center text-[var(--kk-text-dim)]">Redirecting…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link key={n.href} href={n.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                active
                  ? "bg-[var(--kk-lime)] text-white border-[var(--kk-lime)]"
                  : "border-[var(--kk-border)] text-[var(--kk-text-dim)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]",
              )}>
              <n.icon className="w-4 h-4" />
              {n.label}
            </Link>
          );
        })}
      </div>
      <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {children}
      </motion.div>
    </div>
  );
}