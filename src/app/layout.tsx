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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Fruit Fusion | Premium Smoothies & Fresh Blends Ghana",
    template: "%s | Fruit Fusion",
  },
  description:
    "FruitFusion — premium healthy smoothies and parfaits in Ghana. 100% natural fruit, no added sugar. Walk-in or fast delivery.",
  keywords: [
    "smoothies Ghana",
    "fruit fusion Ghana",
    "healthy smoothies Accra",
    "smoothie delivery Ghana",
    "fresh fruit parfait Ghana",
    "natural smoothies Ghana",
  ],
  openGraph: {
    title: `Fruit Fusion — ${BRAND.tagline}`,
    description: BRAND.shortDescription,
    images: ["/brand/logo.png"],
    locale: "en_GH",
    type: "website",
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
