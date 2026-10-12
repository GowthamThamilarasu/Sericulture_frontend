import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Presentation, Sprout, Warehouse } from "lucide-react";

import { Accent, Eyebrow, Flourish } from "@/components/landing/flourish";
import { SiteFooter, SiteHeader, gradientCard, pillGreen, pillLight, section, siteShell } from "@/components/landing/landing-page";
import { ProductShowcase } from "@/components/landing/product-showcase";

export const metadata: Metadata = {
  title: "Products | Paari Seritech",
  description: "Paari Seritech shed controllers, environmental sensors and field sensors for mulberry cultivation and silkworm rearing.",
};

export default function ProductsPage() {
  return (
    <div className={siteShell}>
      <SiteHeader />

      <main>
        <section className={`${section} pt-10 sm:pt-14 lg:pt-20`}>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow center>Products</Eyebrow>
            <h1 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.06] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[4rem]">
              Hardware for the <Accent>farm</Accent> and the <Accent tone="gold" swash>shed</Accent>
            </h1>
            <Flourish className="mt-6" />
            <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
              Controllers and sensors that connect your mulberry farm and silkworm rearing shed to one platform.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#shed" className={pillGreen}>
                <Warehouse className="h-4 w-4" /> Shed Products
              </a>
              <a href="#field" className={pillLight}>
                <Sprout className="h-4 w-4" /> Field Sensors
              </a>
            </div>
          </div>
        </section>

        <ProductShowcase />

        <section className={`${section} pt-10`}>
          <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-6 text-ink-soft/80">
            Actual compatibility depends on the selected hardware, electrical ratings, installation, and control configuration.
          </p>
          <div className={`${gradientCard} px-5 py-10 text-center sm:px-8 sm:py-14`}>
            <h2 className="font-display text-3xl font-bold leading-[1.12] tracking-[-0.015em] text-white sm:text-4xl lg:text-5xl">See the products <Accent tone="light">in action</Accent></h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/85">
              Ask for a product demonstration, or open the live dashboard demo to see how the readings come together.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/demo" className={`${pillGreen} ring-1 ring-inset ring-white/40`}>
                <Presentation className="h-4 w-4" /> Request a Product Demonstration
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-mist">
                View Live Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
