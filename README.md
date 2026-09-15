# Mana Proddatur

A bilingual local shop directory for **Proddatur 516360**. Search a shop name, category, or the kinds of things a shop sells. Results are shops with photos, addresses, contact links, and owner-confirmed opening status. There is no product catalogue, inventory, pricing, cart, or checkout.

Source: [badsoilder7/jnj](https://github.com/badsoilder7/jnj). Automatic synchronization with the original Lovable project has not been verified.

## Run

Use Node.js 22.12+ (validated with Node 24) and npm. `package-lock.json` is the dependency lockfile.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

## Directory modes

The app defaults to the **live directory**, connected to the `mana-proddatur` Supabase project in Mumbai. Its public browser configuration is in `src/lib/supabase-public.ts`. The database migration is applied, and there are no published shops yet. Live mode shows loading, failure, and empty states without falling back to fictional shops.

For a local design preview, set `VITE_DIRECTORY_MODE=demo` before starting/building. This explicitly labelled demo has ten fictional sample shops; edits stay in that browser. Demo data is never seeded into the live database.

To use another Supabase project, set **both** `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at build time. Copy `.env.example` for local configuration. Only `sb_publishable_` keys are accepted; the build rejects secret keys and incomplete overrides, including in demo mode.

## Implemented

- English/Telugu search with common aliases and typo tolerance; category, locality, and owner-confirmed-open filters in the URL.
- Shop details, local photo previews, public phone/WhatsApp, and map directions derived from the business address.
- Email-link owner sign-in in live mode; owners can submit a shop and edit their own listing.
- Shop photo uploads to Supabase Storage, with MIME/size checks and ownership policies.
- New shops await administrator review before appearing in public search. Browser clients cannot publish a shop or change its owner.
- Open/closed/break controls. Postgres stamps confirmations; open/break expire after 30 minutes to 12 hours. Closed persists with its confirmation timestamp. Regular hours never auto-confirm a status.
- Shared data refreshes every 30 seconds while visible, on focus, and after saving. Failures clear confirmations and display a retry prompt.

## Connect and deploy

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the migration, authentication settings, administrator review, and live validation. See [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) for the generated Worker and GitHub build settings.

On 2026-09-15, the free Supabase project was created in the authorized organization and its migration applied. Hosted owner/public permission checks and anonymous API checks passed; Supabase's security advisor reported no issues. See the [project dashboard](https://supabase.com/dashboard/project/qtnesaercsghwfhlnxlb).

Public owner onboarding still needs custom SMTP, the deployed site's Auth redirect settings, and browser verification of sign-in and photo uploads. A permanent Cloudflare account connection is still required. No real shops have been added.

## Photos and export

The original Lovable text export could not transfer its binary JPEGs intact. Missing photos have an accessible placeholder. Restoring the original six `src/assets/demo-*.jpg` files automatically restores illustrative demo images. Live shop owners upload their own business photos; the demo images never stand in for a real shop.

## Validation

See [VALIDATION.md](VALIDATION.md). Tests exercise search, contact normalization, status expiry, environment checks, and Postgres row/column authorization using PGlite. `tests/hosted-database.sql` also passed against the connected Supabase database; its temporary records are rolled back. Email delivery and Storage HTTP flows require separate integration checks.
