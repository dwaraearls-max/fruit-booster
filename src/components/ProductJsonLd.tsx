import { BRAND } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/site-url";

type ProductJsonLdProps = {
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
  priceGhs: number;
};

export function ProductJsonLd({
  name,
  description,
  imageUrl,
  slug,
  priceGhs,
}: ProductJsonLdProps) {
  const site = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: imageUrl.startsWith("http") ? imageUrl : `${site}${imageUrl}`,
    brand: { "@type": "Brand", name: BRAND.name },
    url: `${site}/shop/${slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "GHS",
      price: priceGhs,
      availability: "https://schema.org/InStock",
      url: `${site}/shop/${slug}`,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
