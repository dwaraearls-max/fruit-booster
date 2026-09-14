"use client";

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
    "mt-8 inline-block rounded-lg bg-plum px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gold transition hover:bg-plum-light md:text-sm";

  return (
    <section className="bg-gold-pale px-4 py-12 md:px-6 md:py-16 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-2xl font-bold text-plum md:text-3xl">Menu</h1>

        <div className="mx-auto mt-8 h-2 w-24 rounded-full bg-plum-dark md:mt-10" aria-hidden />

        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-plum/45 md:text-sm">
          Refreshing &amp; re-energizing
        </p>
        <h2 className="mt-3 text-4xl font-black uppercase tracking-tight text-plum md:text-5xl lg:text-[3.25rem]">
          Smoothies
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-plum/70 md:text-lg">
          Delicious, nutritious and blended right before your very eyes, our legendary lineup of tasty
          smoothies are guaranteed to nourish both your body <em className="italic">and</em> your
          cravings.
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
    </section>
  );
}
