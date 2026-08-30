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
    "mt-8 inline-block rounded-lg bg-plum px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gold transition hover:bg-plum-light md:text-sm";

  return (
    <section className="bg-gold-pale px-4 py-12 md:px-6 md:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-2xl font-bold text-plum md:text-3xl">Menu</h1>

        <div className="mt-10 grid items-center gap-10 md:mt-14 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-plum-dark shadow-xl">
              <div className="absolute inset-0 flex items-end justify-center gap-1 px-4 pb-2 pt-8 sm:gap-3 sm:px-8 sm:pb-4">
                <div className="relative h-[78%] w-[30%] -rotate-6">
                  <Image
                    src="/products/regular-very-berry.jpg"
                    alt="Very Berry smoothie"
                    fill
                    className="object-contain drop-shadow-lg"
                    sizes="120px"
                  />
                </div>
                <div className="relative z-10 h-[88%] w-[34%]">
                  <Image
                    src="/products/mango-hurrican.jpg"
                    alt="Mango Hurrican smoothie"
                    fill
                    className="object-contain drop-shadow-xl"
                    sizes="140px"
                  />
                </div>
                <div className="relative h-[78%] w-[30%] rotate-6">
                  <Image
                    src="/products/regular-nuttin-butter.jpg"
                    alt="Nuttin Butter smoothie"
                    fill
                    className="object-contain drop-shadow-lg"
                    sizes="120px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-plum/45 md:text-sm">
              Refreshing &amp; re-energizing
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-tight text-plum md:text-5xl lg:text-[3.25rem]">
              Smoothies
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-plum/70 md:mx-0 md:text-lg">
              Delicious, nutritious and blended right before your very eyes, our legendary lineup of
              tasty smoothies are guaranteed to nourish both your body and your cravings.
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
      </div>
    </section>
  );
}
