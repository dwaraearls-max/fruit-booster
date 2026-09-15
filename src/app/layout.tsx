import type { Metadata } from "next";
import "./globals.css";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { CartProvider } from "@/components/providers/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MiniCart } from "@/components/MiniCart";
import { FloatingCartBar } from "@/components/FloatingCartBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MobileNav } from "@/components/MobileNav";

import { BRAND } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Fruit Booster | Premium Smoothies & Fresh Blends Ghana",
    template: "%s | Fruit Booster",
  },
  description:
    "Fruit Booster — premium healthy smoothies in Ghana. 100% natural fruit, no added sugar. Walk-in or fast delivery.",
  keywords: [
    "smoothies Ghana",
    "Fruit Booster Ghana",
    "healthy smoothies Accra",
    "smoothie delivery Ghana",
    "fresh fruit smoothies Ghana",
    "natural smoothies Ghana",
  ],
  authors: [{ name: "Fruit Booster" }],
  creator: "Fruit Booster",
  publisher: "Fruit Booster",
  category: "food",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  openGraph: {
    title: `Fruit Booster — ${BRAND.tagline}`,
    description: BRAND.shortDescription,
    url: "/",
    siteName: "Fruit Booster",
    images: [
      {
        url: "/brand/og.jpg",
        width: 1200,
        height: 630,
        alt: "Fruit Booster — Where Tropical Fruits Meet Exotic.",
      },
    ],
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Fruit Booster — ${BRAND.tagline}`,
    description: BRAND.shortDescription,
    images: ["/brand/og.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: ["/favicon.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <OrganizationJsonLd />
        <CartProvider>
          <Header />
          <main className="pb-mobile min-h-screen">{children}</main>
          <Footer />
          <MiniCart />
          <FloatingCartBar />
          <WhatsAppButton />
          <MobileNav />
        </CartProvider>
      </body>
    </html>
  );
}
