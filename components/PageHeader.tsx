// components/PageHeader.tsx
// PURPOSE: Consistent header used by every inner page.
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ badge, badgeIcon: BadgeIcon, title, subtitle, actions }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
    >
      <div>
        {badge && (
          <span className="kk-badge mb-3 inline-flex">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
            {badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--kk-text)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-[var(--kk-text-dim)] max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </motion.div>
  );
}