import { ShopPhoto } from "./shop-photo";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Phone, Route, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { effectiveStatus, type Shop, type StatusRecord } from "@/lib/mana-data";
import { useDemo } from "./demo-provider";
import { copy } from "./i18n";
export function StatusBadge({ record }: { record?: StatusRecord | undefined }) {
  const { language, now } = useDemo();
  const t = copy[language];
  const r = effectiveStatus(record, now);
  const label =
    r.status === "open"
      ? t.open
      : r.status === "closed"
        ? t.closed
        : r.status === "break"
          ? t.break
          : t.unconfirmed;
  return (
    <span className="flex flex-col gap-1">
      <span
        className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-bold ${r.status === "open" ? "bg-success-soft text-success" : r.status === "closed" ? "bg-muted text-muted-foreground" : r.status === "break" ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground"}`}
      >
        <span className="mr-1.5 size-1.5 rounded-full bg-current" />
        {label}
      </span>
      {record?.updatedAt && Number.isFinite(Date.parse(record.updatedAt)) && (
        <span className="text-xs text-muted-foreground">
          {t.updated}:{" "}
          {new Date(record.updatedAt).toLocaleString(language === "te" ? "te-IN" : "en-IN", {
            timeZone: "Asia/Kolkata",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}{" "}
          IST
        </span>
      )}
    </span>
  );
}
export function ContactButton({
  kind,
  href,
}: {
  kind: "call" | "whatsapp" | "directions";
  href?: string | undefined;
}) {
  const { language } = useDemo();
  const t = copy[language];
  const Icon = kind === "call" ? Phone : kind === "whatsapp" ? MessageCircle : Route;
  const label = kind === "call" ? t.call : kind === "whatsapp" ? t.whatsapp : t.directions;
  if (href)
    return (
      <Button asChild variant="outline" className="min-h-11 min-w-0 flex-1 gap-1 px-2 text-sm">
        <a href={href} target={kind === "call" ? undefined : "_blank"} rel="noreferrer">
          <Icon />
          {label}
        </a>
      </Button>
    );
  return (
    <Button
      variant="outline"
      className="min-h-11 min-w-0 flex-1 gap-1 px-2 text-sm"
      onClick={() => toast.info(t.contactMissing)}
    >
      <Icon />
      {label}
    </Button>
  );
}
export function ShopCard({
  shop,
  record,
  from,
}: {
  shop: Shop;
  record?: StatusRecord | undefined;
  from: string;
}) {
  const { language } = useDemo();
  const t = copy[language];
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-150 hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-3/2 overflow-hidden bg-muted">
        <ShopPhoto src={shop.images[0]} alt={`${shop.name} — ${t.photoNote}`} />
        <span className="absolute left-3 top-3 rounded-md bg-background/95 px-2 py-1 text-xs font-extrabold uppercase text-primary shadow-sm">
          {t.demo}
        </span>
      </div>
      <div className="p-5">
        <div className="flex flex-col items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              {language === "te" ? shop.categoryTe : shop.category}
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold text-foreground">
              {language === "te" ? shop.nameTe : shop.name}
            </h2>
          </div>
          <StatusBadge record={record} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {shop.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
          <MapPin className="mt-1 size-4 shrink-0 text-primary" />
          <span>
            {shop.address}
            <br />
            <span className="text-foreground">{shop.landmark}</span>
          </span>
        </p>
        <Button asChild className="mt-5 min-h-11 w-full">
          <Link to="/shops/$shopId" params={{ shopId: shop.id }} search={{ from }}>
            {t.view}
            <ArrowRight />
          </Link>
        </Button>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <ContactButton kind="call" href={shop.phone ? `tel:${shop.phone}` : undefined} />
          <ContactButton
            kind="whatsapp"
            href={shop.whatsapp ? `https://wa.me/${shop.whatsapp.replace(/\D/g, "")}` : undefined}
          />
          <ContactButton kind="directions" href={shop.mapsUrl} />
        </div>
      </div>
    </article>
  );
}
