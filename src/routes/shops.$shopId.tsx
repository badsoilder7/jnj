import { ShopPhoto } from "@/components/mana/shop-photo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, Clock3, MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/components/mana/demo-provider";
import { copy } from "@/components/mana/i18n";
import { ContactButton, StatusBadge } from "@/components/mana/shop-card";
const schema = z.object({ from: z.string().catch("/").default("/") });
export const Route = createFileRoute("/shops/$shopId")({
  validateSearch: (input) => schema.parse(input),
  head: () => ({
    meta: [
      { title: "Shop preview — Mana Proddatur" },
      {
        name: "description",
        content:
          "View sample shop information, opening hours, and contact actions on Mana Proddatur.",
      },
      { property: "og:title", content: "Shop preview — Mana Proddatur" },
      {
        property: "og:description",
        content: "Sample local shop details for the Mana Proddatur UI preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopDetail,
});
function ShopDetail() {
  const { shopId } = Route.useParams();
  const { from } = Route.useSearch();
  const { language, shops, store } = useDemo();
  const t = copy[language];
  const shop = shops.find((s) => s.id === shopId);
  if (!shop)
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 text-center">
        <div>
          <Store className="mx-auto size-12 text-primary" />
          <h1 className="mt-4 text-3xl font-extrabold">{t.notFound}</h1>
          <Button asChild className="mt-6">
            <Link
              to="/"
              search={{ q: "", category: "All shops", locality: "All localities", open: false }}
            >
              {t.returnBrowse}
            </Link>
          </Button>
        </div>
      </main>
    );
  const back = from === "/" || from.startsWith("/?") ? from : "/";
  return (
    <main className="pb-24 sm:pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <a
          href={back}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary focus-ring"
        >
          <ArrowLeft />
          {t.back}
        </a>
        <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="aspect-3/2 overflow-hidden rounded-2xl bg-muted">
            <ShopPhoto src={shop.images[0]} alt={`${shop.name} — ${t.photoNote}`} />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="aspect-3/2 overflow-hidden rounded-2xl bg-muted">
              <ShopPhoto
                src={shop.images[1] ?? shop.images[0]}
                alt={`${shop.name} — ${t.photoNote}`}
              />
            </div>
            <div className="flex aspect-3/2 items-center justify-center rounded-2xl border border-notice-border bg-notice p-6 text-center text-sm font-semibold text-notice-foreground">
              {t.photoNote}
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)]">
          <article>
            <p className="font-bold text-primary">
              {language === "te" ? shop.categoryTe : shop.category}
            </p>
            <h1 className="mt-1 font-display text-4xl font-extrabold leading-tight">
              {language === "te" ? shop.nameTe : shop.name}
            </h1>
            <div className="mt-4">
              <StatusBadge record={store.statuses[shop.id]} />
            </div>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {language === "te" ? shop.descriptionTe : shop.description}
            </p>
            <section className="mt-8">
              <h2 className="text-xl font-extrabold">{t.findHere}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {shop.tags.map((tag) => (
                  <span
                    className="rounded-lg bg-secondary px-3 py-2 text-sm font-semibold"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
            <div className="mt-8 rounded-xl border border-notice-border bg-notice p-4 font-semibold text-notice-foreground">
              {t.availability}
            </div>
          </article>
          <aside className="space-y-4">
            <section className="rounded-xl border border-border p-5">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <MapPin className="text-primary" />
                {t.address}
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                {shop.address}
                <br />
                <strong className="text-foreground">{shop.landmark}</strong>
              </p>
            </section>
            <section className="rounded-xl border border-border p-5">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Clock3 className="text-primary" />
                {t.hours}
              </h2>
              <p className="mt-3 font-semibold">{shop.hours}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.hoursNote}</p>
            </section>
          </aside>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-3 backdrop-blur sm:static sm:mx-auto sm:mt-2 sm:flex sm:max-w-7xl sm:gap-2 sm:border-0 sm:bg-transparent sm:px-6 sm:backdrop-blur-none lg:px-8">
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-2 sm:mx-0 sm:w-full">
          <ContactButton kind="call" href={shop.phone ? `tel:${shop.phone}` : undefined} />
          <ContactButton
            kind="whatsapp"
            href={shop.whatsapp ? `https://wa.me/${shop.whatsapp.replace(/\D/g, "")}` : undefined}
          />
          <ContactButton kind="directions" href={shop.mapsUrl} />
        </div>
      </div>
    </main>
  );
}
