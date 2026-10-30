import type { Metadata } from "next";
import { CalendarCheck, Mail, MonitorPlay, PhoneCall } from "lucide-react";

import { DemoForm } from "@/components/demo-form";
import { Accent, Eyebrow } from "@/components/landing/flourish";
import { SiteFooter, SiteHeader, contactEmail, gradientCard, section, siteShell } from "@/components/landing/landing-page";
import { WhatsAppIcon, whatsappGreeting, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Request a Demo | Paari Seritech",
  description: "Request a demonstration of Paari Seritech farm monitoring, shed automation and AI-enabled sericulture solutions.",
};

const steps = [
  { title: "Send your request", detail: "Tell us about your farm and what you want to see.", icon: CalendarCheck },
  { title: "We contact you back", detail: "Our team gets in touch using the method you prefer.", icon: PhoneCall },
  { title: "See it working", detail: "We walk you through the dashboard and the hardware.", icon: MonitorPlay },
];

export default function DemoPage() {
  return (
    <div className={siteShell}>
      <SiteHeader />

      <main>
        <section className={`${section} pt-10 sm:pt-14 lg:pt-20`}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <div>
              <Eyebrow>Request a Demo</Eyebrow>
              <h1 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.06] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.6rem]">
                See Paari Seritech working for <Accent swash>your farm</Accent>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
                Fill in the form and our team will contact you back to arrange a demonstration of farm monitoring, shed automation, and AI-enabled sericulture solutions.
              </p>

              <ol className="mt-8 space-y-3">
                {steps.map((step, index) => (
                  <li key={step.title} className={`${gradientCard} flex items-center gap-4 p-4`}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6fe07f] to-[#00a218] text-[#0b100d]">
                      <step.icon className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="text-base font-bold text-white">
                        {index + 1}. {step.title}
                      </div>
                      <div className="text-sm leading-6 text-white/70">{step.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={whatsappLink(whatsappGreeting)} target="_blank" rel="noopener noreferrer" className="demo-whatsapp sm:w-auto sm:px-6">
                  <WhatsAppIcon className="h-5 w-5 text-white" /> Chat on WhatsApp
                </a>
                <a href={`mailto:${contactEmail}`} className="inline-flex h-[3.1rem] items-center justify-center gap-2 rounded-full bg-mist px-6 text-sm font-semibold text-ink transition-colors hover:bg-line">
                  <Mail className="h-4 w-4" /> {contactEmail}
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-line bg-white p-5 shadow-xl shadow-emerald-950/10 sm:p-8">
              <h2 className="font-display text-[1.75rem] font-bold tracking-[-0.01em] text-ink">Tell us how to <Accent>reach you</Accent></h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Fields marked * are required.</p>
              <div className="mt-6">
                <DemoForm email={contactEmail} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
