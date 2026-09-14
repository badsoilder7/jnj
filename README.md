# Mana Proddatur

A bilingual local shop directory for Proddatur 516360. Search shop names, categories and shop-level keywords. No product catalogue, inventory, cart or checkout.

## Run

Requires Node.js 22.12+ (validated with Node 24) and npm.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

The current Lovable configuration builds a Cloudflare Worker bundle. Production hosting and account connections have not been configured. Do not deploy this preview as a verified business directory.

## Implemented

- Search, category/locality filters, owner-confirmed-open filter and empty results.
- English/Telugu controls and search aliases; shop detail routes with preserved results links.
- Owner preview with editable name, bilingual descriptions, address, public contact numbers, keywords and validated local photo uploads.
- Open/closed/break status; time-bound confirmations expire after at most 12 hours, with India time displayed. Business hours never auto-confirm opening.
- Local-only save feedback, validated cached data, and visible failures when browser storage is unavailable.
- Accessible image fallback and cobalt/white UI theme.

## Demo boundaries

Ten fictional sample shops. No verified addresses, contacts, opening status, ratings or reviews. Owner access is an explicitly labelled local demo, not production authentication. Edits exist only in this browser. Live Supabase persistence, ownership verification, authorization and admin tools are pending.

## Images and export

The Lovable text-file tool cannot recover binary JPEG/ICO files intact. This package contains no corrupt image bytes. Shop cards show an accessible photo placeholder until assets are available. The original project contains six `src/assets/demo-*.jpg` files. Export the original project using Lovable's GitHub connection to transfer those images, then apply the accompanying patch; it does not delete the images. The app discovers them automatically. Alternatively use the owner photo editor to preview your own photos locally.

## Source repository

Source is maintained in [badsoilder7/jnj](https://github.com/badsoilder7/jnj). This is a direct source export of the repaired app. Automatic synchronization with the original Lovable project has not been verified.

## Validation

Production build passed; search/status regression checks passed. TypeScript validation is recorded in VALIDATION.md. Cloud Browser could not access the local server, so interactive/visual QA remains pending. Backend integration and production security are not claimed complete.
