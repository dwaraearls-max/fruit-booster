import Link from "next/link";
import { SmoothieMenuIntro } from "@/components/SmoothieMenuIntro";
import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let settings: Awaited<ReturnType<typeof prisma.siteSettings.findUnique>> = null;

  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  } catch (error) {
    console.error("Home page data load failed:", error);
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-plum text-gold">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/brand/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-0 bg-plum/55" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center md:px-6 md:py-32 lg:py-40">
          <div>
            <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              {settings?.tagline || BRAND.tagline}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gold/85">
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
                className="rounded-full border-2 border-gold/50 px-8 py-4 text-lg font-bold text-gold transition hover:border-gold hover:text-gold"
              >
                EXPLORE FLAVOURS
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="flavours">
        <SmoothieMenuIntro browseHref="/shop" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="text-center text-3xl font-black text-plum">WHY FRUIT BOOSTER?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["🫐", "100% NATURAL", "Blueberries, raspberries, blackberries, strawberries & tropical fruits — no added sugar."],
            ["🥤", "FRESHLY BLENDED", "Creamy smoothies made fresh every day."],
            ["❤️", "TASTE & WELLNESS", "A quick refreshing treat or a healthy meal replacement."],
            ["🇬🇭", "WALK-IN & DELIVERY", "Visit us in store or get fast delivery to your doorstep."],
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-3xl bg-gold/10 p-6 text-center shadow-lg">
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-4 text-lg font-bold text-plum">{title}</h3>
              <p className="mt-2 text-sm text-plum/70">{text}</p>
            </div>
          ))}
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
            <blockquote key={i} className="rounded-3xl bg-gold/10 p-6 shadow-lg">
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
          <p className="mt-3 text-plum/70">Smoothies & daily fresh blends on Instagram and TikTok.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-plum px-8 py-4 font-bold text-gold hover:bg-plum-light"
            >
              INSTAGRAM {BRAND.instagramHandle.toUpperCase()}
            </a>
            <a
              href={BRAND.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-plum px-8 py-4 font-bold text-plum hover:bg-plum-light hover:text-gold"
            >
              TIKTOK {BRAND.tiktokHandle.toUpperCase()}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="text-center text-3xl font-black text-plum">GET IN TOUCH</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-gold/10 p-6 shadow-lg">
            <h3 className="font-bold text-plum">Phone</h3>
            <p className="mt-2 text-plum/70">{settings?.phone}</p>
          </div>
          <div className="rounded-3xl bg-gold/10 p-6 shadow-lg">
            <h3 className="font-bold text-plum">Email</h3>
            <p className="mt-2 text-plum/70">
              <a href={`mailto:${settings?.email || BRAND.email}`} className="hover:text-plum">
                {settings?.email || BRAND.email}
              </a>
            </p>
          </div>
          <div className="rounded-3xl bg-gold/10 p-6 shadow-lg">
            <h3 className="font-bold text-plum">Hours</h3>
            <p className="mt-2 text-plum/70">{settings?.hoursWeekday}</p>
            <p className="text-plum/70">{settings?.hoursSunday}</p>
          </div>
        </div>
      </section>
    </>
  );
}
