export function validatePublicConfig(url: string | undefined, key: string | undefined) {
  const endpoint = url?.trim() ?? "";
  const publicKey = key?.trim() ?? "";
  if (!endpoint && !publicKey) return "demo" as const;
  if (!endpoint || !publicKey.startsWith("sb_publishable_")) {
    throw new Error(
      "Set both VITE_SUPABASE_URL and a public sb_publishable_ key. Secret and service-role keys must never enter the frontend build.",
    );
  }
  const parsed = new URL(endpoint);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      "VITE_SUPABASE_URL must be a secure project URL without credentials, a query or a fragment.",
    );
  }
  return "live" as const;
}
