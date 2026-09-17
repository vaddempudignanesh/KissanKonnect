// app/page.tsx
// PURPOSE: Fully animated landing page.
//
// SCROLL FLOW:
//   1. On load → only hero is visible. Nothing below peeks into the viewport.
//   2. Scroll past hero → 20 produce cards spiral in from top-right to their
//      arc positions. Center card highlighted. Loop completes.
//   3. Continue scrolling → stats fly in, features rise, testimonials slide,
//      CTA zooms.
//   4. At the bottom, two big parallax cards: "For Farmers" and "For Buyers",
//      each with login/signup buttons in its own palette.
"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion, AnimatePresence, useScroll, useTransform,
} from "framer-motion";
import {
  Sprout, TrendingUp, Truck, Sparkles, ArrowRight, Quote, Star,
  ShoppingBasket, Leaf, HandCoins, LogIn, UserPlus, CheckCircle2,
} from "lucide-react";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useI18n } from "@/lib/i18n";

// -----------------------------------------------------------------------------
// 20 PRODUCE CARDS
// -----------------------------------------------------------------------------
interface ArcCard {
  id: string; emoji: string; title: string; subtitle: string;
  price: string; accent: string;
}

const ARC_CARDS: ArcCard[] = [
  { id: "tomato",   emoji: "🍅", title: "Tomatoes",       subtitle: "700 kg · Grade A",   price: "₹22/kg",  accent: "#C75B39" },
  { id: "onion",    emoji: "🧅", title: "Red Onions",     subtitle: "1,500 kg · Grade B", price: "₹18/kg",  accent: "#B23B6B" },
  { id: "potato",   emoji: "🥔", title: "Potatoes",       subtitle: "3,000 kg · Grade A", price: "₹14/kg",  accent: "#A67C52" },
  { id: "carrot",   emoji: "🥕", title: "Carrots",        subtitle: "900 kg · Grade A",   price: "₹24/kg",  accent: "#E67E22" },
  { id: "corn",     emoji: "🌽", title: "Sweet Corn",     subtitle: "1,200 kg · Grade A", price: "₹19/kg",  accent: "#F1C40F" },
  { id: "cabbage",  emoji: "🥬", title: "Cabbage",        subtitle: "2,200 kg · Grade B", price: "₹12/kg",  accent: "#27AE60" },
  { id: "broccoli", emoji: "🥦", title: "Broccoli",       subtitle: "400 kg · Grade A",   price: "₹48/kg",  accent: "#16A085" },
  { id: "apple",    emoji: "🍎", title: "Apples",         subtitle: "800 kg · Grade A",   price: "₹95/kg",  accent: "#C0392B" },
  { id: "banana",   emoji: "🍌", title: "Bananas",        subtitle: "1,800 kg · Grade A", price: "₹32/kg",  accent: "#F1C40F" },
  { id: "orange",   emoji: "🍊", title: "Oranges",        subtitle: "1,100 kg · Grade A", price: "₹45/kg",  accent: "#E67E22" },
  { id: "grapes",   emoji: "🍇", title: "Grapes",         subtitle: "600 kg · Grade A",   price: "₹78/kg",  accent: "#8E44AD" },
  { id: "strawberry",emoji:"🍓", title: "Strawberries",   subtitle: "250 kg · Grade A",   price: "₹140/kg", accent: "#E74C3C" },
  { id: "mango",    emoji: "🥭", title: "Mangoes",        subtitle: "1,000 kg · Grade A", price: "₹88/kg",  accent: "#F39C12" },
  { id: "pineapple",emoji: "🍍", title: "Pineapples",     subtitle: "500 kg · Grade A",   price: "₹55/kg",  accent: "#F1C40F" },
  { id: "watermelon",emoji:"🍉", title: "Watermelons",    subtitle: "2,000 kg · Grade A", price: "₹18/kg",  accent: "#27AE60" },
  { id: "peach",    emoji: "🍑", title: "Peaches",        subtitle: "400 kg · Grade A",   price: "₹92/kg",  accent: "#E67E22" },
  { id: "cherry",   emoji: "🍒", title: "Cherries",       subtitle: "180 kg · Grade A",   price: "₹180/kg", accent: "#C0392B" },
  { id: "kiwi",     emoji: "🥝", title: "Kiwis",          subtitle: "300 kg · Grade A",   price: "₹120/kg", accent: "#7D3C98" },
  { id: "lemon",    emoji: "🍋", title: "Lemons",         subtitle: "700 kg · Grade A",   price: "₹36/kg",  accent: "#F1C40F" },
  { id: "truck",    emoji: "🚚", title: "Order Dispatched",subtitle: "Nashik → Delhi",    price: "₹15,246", accent: "#A9E34B" },
];

export default function HomePage() {
  const { t } = useI18n();

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--kk-green-light)] opacity-20 blur-[120px]" />
        <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-[var(--kk-lime)] opacity-10 blur-[120px]" />
      </div>

      {/* ============================================================= */}
      {/* 1. HERO — only this is visible on load                          */}
      {/* ============================================================= */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[560px]">
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

        <div className="relative h-[520px] w-full hidden lg:block">
          <ShufflingCard emoji="🍅" title="Fresh Tomatoes" subtitle="700 kg · Grade A" price="₹22/kg"   accent="#C75B39" top="4%"  left="0%"  delay={0.6} />
          <RecedingCard  emoji="🌾" title="Wheat Harvest"  subtitle="2,000 kg · Grade A" price="₹28/kg" accent="#F4A300" top="32%" left="22%" delay={0.8} />
          <SlidingInCard emoji="🚚" title="Order Dispatched" subtitle="Nashik → Delhi"   price="₹15,246" accent="#A9E34B" top="60%" left="8%"  delay={1.0} />
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. SPIRAL ARC — 20 cards spiral in from top-right on scroll     */}
      {/* ============================================================= */}
      <SpiralCarousel />

      {/* ============================================================= */}
      {/* 3. STATS — fly in with flip + fade on scroll                    */}
      {/* ============================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24">
        <FlyingStat emoji="🧑‍🌾" value={50000} label="Farmers onboard"      suffix="+" delay={0}    />
        <FlyingStat emoji="📍"   value={1240}  label="Cities covered"              delay={0.1}  />
        <FlyingStat emoji="📈"   value={85}    label="Avg. profit increase" suffix="%" delay={0.2} />
        <FlyingStat emoji="💰"   value={420}   label="Paid to farmers"      prefix="₹" suffix=" Cr" delay={0.3} />
      </div>

      {/* ============================================================= */}
      {/* 4. FEATURES — rise with spring lift on scroll                   */}
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
            <div className="p-3 rounded-xl bg-[var(--kk-green)] text-[var(--kk-lime)] w-fit transition-transform group-hover:scale-110 group-hover:rotate-6">
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
      {/* 5. TESTIMONIALS — slide + scale in on scroll                    */}
      {/* ============================================================= */}
      <Testimonials />

      {/* ============================================================= */}
      {/* 6. FINAL CTA — zoom + glow bloom                                */}
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
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[var(--kk-green-light)] opacity-15 blur-[100px]"
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
      {/* 7. TWO BIG PARALLAX CARDS — For Farmers / For Buyers            */}
      {/* ============================================================= */}
      <RolePanels />
    </section>
  );
}

/* =============================================================================
   SPIRAL CAROUSEL
   ---------------------------------------------------------------------------
   - 20 cards spiral in from top-right as you scroll into the section.
   - Cards settle into a half-circle arc (open side up).
   - Center card is highlighted (bigger, glowing).
   - After the section is fully scrolled past, the rotation stops and the
     spiral is complete.
   ========================================================================== */
function SpiralCarousel() {
  const ref = useRef<HTMLDivElement>(null);

  // 0 → 1 as the section travels through the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],   // start when section enters bottom, end when it leaves top
  });

  // 0 → 1 mapped to "how far through the section we've scrolled"
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setProgress(v));
    return () => unsub();
  }, [scrollYProgress]);

  // Angle of the arc: cards spread across the visible half-circle
  const N = ARC_CARDS.length;
  const anglePerCard = 18;
  const radius = 520;
  const FADE_START = 55;
  const FADE_END = 92;

  // The "current" card index advances with scroll from 0 → N-1
  const currentIndex = Math.min(N - 1, Math.floor(progress * N));

  return (
    <div ref={ref} className="relative mt-24" style={{ height: "900px" }}>
      <div className="sticky top-24">
        <div className="text-center mb-6">
          <span className="kk-badge mb-4 inline-flex">
            <Sparkles className="w-3.5 h-3.5" />
            Live from Indian farms
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Fresh produce, real prices
          </h2>
          <p className="mt-3 text-[var(--kk-text-dim)] max-w-2xl mx-auto">
            Every crop, every price — spiralling in from farms across India.
          </p>
        </div>

        <div
          className="arc-stage relative w-full h-[520px] overflow-visible"
          style={{ perspective: 1200 }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[520px] h-[300px] rounded-full bg-[var(--kk-lime)] opacity-10 blur-[120px] pointer-events-none" aria-hidden />

          <div className="absolute inset-0">
            {ARC_CARDS.map((card, i) => {
              // Relative slot position on the arc, based on distance from
              // the current scroll-selected card.
              let delta = i - currentIndex;
              const half = N / 2;
              if (delta > half) delta -= N;
              if (delta < -half) delta += N;
              const theta = delta * anglePerCard;

              const absTheta = Math.abs(theta);
              const rawOpacity =
                absTheta <= FADE_START ? 1 :
                absTheta >= FADE_END ? 0 :
                1 - (absTheta - FADE_START) / (FADE_END - FADE_START);
              const opacity = Math.pow(rawOpacity, 1.4);
              const offStage = absTheta > FADE_END;

              const rad = (theta * Math.PI) / 180;
              const x = Math.sin(rad) * radius;
              const y = -Math.cos(rad) * radius + radius;

              const scale = offStage
                ? 0.5
                : (1.15 - absTheta / 200) * (0.85 + 0.15 * rawOpacity);
              const rotate = theta * 0.35;
              const zIndex = Math.round(100 - absTheta);
              const active = !offStage && absTheta < 4;

              // On the very first scroll, cards arrive from the top-right.
              // We let the natural x/y motion produce that — cards whose
              // slot is at the far right start far right, and as `currentIndex`
              // advances they travel toward the left.
              return (
                <motion.div
                  key={card.id}
                  animate={{ x, y, scale, opacity, rotate }}
                  initial={{ opacity: 0, scale: 0.4, x: radius, y: -radius }}
                  transition={{
                    type: "tween",
                    ease: [0.22, 1, 0.36, 1],
                    duration: 0.9,
                    opacity: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                  }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    marginLeft: -130,
                    zIndex,
                    pointerEvents: offStage ? "none" : "auto",
                    willChange: "transform, opacity",
                  }}
                >
                  <ArcCardView card={card} active={active} />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress dot row */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {ARC_CARDS.map((c, i) => (
            <span
              key={c.id}
              className={`h-1 rounded-full transition-all ${
                i === currentIndex
                  ? "w-8 bg-[var(--kk-lime)]"
                  : "w-1.5 bg-[var(--kk-border)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArcCardView({ card, active }: { card: ArcCard; active: boolean }) {
  return (
    <motion.div
      animate={active ? { y: [0, -6, 0] } : { y: 0 }}
      transition={active ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
      className="kk-card kk-card--no-hover p-5 sm:p-6 w-[220px] sm:w-[260px]"
      style={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        borderColor: active ? card.accent : card.accent + "44",
        boxShadow: active
          ? `0 30px 80px ${card.accent}66, 0 0 60px ${card.accent}33`
          : `0 20px 50px ${card.accent}22`,
        background: active
          ? `linear-gradient(180deg, ${card.accent}14, rgba(17,24,21,0.95))`
          : undefined,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className={`rounded-2xl flex items-center justify-center ${active ? "w-20 h-20 text-5xl" : "w-14 h-14 text-3xl"}`}
          style={{ background: card.accent + "22" }}
        >
          {card.emoji}
        </div>
        <div className="min-w-0">
          <div className={`font-semibold truncate ${active ? "text-lg" : "text-base"}`}>
            {card.title}
          </div>
          <div className="text-xs text-[var(--kk-text-dim)] truncate">
            {card.subtitle}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-[var(--kk-text-dim)]">
          {active ? "Best price" : "Offer"}
        </span>
        <span
          className={`font-bold ${active ? "text-2xl" : "text-lg"}`}
          style={{ color: card.accent }}
        >
          {card.price}
        </span>
      </div>

      {active && (
        <div className="mt-4 h-1 rounded-full bg-[var(--kk-surface-2)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: card.accent }}
            animate={{ width: ["30%", "85%", "30%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </motion.div>
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
        animate={{ scale: [1, 1.25, 1], opacity: [0.08, 0.16, 0.08] }}
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

  // Farmer card drifts up-left, Buyer card drifts up-right
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
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[var(--kk-lime)] opacity-15 blur-[100px] group-hover:opacity-25 transition-opacity" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--kk-lime)] text-[#0A0F0D] text-xs font-bold mb-5">
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
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--kk-amber)] opacity-15 blur-[100px] group-hover:opacity-25 transition-opacity" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--kk-amber)] text-[#0A0F0D] text-xs font-bold mb-5">
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

/* =============================================================================
   HERO FLOATING CARDS
   ========================================================================== */
function ShufflingCard({ emoji, title, subtitle, price, accent, top, left, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80, y: 0, rotate: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.8, type: "spring", stiffness: 60, damping: 15 }}
      style={{ position: "absolute", top, left }}
      className="w-[300px]"
    >
      <motion.div
        animate={{ y: [0, -12, 0, 10, 0], rotate: [-1, 1.5, -1, 1, -1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="kk-card p-5"
        style={{ borderColor: accent + "55", boxShadow: `0 20px 60px ${accent}22` }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{ background: accent + "22" }}>{emoji}</div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{title}</div>
            <div className="text-xs text-[var(--kk-text-dim)] truncate">{subtitle}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[var(--kk-text-dim)]">Best price</span>
          <span className="text-lg font-bold" style={{ color: accent }}>{price}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RecedingCard({ emoji, title, subtitle, price, accent, top, left, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 120, y: 20, rotate: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.9, type: "spring", stiffness: 55, damping: 14 }}
      style={{ position: "absolute", top, left }}
      className="w-[300px]"
    >
      <motion.div
        animate={{ scale: [1, 0.9, 1], opacity: [1, 0.65, 1], y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="kk-card p-5"
        style={{ borderColor: accent + "55", boxShadow: `0 20px 60px ${accent}22` }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{ background: accent + "22" }}>{emoji}</div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{title}</div>
            <div className="text-xs text-[var(--kk-text-dim)] truncate">{subtitle}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[var(--kk-text-dim)]">Sold at</span>
          <span className="text-lg font-bold" style={{ color: accent }}>{price}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SlidingInCard({ emoji, title, subtitle, price, accent, top, left, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 160, rotate: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 1, type: "spring", stiffness: 50, damping: 14 }}
      style={{ position: "absolute", top, left }}
      className="w-[320px]"
    >
      <motion.div
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="kk-card p-5"
        style={{ borderColor: accent + "88", boxShadow: `0 25px 70px ${accent}33` }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: accent + "22" }}
          >
            {emoji}
          </motion.div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{title}</div>
            <div className="text-xs text-[var(--kk-text-dim)] truncate">{subtitle}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[var(--kk-text-dim)]">Earned</span>
          <span className="text-lg font-bold" style={{ color: accent }}>{price}</span>
        </div>
        <div className="mt-3 h-1 rounded-full bg-[var(--kk-surface-2)] overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: accent }} animate={{ width: ["20%", "85%", "20%"] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        </div>
      </motion.div>
    </motion.div>
  );
}