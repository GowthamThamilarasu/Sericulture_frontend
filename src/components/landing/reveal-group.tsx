"use client";

import { useEffect, useRef } from "react";

// Wraps a set of `.spot-card` children and reveals them, staggered, when scrolled into view.
export function RevealGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("rv-on");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          root.setAttribute("data-inview", "");
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      root.classList.remove("rv-on");
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
