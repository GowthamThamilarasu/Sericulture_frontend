"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

import { WhatsAppIcon, whatsappLink } from "@/lib/contact";

const interests = ["Farm monitoring", "Shed automation", "AI insights", "Complete system"];
const contactMethods = ["Phone call", "WhatsApp", "Email"];

const fieldClass = "login-field";
const inputClass = "login-input";
const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

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
        <label className="block">
          <span className={labelClass}>Interested in</span>
          <span className={fieldClass}>
            <select name="interest" defaultValue={interests[3]} className={inputClass}>
              {interests.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </span>
        </label>
        <label className="block">
          <span className={labelClass}>Contact me by</span>
          <span className={fieldClass}>
            <select name="method" defaultValue={contactMethods[0]} className={inputClass}>
              {contactMethods.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </span>
        </label>
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
