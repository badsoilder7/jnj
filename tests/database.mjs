import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Real Postgres SQL/RLS, with minimal auth/storage fixtures. This does not test
// Supabase's hosted Auth emails, PostgREST column discovery or the Storage HTTP API.
const db = new PGlite();
const owner = "11111111-1111-4111-8111-111111111111";
const stranger = "22222222-2222-4222-8222-222222222222";
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create schema storage;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
  grant usage on schema auth, storage to anon, authenticated, service_role;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid default gen_random_uuid() primary key, bucket_id text references storage.buckets(id), name text);
  alter table storage.objects enable row level security;
  grant select, insert, update, delete on storage.objects to anon, authenticated;
  create function storage.foldername(text) returns text[] language sql immutable as $$
    select (string_to_array($1, '/'))[1:array_length(string_to_array($1, '/'), 1)-1];
  $$;
`);
await db.query("insert into auth.users values ($1), ($2)", [owner, stranger]);
await db.exec(
  await readFile(
    new URL("../supabase/migrations/20260915062310_local_shop_directory.sql", import.meta.url),
    "utf8",
  ),
);
async function as(role, uid = "") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid]);
  await db.exec(`set role ${role}`);
}
const rejected = async (sql, args = []) =>
  assert.rejects(db.query(sql, args), (error) =>
    ["42501", "23514", "22023", "22001"].includes(error.code),
  );
await as("authenticated", owner);
const {
  rows: [shop],
} = await db.query(`insert into public.shops (name, category, locality, address)
  values ('Test shop', 'Footwear', 'Test street', 'Test address in Proddatur') returning *`);
assert.equal(shop.owner_id, owner);
assert.equal(shop.published, false);
assert.equal(shop.status, "unconfirmed");
assert.equal(shop.status_updated_at, null);
await rejected("update public.shops set published = true where id = $1", [shop.id]);
await rejected("update public.shops set owner_id = $1 where id = $2", [stranger, shop.id]);
await rejected(
  `insert into public.shops (name,category,locality,address,published) values ('Fake','Footwear','Street','Address',true)`,
);
await rejected(
  `insert into public.shops (name,category,locality,address,owner_id) values ('Fake','Footwear','Street','Address',$1)`,
  [stranger],
);
await rejected(
  "update public.shops set status_expires_at = now() + interval '5 days' where id = $1",
  [shop.id],
);
await rejected("update public.shops set tags = $1 where id = $2", [
  [...Array(31).fill("shoe")],
  shop.id,
]);
await db.query("update public.shops set tags = $1, phone = $2 where id = $3", [
  ["shoes", "చెప్పులు"],
  "+919876543210",
  shop.id,
]);
await rejected("update public.shops set phone = $1 where id = $2", ["not-a-phone", shop.id]);
await db.query("select public.set_shop_status($1, $2, $3)", [shop.id, "open", 120]);
const {
  rows: [status],
} = await db.query(
  "select status, status_updated_at, status_expires_at from public.shops where id=$1",
  [shop.id],
);
assert.equal(status.status, "open");
assert.equal(new Date(status.status_expires_at) - new Date(status.status_updated_at), 7200000);
await rejected("select public.set_shop_status($1, $2, $3)", [shop.id, "open", 721]);
await rejected("select public.set_shop_status($1, $2, $3)", [shop.id, "fake", 120]);
const ownPhoto = `${owner}/${shop.id}/33333333-3333-4333-8333-333333333333.jpg`;
await db.query("insert into storage.objects(bucket_id,name) values ($1,$2)", [
  "shop-photos",
  ownPhoto,
]);
await rejected("insert into storage.objects(bucket_id,name) values ($1,$2)", [
  "shop-photos",
  `${stranger}/${shop.id}/photo.jpg`,
]);
await rejected("update public.shops set photo_path=$1 where id=$2", [
  `${stranger}/${shop.id}/33333333-3333-4333-8333-333333333333.jpg`,
  shop.id,
]);
await db.query("update public.shops set photo_path=$1 where id=$2", [ownPhoto, shop.id]);
await as("authenticated", stranger);
assert.equal((await db.query("select id from public.shops")).rows.length, 0);
assert.equal(
  (
    await db.query("update public.shops set name=$1 where id=$2 returning id", [
      "Hijacked",
      shop.id,
    ])
  ).rows.length,
  0,
);
await rejected("select public.set_shop_status($1,$2,$3)", [shop.id, "closed", 120]);
await rejected("insert into storage.objects(bucket_id,name) values ($1,$2)", [
  "shop-photos",
  `${stranger}/${shop.id}/photo.jpg`,
]);
assert.equal(
  (await db.query("delete from storage.objects where name=$1 returning id", [ownPhoto])).rows
    .length,
  0,
);
await as("anon");
assert.equal((await db.query("select id,name from public.shops")).rows.length, 0);
await rejected("select owner_id from public.shops");
await rejected("select public.set_shop_status($1,$2,$3)", [shop.id, "closed", 120]);
await rejected("update public.shops set name=$1 where id=$2", ["Hijacked", shop.id]);
await db.exec("reset role");
await db.query("update public.shops set published=true where id=$1", [shop.id]);
await as("anon");
assert.equal((await db.query("select id,name,status,photo_path from public.shops")).rows.length, 1);
assert.equal((await db.query("select id from storage.objects")).rows.length, 0);
await as("authenticated", stranger);
assert.equal((await db.query("select id from public.shops")).rows.length, 1);
assert.equal(
  (
    await db.query("update public.shops set name=$1 where id=$2 returning id", [
      "Still hijacked",
      shop.id,
    ])
  ).rows.length,
  0,
);
await as("authenticated", owner);
await db.query("select public.set_shop_status($1,$2,$3)", [shop.id, "closed", 120]);
const {
  rows: [closed],
} = await db.query("select status,status_expires_at from public.shops where id=$1", [shop.id]);
assert.equal(closed.status, "closed");
assert.equal(closed.status_expires_at, null);
await db.close();
console.log("Database migration and owner/public RLS checks passed.");
