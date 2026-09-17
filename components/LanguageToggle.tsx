// components/LanguageToggle.tsx
// PURPOSE: English ⇄ हिंदी switch. Animated. Persists via I18nProvider.
"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  const next = lang === "en" ? "hi" : "en";

  return (
    <motion.button
      onClick={() => setLang(next)}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl
                 bg-[var(--kk-surface-2)] border border-[var(--kk-border)]
                 text-sm font-medium text-[var(--kk-text)]
                 hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)]
                 transition-colors"
      title="Change language"
    >
      <Languages className="w-4 h-4" />
      <span>{lang === "en" ? "EN" : "हि"}</span>
    </motion.button>
  );
}