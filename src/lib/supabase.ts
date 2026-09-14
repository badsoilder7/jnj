import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { validatePublicConfig } from "./public-config";

const url = import.meta.env["VITE_SUPABASE_URL"]?.trim() ?? "";
const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim() ?? "";
export const liveMode = Boolean(url || key);
let client: SupabaseClient | undefined;

// A browser-only singleton: no session is ever shared between SSR requests.
export function getSupabase() {
  if (typeof window === "undefined") throw new Error("Owner access requires a browser.");
  if (validatePublicConfig(url, key) !== "live") {
    throw new Error("The live directory connection is not configured correctly.");
  }
  client ??= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: init?.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
            : AbortSignal.timeout(15000),
        }),
    },
  });
  return client;
}
