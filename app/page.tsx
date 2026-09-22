// app/page.tsx
// PURPOSE: Fully animated landing page (premium dark theme).
//
// SCROLL FLOW:
//   1. On load → only hero is visible.
//   2. Continue scrolling → stats fly in, features rise, testimonials slide,
//      CTA zooms.
//   3. At the bottom, two big parallax cards: "For Farmers" and "For Buyers".
"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion, AnimatePresence, useScroll, useTransform,
} from "framer-motion";
import {
  Sprout, TrendingUp, Truck, Sparkles, ArrowRight, Quote, Star,
  ShoppingBasket, Leaf, LogIn, UserPlus, CheckCircle2,
} from "lucide-react";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--kk-lime)] opacity-[0.06] blur-[120px]" />
        <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-[var(--kk-amber)] opacity-[0.04] blur-[120px]" />
      </div>

      {/* ============================================================= */}
      {/* 1. HERO                                                         */}
      {/* ============================================================= */}
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="kk-badge mb-6 inline-flex"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("hero.badge")}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-6 text-lg text-[var(--kk-text-dim)] max-w-xl"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <AnimatedButton href="/farmer" size="lg">
              <Sprout className="w-5 h-5" />
              {t("hero.cta.primary")}
            </AnimatedButton>
            <AnimatedButton href="/market" size="lg" variant="ghost">
              <TrendingUp className="w-5 h-5" />
              {t("hero.cta.secondary")}
            </AnimatedButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 flex items-center gap-3 text-xs text-[var(--kk-text-dim)]"
          >
            <div className="flex -space-x-2">
              {["🧑‍🌾", "👩‍🌾", "🧑‍🌾", "👩‍🌾"].map((e, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-[var(--kk-surface-2)] border border-[var(--kk-border)] flex items-center justify-center text-sm"
                >
                  {e}
                </div>
              ))}
            </div>
            <span>Trusted by 50,000+ Indian farmers</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ============================================================= */}
      {/* 2. STATS — fly in with flip + fade on scroll                    */}
      {/* ============================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24">
        <FlyingStat emoji="🧑‍🌾" value={50000} label="Farmers onboard"      suffix="+" delay={0}    />
        <FlyingStat emoji="📍"   value={1240}  label="Cities covered"              delay={0.1}  />
        <FlyingStat emoji="📈"   value={85}    label="Avg. profit increase" suffix="%" delay={0.2} />
        <FlyingStat emoji="💰"   value={420}   label="Paid to farmers"      prefix="₹" suffix=" Cr" delay={0.3} />
      </div>

      {/* ============================================================= */}
      {/* 3. FEATURES — rise with spring lift on scroll                   */}
      {/* ============================================================= */}
      <div className="grid md:grid-cols-3 gap-6 mt-24">
        {[
          { icon: TrendingUp, title: "Live Prices",   desc: "Real mandi rates across India, updated every hour." },
          { icon: Sprout,     title: "Direct Buyers", desc: "Sell straight to Reliance, BigBasket, Amazon Fresh." },
          { icon: Truck,      title: "Live Tracking", desc: "Track your truck from pickup to delivery in real time." },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 60, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.12, duration: 0.7, type: "spring", stiffness: 60, damping: 14 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="kk-card p-6 group"
          >
            <div className="p-3 rounded-xl bg-[var(--kk-lime)]/10 text-[var(--kk-lime)] w-fit transition-transform group-hover:scale-110 group-hover:rotate-6">
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-[var(--kk-text-dim)]">{f.desc}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-[var(--kk-lime)] opacity-60 group-hover:opacity-100 transition-opacity">
              Learn more <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ============================================================= */}
      {/* 4. TESTIMONIALS                                                 */}
      {/* ============================================================= */}
      <Testimonials />

      {/* ============================================================= */}
      {/* 5. FINAL CTA                                                    */}
      {/* ============================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mt-24 kk-card p-10 sm:p-14 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[var(--kk-lime)] opacity-10 blur-[100px]"
            animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[var(--kk-amber)] opacity-10 blur-[100px]"
            animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to sell at the best price?
          </h2>
          <p className="mt-4 text-[var(--kk-text-dim)] max-w-xl mx-auto">
            Join 50,000+ Indian farmers already getting fair prices from national
            buyers. No middlemen. No commission games.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <AnimatedButton href="/farmer" size="lg">
              <Sprout className="w-5 h-5" /> Start Selling
            </AnimatedButton>
            <AnimatedButton href="/market" size="lg" variant="ghost">
              <TrendingUp className="w-5 h-5" /> See Market Prices
            </AnimatedButton>
          </div>
        </div>
      </motion.div>

      {/* ============================================================= */}
      {/* 6. TWO BIG PARALLAX CARDS — For Farmers / For Buyers            */}
      {/* ============================================================= */}
      <RolePanels />
    </section>
  );
}

/* =============================================================================
   FlyingStat — stats that fly in with a flip + fade on scroll
   ========================================================================== */
function FlyingStat({
  emoji, value, label, prefix = "", suffix = "", delay = 0,
}: {
  emoji: string; value: number; label: string; prefix?: string; suffix?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: -60 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.7, type: "spring", stiffness: 60, damping: 14 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="kk-card p-6 relative overflow-hidden"
      style={{ transformStyle: "preserve-3d", perspective: 800 }}
    >
      <motion.div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[var(--kk-lime)] opacity-10 blur-3xl"
        animate={{ scale: [1, 1.25, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative">
        <div className="text-3xl">{emoji}</div>
        <div className="mt-3">
          <Counter value={value} prefix={prefix} suffix={suffix} label={label} />
        </div>
      </div>
    </motion.div>
  );
}

/* Tiny counter that animates from 0 → value on mount */
function Counter({
  value, prefix = "", suffix = "", label,
}: { value: number; prefix?: string; suffix?: string; label: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <>
      <div className="text-3xl font-bold text-[var(--kk-lime)]">
        {prefix}{n.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="mt-1 text-sm text-[var(--kk-text-dim)]">{label}</div>
    </>
  );
}

/* =============================================================================
   TESTIMONIALS — slide + scale in on scroll, auto-rotate
   ========================================================================== */
function Testimonials() {
  const quotes = [
    { name: "Rajesh Patil",  role: "Tomato farmer, Nashik",  quote: "I used to get ₹12/kg from the local middleman. KisanKonnect got me ₹22/kg from Reliance. Same tomatoes." },
    { name: "Sunita Devi",   role: "Wheat farmer, Karnal",   quote: "Payment comes directly to my bank account. No chasing, no excuses, no cuts." },
    { name: "Mohan Reddy",   role: "Onion farmer, Warangal", quote: "The tracking page shows me exactly where my truck is. I can plan the next harvest around it." },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % quotes.length), 5000);
    return () => clearInterval(id);
  }, [quotes.length]);

  const q = quotes[i];

  return (
    <div className="mt-24">
      <div className="text-center mb-10">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="kk-badge mb-4 inline-flex"
        >
          <Quote className="w-3.5 h-3.5" /> Farmers love it
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold tracking-tight"
        >
          Real farmers. Real prices.
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, type: "spring", stiffness: 50, damping: 14 }}
        className="max-w-3xl mx-auto relative h-[240px]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
            className="kk-card p-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--kk-surface-2)] border border-[var(--kk-border)] flex items-center justify-center text-3xl">
                🧑‍🌾
              </div>
            </div>
            <p className="text-lg italic leading-relaxed">"{q.quote}"</p>
            <div className="mt-6">
              <div className="font-semibold">{q.name}</div>
              <div className="text-sm text-[var(--kk-text-dim)]">{q.role}</div>
              <div className="mt-2 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-[var(--kk-amber)] text-[var(--kk-amber)]" />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
          {quotes.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all ${
                k === i ? "w-8 bg-[var(--kk-lime)]" : "w-1.5 bg-[var(--kk-border)]"
              }`}
              aria-label={`Show quote ${k + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* =============================================================================
   ROLE PANELS — two big parallax cards at the bottom
   ========================================================================== */
function RolePanels() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yFarmer = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yBuyer  = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-6 mt-24">
      {/* ---------------- FARMER PANEL ---------------- */}
      <motion.div
        style={{ y: yFarmer }}
        initial={{ opacity: 0, x: -60, rotate: -3 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, type: "spring", stiffness: 50, damping: 14 }}
        className="kk-card p-8 relative overflow-hidden group"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[var(--kk-lime)] opacity-10 blur-[100px] group-hover:opacity-20 transition-opacity" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--kk-lime)]/15 text-[var(--kk-lime)] text-xs font-bold mb-5 border border-[var(--kk-lime)]/30">
            <Leaf className="w-3.5 h-3.5" /> FOR FARMERS
          </div>

          <h3 className="text-3xl font-bold tracking-tight">
            Sell your harvest.
            <br />
            <span className="text-[var(--kk-lime)]">Earn what you deserve.</span>
          </h3>

          <p className="mt-4 text-[var(--kk-text-dim)]">
            List your crops, see live mandi prices, and sell directly to buyers
            across India. Trucks come to you. Payment lands in your bank.
          </p>

          <ul className="mt-6 space-y-2.5 text-sm">
            {[
              "Real-time prices from 1,200+ mandis",
              "Verified MNC buyers like Reliance, BigBasket",
              "Live shipment tracking",
              "Escrow-protected payments",
            ].map((li) => (
              <li key={li} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--kk-lime)] mt-0.5 shrink-0" />
                <span className="text-[var(--kk-text-dim)]">{li}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <AnimatedButton href="/farmer" size="md" variant="primary">
              <LogIn className="w-4 h-4" /> Login as Farmer
            </AnimatedButton>
            <AnimatedButton href="/farmer" size="md" variant="ghost">
              <UserPlus className="w-4 h-4" /> Sign Up
            </AnimatedButton>
          </div>
        </div>
      </motion.div>

      {/* ---------------- BUYER PANEL ---------------- */}
      <motion.div
        style={{ y: yBuyer }}
        initial={{ opacity: 0, x: 60, rotate: 3 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, type: "spring", stiffness: 50, damping: 14 }}
        className="kk-card p-8 relative overflow-hidden group"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--kk-amber)] opacity-10 blur-[100px] group-hover:opacity-20 transition-opacity" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--kk-amber)]/15 text-[var(--kk-amber)] text-xs font-bold mb-5 border border-[var(--kk-amber)]/30">
            <ShoppingBasket className="w-3.5 h-3.5" /> FOR BUYERS
          </div>

          <h3 className="text-3xl font-bold tracking-tight">
            Source fresh produce.
            <br />
            <span className="text-[var(--kk-amber)]">Direct from farms.</span>
          </h3>

          <p className="mt-4 text-[var(--kk-text-dim)]">
            Browse verified farmer listings across India, negotiate fairly, and
            receive shipments with full quality and origin tracking.
          </p>

          <ul className="mt-6 space-y-2.5 text-sm">
            {[
              "Verified farmer network, quality-graded",
              "Bulk pricing direct from source",
              "Live logistics visibility",
              "Escrow + audit trail for every order",
            ].map((li) => (
              <li key={li} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--kk-amber)] mt-0.5 shrink-0" />
                <span className="text-[var(--kk-text-dim)]">{li}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <AnimatedButton href="/buyer" size="md" variant="secondary">
              <LogIn className="w-4 h-4" /> Login as Buyer
            </AnimatedButton>
            <AnimatedButton href="/buyer" size="md" variant="ghost">
              <UserPlus className="w-4 h-4" /> Sign Up
            </AnimatedButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}