# Validation — 2026-09-14

Passed on Node.js 24.19.0:

- `npm run typecheck`: TypeScript validation.
- `npm test`: shop name/keyword search, English/Telugu aliases, typo tolerance, Unicode marks, no-results precision, phone/WhatsApp normalization, status expiry, invalid confirmations, and public build configuration checks.
- Database tests execute the complete migration in PGlite's Postgres engine. They verify private drafts, administrator-only publication, public reads, owner-only edits, server-stamped status expiry, cross-owner denial, protected columns, and shop photo folder ownership. The tests initially caught and resolved a correlated storage-policy column reference.
- `npm run build`: client, SSR, and Cloudflare-module Worker bundles.
- `npm run deploy:check`: Wrangler dry-run packaged the Worker and static assets without deploying (about 434 KiB compressed Worker modules).
- `git diff --check`: clean.
- Existing dependency versions did not change; added packages and their dependencies are pinned through the npm lockfile.

Remaining verification:

- No hosted Supabase project exists in the connected account yet. The SQL migration has not been applied remotely. The local database tests use minimal Auth/Storage fixtures; hosted PostgREST, email delivery, session redirects, and Storage HTTP enforcement still need testing.
- No Cloudflare deployment was performed. Interactive desktop/mobile QA remains pending; the cloud browser previously rejected access to the local preview address.
- No real shops have been published. The original Lovable JPEG/ICO binary files could not be recovered by its text export, so the demo uses photo placeholders until those files are restored. Live owners can upload their shop photos after connecting Supabase.
