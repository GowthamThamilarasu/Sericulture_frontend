"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, CheckCircle2, ChevronDown, Send } from "lucide-react";

import { WhatsAppIcon, whatsappLink } from "@/lib/contact";

const interests = ["Farm monitoring", "Shed automation", "AI insights", "Complete system"];
const contactMethods = ["Phone call", "WhatsApp", "Email"];

const fieldClass = "login-field";
const inputClass = "login-input";
const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

// A dropdown that always opens beneath its field (the browser's own <select> covers the field on
// some systems). The chosen value is submitted through a hidden input under `name`.
function SelectField({ name, label, options, defaultValue }: { name: string; label: string; options: string[]; defaultValue: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [active, setActive] = useState(() => Math.max(0, options.indexOf(defaultValue)));
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const show = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };
  const choose = (option: string) => {
    setValue(option);
    setOpen(false);
  };

  return (
    <div ref={ref} className="select-field">
      <span id={`${id}-label`} className={labelClass}>{label}</span>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        data-open={open ? "" : undefined}
        className={`${fieldClass} select-trigger`}
        onClick={(event) => {
          // Safari does not focus a button on click; focus it so the arrow keys work.
          event.currentTarget.focus();
          if (open) setOpen(false);
          else show();
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) show();
            else setActive((index) => (index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length);
          } else if (open && (event.key === "Home" || event.key === "End")) {
            event.preventDefault();
            setActive(event.key === "Home" ? 0 : options.length - 1);
          } else if (open && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            choose(options[active]);
          }
        }}
      >
        <span className="min-w-0 flex-1 truncate text-left">{value}</span>
        <ChevronDown aria-hidden="true" className="select-chevron h-4 w-4 shrink-0" />
      </button>
      {open ? (
        <ul id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className="select-menu">
          {options.map((option, index) => (
            <li
              key={option}
              id={`${id}-${index}`}
              role="option"
              aria-selected={option === value}
              data-active={index === active ? "" : undefined}
              className="select-option"
              // Keep focus on the trigger so the click lands before the blur closes the list.
              onPointerDown={(event) => event.preventDefault()}
              onPointerEnter={() => setActive(index)}
              onClick={() => choose(option)}
            >
              <span className="min-w-0 flex-1 truncate">{option}</span>
              {option === value ? <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-brand" /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// There is no server behind this form yet: it prepares the request as an email (or a WhatsApp
// message) in the visitor's own app, which they then send.
export function DemoForm({ email }: { email: string }) {
  const [sent, setSent] = useState<"email" | "whatsapp" | null>(null);

  const compose = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const lines = [
      "Demo request",
      "",
      `Name: ${value("name")}`,
      `Phone: ${value("phone")}`,
      `Email: ${value("email") || "-"}`,
      `Farm location: ${value("location") || "-"}`,
      `Interested in: ${value("interest")}`,
      `Preferred contact: ${value("method")}`,
      "",
      value("message") ? `Message: ${value("message")}` : "",
    ];
    return { name: value("name"), body: lines.join("\n").trim() };
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const { name, body } = compose(event.currentTarget);
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Demo request - ${name}`)}&body=${encodeURIComponent(body)}`;
        setSent("email");
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Full name *</span>
          <span className={fieldClass}>
            <input name="name" required autoComplete="name" placeholder="Your name" className={inputClass} />
          </span>
        </label>
        <label className="block">
          <span className={labelClass}>Phone number *</span>
          <span className={fieldClass}>
            <input name="phone" type="tel" required autoComplete="tel" placeholder="Mobile number" className={inputClass} />
          </span>
        </label>
        <label className="block">
          <span className={labelClass}>Email</span>
          <span className={fieldClass}>
            <input name="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} />
          </span>
        </label>
        <label className="block">
          <span className={labelClass}>Farm location</span>
          <span className={fieldClass}>
            <input name="location" placeholder="Village / district" className={inputClass} />
          </span>
        </label>
        <SelectField name="interest" label="Interested in" options={interests} defaultValue={interests[3]} />
        <SelectField name="method" label="Contact me by" options={contactMethods} defaultValue={contactMethods[0]} />
      </div>

      <label className="block">
        <span className={labelClass}>Message</span>
        <span className={`${fieldClass} !h-auto !items-start py-3`}>
          <textarea name="message" rows={4} placeholder="Tell us about your farm and what you would like to see" className={`${inputClass} resize-y`} />
        </span>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="submit" className="login-submit">
          <Send className="h-4 w-4" /> Request a call back
        </button>
        <button
          type="button"
          onClick={(event) => {
            const form = event.currentTarget.form;
            if (!form || !form.reportValidity()) return;
            window.open(whatsappLink(compose(form).body), "_blank", "noopener");
            setSent("whatsapp");
          }}
          className="demo-whatsapp"
        >
          <WhatsAppIcon className="h-5 w-5 text-white" /> Send on WhatsApp
        </button>
      </div>

      {sent ? (
        <div role="status" className="flex gap-3 rounded-2xl bg-brand-tint px-4 py-3 text-sm leading-6 text-ink">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p>
            {sent === "email"
              ? "Your email app should have opened with the request filled in. Press send there to reach our team."
              : "WhatsApp should have opened with the request filled in. Press send there to reach our team."}
          </p>
        </div>
      ) : null}
    </form>
  );
}
