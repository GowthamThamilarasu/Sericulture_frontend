import { cn } from "@/lib/utils";

// The Paari Agritech Automations logo (wide, about 10:3), with its white margins trimmed. Its lettering is dark green, so on dark
// surfaces pass `plate` to sit it on a white tile.
export function Logo({ className, plate }: { className?: string; plate?: boolean }) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer
    <img
      src="/paari-agritech-logo.png"
      alt="Paari Agritech Automations"
      width={1400}
      height={423}
      className={cn("w-auto shrink-0", plate ? "h-full" : className)}
    />
  );

  if (!plate) return image;

  return <span className={cn("inline-flex shrink-0 rounded-2xl bg-white p-1.5", className)}>{image}</span>;
}
