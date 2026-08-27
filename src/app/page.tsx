import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, serializeProduct } from "@/services/products";
import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/site-content";

export default async function HomePage() {
  const [products, settings] = await Promise.all([
    getProducts(),
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
  ]);

  const serialized = products.map(serializeProduct);

  return (
    <>
      <section className="relative overflow-hidden bg-plum text-white">
        <div className="absolute inset-0 opacity-20">
          <Image src="/brand/hero-bg.png" alt="" fill className="object-cover" priority />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-24">
          <div>
            <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              {settings?.tagline || BRAND.tagline}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
              {BRAND.shortDescription}
            </p>
            <p className="mx-auto mt-2 text-base text-gold font-medium">
              {BRAND.subtagline}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="rounded-full bg-gold px-8 py-4 text-lg font-bold text-plum transition hover:bg-gold-warm"
              >
                ORDER YOUR JUICE
              </Link>
              <Link
                href="#flavours"
                className="rounded-full border-2 border-white/40 px-8 py-4 text-lg font-bold text-white transition hover:border-gold hover:text-gold"
              >
                EXPLORE FLAVOURS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="flavours" className="bg-plum/5 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-center text-3xl font-black text-plum md:text-4xl">
            OUR 8 SIGNATURE FLAVOURS
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serialized.map((p) => (
              <ProductCard key={p.id} {...p} bestSeller={p.bestSeller} isNew={p.isNew} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="text-center text-3xl font-black text-plum">WHY FRUIT FUSION?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["🫐", "100% NATURAL", "Blueberries, raspberries, blackberries, strawberries & tropical fruits — no added sugar."],
            ["🥤", "FRESHLY BLENDED", "Creamy smoothies and parfaits made fresh every day."],
            ["❤️", "TASTE & WELLNESS", "A quick refreshing treat or a healthy meal replacement."],
            ["🇬🇭", "WALK-IN & DELIVERY", "Visit us in store or get fast delivery to your doorstep."],
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-3xl bg-white p-6 text-center shadow-lg">
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-4 text-lg font-bold text-plum">{title}</h3>
              <p className="mt-2 text-sm text-plum/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-plum text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6">
          <div className="relative aspect-square overflow-hidden rounded-3xl">
            <Image src="/products/strawberry-fusion.jpg" alt="Fresh strawberry Fruit Fusion smoothie" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gold">YOU CAN TASTE THE FRESHNESS.</h2>
            <p className="mt-4 text-xl font-semibold">Tropical fruits meet exotic.</p>
            <p className="mt-4 text-white/80">
              FruitFusion specializes in fresh, creamy blends — smoothies and parfaits served daily for walk-in customers and fast delivery across Ghana.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="text-center text-3xl font-black text-plum">LOVED BY SMOOTHIE LOVERS ❤️</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            "The strawberry juice was incredibly fresh. Definitely ordering again!",
            "Mango Passion is my go-to after gym. Love the taste!",
            "Fast delivery to East Legon and the juice arrived cold. Perfect.",
          ].map((quote, i) => (
            <blockquote key={i} className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-gold">★★★★★</p>
              <p className="mt-3 text-plum/80">&ldquo;{quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold text-plum">— Customer</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bg-gold/20 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <h2 className="text-3xl font-black text-plum">FOLLOW THE FRESHNESS</h2>
          <p className="mt-3 text-plum/70">Smoothies, parfaits & daily fresh blends on Instagram and TikTok.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href={settings?.instagram || BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-plum px-8 py-4 font-bold text-white hover:bg-plum-light"
            >
              INSTAGRAM @fruitfusion45
            </a>
            <a
              href={settings?.tiktok || BRAND.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-plum px-8 py-4 font-bold text-plum hover:bg-plum hover:text-white"
            >
              TIKTOK @fruitfusion23
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="text-center text-3xl font-black text-plum">GET IN TOUCH</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <h3 className="font-bold text-plum">Phone</h3>
            <p className="mt-2 text-plum/70">{settings?.phone}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <h3 className="font-bold text-plum">Email</h3>
            <p className="mt-2 text-plum/70">
              <a href={`mailto:${settings?.email || BRAND.email}`} className="hover:text-plum">
                {settings?.email || BRAND.email}
              </a>
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <h3 className="font-bold text-plum">Hours</h3>
            <p className="mt-2 text-plum/70">{settings?.hoursWeekday}</p>
            <p className="text-plum/70">{settings?.hoursSunday}</p>
          </div>
        </div>
      </section>
    </>
  );
}
