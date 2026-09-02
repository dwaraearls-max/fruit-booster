import Link from "next/link";
import { SmoothieMenuIntro } from "@/components/SmoothieMenuIntro";
import { BRAND } from "@/lib/site-content";
import { getSiteSettings, SETTINGS_FALLBACK } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const tagline = settings?.tagline || SETTINGS_FALLBACK.tagline;
  const phone = settings?.phone || SETTINGS_FALLBACK.phone;
  const email = settings?.email || SETTINGS_FALLBACK.email;
  const hoursWeekday = settings?.hoursWeekday || SETTINGS_FALLBACK.hoursWeekday;
  const hoursSunday = settings?.hoursSunday || SETTINGS_FALLBACK.hoursSunday;

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
              {tagline}
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

      <section className="border-y border-plum/10 bg-gold-pale px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight text-plum md:text-4xl">
            Blended fresh in Accra
          </h2>
          <p className="mt-4 text-base leading-relaxed text-plum/70 md:text-lg">
            Real fruit. No added sugar. Walk in for a cup made in front of you, or order for
            delivery while it&apos;s still cold.
          </p>
        </div>
      </section>

      <section className="bg-plum px-4 py-16 text-gold md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">See today&apos;s blends</h2>
          <p className="mt-4 text-base text-gold/75 md:text-lg">
            New pours, flavour drops, and store moments on {BRAND.instagramHandle} and{" "}
            {BRAND.tiktokHandle}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-plum hover:bg-gold-warm"
            >
              Instagram
            </a>
            <a
              href={BRAND.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gold/40 px-6 py-3 text-sm font-bold uppercase tracking-wide text-gold hover:border-gold"
            >
              TikTok
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight text-plum md:text-4xl">Visit or call</h2>
          <p className="mt-6 text-lg font-semibold text-plum">{phone}</p>
          <p className="mt-1">
            <a href={`mailto:${email}`} className="text-plum/70 underline-offset-4 hover:text-plum hover:underline">
              {email}
            </a>
          </p>
          <p className="mt-6 text-sm text-plum/65">
            {hoursWeekday}
            <span className="mx-2 text-plum/30">·</span>
            {hoursSunday}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block text-sm font-bold uppercase tracking-[0.15em] text-plum underline-offset-4 hover:underline"
          >
            More contact details
          </Link>
        </div>
      </section>
    </>
  );
}
