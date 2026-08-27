# Fruit Fusion — Premium Juice Store

Freshly blended. Naturally delicious. A Ghana-ready e-commerce site for Fruit Fusion juices.

## Quick start

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin

- URL: `/admin/login`
- Default: `admin@fruitfusion.gh` / `FruitFusion2026!`

## Database

Local dev uses **SQLite** (`file:./dev.db`) when Docker is unavailable.

For production, set `DATABASE_URL` to PostgreSQL and change `provider` in `prisma/schema.prisma` to `postgresql`. Use `docker compose up -d` when Docker is installed.

## Paystack

Add `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` to `.env` for live payments. Set `PAYMENT_PROVIDER=paystack`.

## Moolre (recommended for Ghana)

Add your Moolre credentials to `.env`:

```
PAYMENT_PROVIDER=moolre
MOOLRE_API_USER=your_username
MOOLRE_PUBLIC_KEY=your_public_key
MOOLRE_ACCOUNT_NUMBER=your_account_number
MOOLRE_SANDBOX=true
```

- **MoMo**: sends a USSD prompt to the customer's phone (MTN / Telecel / AirtelTigo)
- **Card**: uses Moolre hosted payment page
- Webhook: `{SITE_URL}/api/payments/moolre/webhook`

Without keys, orders use demo mode and admin can confirm MoMo manually.

## Flavours

Edit names/prices in admin or update `prisma/seed.ts` and re-seed.

## Stack

Next.js 15 · React 19 · Tailwind CSS 4 · Prisma · Paystack-ready · WhatsApp ordering
