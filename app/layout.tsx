// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { SessionProvider } from "@/lib/session";
import { ToastProvider } from "@/components/Toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KisanKonnect — Farm to Buyer, No Middlemen",
  description: "Real-time mandi prices, direct farmer-to-buyer deals, and live shipment tracking.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <ToastProvider>
            <SessionProvider>
              <div className="kk-page-bg min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </SessionProvider>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}