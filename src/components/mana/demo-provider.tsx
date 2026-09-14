import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";
import {
  DEMO_STORE_KEY,
  emptyStore,
  shops,
  type DemoStore,
  type Shop,
  type ShopEdit,
  type StatusRecord,
} from "@/lib/mana-data";
type Language = "en" | "te";
const editSchema = z.object({
  name: z.string().max(100).optional(),
  nameTe: z.string().max(100).optional(),
  description: z.string().max(600).optional(),
  descriptionTe: z.string().max(600).optional(),
  address: z.string().max(300).optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/)
    .or(z.literal(""))
    .optional(),
  whatsapp: z
    .string()
    .regex(/^[0-9]{10,15}$/)
    .or(z.literal(""))
    .optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
  photo: z
    .string()
    .max(4500000)
    .regex(/^data:image\/(jpeg|png|webp);base64,/)
    .optional(),
});
const storeSchema = z.object({
  edits: z.record(editSchema),
  statuses: z.record(
    z.object({
      status: z.enum(["open", "closed", "break", "unconfirmed"]),
      until: z.string().optional(),
      updatedAt: z.string(),
    }),
  ),
});
type Context = {
  language: Language;
  setLanguage: (v: Language) => void;
  shops: Shop[];
  store: DemoStore;
  now: number;
  saveShop: (id: string, edit: ShopEdit) => boolean;
  setStatus: (id: string, status: StatusRecord) => boolean;
};
const DemoContext = createContext<Context | undefined>(undefined);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [store, setStore] = useState<DemoStore>(emptyStore);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 15000);
    try {
      const raw = localStorage.getItem(DEMO_STORE_KEY);
      if (raw) {
        const parsed = storeSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setStore(parsed.data as DemoStore);
      }
      if (localStorage.getItem("mana-language") === "te") setLanguage("te");
    } catch {}
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem("mana-language", language);
    } catch {}
  }, [language]);
  const persist = (next: DemoStore) => {
    try {
      localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(next));
      setStore(next);
      setNow(Date.now());
      return true;
    } catch {
      return false;
    }
  };
  const merged = useMemo(
    () =>
      shops.map((shop) => {
        const edit = store.edits[shop.id];
        return {
          ...shop,
          ...edit,
          images: edit?.photo ? [edit.photo, ...shop.images] : shop.images,
        };
      }),
    [store.edits],
  );
  return (
    <DemoContext.Provider
      value={{
        language,
        setLanguage,
        shops: merged,
        store,
        now,
        saveShop: (id, edit) =>
          persist({ ...store, edits: { ...store.edits, [id]: { ...store.edits[id], ...edit } } }),
        setStatus: (id, status) =>
          persist({ ...store, statuses: { ...store.statuses, [id]: status } }),
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Missing demo provider");
  return context;
}
