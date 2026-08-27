# FruitFusionX — Premium Juice Store

Freshly blended. Naturally delicious. A Ghana-ready e-commerce site for FruitFusionX juices.

## Quick start (local)

1. Copy env and paste your Supabase Postgres URIs (see Database section).
2. Install and run:

```bash
npm install
cp .env.example .env
# set DATABASE_URL + DATABASE_URL_DIRECT from Supabase
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) (or the port you choose).

Schema + seed are already applied on the linked Supabase project.

## Database (Supabase)

This app uses **Prisma + Supabase Postgres**.

1. Open [Database settings](https://supabase.com/dashboard/project/akcyzqarqocxbxuprmlh/settings/database)
2. Copy the **URI** connection strings into `.env`:
   - `DATABASE_URL` — Transaction pooler (port **6543**, add `?pgbouncer=true`)
   - `DATABASE_URL_DIRECT` — Session mode / direct (port **5432**)
3. Seed:

```bash
npx prisma db push
npm run db:seed
```

Project URL: `https://akcyzqarqocxbxuprmlh.supabase.co`

## Deploy on Vercel

Set the same Supabase `DATABASE_URL` / `DATABASE_URL_DIRECT` in Vercel env (Production + Preview), plus `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_WHATSAPP`. Redeploy after updating.

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
