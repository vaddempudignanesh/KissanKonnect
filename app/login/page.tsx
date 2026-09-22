"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Lock, LogIn, Leaf, ChevronLeft } from "lucide-react";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useToast } from "@/components/Toast";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

function destinationForRole(role: string): string {
  switch (role) {
    case "farmer":    return "/farmer";
    case "buyer":     return "/buyer";
    case "logistics": return "/logistics";
    case "fpo":       return "/fpo";
    case "admin":     return "/admin";
    default:          return "/";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { refreshSession } = useSession();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{10}$/.test(phone)) { setError("Phone must be 10 digits"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        setSubmitting(false);
        return;
      }

      await refreshSession();

      toast(`Welcome back, ${data.user.name}!`);
      const next = searchParams.get("next");
      router.push(next ?? destinationForRole(data.user.role));
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--kk-text-dim)] hover:text-[var(--kk-lime)] mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="kk-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-[var(--kk-lime)]/10 text-[var(--kk-lime)]">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm text-[var(--kk-text-dim)]">
                Log in to your KisanKonnect account
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <div className="text-xs text-[var(--kk-text-dim)] mb-2 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone number
              </div>
              <input
                type="tel" inputMode="numeric" maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
                className="w-full px-4 py-3 rounded-xl bg-[var(--kk-surface-2)] border border-[var(--kk-border)]
                           text-[var(--kk-text)] placeholder:text-[var(--kk-text-dim)]/60
                           focus:outline-none focus:border-[var(--kk-lime)] focus:ring-1 focus:ring-[var(--kk-lime)]/40 transition-all"
              />
            </label>

            <label className="block">
              <div className="text-xs text-[var(--kk-text-dim)] mb-2 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Password
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl bg-[var(--kk-surface-2)] border border-[var(--kk-border)]
                           text-[var(--kk-text)] placeholder:text-[var(--kk-text-dim)]/60
                           focus:outline-none focus:border-[var(--kk-lime)] focus:ring-1 focus:ring-[var(--kk-lime)]/40 transition-all"
              />
            </label>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                {error}
              </div>
            )}

            <AnimatedButton size="lg" onClick={() => {}} disabled={submitting} className="w-full">
              <LogIn className="w-4 h-4" />
              {submitting ? "Logging in…" : "Log in"}
            </AnimatedButton>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--kk-text-dim)]">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[var(--kk-lime)] hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}