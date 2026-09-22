"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone, Lock, User as UserIcon, MapPin, Building2, Leaf,
  ChevronLeft, UserPlus, Sprout, ShoppingBasket,
} from "lucide-react";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useToast } from "@/components/Toast";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

type Role = "farmer" | "buyer";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { refreshSession } = useSession();

  const initialRole = (searchParams.get("role") as Role) || "farmer";
  const [role, setRole] = useState<Role>(initialRole);

  // Common fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Farmer
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  // Buyer
  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("");
  const [buyerType, setBuyerType] = useState<"mnc" | "local" | "exporter" | "hotel">("local");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Name is required"); return; }
    if (!/^\d{10}$/.test(phone)) { setError("Phone must be 10 digits"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    if (role === "farmer") {
      if (!village.trim() || !district.trim() || !state.trim()) {
        setError("Village, district and state are required");
        return;
      }
    } else {
      if (!companyName.trim() || !city.trim() || !state.trim()) {
        setError("Company name, city and state are required");
        return;
      }
    }

    setSubmitting(true);
    try {
      const body: any = { name, phone, password, role };
      if (role === "farmer") {
        body.village = village;
        body.district = district;
        body.state = state;
      } else {
        body.companyName = companyName;
        body.city = city;
        body.state = state;
        body.buyerType = buyerType;
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed");
        setSubmitting(false);
        return;
      }

      await refreshSession();
      toast(`Welcome, ${data.user.name}!`);
      router.push(role === "farmer" ? "/farmer" : "/buyer");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[var(--kk-surface-2)] border border-[var(--kk-border)] " +
    "text-[var(--kk-text)] placeholder:text-[var(--kk-text-dim)]/60 " +
    "focus:outline-none focus:border-[var(--kk-lime)] focus:ring-1 focus:ring-[var(--kk-lime)]/40 transition-all";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--kk-text-dim)] hover:text-[var(--kk-lime)] mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="kk-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-[var(--kk-lime)]/10 text-[var(--kk-lime)]">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-sm text-[var(--kk-text-dim)]">
                Join KisanKonnect in 30 seconds
              </p>
            </div>
          </div>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { id: "farmer", label: "I'm a Farmer", icon: Sprout },
              { id: "buyer",  label: "I'm a Buyer",  icon: ShoppingBasket },
            ] as const).map(({ id, label, icon: Icon }) => {
              const active = role === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                    active
                      ? "border-[var(--kk-lime)] bg-[var(--kk-lime)]/10"
                      : "border-[var(--kk-border)] hover:border-[var(--kk-green-light)]",
                  )}
                >
                  <Icon className={cn("w-5 h-5", active && "text-[var(--kk-lime)]")} />
                  <span className={cn("text-sm font-medium", active && "text-[var(--kk-lime)]")}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <div className="text-xs text-[var(--kk-text-dim)] mb-2 flex items-center gap-1">
                <UserIcon className="w-3 h-3" /> Full name
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rajesh Patil"
                className={inputClass}
              />
            </label>

            <label className="block">
              <div className="text-xs text-[var(--kk-text-dim)] mb-2 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone number
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
                className={inputClass}
              />
            </label>

            <label className="block">
              <div className="text-xs text-[var(--kk-text-dim)] mb-2 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Password (min 6 chars)
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className={inputClass}
              />
            </label>

            {role === "farmer" ? (
              <>
                <label className="block">
                  <div className="text-xs text-[var(--kk-text-dim)] mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Village / Town
                  </div>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Nashik"
                    className={inputClass}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-xs text-[var(--kk-text-dim)] mb-2">District</div>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Nashik"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs text-[var(--kk-text-dim)] mb-2">State</div>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className={inputClass}
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <label className="block">
                  <div className="text-xs text-[var(--kk-text-dim)] mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Company name
                  </div>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Reliance Fresh"
                    className={inputClass}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-xs text-[var(--kk-text-dim)] mb-2">City</div>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Delhi"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs text-[var(--kk-text-dim)] mb-2">State</div>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Delhi"
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className="block">
                  <div className="text-xs text-[var(--kk-text-dim)] mb-2">Buyer type</div>
                  <select
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value as any)}
                    className={inputClass}
                  >
                    <option value="mnc">MNC / National chain</option>
                    <option value="local">Local trader</option>
                    <option value="exporter">Exporter</option>
                    <option value="hotel">Hotel / Restaurant</option>
                  </select>
                </label>
              </>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                {error}
              </div>
            )}

            <AnimatedButton
              size="lg"
              onClick={() => {}}
              disabled={submitting}
              className="w-full"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? "Creating account…" : "Create account"}
            </AnimatedButton>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--kk-text-dim)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--kk-lime)] hover:underline font-medium"
            >
              Log in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}