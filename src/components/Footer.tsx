import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { waLink } from "@/lib/ghana";
import { BRAND } from "@/lib/site-content";

export async function Footer() {
  let settings: Awaited<ReturnType<typeof prisma.siteSettings.findUnique>> = null;
  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  } catch {
    /* use brand fallbacks */
  }
  const tagline = settings?.tagline || BRAND.tagline;
  const email = settings?.email || BRAND.email;
  const instagram = settings?.instagram || BRAND.instagram;
  const tiktok = settings?.tiktok || BRAND.tiktok;

  return (
    <footer className="bg-plum-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <Image src="/brand/logo.png" alt="FruitFusionX" width={220} height={44} className="mb-4 h-12 w-auto" />
          <p className="text-lg font-medium text-gold">{tagline}</p>
          <p className="mt-3 max-w-sm text-sm text-white/70">{BRAND.shortDescription}</p>
          <p className="mt-2 text-sm text-white/60">
            <a href={`mailto:${email}`} className="hover:text-gold">
              {email}
            </a>
          </p>
        </div>
        <div>
          <h3 className="mb-4 font-bold text-gold">Quick Links</h3>
          <ul className="space-y-2 text-sm text-white/80">
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
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                Instagram @fruitfusion45
              </a>
            </li>
            <li>
              <a href={tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                TikTok @fruitfusion23
              </a>
            </li>
          </ul>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-leaf px-5 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
          Est. 2026 · Accra, Ghana
        </p>
        <p className="mt-2 text-sm text-white/70">
          © 2026 <span className="font-bold text-white">FruitFusionX</span>. Powered by{" "}
          <span className="font-bold text-gold">EarlsdwaraDigital</span>.
        </p>
      </div>
    </footer>
  );
}
