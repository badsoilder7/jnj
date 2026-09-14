import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Store, Check, Coffee, Moon, Upload } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/components/mana/demo-provider";
import { StatusBadge } from "@/components/mana/shop-card";
import { ShopPhoto } from "@/components/mana/shop-photo";
import { copy } from "@/components/mana/i18n";
import { Button } from "@/components/ui/button";
import type { Shop, ShopEdit, ShopStatus } from "@/lib/mana-data";
export const Route = createFileRoute("/owners")({
  head: () => ({ meta: [{ title: "Owner preview · Mana Proddatur" }] }),
  component: Owners,
});
function Owners() {
  const { shops, language } = useDemo();
  const [id, setId] = useState(shops[0]!.id);
  const t = copy[language];
  const shop = shops.find((s) => s.id === id)!;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <span className="text-sm font-bold tracking-wide text-primary">MANA PRODDATUR</span>
        <h1 className="mt-2 text-3xl font-extrabold">{t.ownerTitle}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{t.ownerIntro}</p>
      </div>
      <label className="block max-w-lg text-sm font-bold">
        {t.selectShop}
        <select className="owner-input" value={id} onChange={(e) => setId(e.target.value)}>
          {shops.map((s) => (
            <option key={s.id} value={s.id}>
              {language === "te" ? s.nameTe : s.name}
            </option>
          ))}
        </select>
      </label>
      <OwnerEditor key={id} shop={shop} />
    </main>
  );
}
function OwnerEditor({ shop }: { shop: Shop }) {
  const { language, store, saveShop, setStatus } = useDemo();
  const t = copy[language];
  const te = language === "te";
  const [draft, setDraft] = useState<ShopEdit>({
    name: shop.name,
    nameTe: shop.nameTe,
    description: shop.description,
    descriptionTe: shop.descriptionTe,
    address: shop.address,
    phone: shop.phone ?? "",
    whatsapp: shop.whatsapp ?? "",
    tags: shop.tags,
  });
  const [tags, setTags] = useState(shop.tags.join(", "));
  const [photo, setPhoto] = useState<string>();
  const [status, changeStatus] = useState<ShopStatus>("open");
  const [duration, setDuration] = useState("4");
  const [uploading, setUploading] = useState(false);
  const fail = () =>
    toast.error(
      te
        ? "సేవ్ కాలేదు. బ్రౌజర్ నిల్వను తనిఖీ చేయండి."
        : "Could not save. Check browser storage or use a smaller photo.",
    );
  function updateStatus() {
    const now = Date.now();
    const record = {
      status,
      updatedAt: new Date(now).toISOString(),
      ...(status === "open" || status === "break"
        ? { until: new Date(now + Number(duration) * 3600000).toISOString() }
        : {}),
    };
    if (setStatus(shop.id, record)) toast.success(t.saved);
    else fail();
  }
  function save(e: FormEvent) {
    e.preventDefault();
    const phone = (draft.phone ?? "").replace(/[\s()-]/g, "");
    const whatsapp = (draft.whatsapp ?? "").replace(/[\s()+-]/g, "");
    if (
      (phone && !/^\+?[0-9]{10,15}$/.test(phone)) ||
      (whatsapp && !/^[0-9]{10,15}$/.test(whatsapp))
    ) {
      toast.error(
        te ? "దేశ కోడ్‌తో సరైన నంబర్ ఇవ్వండి." : "Enter valid phone numbers with country code.",
      );
      return;
    }
    const keywords = [
      ...new Set(
        tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
    if (keywords.length > 30 || keywords.some((s) => s.length > 50)) {
      toast.error(
        te
          ? "గరిష్టంగా 30 చిన్న కీవర్డ్స్ ఇవ్వండి."
          : "Use up to 30 keywords, each at most 50 characters.",
      );
      return;
    }
    if (
      saveShop(shop.id, { ...draft, phone, whatsapp, tags: keywords, ...(photo ? { photo } : {}) })
    )
      toast.success(t.saved);
    else fail();
  }
  async function upload(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 3 * 1024 * 1024
    ) {
      toast.error(t.invalidImage);
      return;
    }
    setUploading(true);
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(String(reader.result));
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error(t.invalidImage);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error(t.invalidImage);
      setUploading(false);
    }
  }
  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1.6fr]">
      <section className="rounded-2xl border border-border bg-card p-6">
        <Store className="size-7 text-primary" />
        <h2 className="mt-4 text-xl font-bold">{t.currentStatus}</h2>
        <div className="mt-3">
          <StatusBadge record={store.statuses[shop.id]} />
        </div>
        <div className="mt-6 grid gap-2">
          {(
            [
              { v: "open", label: t.open, Icon: Check },
              { v: "closed", label: t.closed, Icon: Moon },
              { v: "break", label: t.break, Icon: Coffee },
            ] as const
          ).map(({ v, label, Icon }) => (
            <button
              key={v}
              type="button"
              aria-pressed={status === v}
              onClick={() => changeStatus(v)}
              className={`flex min-h-12 items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold ${status === v ? "border-primary bg-secondary text-primary" : "border-border"}`}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
        {status !== "closed" && (
          <label className="mt-5 block text-sm font-bold">
            {te ? "నిర్ధారణ వ్యవధి" : "Confirmation duration"}
            <select
              className="owner-input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {[0.5, 1, 2, 4, 8, 12].map((h) => (
                <option key={h} value={h}>
                  {h} {te ? "గంటలు" : "hours"}
                </option>
              ))}
            </select>
          </label>
        )}
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {te
            ? "వ్యవధి ముగిశాక స్థితి నిర్ధారించలేదు అని చూపిస్తుంది."
            : "After this time, customers see ‘Status not confirmed’. Regular hours never turn this on automatically."}
        </p>
        <Button className="mt-5 min-h-11 w-full" onClick={updateStatus}>
          {t.saveStatus}
        </Button>
      </section>
      <form onSubmit={save} className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold">{t.editListing}</h2>
        <div className="mt-5 grid gap-5">
          {(
            [
              {
                key: "name",
                label: te ? "దుకాణం పేరు (English)" : "Shop name (English)",
                max: 100,
              },
              { key: "nameTe", label: "దుకాణం పేరు (తెలుగు)", max: 100 },
              { key: "address", label: t.address, max: 300 },
              { key: "phone", label: t.phone, max: 20 },
              { key: "whatsapp", label: t.waNumber, max: 20 },
            ] as const
          ).map(({ key, label, max }) => (
            <label key={key} className="text-sm font-bold">
              {label}
              <input
                className="owner-input"
                value={draft[key] ?? ""}
                maxLength={max}
                required={key === "name" || key === "address"}
                type={key === "phone" || key === "whatsapp" ? "tel" : "text"}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="text-sm font-bold">
            {t.description} (English)
            <textarea
              className="owner-input min-h-24"
              maxLength={600}
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </label>
          <label className="text-sm font-bold">
            {t.description} (తెలుగు)
            <textarea
              className="owner-input min-h-24"
              maxLength={600}
              value={draft.descriptionTe ?? ""}
              onChange={(e) => setDraft({ ...draft, descriptionTe: e.target.value })}
            />
          </label>
          <label className="text-sm font-bold">
            {t.keywords}
            <textarea
              className="owner-input min-h-24"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="shoes, school shoes, చెప్పులు"
            />
            <span className="mt-1 block font-normal text-muted-foreground">
              {te
                ? "కామాతో పదాలను వేరు చేయండి."
                : "Separate keywords with commas. These describe the shop, not individual product listings."}
            </span>
          </label>
          <div>
            <div className="aspect-3/2 overflow-hidden rounded-xl">
              <ShopPhoto src={photo ?? shop.images[0]} alt={t.photo} />
            </div>
            <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary p-3 font-semibold text-primary">
              <Upload className="size-5" />
              {t.photo}
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => upload(e.target.files?.[0])}
              />
            </label>
            <p className="mt-2 text-sm text-muted-foreground">{t.uploadHelp}</p>
          </div>
          <Button type="submit" disabled={uploading} className="min-h-12">
            {t.saveLocal}
          </Button>
        </div>
      </form>
    </div>
  );
}
