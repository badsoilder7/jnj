import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import {
  DEMO_STORE_KEY,
  emptyStore,
  categoryLabelsTe,
  shops as samples,
  type DemoStore,
  type Shop,
  type ShopEdit,
  type ShopStatus,
} from "@/lib/mana-data";
import { getSupabase, liveMode } from "@/lib/supabase";
import { shopEditSchema } from "@/lib/shop-validation";
import {
  createShop,
  loadDirectory,
  updateShop,
  updateShopStatus,
  type NewShop,
  type DirectorySnapshot,
} from "@/lib/shop-repository";

type Language = "en" | "te";
const storeSchema = z.object({
  edits: z.record(shopEditSchema),
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
  isLive: boolean;
  shops: Shop[];
  ownerShops: Shop[];
  store: DemoStore;
  now: number;
  loading: boolean;
  error: string | null;
  authReady: boolean;
  user: User | null;
  refresh: () => Promise<void>;
  saveShop: (id: string, edit: ShopEdit, photo?: File) => Promise<void>;
  setStatus: (id: string, status: ShopStatus, durationHours: number) => Promise<void>;
  addShop: (input: NewShop) => Promise<string>;
};
const DirectoryContext = createContext<Context | undefined>(undefined);
const blankSnapshot: DirectorySnapshot = { shops: [], statuses: {} };
export function DirectoryProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [demoStore, setDemoStore] = useState<DemoStore>(emptyStore);
  const demoRef = useRef(demoStore);
  const [now, setNow] = useState(0);
  const [publicData, setPublicData] = useState(blankSnapshot);
  const [ownerData, setOwnerData] = useState(blankSnapshot);
  const [loading, setLoading] = useState(liveMode);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!liveMode);
  const requestId = useRef(0);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 15000);
    try {
      if (!liveMode) {
        const raw = localStorage.getItem(DEMO_STORE_KEY);
        const parsed = raw ? storeSchema.safeParse(JSON.parse(raw)) : undefined;
        if (parsed?.success) {
          demoRef.current = parsed.data as DemoStore;
          setDemoStore(demoRef.current);
        }
      }
      if (localStorage.getItem("mana-language") === "te") setLanguage("te");
    } catch {
      /* Unavailable caches do not stop browsing. Writes report errors. */
    }
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem("mana-language", language);
    } catch {}
  }, [language]);
  useEffect(() => {
    if (!liveMode) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    try {
      const client = getSupabase();
      const subscription = client.auth.onAuthStateChange((_event, session) => {
        if (active) {
          setUser(session?.user ?? null);
          setAuthReady(true);
        }
      });
      unsubscribe = () => subscription.data.subscription.unsubscribe();
      client.auth
        .getSession()
        .then(({ data, error: authError }) => {
          if (!active) return;
          if (authError) setError("Could not restore sign-in. Please sign in again.");
          setUser(data.session?.user ?? null);
          setAuthReady(true);
        })
        .catch(() => {
          if (active) {
            setAuthReady(true);
            setError("Could not restore sign-in.");
          }
        });
    } catch {
      setAuthReady(true);
      setLoading(false);
      setError("The live directory connection needs setup. Please try again later.");
    }
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);
  const refresh = useCallback(async () => {
    if (!liveMode) return;
    const request = ++requestId.current;
    const [publicResult, ownerResult] = await Promise.allSettled([
      loadDirectory(),
      user ? loadDirectory(user.id) : Promise.resolve(blankSnapshot),
    ]);
    if (request !== requestId.current) return;
    // Do not retain stale opening confirmations when a refresh fails.
    setPublicData(publicResult.status === "fulfilled" ? publicResult.value : blankSnapshot);
    setOwnerData(ownerResult.status === "fulfilled" ? ownerResult.value : blankSnapshot);
    setError(
      publicResult.status === "rejected" || ownerResult.status === "rejected"
        ? "Could not refresh shop information. Check your connection and try again."
        : null,
    );
    setLoading(false);
    setNow(Date.now());
  }, [user?.id]);
  useEffect(() => {
    if (!liveMode || !authReady) return;
    setOwnerData(blankSnapshot);
    setLoading(true);
    void refresh();
    const retry = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = setInterval(retry, 30000);
    window.addEventListener("focus", retry);
    window.addEventListener("online", retry);
    return () => {
      ++requestId.current;
      clearInterval(timer);
      window.removeEventListener("focus", retry);
      window.removeEventListener("online", retry);
    };
  }, [authReady, refresh]);
  const persist = (next: DemoStore) => {
    try {
      localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(next));
    } catch {
      throw new Error(
        "Could not save on this device. Check browser storage or use a smaller photo.",
      );
    }
    demoRef.current = next;
    setDemoStore(next);
    setNow(Date.now());
  };
  const merged = useMemo(
    () =>
      samples.map((shop) => {
        const edit = demoStore.edits[shop.id];
        return {
          ...shop,
          ...edit,
          categoryTe: categoryLabelsTe[edit?.category ?? shop.category],
          images: edit?.photo ? [edit.photo, ...shop.images] : shop.images,
        };
      }),
    [demoStore.edits],
  );
  return (
    <DirectoryContext.Provider
      value={{
        language,
        setLanguage,
        isLive: liveMode,
        now,
        loading,
        error,
        authReady,
        user,
        refresh,
        shops: liveMode ? publicData.shops : merged,
        ownerShops: liveMode ? ownerData.shops : merged,
        store: liveMode
          ? { edits: {}, statuses: { ...publicData.statuses, ...ownerData.statuses } }
          : demoStore,
        saveShop: async (id, edit, photo) => {
          const valid = Object.fromEntries(
            Object.entries(shopEditSchema.parse(edit)).filter(([, v]) => v !== undefined),
          ) as ShopEdit;
          if (liveMode) {
            await updateShop(id, valid, photo);
            await refresh();
          } else
            persist({
              ...demoRef.current,
              edits: { ...demoRef.current.edits, [id]: { ...demoRef.current.edits[id], ...valid } },
            });
        },
        setStatus: async (id, status, durationHours) => {
          if (![0.5, 1, 2, 4, 8, 12].includes(durationHours))
            throw new Error("Choose a confirmation duration up to 12 hours.");
          if (liveMode) {
            await updateShopStatus(id, status, durationHours);
            await refresh();
          } else {
            const time = Date.now();
            persist({
              ...demoRef.current,
              statuses: {
                ...demoRef.current.statuses,
                [id]: {
                  status,
                  updatedAt: new Date(time).toISOString(),
                  ...(status === "open" || status === "break"
                    ? { until: new Date(time + durationHours * 3600000).toISOString() }
                    : {}),
                },
              },
            });
          }
        },
        addShop: async (input) => {
          if (!liveMode) throw new Error("Adding a shop requires the live directory.");
          const id = await createShop(input);
          await refresh();
          return id;
        },
      }}
    >
      {children}
    </DirectoryContext.Provider>
  );
}
export function useDirectory() {
  const context = useContext(DirectoryContext);
  if (!context) throw new Error("Missing directory provider");
  return context;
}
