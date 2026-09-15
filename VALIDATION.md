# Validation — 2026-09-15

Passed on Node.js 24.19.0:

- `npm run typecheck`: TypeScript validation.
- `npm test`: shop name/keyword search, English/Telugu aliases, typo tolerance, Unicode marks, no-results precision, phone/WhatsApp normalization, status expiry, invalid confirmations, live-by-default configuration, explicit demo mode, and rejection of incomplete or secret-key overrides.
- Database tests execute the complete migration in PGlite's Postgres engine. They verify private drafts, administrator-only publication, public reads, owner-only edits, server-stamped status expiry, cross-owner denial, protected columns, and shop photo folder ownership. The tests initially caught and resolved a correlated storage-policy column reference.
- `npm run build`: client, SSR, and Cloudflare-module Worker bundles.
- `npm run deploy:check`: Wrangler dry-run packaged the Worker and static assets without deploying (about 434 KiB compressed Worker modules).
- `git diff --check`: clean.
- Existing dependency versions did not change; added packages and their dependencies are pinned through the npm lockfile.

Hosted Supabase checks:

- Project `qtnesaercsghwfhlnxlb` is healthy in Mumbai, with migration `20260915062310` recorded in its history.
- `tests/hosted-database.sql` passed: private drafts, owner-only edits, cross-owner denial, administrator-only publication, protected timestamps/columns, server-stamped status expiry, public reads, and anonymous status denial. Temporary users and shops were rolled back; zero shops remain.
- Anonymous PostgREST read of published shop fields: HTTP 200, empty list.
- Auth settings API: HTTP 200, email authentication enabled.
- Anonymous status RPC: HTTP 401, Postgres error `42501` (insufficient privilege).
- RLS is enabled; the public photo bucket allows only JPEG/PNG/WebP up to 3 MiB. Neither anonymous nor authenticated roles can update the publication column.
- Supabase security advisor: no issues reported.

Cloudflare and browser checks:

- Deployed to a temporary Cloudflare account with Wrangler; version `4b625ed3-40cf-4c04-9da3-1ec174208e13`. Worker startup time: 5 ms.
- The deployed directory loaded its actual empty Supabase result without displaying demo listings.
- Product search updated the URL; category selection, filter reset, and English/Telugu switching worked.
- Desktop layout was visually inspected. The owner link loaded the email sign-in form; no email was sent.
- Preview/account expiry and the remaining permanent deployment connection are documented in [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md).

Remaining verification:

- Public email delivery needs custom SMTP and the final site's Auth redirect configuration. Session redirects and Storage HTTP enforcement still need browser integration testing.
- A permanent Cloudflare account connection is not established. Mobile viewport checks and authenticated owner workflows remain pending.
- No real shops have been published. The original Lovable JPEG/ICO binary files could not be recovered by its text export, so the demo uses photo placeholders until those files are restored. Live owners can upload their shop photos after completing email setup.
