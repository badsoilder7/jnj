import { useState } from "react";
import { Camera } from "lucide-react";
import { useDirectory } from "./directory-provider";
export function ShopPhoto({ src, alt }: { src?: string | undefined; alt: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const { language } = useDirectory();
  return src && failed !== src ? (
    <img
      src={src}
      alt={alt}
      width={1200}
      height={800}
      loading="lazy"
      className="h-full w-full object-cover"
      onError={() => setFailed(src)}
    />
  ) : (
    <div
      className="flex h-full min-h-32 flex-col items-center justify-center gap-3 bg-secondary text-muted-foreground"
      role="img"
      aria-label={alt}
    >
      <Camera className="size-9" />
      <span className="text-sm">
        {language === "te" ? "దుకాణం ఫోటో జోడించండి" : "Shop photo to be added"}
      </span>
    </div>
  );
}
