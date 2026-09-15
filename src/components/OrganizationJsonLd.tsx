import { BRAND } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/site-url";

export function OrganizationJsonLd() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: BRAND.name,
        description: BRAND.shortDescription,
        email: BRAND.email,
        telephone: `+${BRAND.whatsapp}`,
        url,
        logo: `${url}/brand/logo.png`,
        image: `${url}/brand/og.jpg`,
        areaServed: "Ghana",
        slogan: BRAND.tagline,
        sameAs: [BRAND.instagram, BRAND.tiktok],
      },
      {
        "@type": "FoodEstablishment",
        "@id": `${url}/#localbusiness`,
        name: BRAND.name,
        description: BRAND.shortDescription,
        url,
        image: `${url}/brand/og.jpg`,
        telephone: `+${BRAND.whatsapp}`,
        email: BRAND.email,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Accra",
          addressCountry: "GH",
        },
        servesCuisine: "Smoothies",
        priceRange: "GH₵40",
        parentOrganization: { "@id": `${url}/#organization` },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: BRAND.name,
        description: BRAND.shortDescription,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "en-GH",
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
