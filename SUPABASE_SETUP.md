# Supabase connection

## 1. Project

Connected on 2026-09-15 with user approval:

- Project: `mana-proddatur` (`qtnesaercsghwfhlnxlb`).
- Organization: `badsoilder7's Org` (`vhhdvyxacydkmzivjbpf`).
- Region: Mumbai (`ap-south-1`); quoted free plan cost: $0/month.
- [Dashboard](https://supabase.com/dashboard/project/qtnesaercsghwfhlnxlb).

The project was healthy when verified. Do not create a second project for this repository.

## 2. Schema

`supabase/migrations/20260915062310_local_shop_directory.sql` is **already applied**. It creates `public.shops`, status functions/triggers, a `shop-photos` bucket, and ownership policies. Do not import the fictional demo shops into production.

The migration was prepared with Supabase CLI 2.117.0 and applied through the connected migration tool. Its file version matches the hosted migration history, `20260915062310`. Do not apply it again through the SQL editor. To deploy future migrations with a linked local project:

```sh
npm exec --yes --package=supabase@2.117.0 -- supabase db push
```

Future migrations can also use the connected Supabase migration tool. The public Data API and security advisor checks passed for the initial schema. The current client validates explicit response fields using Zod; regenerate types from the hosted schema if a generated client is introduced.

## 3. Public app configuration

The default HTTPS URL and **publishable** key are connected in `src/lib/supabase-public.ts`, so this project needs no additional build variables. Publishable keys are [designed for public browser code](https://supabase.com/docs/guides/getting-started/api-keys); RLS and column grants enforce access. Service-role keys, project passwords, and Supabase access tokens must never be VITE variables or committed files.

To point a deployment at another project, set both override variables from `.env.example` before building. `VITE_DIRECTORY_MODE=demo` explicitly selects the fictional local preview; the default is `live`.

The owner workspace is a browser client. Authentication and authorization happen through Supabase Auth and Postgres RLS; SSR does not hold an owner session or a privileged database key.

## 4. Email sign-in

Email authentication is enabled. The app uses the standard email magic-link flow. **Deployment setup remains:** set the site's real HTTPS origin as the Auth Site URL and allow the exact redirect URL `<site-origin>/owners`. Add local/preview URLs only when needed. Keep the standard confirmation link in the email template.

Configure custom SMTP before public onboarding. Supabase's default sender is restricted to project-team addresses and is intended for setup/testing. See [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp) and [passwordless sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless).

### Exact URL settings

Open [Authentication > URL Configuration](https://supabase.com/dashboard/project/qtnesaercsghwfhlnxlb/auth/url-configuration). If Cloudflare still displays the original Worker address, set:

| Setting | Value |
| --- | --- |
| Site URL | `https://mana-proddatur.shore-spinosaurus-6a2.workers.dev` |
| Redirect URLs | `https://mana-proddatur.shore-spinosaurus-6a2.workers.dev/owners` |

If the claimed Worker's address is different, use that exact origin in both values. The app already requests a return to its current origin plus `/owners`. Use exact production paths rather than a wildcard for all `workers.dev` sites. These dashboard settings have not been applied through this session; the connected Supabase tools do not expose Auth configuration changes.

For the requested rename, once Cloudflare actually confirms `app.manaproddutur.workers.dev`, use Site URL `https://app.manaproddutur.workers.dev` and redirect `https://app.manaproddutur.workers.dev/owners`. These values are prepared only; the hostname is not yet claimed or deployed by this session.

### Resend connection

The Resend connection was authenticated and checked on 2026-09-15. It currently contains **no sending domains**. A domain owned by the user must be supplied and verified before production email delivery can be configured. The Worker subdomain is the website's address; it is not a verified Resend sending domain.

After verifying the chosen domain, use [Supabase SMTP settings](https://supabase.com/dashboard/project/qtnesaercsghwfhlnxlb/auth/smtp):

| Setting | Value |
| --- | --- |
| Sender name | `Mana Proddatur` |
| Sender email | An address on the verified sending domain |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | A Resend API key for sending from that domain |

Enter the sending key directly in Supabase's private SMTP configuration. It does not belong in the frontend, Cloudflare build variables, or GitHub. No sending key was created and no email was sent during this check. See [Resend's Supabase SMTP guide](https://resend.com/docs/send-with-supabase-smtp).

## 5. Review a submitted shop

Use the Supabase dashboard with an administrator account. Review its public contact details, address in 516360, photo, keyword tags, and the submitter's authority to manage it. Then set `published` to `true` for that specific `shops` row. Setting it to `false` removes the listing from public search on the next refresh.

Owners cannot change `published`, `owner_id`, IDs, postal code, or server timestamps. Ownership transfers and deletion are administrator operations. There is no browser administrator role or user-editable metadata that grants elevated access.

Shop photos are public business assets, including photos uploaded while a listing awaits review. The form discloses this before saving. Uploads use unique file names and do not overwrite another shop's files. Old/unreferenced uploads are retained to avoid deleting an image after an uncertain network write; add an administrator retention/cleanup process as the directory grows.

## 6. Verify the hosted connection

Hosted checks already passed for private drafts, owner-only edits, administrator-only publication, protected columns, server-stamped status expiry, public reads, and anonymous denial. The reproducible SQL is in `tests/hosted-database.sql`; it uses temporary fixtures inside a transaction and rolls them back. HTTP checks confirmed a successful empty public shop list, enabled email Auth, and rejection of anonymous status changes. The security advisor reported no issues, and the database contains zero shops.

Before accepting real shop owners, verify email delivery, session redirects, sign-out, and photo MIME/size/ownership enforcement through the actual browser and Storage APIs. Check status changes from a separate browser, the displayed India timestamp, expiry, and network-error behavior. These browser flows have not yet been verified on a deployed site.

Public search currently loads published listings in pages of 250 and matches them in the browser. This avoids Supabase's single-response row limit and is suitable for an initial town directory; move search to a paginated server query when the directory grows substantially.

References: [Row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Supabase changelog](https://supabase.com/changelog).
