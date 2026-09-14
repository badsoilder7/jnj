import { createFileRoute, Link } from "@tanstack/react-router";

import { z } from "zod";
import { useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Footprints,
  Shirt,
  Smartphone,
  ShoppingBasket,
  Hammer,
  House,
  NotebookPen,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, effectiveStatus, matchesShop } from "@/lib/mana-data";
import { DirectoryNotice } from "@/components/mana/directory-notice";
import { useDirectory } from "@/components/mana/directory-provider";
import { copy } from "@/components/mana/i18n";
import { ShopCard } from "@/components/mana/shop-card";
const schema = z.object({
  q: z.string().catch("").default(""),
  category: z.string().catch("All shops").default("All shops"),
  locality: z.string().catch("All localities").default("All localities"),
  open: z.boolean().catch(false).default(false),
});
export const Route = createFileRoute("/")({
  validateSearch: (input) => schema.parse(input),
  head: () => ({
    meta: [
      { title: "Mana Proddatur — Find local shops" },
      {
        name: "description",
        content:
          "Find shops in Proddatur 516360 by name or what they sell. View contact details and owner-confirmed opening status.",
      },
      { property: "og:title", content: "Mana Proddatur — Find local shops" },
      {
        property: "og:description",
        content: "A bilingual local shop finder for Proddatur 516360.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Browse,
});
const categoryTe: Record<string, string> = {
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
const icons = [
  SlidersHorizontal,
  Footprints,
  Shirt,
  Smartphone,
  ShoppingBasket,
  Hammer,
  House,
  NotebookPen,
  Wrench,
];
function Browse() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { language, shops, store, now, isLive, loading, error } = useDirectory();
  const localities = [
    "All localities",
    ...Array.from(new Set(shops.map((s) => s.locality))).sort(),
  ];
  const t = copy[language];
  const filtered = useMemo(
    () =>
      shops.filter(
        (shop) =>
          matchesShop(shop, search.q) &&
          (search.category === "All shops" || shop.category === search.category) &&
          (search.locality === "All localities" || shop.locality === search.locality) &&
          (!search.open || effectiveStatus(store.statuses[shop.id], now).status === "open"),
      ),
    [shops, search, store.statuses, now],
  );
  const set = (patch: Partial<typeof search>) =>
    navigate({ search: (old) => ({ ...old, ...patch }), replace: true });
  const clear = () =>
    navigate({
      search: { q: "", category: "All shops", locality: "All localities", open: false },
      replace: true,
    });
  return (
    <main>
      <section className="border-b border-border bg-secondary/35">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-primary">
              {language === "te" ? "మన ఊరు • మన దుకాణాలు" : "OUR TOWN • OUR SHOPS"}
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              {t.title}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">{t.subtitle}</p>
            <form
              className="mt-6 flex rounded-xl border border-border bg-background p-1.5 shadow-search focus-within:ring-2 focus-within:ring-ring"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="sr-only" htmlFor="shop-search">
                {t.search}
              </label>
              <Search className="ml-3 mt-3 size-5 shrink-0 text-primary" />
              <Input
                id="shop-search"
                value={search.q}
                onChange={(e) => set({ q: e.target.value.slice(0, 100) })}
                placeholder={t.placeholder}
                className="h-11 border-0 text-base shadow-none focus-visible:ring-0 md:text-base"
              />
              <Button type="submit" className="min-h-11 px-5">
                {t.search}
              </Button>
            </form>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
            {categories.map((cat, i) => {
              const Icon = icons[i] ?? Search;
              return (
                <button
                  key={cat}
                  onClick={() => set({ category: cat })}
                  className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-2 text-center text-xs font-bold transition duration-150 focus-ring ${search.category === cat ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary/40"}`}
                  aria-pressed={search.category === cat}
                >
                  <Icon className="size-5" />
                  <span>{language === "te" ? categoryTe[cat] : cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {!isLive ? (
          <div className="flex items-start gap-3 rounded-xl border border-notice-border bg-notice px-4 py-3">
            <span className="mt-0.5 rounded-md bg-warning px-2 py-1 text-xs font-extrabold text-warning-foreground">
              {t.sample}
            </span>
            <p className="text-sm leading-6 text-notice-foreground">{t.sampleNote}</p>
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            {language === "te"
              ? "స్థితిని యజమానులు స్వయంగా మారుస్తారు. ప్రతి 30 సెకన్లకు నవీకరిస్తాము. వెళ్లే ముందు అవసరమైన వస్తువు ఉందో సంప్రదించండి."
              : "Opening status is set by shop owners and refreshed every 30 seconds. Contact the shop to check availability before visiting."}
          </p>
        )}
        <DirectoryNotice />
        <div className="mt-5 grid gap-3 rounded-xl border border-border bg-background p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <label className="text-sm font-bold text-foreground">
            {t.category}
            <select
              value={search.category}
              onChange={(e) => set({ category: e.target.value })}
              className="mt-1 block min-h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
            >
              <option value="All shops">
                {language === "te" ? categoryTe["All shops"] : "All shops"}
              </option>
              {categories.slice(1).map((v) => (
                <option key={v} value={v}>
                  {language === "te"
                    ? (categoryTe[v] ?? (String(v) === "All localities" ? "అన్ని ప్రాంతాలు" : v))
                    : v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-foreground">
            {t.locality}
            <select
              value={search.locality}
              onChange={(e) => set({ locality: e.target.value })}
              className="mt-1 block min-h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
            >
              {localities.map((v) => (
                <option key={v} value={v}>
                  {language === "te"
                    ? (categoryTe[v] ?? (String(v) === "All localities" ? "అన్ని ప్రాంతాలు" : v))
                    : v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-input px-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={search.open}
              onChange={(e) => set({ open: e.target.checked })}
              className="size-5 accent-primary"
            />
            {t.openOnly}
          </label>
          <Button variant="ghost" onClick={clear} className="min-h-11">
            <X />
            {t.clear}
          </Button>
        </div>
        <div className="mt-7 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-primary">
              {filtered.length} {t.results}
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">
              {language === "te"
                ? (categoryTe[search.category] ?? search.category)
                : search.category}
            </h2>
          </div>
        </div>
        {loading || error ? null : filtered.length ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                record={store.statuses[shop.id]}
                from={`/?q=${encodeURIComponent(search.q)}&category=${encodeURIComponent(search.category)}&locality=${encodeURIComponent(search.locality)}&open=${search.open}`}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 grid min-h-72 place-items-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-background text-primary shadow-sm">
                <Search />
              </span>
              <h2 className="mt-4 text-xl font-extrabold">
                {isLive && !shops.length
                  ? language === "te"
                    ? "మన దుకాణాల డైరెక్టరీ మొదలవుతోంది"
                    : "Our local directory is taking shape"
                  : t.noResults}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                {isLive && !shops.length
                  ? language === "te"
                    ? "మొదటి దుకాణాలను జోడిస్తున్నాము. మీ దుకాణాన్ని నమోదు చేయండి."
                    : "The first shops are being added. Own a shop in Proddatur? Add yours for review."
                  : t.noHelp}
              </p>
              {isLive && !shops.length ? (
                <Button asChild className="mt-5 min-h-11">
                  <Link to="/owners">{t.owners}</Link>
                </Button>
              ) : (
                <Button onClick={clear} className="mt-5 min-h-11">
                  {t.clear}
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
