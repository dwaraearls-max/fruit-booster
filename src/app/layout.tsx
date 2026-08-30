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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
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
  openGraph: {
    title: `Fruit Booster — ${BRAND.tagline}`,
    description: BRAND.shortDescription,
    images: ["/brand/logo.png"],
    locale: "en_GH",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/brand/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
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
