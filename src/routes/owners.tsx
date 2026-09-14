import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Store, Check, Coffee, Moon, Upload } from "lucide-react";
import { toast } from "sonner";
import { useDirectory } from "@/components/mana/directory-provider";
import { StatusBadge } from "@/components/mana/shop-card";
import { ShopPhoto } from "@/components/mana/shop-photo";
import { DirectoryNotice } from "@/components/mana/directory-notice";
import { AddShop, OwnerSignIn } from "@/components/mana/owner-access";
import { getSupabase } from "@/lib/supabase";
import { normalizeContact } from "@/lib/shop-validation";
import { categories, categoryLabelsTe } from "@/lib/mana-data";
import { copy } from "@/components/mana/i18n";
import { Button } from "@/components/ui/button";
import type { Shop, ShopEdit, ShopStatus } from "@/lib/mana-data";
export const Route = createFileRoute("/owners")({
  head: () => ({
    meta: [
      { title: "For shop owners · Mana Proddatur" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Owners,
});
function Owners() {
  const { ownerShops: shops, language, isLive, user, authReady, loading, error } = useDirectory();
  const [selectedId, setId] = useState("");
  const id = shops.some((s) => s.id === selectedId) ? selectedId : shops[0]?.id;
  const t = copy[language];
  const te = language === "te";
  const shop = shops.find((s) => s.id === id);
  async function signOut() {
    try {
      const { error } = await getSupabase().auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch {
      toast.error(
        te ? "సైన్ అవుట్ కాలేదు. మళ్లీ ప్రయత్నించండి." : "Could not sign out. Please try again.",
      );
    }
  }
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <span className="text-sm font-bold tracking-wide text-primary">MANA PRODDATUR</span>
        <h1 className="mt-2 text-3xl font-extrabold">
          {isLive ? (te ? "దుకాణ యజమానులకు" : "For shop owners") : t.ownerTitle}
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          {isLive
            ? te
              ? "మీ దుకాణ వివరాలు, నేటి స్థితిని ఇక్కడ మార్చండి."
              : "Keep your shop details and today's opening status up to date."
            : t.ownerIntro}
        </p>
      </div>
      <DirectoryNotice />
      {isLive && authReady && !user && <OwnerSignIn />}
      {isLive && user && (
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="break-all text-sm text-muted-foreground">{user.email}</span>
          <Button variant="ghost" onClick={signOut}>
            {te ? "సైన్ అవుట్" : "Sign out"}
          </Button>
          <AddShop onCreated={setId} />
        </div>
      )}
      {shop && (!isLive || user) && (
        <>
          <label className="block max-w-lg text-sm font-bold">
            {isLive ? (te ? "మీ దుకాణం ఎంచుకోండి" : "Select your shop") : t.selectShop}
            <select className="owner-input" value={id} onChange={(e) => setId(e.target.value)}>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {language === "te" ? s.nameTe : s.name}
                </option>
              ))}
            </select>
          </label>
          {isLive && !shop.published && (
            <p
              role="status"
              className="mt-5 rounded-xl bg-notice p-4 text-sm leading-6 text-notice-foreground"
            >
              {te
                ? "సమీక్ష కోసం వేచి ఉంది. ఆమోదం తర్వాత మీ దుకాణం శోధనలో కనిపిస్తుంది. అప్పటివరకు వివరాలను మార్చవచ్చు."
                : "Awaiting review. Your shop will appear in search after approval. You can complete its details now."}
            </p>
          )}
          <OwnerEditor key={`${user?.id ?? "demo"}-${id}`} shop={shop} />
        </>
      )}
      {isLive && user && !shop && !loading && !error && (
        <p className="my-8 text-muted-foreground">
          {te ? "మీ మొదటి దుకాణాన్ని జోడించండి." : "Add your first shop to get started."}
        </p>
      )}
    </main>
  );
}
function OwnerEditor({ shop }: { shop: Shop }) {
  const { language, store, saveShop, setStatus, isLive } = useDirectory();
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
    category: shop.category,
    locality: shop.locality,
    landmark: shop.landmark,
    hours: shop.hours,
  });
  const [tags, setTags] = useState(shop.tags.join(", "));
  const [photo, setPhoto] = useState<string>();
  const [photoFile, setPhotoFile] = useState<File>();
  const [status, changeStatus] = useState<ShopStatus>("open");
  const [duration, setDuration] = useState("4");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const fail = () =>
    toast.error(
      te
        ? "సేవ్ కాలేదు. వివరాలు, కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి."
        : isLive
          ? "Could not save. Check the details and your connection, then try again."
          : "Could not save. Check browser storage or use a smaller photo.",
    );
  async function updateStatus() {
    setStatusSaving(true);
    try {
      await setStatus(shop.id, status, Number(duration));
      toast.success(isLive ? (te ? "స్థితి సేవ్ అయింది." : "Opening status saved.") : t.saved);
    } catch {
      fail();
    } finally {
      setStatusSaving(false);
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    const phone = normalizeContact(draft.phone ?? "");
    const whatsapp = normalizeContact(draft.whatsapp ?? "", true);
    if (
      (phone && !/^\+[1-9][0-9]{9,14}$/.test(phone)) ||
      (whatsapp && !/^[1-9][0-9]{9,14}$/.test(whatsapp))
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
    setSaving(true);
    try {
      await saveShop(
        shop.id,
        { ...draft, phone, whatsapp, tags: keywords, ...(!isLive && photo ? { photo } : {}) },
        photoFile,
      );
      setPhotoFile(undefined);
      toast.success(
        isLive ? (te ? "దుకాణ వివరాలు సేవ్ అయ్యాయి." : "Shop details saved.") : t.saved,
      );
    } catch {
      fail();
    } finally {
      setSaving(false);
    }
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
        setPhotoFile(file);
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
        <Button className="mt-5 min-h-11 w-full" onClick={updateStatus} disabled={statusSaving}>
          {statusSaving
            ? te
              ? "సేవ్ చేస్తున్నాము…"
              : "Saving…"
            : isLive
              ? te
                ? "స్థితి మార్చండి"
                : "Update opening status"
              : t.saveStatus}
        </Button>
      </section>
      <form onSubmit={save} className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold">
          {isLive ? (te ? "దుకాణ వివరాలు" : "Shop details") : t.editListing}
        </h2>
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
              { key: "locality", label: te ? "ప్రాంతం / వీధి" : "Locality / street", max: 100 },
              { key: "landmark", label: te ? "గుర్తు" : "Landmark", max: 150 },
              { key: "hours", label: t.regularHours, max: 150 },
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
                required={key === "name" || key === "address" || key === "locality"}
                type={key === "phone" || key === "whatsapp" ? "tel" : "text"}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </label>
          ))}
          <p className="text-sm text-muted-foreground">
            {te
              ? "10 అంకెల స్థానిక నంబర్లకు +91 జోడిస్తాము. ఈ నంబర్లు అందరికీ కనిపిస్తాయి."
              : "Local 10-digit numbers use +91. These contact numbers are public."}
          </p>
          <label className="text-sm font-bold">
            {t.category}
            <select
              className="owner-input"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as Shop["category"] })}
            >
              {categories.slice(1).map((c) => (
                <option key={c} value={c}>
                  {te ? categoryLabelsTe[c] : c}
                </option>
              ))}
            </select>
          </label>
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
            <p className="mt-2 text-sm text-muted-foreground">
              {isLive
                ? te
                  ? "JPG, PNG లేదా WebP, 3 MB వరకు. మీ దుకాణానికి చెందిన ఫోటోను జోడించండి. సేవ్ చేసిన ఫోటో అందరికీ అందుబాటులో ఉంటుంది."
                  : "JPG, PNG or WebP, up to 3 MB. Upload a photo of your shop that you have permission to share. Saved photos are public."
                : t.uploadHelp}
            </p>
          </div>
          <Button type="submit" disabled={uploading || saving} className="min-h-12">
            {saving
              ? te
                ? "సేవ్ చేస్తున్నాము…"
                : "Saving…"
              : isLive
                ? te
                  ? "వివరాలు సేవ్ చేయండి"
                  : "Save shop details"
                : t.saveLocal}
          </Button>
        </div>
      </form>
    </div>
  );
}
