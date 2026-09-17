// components/Navbar.tsx
// PURPOSE: Top navigation for the entire app.
//          - Sticky, translucent glass effect
//          - Shows different links when logged in as Farmer vs Buyer
//          - Language toggle always visible
//          - "Login" button switches to "Logout" when a role is active
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, UserCircle2, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatedButton } from "./AnimatedButton";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useI18n();
  const { role, farmer, buyer, logout } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/market", label: t("nav.market") },
    ...(role === "farmer"
      ? [{ href: "/farmer", label: t("nav.farmer") },
         { href: "/farmer/buyers", label: "Buyers" },
         { href: "/farmer/orders", label: "My Orders" }]
      : []),
    ...(role === "buyer"
      ? [{ href: "/buyer", label: t("nav.buyer") },
         { href: "/buyer/listings", label: "Browse" },
         { href: "/buyer/orders", label: "My Orders" }]
      : []),
    { href: "/tracking/ORD-2026-001", label: t("nav.tracking") },
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-xl
                 bg-[rgba(10,15,13,0.75)]
                 border-b border-[var(--kk-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ---------- Brand ---------- */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-2 rounded-xl bg-[var(--kk-green)] text-[var(--kk-lime)]"
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
                    "kk-nav-link text-sm font-medium transition-colors",
                    active
                      ? "text-[var(--kk-lime)]"
                      : "text-[var(--kk-text-dim)] hover:text-[var(--kk-text)]"
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
                    {farmer?.name ?? buyer?.name}
                  </span>
                  <span className="kk-badge ml-1">
                    {role === "farmer" ? "Farmer" : "Buyer"}
                  </span>
                </div>
                <AnimatedButton variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  {t("nav.logout")}
                </AnimatedButton>
              </>
            ) : (
              <LoginMenu />
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
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--kk-border)]">
                <LanguageToggle />
                {role ? (
                  <AnimatedButton variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                    {t("nav.logout")}
                  </AnimatedButton>
                ) : (
                  <LoginMenu mobile />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/* LoginMenu — dropdown with "Continue as Farmer" / "Continue as Buyer" */
/* ------------------------------------------------------------------ */
function LoginMenu({ mobile }: { mobile?: boolean }) {
  const { t } = useI18n();
  const { loginAsFarmer, loginAsBuyer } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <AnimatedButton
        variant="primary"
        size="sm"
        onClick={() => setOpen((v) => !v)}
      >
        {t("nav.login")}
      </AnimatedButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute right-0 mt-2 w-56 p-2 rounded-2xl",
              "bg-[var(--kk-surface)] border border-[var(--kk-border)]",
              "shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
              mobile && "static mt-3 w-full"
            )}
          >
            <button
              onClick={() => { loginAsFarmer(); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm
                         hover:bg-[var(--kk-surface-2)] transition-colors"
            >
              🌾 {t("nav.role.farmer")}
            </button>
            <button
              onClick={() => { loginAsBuyer(); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm
                         hover:bg-[var(--kk-surface-2)] transition-colors"
            >
              🏢 {t("nav.role.buyer")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}