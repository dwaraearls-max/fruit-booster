import { prisma } from "@/lib/db";
import { waLink } from "@/lib/ghana";
import { BRAND } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  let settings: Awaited<ReturnType<typeof prisma.siteSettings.findUnique>> = null;
  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  } catch (error) {
    console.error("Contact page data load failed:", error);
  }
  const email = settings?.email || BRAND.email;
  const instagram = BRAND.instagram;
  const tiktok = BRAND.tiktok;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="text-4xl font-black text-plum">GET IN TOUCH</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-gold/10 p-6 shadow">
          <h2 className="font-bold text-plum">Phone</h2>
          <p className="mt-2">{settings?.phone}</p>
        </div>
        <div className="rounded-2xl bg-gold/10 p-6 shadow">
          <h2 className="font-bold text-plum">WhatsApp</h2>
          <a href={waLink()} className="mt-2 inline-block text-plum underline">
            Message us
          </a>
        </div>
        <div className="rounded-2xl bg-gold/10 p-6 shadow">
          <h2 className="font-bold text-plum">Email</h2>
          <a href={`mailto:${email}`} className="mt-2 inline-block text-plum underline">
            {email}
          </a>
        </div>
        <div className="rounded-2xl bg-gold/10 p-6 shadow">
          <h2 className="font-bold text-plum">Location</h2>
          <p className="mt-2">{settings?.address}</p>
        </div>
        <div className="rounded-2xl bg-gold/10 p-6 shadow">
          <h2 className="font-bold text-plum">Instagram</h2>
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-plum underline">
            {BRAND.instagramHandle}
          </a>
        </div>
        <div className="rounded-2xl bg-gold/10 p-6 shadow">
          <h2 className="font-bold text-plum">TikTok</h2>
          <a href={tiktok} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-plum underline">
            {BRAND.tiktokHandle}
          </a>
        </div>
      </div>
      <div className="mt-8 rounded-2xl bg-plum/5 p-8 text-center">
        <p className="font-semibold">{settings?.hoursWeekday}</p>
        <p className="text-plum/70">{settings?.hoursSunday}</p>
      </div>
      <div className="mt-8 flex aspect-video items-center justify-center rounded-2xl bg-plum/10 text-plum/50">
        Google Maps — {settings?.address}
      </div>
    </div>
  );
}
