"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";

import { WhatsAppIcon, whatsappGreeting, whatsappLink } from "@/lib/contact";

const EDGE = 8;

// Pins its child to a bottom corner and lets the visitor drag it anywhere on screen.
// A drag never triggers the button underneath; a plain click or tap still does.
function Draggable({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startY: 0, baseX: 0, baseY: 0, x: 0, y: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 });

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const d = drag.current;
    const rect = el.getBoundingClientRect();
    d.minX = d.x - rect.left + EDGE;
    d.maxX = d.x + (window.innerWidth - rect.right) - EDGE;
    d.minY = d.y - rect.top + EDGE;
    d.maxY = d.y + (window.innerHeight - rect.bottom) - EDGE;
  };

  const place = (x: number, y: number) => {
    const el = ref.current;
    if (!el) return;
    const d = drag.current;
    d.x = Math.min(d.maxX, Math.max(d.minX, x));
    d.y = Math.min(d.maxY, Math.max(d.minY, y));
    el.style.transform = `translate3d(${d.x}px, ${d.y}px, 0)`;
  };

  // Keep the button on screen when the window is resized.
  useEffect(() => {
    const onResize = () => {
      measure();
      place(drag.current.x, drag.current.y);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      ref={ref}
      className={`float-slot float-slot-${side}`}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        const d = drag.current;
        measure();
        d.active = true;
        d.moved = false;
        d.startX = event.clientX;
        d.startY = event.clientY;
        d.baseX = d.x;
        d.baseY = d.y;
      }}
      onPointerMove={(event) => {
        const d = drag.current;
        if (!d.active) return;
        const dx = event.clientX - d.startX;
        const dy = event.clientY - d.startY;
        if (!d.moved) {
          if (Math.hypot(dx, dy) < 6) return;
          d.moved = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.setAttribute("data-dragging", "");
        }
        place(d.baseX + dx, d.baseY + dy);
      }}
      onPointerUp={(event) => {
        drag.current.active = false;
        event.currentTarget.removeAttribute("data-dragging");
      }}
      onPointerCancel={(event) => {
        drag.current.active = false;
        event.currentTarget.removeAttribute("data-dragging");
      }}
      onClickCapture={(event) => {
        if (!drag.current.moved) return;
        drag.current.moved = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      {children}
    </div>
  );
}

// Floating WhatsApp (bottom left) and "Login" (bottom right) buttons on the public pages;
// hidden on the login page and inside the dashboard.
export function FloatingLogin() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/login")) return null;

  return (
    <>
      <Draggable side="left">
        <a
          href={whatsappLink(whatsappGreeting)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
          draggable={false}
          className="float-whatsapp"
        >
          <WhatsAppIcon className="h-7 w-7 text-white" />
        </a>
      </Draggable>
      <Draggable side="right">
        <Link href="/login" draggable={false} className="float-login">
          <span className="float-login-icon">
            <LogIn className="h-4 w-4" />
          </span>
          Login
        </Link>
      </Draggable>
    </>
  );
}
