"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Trails the mouse pointer on every page: a cocoon while the pointer rests, a silk moth that emerges
// and flies while it moves. Mouse/trackpad only; off for reduced motion and inside the dashboard.
export function MothFollower() {
  const pathname = usePathname();
  const hidden = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (hidden || !el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let angle = 0;
    let lastFrame = performance.now();
    let seen = false;
    let raf = 0;
    let lastMove = 0;
    let state = "rest";

    const onMove = (event: PointerEvent) => {
      // Trail just beside the pointer so the moth never covers what is being clicked.
      target.x = event.clientX + 22;
      target.y = event.clientY + 22;
      lastMove = performance.now();
      if (!seen) {
        seen = true;
        pos.x = target.x;
        pos.y = target.y;
        vel.x = 0;
        vel.y = 0;
        el.style.opacity = "1";
      }
    };
    const onLeave = () => {
      el.style.opacity = "0";
      seen = false;
    };

    // A critically damped spring: the moth gathers speed gently and eases to a stop without overshooting.
    // Lower STIFFNESS = slower follow. Damping is derived from it so the motion never bounces.
    const STIFFNESS = 0.004;
    const DAMPING = 1 - 2 * Math.sqrt(STIFFNESS);

    const frame = (now: number) => {
      // Step in fixed 60 fps ticks so the speed is the same on 60 Hz and 120 Hz screens.
      const ticks = Math.min(4, Math.max(1, Math.round((now - lastFrame) / (1000 / 60))));
      lastFrame = now;
      for (let i = 0; i < ticks; i++) {
        vel.x = (vel.x + (target.x - pos.x) * STIFFNESS) * DAMPING;
        vel.y = (vel.y + (target.y - pos.y) * STIFFNESS) * DAMPING;
        pos.x += vel.x;
        pos.y += vel.y;
      }

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const moving = Math.hypot(dx, dy) > 6 || Math.hypot(vel.x, vel.y) > 0.4;
      // The moth is drawn facing up, so add 90° to the travel direction; settle upright when hovering.
      const wanted = moving ? (Math.atan2(vel.y, vel.x) * 180) / Math.PI + 90 : 0;
      const diff = ((wanted - angle + 540) % 360) - 180;
      angle += diff * 0.12;

      el.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${angle.toFixed(1)}deg)`;
      el.style.setProperty("--flap", moving ? "110ms" : "420ms");

      // Back to a cocoon once the pointer has been still for a moment.
      const next = !moving && performance.now() - lastMove > 600 ? "rest" : "fly";
      if (next !== state) {
        state = next;
        el.dataset.state = next;
      }
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div ref={ref} aria-hidden="true" data-state="rest" className="moth-follower">
      <svg viewBox="-30 -40 60 80" width="45" height="60" className="moth-cocoon">
        <defs>
          <radialGradient id="cocoon-fill" cx="0.38" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#f3ecda" />
            <stop offset="1" stopColor="#d9cba9" />
          </radialGradient>
        </defs>
        <path d="M0,-40 V-24" stroke="#e9dfc6" strokeWidth="1" />
        <g className="cocoon-half cocoon-top">
          <path d="M-15,0 A15,24 0 0 1 15,0 L11,2 L7,-1 L3,2 L-1,-1 L-5,2 L-9,-1 L-12,2 Z" fill="url(#cocoon-fill)" stroke="#cdbf9d" strokeWidth="0.9" />
          <path d="M-12,-9 C-4,-14 5,-13 13,-7 M-9,-16 C-2,-12 6,-18 10,-15 M-14,-3 C-6,-8 4,-4 14,-5 M-5,-22 C-1,-18 4,-20 6,-21 M-11,-12 C-6,-5 2,-8 8,-3" fill="none" stroke="#e6dcc3" strokeWidth="0.7" />
        </g>
        <g className="cocoon-half cocoon-bottom">
          <path d="M-15,0 L-12,2 L-9,-1 L-5,2 L-1,-1 L3,2 L7,-1 L11,2 L15,0 A15,24 0 0 1 -15,0 Z" fill="url(#cocoon-fill)" stroke="#cdbf9d" strokeWidth="0.9" />
          <path d="M-13,6 C-5,3 5,9 14,5 M-12,12 C-4,16 4,10 12,13 M-9,18 C-3,14 4,19 9,17 M-5,22 C-1,20 3,22 5,21 M-11,9 C-4,13 3,6 10,10" fill="none" stroke="#e6dcc3" strokeWidth="0.7" />
        </g>
      </svg>
      <div className="moth-insect">
      <svg viewBox="-64 -56 128 112" width="96" height="84" className="moth-bob">
        <defs>
          <linearGradient id="moth-wing-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbf7ee" />
            <stop offset="0.55" stopColor="#efe6d4" />
            <stop offset="1" stopColor="#dccfb6" />
          </linearGradient>
          <radialGradient id="moth-body-fill" cx="0.4" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#ece6d8" />
            <stop offset="1" stopColor="#cfc6b2" />
          </radialGradient>
          <filter id="moth-fuzz" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
          </filter>
        </defs>

        <g className="moth-wing moth-wing-left" opacity="0.93">
          <path d="M-4,2 C-16,6 -31,11 -34,24 C-33,35 -19,33 -11,24 C-6,17 -4,10 -4,6 Z" fill="url(#moth-wing-fill)" stroke="#b7a686" strokeWidth="0.9" />
          <path d="M-4,-12 C-18,-27 -37,-38 -58,-36 C-53,-31 -53,-25 -47,-19 C-44,-11 -38,-1 -27,6 C-17,9 -8,5 -4,0 Z" fill="url(#moth-wing-fill)" stroke="#b7a686" strokeWidth="0.9" />
          <path d="M-5,-9 C-20,-22 -38,-31 -55,-34 M-5,-7 C-20,-15 -36,-20 -48,-21 M-5,-5 C-18,-8 -32,-8 -42,-9 M-5,-3 C-15,-2 -24,1 -30,4 M-5,4 C-14,9 -24,16 -31,25 M-5,6 C-10,12 -15,20 -17,29" fill="none" stroke="#c9b997" strokeWidth="0.6" />
          <path d="M-30,-33 C-22,-22 -20,-8 -24,5" fill="none" stroke="#bda98a" strokeWidth="0.8" strokeDasharray="1.6 1.4" />
        </g>
        <g className="moth-wing moth-wing-right" opacity="0.93">
          <path d="M4,2 C16,6 31,11 34,24 C33,35 19,33 11,24 C6,17 4,10 4,6 Z" fill="url(#moth-wing-fill)" stroke="#b7a686" strokeWidth="0.9" />
          <path d="M4,-12 C18,-27 37,-38 58,-36 C53,-31 53,-25 47,-19 C44,-11 38,-1 27,6 C17,9 8,5 4,0 Z" fill="url(#moth-wing-fill)" stroke="#b7a686" strokeWidth="0.9" />
          <path d="M5,-9 C20,-22 38,-31 55,-34 M5,-7 C20,-15 36,-20 48,-21 M5,-5 C18,-8 32,-8 42,-9 M5,-3 C15,-2 24,1 30,4 M5,4 C14,9 24,16 31,25 M5,6 C10,12 15,20 17,29" fill="none" stroke="#c9b997" strokeWidth="0.6" />
          <path d="M30,-33 C22,-22 20,-8 24,5" fill="none" stroke="#bda98a" strokeWidth="0.8" strokeDasharray="1.6 1.4" />
        </g>

        <g fill="none" stroke="#b08d5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-5,-15 L-13,-22 L-17,-20 M5,-15 L13,-22 L17,-20" />
          <path d="M-7,-9 L-16,-10 L-19,-6 M7,-9 L16,-10 L19,-6" />
          <path d="M-7,-2 L-14,3 L-13,8 M7,-2 L14,3 L13,8" />
        </g>

        <g>
          <path d="M-2.5,-22 C-9,-30 -15,-40 -9,-48 C-6,-41 -3,-32 -1.5,-22 Z" fill="#4b4338" />
          <path d="M2.5,-22 C9,-30 15,-40 9,-48 C6,-41 3,-32 1.5,-22 Z" fill="#4b4338" />
          <path d="M-3,-25 L-8,-29 M-4,-29 L-10,-34 M-5,-34 L-11,-39 M-6,-39 L-10,-44 M3,-25 L8,-29 M4,-29 L10,-34 M5,-34 L11,-39 M6,-39 L10,-44" stroke="#d8d0c0" strokeWidth="0.5" />
        </g>

        <g filter="url(#moth-fuzz)">
          <ellipse cx="0" cy="17" rx="11" ry="21" fill="url(#moth-body-fill)" stroke="#bdb39c" strokeWidth="0.8" />
          <path d="M-10,9 Q0,13 10,9 M-11,16 Q0,20 11,16 M-10.5,23 Q0,27 10.5,23 M-8.5,30 Q0,33.5 8.5,30" fill="none" stroke="#c8bea8" strokeWidth="1" />
          <ellipse cx="0" cy="-8" rx="10.5" ry="9.5" fill="url(#moth-body-fill)" stroke="#bdb39c" strokeWidth="0.8" />
          <circle cx="0" cy="-19" r="5.6" fill="#f7f2e6" stroke="#bdb39c" strokeWidth="0.8" />
        </g>
        <circle cx="-3.6" cy="-20.5" r="2.1" fill="#17140f" />
        <circle cx="3.6" cy="-20.5" r="2.1" fill="#17140f" />
        <circle cx="-4.2" cy="-21.2" r="0.6" fill="#ffffff" />
        <circle cx="3" cy="-21.2" r="0.6" fill="#ffffff" />
      </svg>
      </div>
    </div>
  );
}
