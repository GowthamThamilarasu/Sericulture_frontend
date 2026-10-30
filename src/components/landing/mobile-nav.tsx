"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Menu, X } from "lucide-react";

type MobileNavProps = {
  links: { href: string; label: string }[];
  email: string;
};

export function MobileNav({ links, email }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-ink hover:bg-line"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-t border-line bg-white shadow-lg">
          <nav className="mx-auto flex w-full max-w-[1920px] flex-col px-5 py-4 sm:px-8">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={close} className="border-b border-line py-3 text-base font-medium text-ink hover:text-brand">
                {link.label}
              </a>
            ))}
            <a href={`mailto:${email}`} onClick={close} className="flex items-center gap-3 py-4 text-sm font-medium text-ink hover:text-brand">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
                <Mail className="h-4 w-4" />
              </span>
              <span className="break-all">{email}</span>
            </a>
            <Link href="/login" onClick={close} className="mt-1 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
              Login
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
