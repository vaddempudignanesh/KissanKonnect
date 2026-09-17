// lib/i18n.ts
// PURPOSE: Bilingual strings for the entire app.
//          Simple key-based lookup — swap for next-intl later without
//          changing any component, because components only use `t(...)`.
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Lang = "en" | "hi";

const strings = {
  en: {
    "brand.name": "KisanKonnect",
    "brand.tagline": "Farm to Buyer. No Middlemen.",

    "nav.home": "Home",
    "nav.market": "Market Prices",
    "nav.farmer": "Farmer",
    "nav.buyer": "Buyer",
    "nav.tracking": "Track Order",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.role.farmer": "Continue as Farmer",
    "nav.role.buyer": "Continue as Buyer",

    "hero.badge": "For Indian Farmers",
    "hero.title": "Sell your harvest at the best price.",
    "hero.subtitle":
      "Real-time mandi prices across India. Direct deals with Reliance, BigBasket, Amazon Fresh. No middleman. Full tracking.",
    "hero.cta.primary": "Start Selling",
    "hero.cta.secondary": "See Market Prices",

    "stats.farmers": "Farmers onboard",
    "stats.cities": "Cities covered",
    "stats.avgProfit": "Avg. profit increase",
    "stats.paid": "Paid to farmers",

    "footer.tag": "Built for the farmers of India.",
    "footer.rights": "All rights reserved.",

    "role.farmer.title": "Farmer Dashboard",
    "role.buyer.title": "Buyer Dashboard",

    "common.back": "Back",
    "common.continue": "Continue",
    "common.cancel": "Cancel",
    "common.post": "Post",
  },
  hi: {
    "brand.name": "किसानकनेक्ट",
    "brand.tagline": "खेत से खरीदार तक। कोई बिचौलिया नहीं।",

    "nav.home": "होम",
    "nav.market": "मंडी भाव",
    "nav.farmer": "किसान",
    "nav.buyer": "खरीदार",
    "nav.tracking": "ऑर्डर ट्रैक",
    "nav.login": "लॉगिन",
    "nav.logout": "लॉगआउट",
    "nav.role.farmer": "किसान के रूप में जारी रखें",
    "nav.role.buyer": "खरीदार के रूप में जारी रखें",

    "hero.badge": "भारतीय किसानों के लिए",
    "hero.title": "अपनी फसल सबसे अच्छे दाम पर बेचें।",
    "hero.subtitle":
      "पूरे भारत के रीयल-टाइम मंडी भाव। रिलायंस, बिगबास्केट, अमेज़न फ्रेश से सीधा सौदा। कोई बिचौलिया नहीं। पूरी ट्रैकिंग।",
    "hero.cta.primary": "बेचना शुरू करें",
    "hero.cta.secondary": "मंडी भाव देखें",

    "stats.farmers": "जुड़े किसान",
    "stats.cities": "शहर शामिल",
    "stats.avgProfit": "औसत मुनाफा बढ़ोतरी",
    "stats.paid": "किसानों को भुगतान",

    "footer.tag": "भारत के किसानों के लिए बनाया गया।",
    "footer.rights": "सर्वाधिकार सुरक्षित।",

    "role.farmer.title": "किसान डैशबोर्ड",
    "role.buyer.title": "खरीदार डैशबोर्ड",

    "common.back": "वापस",
    "common.continue": "जारी रखें",
    "common.cancel": "रद्द करें",
    "common.post": "पोस्ट करें",
  },
} as const;

type Dict = typeof strings.en;
type Key = keyof Dict;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Persist chosen language across reloads.
  useEffect(() => {
    const saved = typeof window !== "undefined"
      ? (localStorage.getItem("kk-lang") as Lang | null)
      : null;
    if (saved === "en" || saved === "hi") setLang(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("kk-lang", lang);
  }, [lang]);

  const t = (k: Key) => strings[lang][k] ?? strings.en[k] ?? k;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}