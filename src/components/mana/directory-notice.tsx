import { Button } from "@/components/ui/button";
import { useDirectory } from "./directory-provider";
export function DirectoryNotice() {
  const { error, loading, language, refresh } = useDirectory();
  const te = language === "te";
  if (error)
    return (
      <div
        role="alert"
        className="my-5 rounded-xl border border-notice-border bg-notice p-4 text-notice-foreground"
      >
        <p>
          {te
            ? "దుకాణాల వివరాలను పొందలేకపోయాము. మీ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి."
            : error}
        </p>
        <Button variant="outline" className="mt-3 min-h-11" onClick={() => void refresh()}>
          {te ? "మళ్లీ ప్రయత్నించండి" : "Try again"}
        </Button>
      </div>
    );
  if (loading)
    return (
      <p role="status" className="my-8 text-center text-muted-foreground">
        {te ? "దుకాణాల వివరాలు లోడ్ అవుతున్నాయి…" : "Loading shop information…"}
      </p>
    );
  return null;
}
