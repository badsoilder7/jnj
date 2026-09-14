import { Link } from "@tanstack/react-router";
import { MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "./demo-provider";
import { copy } from "./i18n";
export function SiteHeader() {
  const { language, setLanguage } = useDemo();
  const t = copy[language];
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto grid min-h-18 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:flex sm:px-6 lg:px-8">
        <Link
          to="/"
          search={{ q: "", category: "All shops", locality: "All localities", open: false }}
          className="flex min-w-0 items-center gap-2.5 focus-ring"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-xl font-extrabold text-foreground">
              Mana <span className="text-primary">Proddatur</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {t.location}
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1 sm:ml-auto">
          <div className="flex rounded-lg border border-border p-0.5" aria-label="Language">
            <button
              className={`min-h-10 rounded-md px-3 text-sm font-semibold ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
            <button
              className={`min-h-10 rounded-md px-3 text-sm font-semibold ${language === "te" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setLanguage("te")}
              aria-pressed={language === "te"}
            >
              తెలుగు
            </button>
          </div>
          <Button asChild variant="outline" className="hidden min-h-11 sm:inline-flex">
            <Link to="/owners">{t.owners}</Link>
          </Button>
        </div>
        <Button asChild variant="ghost" className="col-span-2 min-h-11 sm:hidden">
          <Link to="/owners">{t.owners}</Link>
        </Button>
      </div>
    </header>
  );
}
