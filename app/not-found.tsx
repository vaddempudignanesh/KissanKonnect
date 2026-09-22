// app/not-found.tsx
import Link from "next/link";
import { Leaf, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-32 text-center">
      <div className="inline-flex p-4 rounded-2xl bg-[var(--kk-lime)]/10 text-[var(--kk-lime)] mb-6">
        <Leaf className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-[var(--kk-text-dim)]">
        This field hasn't been planted yet.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--kk-lime)] text-white font-semibold hover:scale-105 transition-transform"
        >
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link
          href="/market"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--kk-border)] text-[var(--kk-text)] hover:border-[var(--kk-lime)] hover:text-[var(--kk-lime)] transition-colors"
        >
          See Market Prices
        </Link>
      </div>
    </div>
  );
}