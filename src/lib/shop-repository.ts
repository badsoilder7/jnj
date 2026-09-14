import { z } from "zod";
import { getSupabase } from "./supabase";
import { shopEditSchema } from "./shop-validation";
import {
  categoryLabelsTe,
  type Shop,
  type ShopEdit,
  type ShopStatus,
  type StatusRecord,
} from "./mana-data";

const rowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  name_te: z.string(),
  category: z.enum([
    "Footwear",
    "Clothing",
    "Mobiles",
    "Groceries",
    "Hardware",
    "Home essentials",
    "Stationery",
    "Services",
  ]),
  description: z.string(),
  description_te: z.string(),
  tags: z.array(z.string()),
  locality: z.string(),
  address: z.string(),
  landmark: z.string(),
  hours: z.string(),
  phone: z.string().nullable(),
  whatsapp: z.string().nullable(),
  photo_path: z.string().nullable(),
  published: z.boolean(),
  status: z.enum(["open", "closed", "break", "unconfirmed"]),
  status_updated_at: z.string().nullable(),
  status_expires_at: z.string().nullable(),
});
type Row = z.infer<typeof rowSchema>;
// Explicit columns exclude owner IDs from the public payload.
const columns =
  "id,name,name_te,category,description,description_te,tags,locality,address,landmark,hours,phone,whatsapp,photo_path,published,status,status_updated_at,status_expires_at";
export type DirectorySnapshot = { shops: Shop[]; statuses: Record<string, StatusRecord> };
export type NewShop = Pick<Shop, "name" | "category" | "address" | "locality">;

function toShop(row: Row): Shop {
  return {
    id: row.id,
    name: row.name,
    nameTe: row.name_te || row.name,
    category: row.category,
    categoryTe: categoryLabelsTe[row.category]!,
    description: row.description,
    descriptionTe: row.description_te || row.description,
    tags: row.tags,
    locality: row.locality,
    address: row.address,
    landmark: row.landmark,
    hours: row.hours,
    ...(row.phone ? { phone: row.phone } : {}),
    ...(row.whatsapp ? { whatsapp: row.whatsapp } : {}),
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${row.name}, ${row.address}, ${row.locality}, Proddatur 516360`)}`,
    images: row.photo_path
      ? [getSupabase().storage.from("shop-photos").getPublicUrl(row.photo_path).data.publicUrl]
      : [],
    published: row.published,
  };
}
export async function loadDirectory(ownerId?: string): Promise<DirectorySnapshot> {
  const rows: Row[] = [];
  // Traverse every page instead of silently truncating at Supabase's response limit.
  for (let offset = 0; ; offset += 250) {
    let query = getSupabase()
      .from("shops")
      .select(columns)
      .order("id")
      .range(offset, offset + 249);
    query = ownerId ? query.eq("owner_id", ownerId) : query.eq("published", true);
    const { data, error } = await query;
    if (error) throw error;
    const page = z.array(rowSchema).parse(data);
    rows.push(...page);
    if (page.length < 250) break;
  }
  return {
    shops: rows.map(toShop),
    statuses: Object.fromEntries(
      rows
        .filter((r) => r.status_updated_at)
        .map((r) => [
          r.id,
          {
            status: r.status,
            updatedAt: r.status_updated_at!,
            ...(r.status_expires_at ? { until: r.status_expires_at } : {}),
          },
        ]),
    ),
  };
}
function toColumns(edit: ShopEdit) {
  const e = shopEditSchema.parse(edit);
  const map = {
    name: "name",
    nameTe: "name_te",
    description: "description",
    descriptionTe: "description_te",
    category: "category",
    address: "address",
    locality: "locality",
    landmark: "landmark",
    hours: "hours",
    phone: "phone",
    whatsapp: "whatsapp",
    tags: "tags",
  } as const;
  return Object.fromEntries(
    Object.entries(map).flatMap(([key, column]) => {
      const value = e[key as keyof typeof map];
      return value === undefined
        ? []
        : [[column, (key === "phone" || key === "whatsapp") && !value ? null : value]];
    }),
  );
}
export async function createShop(input: NewShop): Promise<string> {
  const { data, error } = await getSupabase()
    .from("shops")
    .insert(toColumns(input))
    .select("id")
    .single();
  if (error) throw error;
  return z.object({ id: z.string().uuid() }).parse(data).id;
}
export async function updateShop(id: string, edit: ShopEdit, photo?: File) {
  const client = getSupabase();
  const payload = toColumns(edit);
  if (photo) {
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = extensions[photo.type];
    if (!ext || photo.size > 3 * 1024 * 1024)
      throw new Error("Choose a JPG, PNG or WebP under 3 MB.");
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw new Error("Sign in again to upload your shop photo.");
    const path = `${data.user.id}/${id}/${crypto.randomUUID()}.${ext}`;
    const upload = await client.storage
      .from("shop-photos")
      .upload(path, photo, { contentType: photo.type, upsert: false });
    if (upload.error) throw upload.error;
    payload["photo_path"] = path;
  }
  const { data, error } = await client
    .from("shops")
    .update(payload)
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
  if (!data) throw new Error("This shop could not be updated. Check your owner account.");
}
export async function updateShopStatus(id: string, status: ShopStatus, durationHours: number) {
  if (!["open", "closed", "break"].includes(status)) throw new Error("Choose a shop status.");
  const { error } = await getSupabase().rpc("set_shop_status", {
    shop_id: id,
    new_status: status,
    duration_minutes: Math.round(durationHours * 60),
  });
  if (error) throw error;
}
