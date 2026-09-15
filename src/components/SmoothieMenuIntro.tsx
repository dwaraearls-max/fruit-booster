"use client";

import Image from "next/image";
import Link from "next/link";

type SmoothieMenuIntroProps = {
  onBrowse?: () => void;
  browseHref?: string;
  browseLabel?: string;
};

export function SmoothieMenuIntro({
  onBrowse,
  browseHref,
  browseLabel = "Find your perfect smoothie",
}: SmoothieMenuIntroProps) {
  const ctaClass =
    "mt-8 inline-block rounded-md bg-plum-dark px-7 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-plum md:text-sm";

  return (
    <section className="bg-gold-pale px-4 py-14 md:px-6 md:py-20 lg:py-24">
      <h1 className="text-center text-2xl font-semibold text-plum md:text-3xl">Menu</h1>

      <div className="mx-auto mt-10 grid max-w-6xl items-center gap-10 md:mt-14 md:grid-cols-2 md:gap-12 lg:gap-16">
        {/* Cups over purple panel — Booster Juice style */}
        <div className="relative mx-auto flex w-full max-w-md items-center justify-center py-10 md:max-w-none md:py-12">
          <div
            className="absolute inset-x-[6%] top-1/2 h-[48%] -translate-y-1/2 rounded-[1.75rem] bg-plum-dark md:inset-x-[8%] md:h-[52%] md:rounded-[2rem]"
            aria-hidden
          />
          <div className="relative z-10 w-[92%] md:w-[88%]">
            <Image
              src="/brand/menu-smoothies.jpg"
              alt="Fruit Booster smoothies — mango, banana, and berry"
              width={1200}
              height={900}
              className="h-auto w-full object-contain drop-shadow-lg"
              sizes="(max-width: 768px) 90vw, 40vw"
              priority
            />
          </div>
        </div>

        {/* Copy + CTA */}
        <div className="mx-auto max-w-md text-center md:mx-0 md:max-w-none md:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-plum/40 md:text-xs">
            Refreshing &amp; re-energizing
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight text-plum md:text-5xl lg:text-6xl">
            Smoothies
          </h2>
          <p className="mt-5 text-base leading-relaxed text-plum/65 md:max-w-md md:text-lg">
            Delicious, nutritious and blended right before your very eyes, our legendary lineup of
            tasty smoothies are guaranteed to nourish both your body{" "}
            <em className="italic">and</em> your cravings.
          </p>
          {browseHref ? (
            <Link href={browseHref} className={ctaClass}>
              {browseLabel}
            </Link>
          ) : (
            <button type="button" onClick={onBrowse} className={ctaClass}>
              {browseLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
