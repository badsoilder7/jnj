import { useState, type FormEvent } from "react";
import { Mail, Plus, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { categories, categoryLabelsTe, type Shop } from "@/lib/mana-data";
import { useDirectory } from "./directory-provider";

export function OwnerSignIn() {
  const { language } = useDirectory();
  const te = language === "te";
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSent(false);
    try {
      const { error } = await getSupabase().auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/owners` },
      });
      if (error) throw error;
      setSent(true);
    } catch {
      toast.error(
        te
          ? "లింక్ పంపలేకపోయాము. కాసేపటి తర్వాత మళ్లీ ప్రయత్నించండి."
          : "Could not send a sign-in link. Check your email address and try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
        <Store />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold">
        {te ? "మీ దుకాణం, మీ నియంత్రణలో" : "Your shop, in your hands"}
      </h2>
      <p className="mt-3 leading-7 text-muted-foreground">
        {te
          ? "ఈమెయిల్ లింక్‌తో సైన్ ఇన్ చేసి మీ దుకాణ వివరాలు, ఫోటో, నేటి స్థితిని మార్చండి."
          : "Sign in with an email link to manage your shop details, photo, and today's opening status."}
      </p>
      <form onSubmit={signIn} className="mt-6 space-y-4">
        <label className="block text-sm font-bold">
          {te ? "మీ ఈమెయిల్" : "Your email"}
          <input
            className="owner-input"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSent(false);
            }}
            placeholder="you@example.com"
          />
        </label>
        <Button type="submit" disabled={busy || sent} className="min-h-12 w-full">
          <Mail />
          {busy
            ? te
              ? "పంపుతున్నాము…"
              : "Sending…"
            : te
              ? "సైన్ ఇన్ లింక్ పంపండి"
              : "Send sign-in link"}
        </Button>
      </form>
      {sent && (
        <div
          role="status"
          className="mt-5 rounded-xl bg-success-soft p-4 text-sm leading-6 text-success"
        >
          {te
            ? "మీ ఇన్‌బాక్స్‌లో లింక్ చూడండి. స్పామ్ ఫోల్డర్‌ను కూడా తనిఖీ చేయండి."
            : "Check your inbox for the sign-in link, including your spam folder."}
          <button
            type="button"
            className="mt-2 block min-h-11 underline"
            onClick={() => setSent(false)}
          >
            {te ? "మళ్లీ పంపండి" : "Send another link"}
          </button>
        </div>
      )}
    </section>
  );
}
export function AddShop({ onCreated }: { onCreated: (id: string) => void }) {
  const { addShop, language } = useDirectory();
  const te = language === "te";
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Groceries" as Shop["category"],
    address: "",
    locality: "",
  });
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const id = await addShop(form);
      onCreated(id);
      setOpen(false);
      setForm({ name: "", category: "Groceries", address: "", locality: "" });
      toast.success(
        te
          ? "దుకాణం సేవ్ అయింది. ప్రచురణకు ముందు సమీక్షిస్తాము."
          : "Shop saved. It will appear in search after review.",
      );
    } catch {
      toast.error(
        te
          ? "దుకాణాన్ని సేవ్ చేయలేకపోయాము. వివరాలను తనిఖీ చేయండి."
          : "Could not add the shop. Check the details and your connection.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!open)
    return (
      <Button variant="outline" className="min-h-11" onClick={() => setOpen(true)}>
        <Plus />
        {te ? "మీ దుకాణం జోడించండి" : "Add your shop"}
      </Button>
    );
  return (
    <form
      onSubmit={submit}
      className="my-6 max-w-xl space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <h2 className="text-xl font-bold">
        {te ? "ప్రొద్దుటూరులో మీ దుకాణం" : "Your shop in Proddatur"}
      </h2>
      <p className="text-sm leading-6 text-muted-foreground">
        {te
          ? "పిన్ కోడ్ 516360. మీకు చెందిన దుకాణాన్ని మాత్రమే జోడించండి. వివరాలు సమీక్ష తర్వాత కనిపిస్తాయి."
          : "For shops in 516360. Add a business you own or are authorized to manage. We'll review the listing before it appears in search."}
      </p>
      {(
        [
          { key: "name", label: te ? "దుకాణం పేరు" : "Shop name", max: 100, min: 2 },
          { key: "locality", label: te ? "ప్రాంతం / వీధి" : "Locality / street", max: 100, min: 2 },
          { key: "address", label: te ? "పూర్తి చిరునామా" : "Full address", max: 300, min: 5 },
        ] as const
      ).map(({ key, label, max, min }) => (
        <label className="block text-sm font-bold" key={key}>
          {label}
          <input
            className="owner-input"
            value={form[key]}
            required
            minLength={min}
            maxLength={max}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </label>
      ))}
      <label className="block text-sm font-bold">
        {te ? "వర్గం" : "Category"}
        <select
          className="owner-input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as Shop["category"] })}
        >
          {categories.slice(1).map((c) => (
            <option key={c} value={c}>
              {te ? categoryLabelsTe[c] : c}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-3">
        <Button type="submit" disabled={busy} className="min-h-11">
          {busy ? (te ? "సేవ్ చేస్తున్నాము…" : "Saving…") : te ? "దుకాణం జోడించండి" : "Add shop"}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
          {te ? "రద్దు" : "Cancel"}
        </Button>
      </div>
    </form>
  );
}
