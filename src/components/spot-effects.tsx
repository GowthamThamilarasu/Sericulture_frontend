"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Site-wide behaviour for `.spot-card` boxes: the hover spotlight follows the pointer,
// and `.spot-panel` boxes fade up the first time they scroll into view.
export function SpotEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement).closest?.<HTMLElement>(".spot-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("rv-ready");

    // Measured directly on scroll (not IntersectionObserver) so a panel can never get stuck hidden.
    let queued = false;
    const reveal = () => {
      queued = false;
      const limit = window.innerHeight * 0.92;
      document.querySelectorAll<HTMLElement>(".spot-panel:not([data-inview])").forEach((panel) => {
        if (panel.getBoundingClientRect().top < limit) panel.setAttribute("data-inview", "");
      });
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(reveal);
    };

    reveal();
    const settle = window.setTimeout(reveal, 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
