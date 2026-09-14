// Existing Lovable images are used automatically once exported through GitHub.
// The text-only connector cannot transfer their binary bytes; missing photos use an accessible fallback.
const assets = import.meta.glob<string>("../assets/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});
const footwear = assets["../assets/demo-footwear.jpg"] ?? "";
const clothing = assets["../assets/demo-clothing.jpg"] ?? "";
const mobiles = assets["../assets/demo-mobiles.jpg"] ?? "";
const groceries = assets["../assets/demo-groceries.jpg"] ?? "";
const hardware = assets["../assets/demo-hardware.jpg"] ?? "";
const stationery = assets["../assets/demo-stationery.jpg"] ?? "";

export const categories = [
  "All shops",
  "Footwear",
  "Clothing",
  "Mobiles",
  "Groceries",
  "Hardware",
  "Home essentials",
  "Stationery",
  "Services",
] as const;
export type Category = (typeof categories)[number];
export const categoryLabelsTe: Record<Category, string> = {
  "All shops": "అన్ని దుకాణాలు",
  Footwear: "పాదరక్షలు",
  Clothing: "దుస్తులు",
  Mobiles: "మొబైల్స్",
  Groceries: "కిరాణా",
  Hardware: "హార్డ్‌వేర్",
  "Home essentials": "గృహ అవసరాలు",
  Stationery: "స్టేషనరీ",
  Services: "సేవలు",
};
export type ShopStatus = "open" | "closed" | "break" | "unconfirmed";
export type Shop = {
  id: string;
  name: string;
  nameTe: string;
  category: Exclude<Category, "All shops">;
  categoryTe: string;
  description: string;
  descriptionTe: string;
  tags: string[];
  locality: string;
  address: string;
  landmark: string;
  hours: string;
  phone?: string;
  whatsapp?: string;
  mapsUrl?: string;
  images: string[];
  published?: boolean;
};
export type ShopEdit = Partial<
  Pick<
    Shop,
    | "name"
    | "description"
    | "address"
    | "phone"
    | "whatsapp"
    | "tags"
    | "nameTe"
    | "descriptionTe"
    | "category"
    | "locality"
    | "landmark"
    | "hours"
  >
> & { photo?: string };
export type StatusRecord = { status: ShopStatus; until?: string; updatedAt: string };

export const shops: Shop[] = [
  {
    id: "stride-footwear",
    name: "Stride Footwear",
    nameTe: "స్ట్రైడ్ ఫుట్‌వేర్",
    category: "Footwear",
    categoryTe: "పాదరక్షలు",
    description: "A sample neighbourhood footwear shop for everyday and school needs.",
    descriptionTe: "రోజువారీ మరియు పాఠశాల అవసరాలకు నమూనా పాదరక్షల దుకాణం.",
    tags: ["school shoes", "shoes", "cheppulu", "చెప్పులు", "sandals", "socks"],
    locality: "Gandhi Road",
    address: "Sample address, Gandhi Road, Proddatur 516360",
    landmark: "Near the sample clock tower landmark",
    hours: "Mon–Sat, 9:30 AM–8:30 PM",
    images: [footwear, footwear],
  },
  {
    id: "vastra-corner",
    name: "Vastra Corner",
    nameTe: "వస్త్ర కార్నర్",
    category: "Clothing",
    categoryTe: "దుస్తులు",
    description: "Illustrative family clothing and fabric shop.",
    descriptionTe: "కుటుంబ దుస్తులు మరియు వస్త్రాల నమూనా దుకాణం.",
    tags: ["shirts", "sarees", "uniforms", "dress material", "బట్టలు"],
    locality: "Gandhi Road",
    address: "Sample address, Gandhi Road, Proddatur 516360",
    landmark: "Beside a sample community hall",
    hours: "Daily, 10:00 AM–9:00 PM",
    images: [clothing, clothing],
  },
  {
    id: "connect-mobile-point",
    name: "Connect Mobile Point",
    nameTe: "కనెక్ట్ మొబైల్ పాయింట్",
    category: "Mobiles",
    categoryTe: "మొబైల్స్",
    description: "Sample mobile accessories and device service counter.",
    descriptionTe: "మొబైల్ ఉపకరణాలు మరియు సేవల నమూనా కేంద్రం.",
    tags: ["charger", "cable", "phone cases", "screen guard", "mobile service"],
    locality: "Mydukur Road",
    address: "Sample address, Mydukur Road, Proddatur 516360",
    landmark: "Opposite a sample bus stop",
    hours: "Mon–Sat, 10:00 AM–8:00 PM",
    images: [mobiles, mobiles],
  },
  {
    id: "annapurna-provisions",
    name: "Annapurna Provisions",
    nameTe: "అన్నపూర్ణ ప్రొవిజన్స్",
    category: "Groceries",
    categoryTe: "కిరాణా",
    description: "Illustrative provisions shop for pantry staples.",
    descriptionTe: "రోజువారీ కిరాణా అవసరాలకు నమూనా దుకాణం.",
    tags: ["rice", "biyyam", "బియ్యం", "dal", "spices", "oil"],
    locality: "Rameswaram Road",
    address: "Sample address, Rameswaram Road, Proddatur 516360",
    landmark: "Near a sample temple junction",
    hours: "Daily, 8:00 AM–9:00 PM",
    images: [groceries, groceries],
  },
  {
    id: "rayalaseema-hardware",
    name: "Rayalaseema Hardware",
    nameTe: "రాయలసీమ హార్డ్‌వేర్",
    category: "Hardware",
    categoryTe: "హార్డ్‌వేర్",
    description: "Sample hardware and building supplies shop.",
    descriptionTe: "హార్డ్‌వేర్ మరియు నిర్మాణ సామగ్రి నమూనా దుకాణం.",
    tags: ["cement", "tools", "pipes", "paint brushes", "fasteners"],
    locality: "Jammalamadugu Road",
    address: "Sample address, Jammalamadugu Road, Proddatur 516360",
    landmark: "Near a sample petrol station",
    hours: "Mon–Sat, 8:30 AM–7:30 PM",
    images: [hardware, hardware],
  },
  {
    id: "little-learners",
    name: "Little Learners Stationery",
    nameTe: "లిటిల్ లెర్నర్స్ స్టేషనరీ",
    category: "Stationery",
    categoryTe: "స్టేషనరీ",
    description: "Illustrative school and office stationery shop.",
    descriptionTe: "పాఠశాల మరియు కార్యాలయ స్టేషనరీ నమూనా దుకాణం.",
    tags: ["notebooks", "pens", "school bags", "art supplies", "xerox"],
    locality: "Holmespet",
    address: "Sample address, Holmespet, Proddatur 516360",
    landmark: "Behind a sample school gate",
    hours: "Mon–Sat, 9:00 AM–8:00 PM",
    images: [stationery, stationery],
  },
  {
    id: "sri-home-needs",
    name: "Sri Home Needs",
    nameTe: "శ్రీ హోమ్ నీడ్స్",
    category: "Home essentials",
    categoryTe: "గృహ అవసరాలు",
    description: "Sample shop for practical household essentials.",
    descriptionTe: "ఉపయోగకరమైన గృహ అవసరాల నమూనా దుకాణం.",
    tags: ["utensils", "storage boxes", "cleaning", "kitchen", "buckets"],
    locality: "YMR Colony",
    address: "Sample address, YMR Colony, Proddatur 516360",
    landmark: "Near a sample park entrance",
    hours: "Daily, 9:30 AM–8:30 PM",
    images: [stationery, stationery],
  },
  {
    id: "quick-fix-services",
    name: "Quick Fix Services",
    nameTe: "క్విక్ ఫిక్స్ సర్వీసెస్",
    category: "Services",
    categoryTe: "సేవలు",
    description: "Illustrative repair desk for small household appliances.",
    descriptionTe: "చిన్న గృహోపకరణాల మరమ్మతులకు నమూనా సేవా కేంద్రం.",
    tags: ["mixer repair", "fan repair", "iron repair", "electrical service"],
    locality: "Mydukur Road",
    address: "Sample address, Mydukur Road, Proddatur 516360",
    landmark: "Next to a sample pharmacy",
    hours: "Mon–Sat, 10:00 AM–7:00 PM",
    images: [hardware, hardware],
  },
  {
    id: "campus-shoe-mart",
    name: "Campus Shoe Mart",
    nameTe: "క్యాంపస్ షూ మార్ట్",
    category: "Footwear",
    categoryTe: "పాదరక్షలు",
    description: "Illustrative footwear shop focused on school and everyday styles.",
    descriptionTe: "పాఠశాల మరియు రోజువారీ పాదరక్షల నమూనా దుకాణం.",
    tags: ["school shoes", "black shoes", "white shoes", "cheppulu", "చెప్పులు"],
    locality: "Holmespet",
    address: "Sample address, Holmespet, Proddatur 516360",
    landmark: "Near a sample book depot",
    hours: "Mon–Sat, 9:30 AM–8:00 PM",
    images: [footwear, footwear],
  },
  {
    id: "daily-basket",
    name: "Daily Basket",
    nameTe: "డైలీ బాస్కెట్",
    category: "Groceries",
    categoryTe: "కిరాణా",
    description: "Sample local shop for everyday provisions.",
    descriptionTe: "రోజువారీ కిరాణా కోసం నమూనా స్థానిక దుకాణం.",
    tags: ["rice", "biyyam", "బియ్యం", "snacks", "soap", "household supplies"],
    locality: "YMR Colony",
    address: "Sample address, YMR Colony, Proddatur 516360",
    landmark: "Near a sample water tank",
    hours: "Daily, 7:30 AM–9:00 PM",
    images: [groceries, groceries],
  },
];
export const localities = [
  "All localities",
  ...Array.from(new Set(shops.map((shop) => shop.locality))),
] as const;
const aliasGroups = [
  ["shoe", "shoes", "school shoe", "school shoes", "cheppulu", "చెప్పులు", "footwear"],
  ["rice", "biyyam", "బియ్యం"],
  ["charger", "charging", "cable"],
  ["cement", "building material", "hardware"],
];
export function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}
function editDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const old = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = old;
    }
  }
  return row[b.length]!;
}
export function matchesShop(shop: Shop, query: string) {
  const q = normalize(query);
  if (!q) return true;
  const hay = normalize(
    [shop.name, shop.nameTe, shop.category, shop.categoryTe, ...shop.tags].join(" "),
  );
  if (hay.includes(q)) return true;
  const group = aliasGroups.find((g) => g.some((a) => normalize(a) === q));
  if (group?.some((a) => hay.includes(normalize(a)))) return true;
  return q
    .split(" ")
    .every((term) =>
      hay
        .split(" ")
        .some((token) => token === term || (term.length >= 5 && editDistance(term, token) <= 1)),
    );
}
export function effectiveStatus(record?: StatusRecord, now = Date.now()): StatusRecord {
  const unknown = { status: "unconfirmed" as const, updatedAt: record?.updatedAt ?? "" };
  if (!record || !Number.isFinite(Date.parse(record.updatedAt))) return unknown;
  if (record.status === "open" || record.status === "break") {
    const until = Date.parse(record.until ?? "");
    const updated = Date.parse(record.updatedAt);
    if (
      !Number.isFinite(until) ||
      until <= now ||
      until > updated + 12 * 60 * 60 * 1000 ||
      updated > now
    )
      return unknown;
  }
  if (!["open", "closed", "break", "unconfirmed"].includes(record.status)) return unknown;
  return record;
}
export const DEMO_STORE_KEY = "mana-proddatur-demo-v1";
export type DemoStore = { edits: Record<string, ShopEdit>; statuses: Record<string, StatusRecord> };
export const emptyStore: DemoStore = { edits: {}, statuses: {} };
