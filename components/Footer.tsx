// components/Footer.tsx
// PURPOSE: Global footer. Contains brand, quick links, and made-with line.
"use client";

import Link from "next/link";
import { Leaf, Github, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[var(--kk-border)]
                       bg-[var(--kk-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12
                      grid md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-[var(--kk-green)] text-[var(--kk-lime)]">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">{t("brand.name")}</span>
          </div>
          <p className="text-sm text-[var(--kk-text-dim)] max-w-xs">
            {t("footer.tag")}
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--kk-lime)] mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm text-[var(--kk-text-dim)]">
            <li><Link href="/market" className="hover:text-[var(--kk-text)] transition-colors">{t("nav.market")}</Link></li>
            <li><Link href="/farmer" className="hover:text-[var(--kk-text)] transition-colors">{t("nav.farmer")}</Link></li>
            <li><Link href="/buyer" className="hover:text-[var(--kk-text)] transition-colors">{t("nav.buyer")}</Link></li>
            <li><Link href="/tracking/ORD-2026-001" className="hover:text-[var(--kk-text)] transition-colors">{t("nav.tracking")}</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--kk-lime)] mb-3">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-[var(--kk-text-dim)]">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> hello@kisankonnect.in
            </li>
            <li className="flex items-center gap-2">
              <Github className="w-4 h-4" /> github.com/kisankonnect
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--kk-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4
                        flex items-center justify-between text-xs
                        text-[var(--kk-text-dim)]">
          <span>© {year} {t("brand.name")}. {t("footer.rights")}</span>
          <span>Made with 🌱 for SIH</span>
        </div>
      </div>
    </footer>
  );
}