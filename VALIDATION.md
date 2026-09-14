# Validation

- `npm run build`: passed (client, SSR and Cloudflare-module Worker bundle).
- `npx tsc --noEmit`: passed after fixing typed search navigation.
- `node tests/directory.mjs`: passed search aliases, Telugu marks, name search, typo tolerance, no-results precision, expiry, malformed timestamp and overlong confirmation rejection.
- Visual/browser interaction QA: not completed. Cloud Browser rejected the local preview address; local HTTP smoke checks could not reach the server.
- Production GitHub push, Cloudflare deployment, and Supabase connection: not performed.
- Original JPEG/ICO bytes: unavailable through text export, not included. Original filenames remain supported when the proper GitHub export restores them.
