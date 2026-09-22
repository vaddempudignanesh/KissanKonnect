"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, UserCircle2, LogOut, Menu, X, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { AnimatedButton } from "./AnimatedButton";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useI18n();
  const { role, user, farmer, buyer, logout } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/market", label: t("nav.market") },
    ...(role === "farmer"
      ? [
          { href: "/farmer", label: t("nav.farmer") },
          { href: "/farmer/buyers", label: "Buyers" },
          { href: "/farmer/orders", label: "My Orders" },
        ]
      : []),
    ...(role === "buyer"
      ? [
          { href: "/buyer", label: t("nav.buyer") },
          { href: "/buyer/listings", label: "Browse" },
          { href: "/buyer/orders", label: "My Orders" },
        ]
      : []),
  ];

  const displayName = farmer?.name ?? buyer?.company_name ?? user?.name ?? "";

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setMobileOpen(false);
    try {
      await logout();
    } finally {
      // Send them home
      router.push("/");
      // Small delay so the router transition feels smooth
      setTimeout(() => setLoggingOut(false), 400);
    }
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-xl
                 bg-[rgba(11,15,25,0.75)]
                 border-b border-[var(--kk-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ---------- Brand ---------- */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-2 rounded-xl bg-[var(--kk-lime)]/15 text-[var(--kk-lime)]"
            >
              <Leaf className="w-5 h-5" />
            </motion.div>
            <div className="leading-tight">
              <div className="font-bold text-[var(--kk-text)]">
                {t("brand.name")}
              </div>
              <div className="text-[10px] text-[var(--kk-text-dim)] hidden sm:block">
                {t("brand.tagline")}
              </div>
            </div>
          </Link>

          {/* ---------- Desktop links ---------- */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    active
                      ? "text-[var(--kk-lime)]"
                      : "text-[var(--kk-text-dim)] hover:text-[var(--kk-text)]",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* ---------- Right actions ---------- */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />

            {role ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                                bg-[var(--kk-surface-2)] border border-[var(--kk-border)]">
                  <UserCircle2 className="w-4 h-4 text-[var(--kk-lime)]" />
                  <span className="text-sm text-[var(--kk-text)]">
                    {displayName}
                  </span>
                  <span className="kk-badge ml-1">
                    {role === "farmer" ? "Farmer" : "Buyer"}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  disabled={loggingOut}
                  className={cn(
                    "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold",
                    "border border-[var(--kk-border)] text-[var(--kk-text-dim)]",
                    "hover:border-[var(--kk-terracotta)] hover:text-[var(--kk-terracotta)]",
                    "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {loggingOut ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent"
                      />
                      Logging out…
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <AnimatedButton variant="ghost" size="sm">
                    <LogIn className="w-4 h-4" />
                    {t("nav.login")}
                  </AnimatedButton>
                </Link>
                <Link href="/signup">
                  <AnimatedButton variant="primary" size="sm">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </AnimatedButton>
                </Link>
              </>
            )}
          </div>

          {/* ---------- Mobile toggle ---------- */}
          <button
            className="md:hidden p-2 rounded-lg border border-[var(--kk-border)]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ---------- Mobile drawer ---------- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-[var(--kk-border)]
                       bg-[var(--kk-surface)] overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[var(--kk-text)] py-2"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--kk-border)]">
                <LanguageToggle />
                {role ? (
                  <button
                    onClick={onLogout}
                    disabled={loggingOut}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold
                               border border-[var(--kk-border)] text-[var(--kk-text-dim)]
                               hover:border-[var(--kk-terracotta)] hover:text-[var(--kk-terracotta)]
                               disabled:opacity-50 transition-colors"
                  >
                    {loggingOut ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent"
                        />
                        Logging out…
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" /> {t("nav.logout")}
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <AnimatedButton variant="ghost" size="sm">
                        <LogIn className="w-4 h-4" /> Login
                      </AnimatedButton>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}>
                      <AnimatedButton variant="primary" size="sm">
                        <UserPlus className="w-4 h-4" /> Sign Up
                      </AnimatedButton>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}