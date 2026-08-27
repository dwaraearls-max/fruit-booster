import { BRAND } from "@/lib/site-content";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    description: BRAND.shortDescription,
    email: BRAND.email,
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    areaServed: "Ghana",
    slogan: BRAND.tagline,
    sameAs: [BRAND.instagram, BRAND.tiktok],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
