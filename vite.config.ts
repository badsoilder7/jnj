// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { resolveDirectoryConfig } from "./src/lib/public-config";

export default defineConfig({
  vite: {
    plugins: [
      {
        name: "mana-public-config",
        configResolved(config) {
          resolveDirectoryConfig(
            config.env["VITE_SUPABASE_URL"],
            config.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
            config.env["VITE_DIRECTORY_MODE"],
          );
        },
      },
    ],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
