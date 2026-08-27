import { prisma } from "@/lib/db";
import { waLink } from "@/lib/ghana";
import { BRAND } from "@/lib/site-content";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const email = settings?.email || BRAND.email;
  const instagram = settings?.instagram || BRAND.instagram;
  const tiktok = settings?.tiktok || BRAND.tiktok;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="text-4xl font-black text-plum">GET IN TOUCH</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="font-bold text-plum">Phone</h2>
          <p className="mt-2">{settings?.phone}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="font-bold text-plum">WhatsApp</h2>
          <a href={waLink()} className="mt-2 inline-block text-leaf underline">
            Message us
          </a>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="font-bold text-plum">Email</h2>
          <a href={`mailto:${email}`} className="mt-2 inline-block text-plum underline">
            {email}
          </a>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="font-bold text-plum">Location</h2>
          <p className="mt-2">{settings?.address}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="font-bold text-plum">Instagram</h2>
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-plum underline">
            @fruitfusion45
          </a>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="font-bold text-plum">TikTok</h2>
          <a href={tiktok} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-plum underline">
            @fruitfusion23
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
