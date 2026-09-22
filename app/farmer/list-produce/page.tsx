// app/farmer/list-produce/page.tsx
// PURPOSE: Form for the farmer to create a new produce listing.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sprout, Package, Scale, Award, IndianRupee, MapPin, Camera,
  CheckCircle2, ChevronLeft,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useToast } from "@/components/Toast";
import { useSession } from "@/lib/session";
import { createListing, Crop } from "@/lib/db";
import { cn } from "@/lib/utils";

const CROPS: { crop: Crop; emoji: string }[] = [
  { crop: "Tomato", emoji: "🍅" },
  { crop: "Onion",  emoji: "🧅" },
  { crop: "Potato", emoji: "🥔" },
  { crop: "Wheat",  emoji: "🌾" },
  { crop: "Rice",   emoji: "🌾" },
];

const QUALITIES = [
  { value: "A", label: "Grade A — Premium", desc: "Top 20% quality, uniform size and color" },
  { value: "B", label: "Grade B — Standard", desc: "Good quality, minor cosmetic variations" },
  { value: "C", label: "Grade C — Economy", desc: "Accepted by local buyers, food processing" },
] as const;

export default function ListProducePage() {
  const router = useRouter();
  const toast = useToast();
  const { farmer } = useSession();

  const [crop, setCrop] = useState<Crop>("Tomato");
  const [quantity, setQuantity] = useState<string>("700");
  const [quality, setQuality] = useState<"A" | "B" | "C">("A");
  const [expectedPrice, setExpectedPrice] = useState<string>("22");
  const [village, setVillage] = useState<string>(farmer?.village ?? "");
  const [state, setState] = useState<string>(farmer?.state ?? "");
  const [submitting, setSubmitting] = useState(false);

  const selectedCropEmoji = CROPS.find(c => c.crop === crop)?.emoji ?? "🍅";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer) {
      toast("Please log in as a farmer first");
      return;
    }
    const q = parseInt(quantity, 10);
    const p = parseInt(expectedPrice, 10);
    if (!q || q <= 0) { toast("Enter a valid quantity"); return; }
    if (!p || p <= 0) { toast("Enter a valid price"); return; }

    setSubmitting(true);
    try {
            await createListing({
        farmerId: farmer.id,
        cropId: 0,
        crop,
        quantityKg: q,
        qualityGrade: quality,
        quality,
        expectedPrice: p,
        village,
        district: farmer.district,
        state,
        photo: selectedCropEmoji,
      });
      toast("Listing published! Finding best buyers…");
      setTimeout(() => router.push("/farmer/buyers"), 900);
    } catch {
      toast("Could not publish listing");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-[var(--kk-text-dim)] hover:text-[var(--kk-lime)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <PageHeader
        badge="New Listing"
        badgeIcon={Sprout}
        title="List your produce"
        subtitle="Fill in the details of your harvest. We'll match you with verified buyers across India."
      />

      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* LEFT: form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Crop picker */}
          <Section title="What are you selling?" icon={Sprout}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {CROPS.map(c => {
                const active = crop === c.crop;
                return (
                  <motion.button
                    key={c.crop}
                    type="button"
                    onClick={() => setCrop(c.crop)}
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                      active
                        ? "border-[var(--kk-lime)] bg-[var(--kk-lime)]/10 shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                        : "border-[var(--kk-border)] hover:border-[var(--kk-green-light)]"
                    )}
                  >
                    <span className="text-3xl">{c.emoji}</span>
                    <span className={cn("text-sm font-medium", active && "text-[var(--kk-lime)]")}>
                      {c.crop}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </Section>

          {/* Quantity + Price */}
          <Section title="Quantity and price" icon={Package}>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                icon={Scale}
                label="Quantity (kg)"
                value={quantity}
                onChange={setQuantity}
                type="number"
                placeholder="700"
              />
              <InputField
                icon={IndianRupee}
                label="Expected price (₹/kg)"
                value={expectedPrice}
                onChange={setExpectedPrice}
                type="number"
                placeholder="22"
              />
            </div>
          </Section>

          {/* Quality */}
          <Section title="Quality grade" icon={Award}>
            <div className="space-y-2">
              {QUALITIES.map(q => {
                const active = quality === q.value;
                return (
                  <motion.button
                    key={q.value}
                    type="button"
                    onClick={() => setQuality(q.value)}
                    whileHover={{ x: 4 }}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4",
                      active
                        ? "border-[var(--kk-lime)] bg-[var(--kk-lime)]/10"
                        : "border-[var(--kk-border)] hover:border-[var(--kk-green-light)]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                        active ? "border-[var(--kk-lime)] bg-[var(--kk-lime)]" : "border-[var(--kk-border)]"
                      )}
                    >
                      {active && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className={cn("font-medium", active && "text-[var(--kk-lime)]")}>{q.label}</div>
                      <div className="text-xs text-[var(--kk-text-dim)]">{q.desc}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Section>

          {/* Location */}
          <Section title="Pickup location" icon={MapPin}>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                icon={MapPin}
                label="Village / Town"
                value={village}
                onChange={setVillage}
                placeholder="Nashik"
              />
              <InputField
                icon={MapPin}
                label="State"
                value={state}
                onChange={setState}
                placeholder="Maharashtra"
              />
            </div>
          </Section>

          {/* Photos (placeholder) */}
          <Section title="Photos (optional)" icon={Camera}>
            <div className="border-2 border-dashed border-[var(--kk-border)] rounded-2xl p-8 text-center hover:border-[var(--kk-lime)] transition-colors cursor-pointer">
              <Camera className="w-8 h-8 text-[var(--kk-text-dim)] mx-auto mb-3" />
              <div className="text-sm text-[var(--kk-text-dim)]">
                Click to upload · JPG / PNG · max 5 MB
              </div>
              <div className="text-xs text-[var(--kk-text-dim)] mt-1">
                (Coming soon — skip for the demo)
              </div>
            </div>
          </Section>
        </div>

        {/* RIGHT: live preview + submit */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="kk-card p-6">
              <div className="text-xs uppercase tracking-widest text-[var(--kk-text-dim)] mb-3">
                Live preview
              </div>
              <motion.div
                key={crop}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="text-center"
              >
                <div className="text-6xl mb-3">{selectedCropEmoji}</div>
                <div className="text-xl font-bold">{crop}</div>
                <div className="text-sm text-[var(--kk-text-dim)] mt-1">
                  {quantity || 0} kg · Grade {quality}
                </div>
                <div className="mt-4 text-3xl font-bold text-[var(--kk-lime)]">
                  ₹{expectedPrice || 0}
                  <span className="text-sm text-[var(--kk-text-dim)] font-normal"> /kg</span>
                </div>
                <div className="mt-3 text-sm text-[var(--kk-text-dim)]">
                  Total value: ₹
                  {(
                    (parseInt(quantity) || 0) * (parseInt(expectedPrice) || 0)
                  ).toLocaleString("en-IN")}
                </div>
              </motion.div>
            </div>

            <AnimatedButton
              size="lg"
              onClick={() => {
                const fake = new Event("submit") as any;
                onSubmit(fake);
              }}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Publishing…" : "Publish Listing"}
            </AnimatedButton>
          </div>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- helpers

function Section({ title, icon: Icon, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="kk-card p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-[var(--kk-lime)]/10 text-[var(--kk-lime)]">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function InputField({
  icon: Icon, label, value, onChange, type = "text", placeholder,
}: any) {
  return (
    <label className="block">
      <div className="text-xs text-[var(--kk-text-dim)] mb-2 flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-[var(--kk-surface-2)] border border-[var(--kk-border)]
                   text-[var(--kk-text)] placeholder:text-[var(--kk-text-dim)]/60
                   focus:outline-none focus:border-[var(--kk-lime)] focus:ring-1 focus:ring-[var(--kk-lime)]/40
                   transition-all"
      />
    </label>
  );
}