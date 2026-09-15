# Cloudflare Workers deployment

This TanStack Start app uses Lovable's Vite configuration and Nitro's `cloudflare-module` target. `npm run build` generates the Worker entry, static assets, and deployment configuration under `.output/`. Deploy the complete Worker, not just the static files.

## GitHub integration

In Cloudflare Workers Builds, connect `badsoilder7/jnj`, select branch `main`, and use:

| Setting         | Value                                                      |
| --------------- | ---------------------------------------------------------- |
| Root            | Repository root                                            |
| Worker name     | `mana-proddatur`                                           |
| Node version    | 24                                                         |
| Build command   | `npm ci && npm run typecheck && npm test && npm run build` |
| Deploy command  | `npm run deploy`                                           |
| Build variables | None required for the connected Supabase project           |

The deploy script points Wrangler at `.output/server/wrangler.json`, which contains the asset binding and module entry. The scripts explicitly set the Worker name to `mana-proddatur`, overriding Nitro's repository-derived default. The Wrangler version is locked in `package-lock.json`.

Build once, then check packaging without publishing:

```sh
npm run build
npm run deploy:check
```

After connecting the correct Cloudflare account, `npm run deploy` publishes the build. The approved Supabase project is the default browser configuration. To override it, set both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as build variables. Supabase values are compiled into the browser bundle, so changing only Worker runtime variables is insufficient; rebuild when the public project configuration changes. Keep `VITE_DIRECTORY_MODE` absent or `live` for the real directory.

After deployment, configure the resulting HTTPS origin and `/owners` redirect in Supabase Auth, then run the hosted checks in [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Add a custom domain through Cloudflare when the default Worker URL is verified.

A permanent Cloudflare account connection has not been established in this session. The installed Wrangler CLI is not authenticated, and no Cloudflare connector is available. The production bundle and deployment dry-run pass. Do not commit account tokens or temporary account claim links to this repository.

## Temporary preview — 2026-09-15

The connected app was deployed successfully with Wrangler's supported `--temporary` option. Preview origin: `https://mana-proddatur.shore-spinosaurus-6a2.workers.dev`. Worker version: `4b625ed3-40cf-4c04-9da3-1ec174208e13`; startup time reported by Cloudflare: 5 ms.

This temporary account must be claimed through the private link returned by Wrangler within 60 minutes of creation. An unclaimed preview expires; this URL is not a permanent production deployment. The claim link is intentionally excluded from the repository. GitHub automatic deployments still require the Workers Builds connection described above.

Browser checks passed for the live directory's empty state, search URL updates, category filters, filter reset, English/Telugu switching, and navigation to the owner email sign-in form. No sign-in email was sent. Configure and verify public email authentication before onboarding owners.

References: [Cloudflare TanStack Start](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/), [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
