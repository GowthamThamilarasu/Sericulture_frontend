import { useId } from "react";

// Decorative pieces shared by the public pages. Styles live in globals.css (.accent, .eyebrow, .swash).

// Where each glitter sparkle sits over the word, how big it is and when it twinkles.
const glints = [
  { left: "4%", top: "8%", size: "0.2em", delay: "0s" },
  { left: "24%", top: "68%", size: "0.13em", delay: "1.1s" },
  { left: "43%", top: "2%", size: "0.16em", delay: "0.5s" },
  { left: "61%", top: "58%", size: "0.22em", delay: "1.7s" },
  { left: "78%", top: "12%", size: "0.14em", delay: "0.8s" },
  { left: "95%", top: "44%", size: "0.18em", delay: "2.2s" },
];

// A highlighted word or phrase inside a heading: calligraphic italic with a silk gradient.
// `glitter` adds a light sweep across the letters and twinkling sparkles (made for the gold tone).
export function Accent({ children, tone = "green", swash = false, glitter = false }: { children: React.ReactNode; tone?: "green" | "gold" | "light"; swash?: boolean; glitter?: boolean }) {
  const toneClass = tone === "gold" ? "accent-gold" : tone === "light" ? "accent-light" : "";
  return (
    <em className={`accent ${toneClass} ${swash ? "swash" : ""} ${glitter ? "accent-glitter" : ""}`}>
      {children}
      {glitter
        ? glints.map((glint) => (
            <span
              key={glint.left}
              aria-hidden="true"
              className="glint"
              style={{ left: glint.left, top: glint.top, width: glint.size, height: glint.size, animationDelay: glint.delay }}
            />
          ))
        : null}
    </em>
  );
}

function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16Z" fill="currentColor" opacity="0.18" />
      <path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16Zm0 0 9-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Small uppercase label above a heading, led by a leaf and trailed by a silk thread.
export function Eyebrow({ children, center = false, light = false, className = "" }: { children: React.ReactNode; center?: boolean; light?: boolean; className?: string }) {
  return (
    <div className={`eyebrow ${light ? "eyebrow-light" : ""} ${center ? "justify-center" : ""} ${className}`}>
      <LeafMark className="h-4 w-4 shrink-0" />
      <span>{children}</span>
      {!center && <span aria-hidden="true" className="h-px w-12 bg-gradient-to-r from-current to-transparent opacity-50 sm:w-16" />}
    </div>
  );
}

// A silk thread looping out of a cocoon, used as a divider under centred headings.
export function Flourish({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 220 24" aria-hidden="true" className={`mx-auto h-5 w-44 ${className}`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#1d8a3d" stopOpacity="0" />
          <stop offset="0.35" stopColor="#1d8a3d" />
          <stop offset="0.65" stopColor="#c99a2e" />
          <stop offset="1" stopColor="#c99a2e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M2 12 C 30 12, 44 4, 62 10 S 84 20, 92 12 C 96 8, 100 9, 101 12 M219 12 C 190 12, 176 4, 158 10 S 136 20, 128 12 C 124 8, 120 9, 119 12"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx="110" cy="12" rx="7.5" ry="5" fill="#fbf6e9" stroke="#c99a2e" strokeWidth="1.2" />
      <path d="M105 10.5c3 1.5 7 1.5 10 0M105 13.5c3 1.5 7 1.5 10 0" fill="none" stroke="#c99a2e" strokeWidth="0.7" opacity="0.6" />
    </svg>
  );
}
