# Supabase connection

## 1. Project

Choose the intended Supabase organization and confirm the project's quoted cost before creating it. Suggested project name: `mana-proddatur`; region: Mumbai (`ap-south-1`). The account connection alone does not create a database project.

## 2. Schema

Apply `supabase/migrations/20260914135102_local_shop_directory.sql` once through Supabase migrations. It creates only `public.shops`, status functions/triggers, a `shop-photos` bucket, and ownership policies. Do not import the fictional demo shops into production.

The migration was created with Supabase CLI 2.117.0. With a linked local project, the migration can be deployed using that version:

```sh
npm exec --yes --package=supabase@2.117.0 -- supabase db push
```

Alternatively apply the migration with the connected Supabase migration tool so the migration is recorded in its history. After applying it, confirm the public schema is exposed to the Data API, check the security advisors, and regenerate TypeScript database types from the hosted schema if a generated client is introduced. The current repository validates explicit response fields using Zod rather than asserting generated types from an unavailable database.

## 3. Public app configuration

Use the project's HTTPS URL and **publishable** key in the two variables from `.env.example`. Set them in Cloudflare's build variables before building. They are browser configuration; service-role keys, project passwords, and Supabase access tokens must never be VITE variables or committed files.

The owner workspace is a browser client. Authentication and authorization happen through Supabase Auth and Postgres RLS; SSR does not hold an owner session or a privileged database key.

## 4. Email sign-in

Enable email authentication with confirmation. The app uses the standard email magic-link flow. Set the site's real HTTPS origin as the Auth Site URL and allow the exact redirect URL `<site-origin>/owners`. Add local/preview URLs only when needed. Keep the standard confirmation link in the email template.

Configure custom SMTP before public onboarding. Supabase's default sender is restricted to project-team addresses and is intended for setup/testing. See [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp) and [passwordless sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless).

## 5. Review a submitted shop

Use the Supabase dashboard with an administrator account. Review its public contact details, address in 516360, photo, keyword tags, and the submitter's authority to manage it. Then set `published` to `true` for that specific `shops` row. Setting it to `false` removes the listing from public search on the next refresh.

Owners cannot change `published`, `owner_id`, IDs, postal code, or server timestamps. Ownership transfers and deletion are administrator operations. There is no browser administrator role or user-editable metadata that grants elevated access.

Shop photos are public business assets, including photos uploaded while a listing awaits review. The form discloses this before saving. Uploads use unique file names and do not overwrite another shop's files. Old/unreferenced uploads are retained to avoid deleting an image after an uncertain network write; add an administrator retention/cleanup process as the directory grows.

## 6. Verify the hosted connection

Before accepting real shop owners, use two test accounts to verify draft visibility, approval, cross-owner editing denial, upload ownership, and sign-out. Confirm anonymous requests can read only published shop fields and cannot write. Check a status change from a separate browser, the displayed India timestamp, expiry, and network-error behavior. Test email delivery and photo MIME/size enforcement through the actual hosted APIs.

Public search currently loads published listings in pages of 250 and matches them in the browser. This avoids Supabase's single-response row limit and is suitable for an initial town directory; move search to a paginated server query when the directory grows substantially.

References: [Row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Supabase changelog](https://supabase.com/changelog).
