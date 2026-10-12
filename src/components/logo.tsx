import { cn } from "@/lib/utils";

// The Paari Seritech logo, used unmodified. Its lettering is dark green, so on dark
// surfaces pass `plate` to sit it on a white tile.
export function Logo({ className, plate }: { className?: string; plate?: boolean }) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer
    <img
      src="/paari-seritech-logo.png"
      alt="Paari Seritech"
      width={1207}
      height={1303}
      className={cn("w-auto shrink-0", plate ? "h-full" : className)}
    />
  );

  if (!plate) return image;

  return <span className={cn("inline-flex shrink-0 rounded-2xl bg-white p-1.5", className)}>{image}</span>;
}
