# Cloudflare Workers deployment

This TanStack Start app uses Lovable's Vite configuration and Nitro's `cloudflare-module` target. `npm run build` generates the Worker entry, static assets, and deployment configuration under `.output/`. Deploy the complete Worker, not just the static files.

## Requested address

The requested account subdomain is `manaproddutur.workers.dev`. Cloudflare's public Worker routes include a Worker name before that account subdomain: `<worker>.<account-subdomain>.workers.dev`. The account subdomain alone is not the route for this app.

The selected shorter format is `app.manaproddutur.workers.dev`, subject to account-subdomain availability. It requires Worker name `app` and account subdomain `manaproddutur`. The repository now includes `npm run deploy:app` and its dry-run, `npm run deploy:app:check`, with the matching Worker name. Neither address availability nor the account/Worker rename has been confirmed.

Cloudflare documents the account setting under **Workers & Pages > Your subdomain > Change**. This setting changes the shared account subdomain for its Workers, so use the account containing this project. After choosing the final address, update Supabase's Site URL and the exact `/owners` redirect. See [Cloudflare's workers.dev documentation](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/).

After renaming the existing Worker to `app`, use these settings for its GitHub build connection:

| Setting | Value |
| --- | --- |
| Worker name | `app` |
| Account subdomain | `manaproddutur` (if available) |
| Repository / branch | `badsoilder7/jnj` / `main` |
| Build command | `npm ci && npm run typecheck && npm test && npm run build` |
| Deploy command | `npm run deploy:app` |

The original `npm run deploy` still targets `mana-proddatur` for the current deployment. Select the script matching the Worker being deployed.

## GitHub integration

Open the existing `mana-proddatur` Worker in Cloudflare, then **Settings > Build**. Connect `badsoilder7/jnj`, select branch `main`, and use:

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

The user reported successfully claiming the Cloudflare account on 2026-09-15. Claiming the account does not authenticate this coding environment: Wrangler still reports no authenticated user, and no Cloudflare connector is available. Connecting Workers Builds remains an account-dashboard step. The production bundle and deployment dry-run passed. Do not commit account tokens or temporary account claim links to this repository.

The user subsequently reported completing the device sign-in screen, but this environment blocked the authorization follow-up to `https://dash.cloudflare.com:443` by network policy. A subsequent `wrangler whoami` still reported no authenticated user. The rename must be completed through an authorized account connection or the user's dashboard; repeatedly issuing device codes does not resolve this environment block.

`npm run deploy:app:check` passed with the existing production bundle, confirming that the renamed deployment can be packaged. This dry-run did not change the hosted Worker or account subdomain. The account was originally named **Shore Spinosaurus**; if renamed after claiming, identify it by the existing `mana-proddatur` Worker.

## Temporary preview — 2026-09-15

The connected app was deployed successfully with Wrangler's supported `--temporary` option. Preview origin: `https://mana-proddatur.shore-spinosaurus-6a2.workers.dev`. Worker version: `4b625ed3-40cf-4c04-9da3-1ec174208e13`; startup time reported by Cloudflare: 5 ms.

The initial account had a 60-minute claim window; the user subsequently reported completing the claim. The claim link is intentionally excluded from the repository. GitHub automatic deployments still require the Workers Builds connection described above.

Browser checks passed for the live directory's empty state, search URL updates, category filters, filter reset, English/Telugu switching, and navigation to the owner email sign-in form. No sign-in email was sent. Configure and verify public email authentication before onboarding owners.

A later automated HTTP check received HTTP 403 with Cloudflare error `1010`. This environment could not re-verify the website after the claim; that response does not establish whether it loads for the user. Use the Worker URL currently displayed in your dashboard when configuring Supabase redirects. Do not create another temporary deployment to replace the claimed Worker.

References: [Cloudflare TanStack Start](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/), [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
