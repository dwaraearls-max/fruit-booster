import Link from "next/link";
import Image from "next/image";
import { waLink } from "@/lib/ghana";
import { BRAND } from "@/lib/site-content";
import { getSiteSettings, SETTINGS_FALLBACK } from "@/lib/site-settings";

export async function Footer() {
  const settings = await getSiteSettings();
  const tagline = settings?.tagline || SETTINGS_FALLBACK.tagline;
  const email = settings?.email || SETTINGS_FALLBACK.email;
  const instagram = BRAND.instagram;
  const tiktok = BRAND.tiktok;

  return (
    <footer className="bg-plum-dark pb-mobile text-gold">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <Image
            src="/brand/logo.png"
            alt="Fruit Booster"
            width={360}
            height={120}
            className="mb-4 h-12 w-auto max-w-[14rem] object-contain md:h-14 md:max-w-[16rem]"
          />
          <p className="text-lg font-medium text-gold">{tagline}</p>
          <p className="mt-3 max-w-sm text-sm text-gold/70">{BRAND.shortDescription}</p>
          <p className="mt-2 text-sm text-gold/60">
            <a href={`mailto:${email}`} className="hover:text-gold">
              {email}
            </a>
          </p>
        </div>
        <div>
          <h3 className="mb-4 font-bold text-gold">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gold/80">
            {[
              ["/", "Home"],
              ["/shop", "Shop"],
              ["/about", "About"],
              ["/contact", "Contact"],
              ["/delivery", "Delivery Information"],
              ["/privacy", "Privacy Policy"],
              ["/terms", "Terms & Conditions"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-gold">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-bold text-gold">Follow Us</h3>
          <ul className="space-y-2 text-sm text-gold/80">
            <li>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                Instagram {BRAND.instagramHandle}
              </a>
            </li>
            <li>
              <a href={tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                TikTok {BRAND.tiktokHandle}
              </a>
            </li>
          </ul>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-gold px-5 py-2 text-sm font-bold text-plum hover:bg-gold-warm"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-gold/25 px-4 py-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
          Est. 2026 · Accra, Ghana
        </p>
        <p className="mt-2 text-sm text-gold/70">
          © 2026 <span className="font-bold text-gold">Fruit Booster</span>. Powered by{" "}
          <span className="font-bold text-gold">EarlsdwaraDigital</span>.
        </p>
      </div>
    </footer>
  );
}
