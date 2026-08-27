# Fruit Fusion — Premium Juice Store

Freshly blended. Naturally delicious. A Ghana-ready e-commerce site for Fruit Fusion juices.

## Quick start (local)

1. Create a PostgreSQL database (Docker or [Neon](https://neon.tech)).
2. Copy env and set `DATABASE_URL`:

```bash
npm install
cp .env.example .env
# Edit DATABASE_URL to your Postgres connection string
npx prisma db push
npm run db:seed
npm run dev
```

Docker (if installed):

```bash
docker compose up -d
# then use the DATABASE_URL from .env.example (port 5433)
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

1. Import the GitHub repo in Vercel.
2. Add these **Environment Variables** (Production):

| Variable | Notes |
|---|---|
| `DATABASE_URL` | **Required.** Postgres URL (Neon or Vercel Postgres). Must be reachable at build time. |
| `AUTH_SECRET` | Long random string |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL, e.g. `https://fruit-fusion.vercel.app` |
| `NEXT_PUBLIC_WHATSAPP` | `233246572540` |
| `PAYMENT_PROVIDER` | `moolre` (optional until keys are set) |
| `MOOLRE_*` | Optional — demo checkout works without keys |

3. Redeploy. The build runs `prisma db push`, seeds catalogue/admin, then `next build`.

**SQLite will not work on Vercel.** Use Postgres only.

### Free Postgres (Neon — recommended)

Fastest setup from your machine:

```bash
npx neon-new@latest --yes
```

That writes `DATABASE_URL` and `DATABASE_URL_DIRECT` into `.env`. Copy both into Vercel env vars.

**Important:** claim the database within 72 hours via the `PUBLIC_POSTGRES_CLAIM_URL` printed in `.env` (or run `npx neon-new claim`), otherwise it expires.

## Admin

- URL: `/admin/login`
- Default: `admin@fruitfusion.gh` / `FruitFusion2026!`

## Payments

### Moolre (recommended for Ghana)

```
PAYMENT_PROVIDER=moolre
MOOLRE_API_USER=your_username
MOOLRE_PUBLIC_KEY=your_public_key
MOOLRE_ACCOUNT_NUMBER=your_account_number
MOOLRE_SANDBOX=true
```

- **MoMo**: USSD prompt to the customer's phone (MTN / Telecel / AirtelTigo)
- **Card**: Moolre hosted payment page
- Webhook: `{SITE_URL}/api/payments/moolre/webhook`

Without keys, orders use demo mode and admin can confirm MoMo manually.

### Paystack (alternative)

Set `PAYMENT_PROVIDER=paystack` plus `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`.

## Stack

Next.js 15 · React 19 · Tailwind CSS 4 · Prisma · PostgreSQL · Moolre / Paystack · WhatsApp ordering
