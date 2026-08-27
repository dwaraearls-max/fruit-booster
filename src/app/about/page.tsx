import { BRAND } from "@/lib/site-content";

export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="text-4xl font-black text-plum">About {BRAND.name}</h1>
      <p className="mt-4 text-xl font-semibold text-gold">{BRAND.tagline}</p>
      {BRAND.description.split("\n\n").map((paragraph) => (
        <p key={paragraph.slice(0, 40)} className="mt-6 text-lg text-plum/80 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
