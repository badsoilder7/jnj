import assert from "node:assert/strict";
import { createServer } from "vite";
const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { shops, matchesShop, effectiveStatus, normalize } =
    await server.ssrLoadModule("/src/lib/mana-data.ts");
  for (const query of ["school shoes", "cheppulu", "చెప్పులు"])
    assert.equal(shops.filter((s) => matchesShop(s, query)).length, 2, query);
  for (const query of ["rice", "biyyam", "బియ్యం"])
    assert.equal(shops.filter((s) => matchesShop(s, query)).length, 2, query);
  assert.equal(shops.filter((s) => matchesShop(s, "Connect Mobile Point")).length, 1);
  assert.equal(shops.filter((s) => matchesShop(s, "charger")).length, 1);
  assert.equal(shops.filter((s) => matchesShop(s, "cement")).length, 1);
  assert.equal(shops.filter((s) => matchesShop(s, "unlisted specialty shoe")).length, 0);
  assert.equal(shops.filter((s) => matchesShop(s, "chargr")).length, 1);
  assert.equal(normalize("బియ్యం"), "బియ్యం");
  const { normalizeContact, shopEditSchema } = await server.ssrLoadModule(
    "/src/lib/shop-validation.ts",
  );
  assert.equal(normalizeContact("98765 43210"), "+919876543210");
  assert.equal(normalizeContact("98765 43210", true), "919876543210");
  assert.equal(normalizeContact("+44 20 7946 0958"), "+442079460958");
  assert.equal(normalizeContact(""), "");
  assert.equal(shopEditSchema.safeParse({ phone: normalizeContact("not a phone") }).success, false);
  const { validatePublicConfig } = await server.ssrLoadModule("/src/lib/public-config.ts");
  assert.equal(validatePublicConfig("", ""), "demo");
  assert.equal(
    validatePublicConfig("https://example.supabase.co", "sb_publishable_example"),
    "live",
  );
  assert.throws(() => validatePublicConfig("https://example.supabase.co", "sb_secret_example"));
  assert.throws(() => validatePublicConfig("https://example.supabase.co", ""));
  assert.throws(() => validatePublicConfig("http://example.supabase.co", "sb_publishable_example"));
  assert.throws(() =>
    validatePublicConfig("https://user:pass@example.supabase.co", "sb_publishable_example"),
  );
  const now = Date.now(),
    updatedAt = new Date(now - 60000).toISOString(),
    until = new Date(now + 60000).toISOString();
  assert.equal(effectiveStatus({ status: "open", updatedAt, until }, now).status, "open");
  assert.equal(
    effectiveStatus({ status: "open", updatedAt, until }, now + 60001).status,
    "unconfirmed",
  );
  assert.equal(
    effectiveStatus({ status: "break", updatedAt, until }, now + 60001).status,
    "unconfirmed",
  );
  assert.equal(effectiveStatus({ status: "open", updatedAt }, now).status, "unconfirmed");
  assert.equal(
    effectiveStatus({ status: "open", updatedAt, until: "bad-date" }, now).status,
    "unconfirmed",
  );
  assert.equal(
    effectiveStatus(
      { status: "open", updatedAt, until: new Date(now + 13 * 3600000).toISOString() },
      now,
    ).status,
    "unconfirmed",
  );
  assert.equal(effectiveStatus({ status: "closed", updatedAt }, now).status, "closed");
  assert.equal(effectiveStatus(undefined, now).status, "unconfirmed");
  console.log(
    "PASS: search aliases, Telugu preservation, exact shop search, typo matching, no-result precision, status expiry, and invalid confirmation rejection.",
  );
} finally {
  await server.close();
}
