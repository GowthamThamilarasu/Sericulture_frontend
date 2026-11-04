import Link from "next/link";
import { Activity, ArrowRight, BarChart3, Bell, Bug, CalendarClock, Camera, Check, ClipboardList, CloudRain, CloudSun, Cpu, Droplets, Fan, FlaskConical, Gauge, Info, LayoutDashboard, LayoutGrid, Leaf, Lightbulb, LogIn, Mail, MapPin, Phone, Play, Plug, Presentation, Radio, Settings2, ShieldCheck, SlidersHorizontal, Sprout, Target, ThermometerSun, TrendingUp, Warehouse, Waves, Wind, Wrench, Zap } from "lucide-react";

import { Logo as BrandLogo } from "@/components/logo";
import { MobileNav } from "@/components/landing/mobile-nav";
import { WhatsAppIcon, contactPhone, contactPhoneHref, whatsappGreeting, whatsappLink } from "@/lib/contact";
import { RevealGroup } from "@/components/landing/reveal-group";
import { Accent, Eyebrow, Flourish } from "@/components/landing/flourish";
import { ProcessStory } from "@/components/landing/process-story";

export const siteShell = "overflow-x-clip bg-white font-sans text-ink";

export const contactEmail = "info@saaram.co.in";

const images = {
  heroVisual: "/landing/hero-visual.png",
  shed: "/landing/shed.jpg",
  mulberry: "/landing/mulberry.jpg",
  dashboard: "/landing/dashboard.jpg",
  sensors: "/landing/sensors.jpg",
  farmField: "/landing/farm-field.png",
  rearingShed: "/landing/rearing-shed.png",
};

const pill =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors";
export const pillGreen = `${pill} bg-brand text-white hover:bg-brand-dark`;
export const pillLight = `${pill} bg-mist text-ink hover:bg-line`;
const pillWhite = `${pill} bg-white text-ink hover:bg-mist`;

export const gradientCard =
  "spot-card spot-panel text-white";

export const container = "mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-12 2xl:px-16";
const headingSize = "font-display text-[2rem] font-bold leading-[1.1] tracking-[-0.015em] sm:text-[2.6rem] lg:text-[3.4rem]";
export const heading = `${headingSize} text-ink`;
export const section = `${container} pb-16 sm:pb-20 lg:pb-24`;

const heroPromises = [
  { text: "Monitor smarter.", icon: Activity },
  { text: "Automate better.", icon: Settings2 },
  { text: "Grow with confidence.", icon: TrendingUp },
];

const heroFeatures = [
  { text: "Optimized Cultivation", icon: Leaf },
  { text: "Automated Operations", icon: Settings2 },
  { text: "Real-time Monitoring", icon: BarChart3 },
  { text: "Better Yield & Quality", icon: ShieldCheck },
];

// Fades the hero photo into the page on its left and bottom edges.
const heroFade = {
  maskImage: "linear-gradient(to right, transparent, #000 24%), linear-gradient(to top, transparent, #000 16%)",
  WebkitMaskImage: "linear-gradient(to right, transparent, #000 24%), linear-gradient(to top, transparent, #000 16%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

const platformScenes = [
  {
    label: "In the field",
    icon: Sprout,
    caption: "Soil, water and weather sensing across every row of your mulberry farm.",
    image: images.farmField,
    alt: "Paari Seritech soil sensor and weather station in a mulberry field",
    badge: "Field sensing",
    points: [
      { text: "Soil moisture", icon: Droplets },
      { text: "Soil pH & EC", icon: FlaskConical },
      { text: "Soil temperature", icon: ThermometerSun },
      { text: "Rainfall", icon: CloudRain },
      { text: "Weather station", icon: CloudSun },
      { text: "Tank level & flow", icon: Waves },
    ],
    cta: "Explore field sensors",
  },
  {
    label: "In the shed",
    icon: Warehouse,
    caption: "Temperature, humidity, CO₂ and ammonia tracked through every rearing stage.",
    image: images.rearingShed,
    alt: "Paari Seritech sensor and climate display in a silkworm rearing shed",
    badge: "Shed climate",
    points: [
      { text: "Temperature", icon: ThermometerSun },
      { text: "Humidity", icon: Droplets },
      { text: "CO₂", icon: Wind },
      { text: "Ammonia (NH₃)", icon: FlaskConical },
      { text: "Light & door status", icon: Lightbulb },
      { text: "Fan & heater control", icon: Fan },
    ],
    cta: "Explore shed hardware",
  },
];

const platformCards = [
  {
    title: "Smart Mulberry Farm",
    detail:
      "Monitor soil moisture, soil temperature, pH, electrical conductivity, water quality, tank levels, rainfall, and other environmental conditions. Make informed irrigation and crop-management decisions using real-time data and actionable recommendations.",
    icon: Sprout,
  },
  {
    title: "Intelligent Silkworm Shed",
    detail:
      "Monitor temperature, relative humidity, carbon dioxide, ammonia, light intensity, and door status. Understand changing rearing conditions and support a more controlled environment throughout the silkworm growth cycle.",
    icon: ThermometerSun,
  },
  {
    title: "Connected Monitoring & Control",
    detail:
      "Access farm and shed information from a centralized dashboard. Receive alerts, review trends, check equipment status, and operate supported automation systems remotely, subject to configured permissions and connectivity.",
    icon: Gauge,
  },
  {
    title: "AI-Powered Insights",
    detail:
      "Build on collected sensor data and operating history to generate irrigation predictions, fertigation recommendations, environmental risk indicators, and insights into mulberry and silkworm conditions.",
    icon: Cpu,
  },
];

type Level = {
  number: string;
  name: string;
  tagline: string;
  lead: string;
  body: string;
  image: string;
  icon: typeof Activity;
  badge: string;
  highlights: { text: string; icon: typeof Activity }[];
  groups: { title?: string; icon?: typeof Activity; items: string[] }[];
  note?: string;
  idealFor?: string;
};

const levels: Level[] = [
  {
    number: "01",
    name: "Monitor",
    tagline: "Visibility at Every Step",
    lead: "Understand your farm before you automate it.",
    body: "Start with connected sensing and real-time dashboards that bring critical agricultural and rearing parameters into one place.",
    image: images.sensors,
    icon: Activity,
    badge: "See everything",
    highlights: [
      { text: "Live dashboards", icon: LayoutDashboard },
      { text: "Soil & water readings", icon: Droplets },
      { text: "Threshold alerts", icon: Bell },
      { text: "Historical trends", icon: TrendingUp },
    ],
    groups: [
      {
        items: [
          "Live farm and shed parameter monitoring",
          "Soil, water, and environmental measurements",
          "Temperature and humidity tracking",
          "CO₂ and ammonia monitoring",
          "Equipment status and sensor health alerts",
          "Historical trends and data visualization",
          "Configurable threshold-based notifications",
          "Farm and shed overview dashboards",
        ],
      },
    ],
    idealFor: "Farmers who want better visibility, early warnings, and data-backed decisions without automatic equipment control.",
  },
  {
    number: "02",
    name: "Smart Control",
    tagline: "Automation That Works for You",
    lead: "Move from observing conditions to managing them.",
    body: "Connect compatible pumps, valves, fans, humidifiers, heaters, and other supported equipment to configured control logic. Automate routine operations using predefined thresholds and operating rules.",
    image: images.shed,
    icon: SlidersHorizontal,
    badge: "Runs by rules",
    highlights: [
      { text: "Fans & ventilation", icon: Fan },
      { text: "Cooling control", icon: ThermometerSun },
      { text: "Humidity management", icon: Droplets },
      { text: "Heater & lighting", icon: Lightbulb },
    ],
    groups: [
      {
        title: "Farm automation",
        icon: Droplets,
        items: [
          "Automatic or semi-automatic irrigation",
          "Soil-moisture-based pump control",
          "Solenoid valve and drip irrigation management",
          "Fertilizer dosing and mixing control",
          "Water tank filling and level management",
          "Configurable irrigation and fertigation sequences",
        ],
      },
      {
        title: "Shed automation",
        icon: Fan,
        items: [
          "Multi-stage fan and ventilation control",
          "Temperature-based cooling management",
          "Humidity management using supported equipment",
          "Heater and lighting control",
          "Environmental response to rising ammonia levels",
          "Equipment status monitoring and fault alerts",
        ],
      },
    ],
    note: "Automation settings can be configured around the farm's operating requirements and approved cultivation practices.",
    idealFor: "Farms seeking to reduce repetitive manual operations and maintain more consistent operating conditions.",
  },
  {
    number: "03",
    name: "AI Smart Sericulture",
    tagline: "Insights Beyond Monitoring",
    lead: "Turn farm data into more informed decisions.",
    body: "Build on sensor readings, historical records, crop stages, and environmental trends to develop intelligent recommendations for cultivation and silkworm rearing.",
    image: images.mulberry,
    icon: Cpu,
    badge: "Learns from data",
    highlights: [
      { text: "Irrigation prediction", icon: CloudSun },
      { text: "Leaf condition", icon: Leaf },
      { text: "Risk-zone assessment", icon: ShieldCheck },
      { text: "Trend analysis", icon: BarChart3 },
    ],
    groups: [
      {
        title: "AI for mulberry cultivation",
        icon: Leaf,
        items: [
          "Irrigation demand prediction",
          "Water requirement estimation",
          "Weather-aware irrigation recommendations",
          "Fertigation recommendations based on measured and target EC",
          "Mulberry leaf condition assessment",
          "Growth and visible-damage analysis",
        ],
      },
      {
        title: "AI for silkworm rearing",
        icon: Bug,
        items: [
          "Environmental risk-zone assessment",
          "Temperature and humidity trend analysis",
          "Ammonia-related risk indicators",
          "Growth-stage-aware environmental insights",
          "Potential stress and abnormal-condition indicators",
          "Contextual recommendations for inspection and intervention",
        ],
      },
      {
        title: "Future computer-vision capabilities",
        icon: Camera,
        items: [
          "Silkworm counting and growth measurement",
          "Activity and feeding observations",
          "Mortality and uneven-development indicators",
          "Mulberry leaf area, colour, and visible-damage analysis",
          "Cocoon size, shape, colour, and defect assessment",
          "Batch-level quality analytics",
        ],
      },
    ],
    note: "Advanced AI and computer-vision features can be introduced as separate modules as they are developed, validated, and deployed.",
  },
];

const engineered = [
  {
    title: "Farm Intelligence",
    detail: "Give your mulberry cultivation the benefit of connected environmental and irrigation monitoring.",
    listTitle: "Parameters supported by the proposed system",
    items: [
      "Soil moisture and temperature",
      "Soil and irrigation-water EC",
      "Soil pH",
      "Water flow, pressure, and tank level",
      "Rainfall and local weather conditions",
      "Irrigation and fertilizer-dosing status",
    ],
    icon: Sprout,
  },
  {
    title: "Shed Intelligence",
    detail: "Monitor the environmental factors that matter during silkworm rearing.",
    listTitle: "Parameters supported by the proposed system",
    items: [
      "Temperature and relative humidity",
      "CO₂ and NH₃ levels",
      "Light intensity",
      "Door status",
      "Fan and ventilation status",
      "Optional airflow and additional environmental sensing",
    ],
    icon: ThermometerSun,
  },
  {
    title: "Intelligent Equipment Control",
    detail: "Connect monitoring to physical action through compatible controllers and actuators.",
    listTitle: "Supported control categories",
    items: [
      "Water pumps and solenoid valves",
      "Fertilizer dosing pumps and mixing systems",
      "Exhaust and circulation fans",
      "Foggers, misters, and humidifiers",
      "Heaters and cooling equipment",
      "Motorized curtains, louvers, and lighting",
    ],
    icon: Wind,
  },
];

const dashboardPoints = [
  { title: "Monitor in real time", detail: "View current sensor readings, farm conditions, shed climate, water levels, and connected equipment status.", icon: Activity },
  { title: "Stay informed", detail: "Receive alerts for configured threshold violations, abnormal trends, and sensor or equipment faults.", icon: Bell },
  { title: "Review performance", detail: "Explore historical data, environmental trends, irrigation activity, and available production indicators.", icon: TrendingUp },
  { title: "Control remotely", detail: "Operate supported equipment through authorized interfaces, with appropriate safeguards and connectivity.", icon: SlidersHorizontal },
  { title: "Make informed decisions", detail: "Use trends, historical records, and available AI recommendations to guide daily farm management.", icon: Lightbulb },
];

const growthAdditions = [
  { text: "Additional sensor channels and new environmental parameters", icon: Radio, short: "More Sensors", anim: "pulse" },
  { text: "More farm zones, sheds, and independent control groups", icon: LayoutGrid, short: "More Zones & Sheds", anim: "spin" },
  { text: "Crop-stage and silkworm-stage management", icon: CalendarClock, short: "Stage Management", anim: "tick" },
  { text: "Advanced camera-based monitoring", icon: Camera, short: "Camera Monitoring", anim: "zoom" },
  { text: "Predictive maintenance and equipment diagnostics", icon: Wrench, short: "Predictive Maintenance", anim: "rock" },
  { text: "Energy and water-use analytics", icon: Zap, short: "Energy & Water Analytics", anim: "flicker" },
  { text: "Production, batch, and cocoon-quality records", icon: ClipboardList, short: "Quality Records", anim: "bounce" },
  { text: "Weather-service and external platform integrations", icon: CloudSun, short: "Weather Integrations", anim: "drift" },
  { text: "Custom reports, APIs, and third-party system connectivity", icon: Plug, short: "Reports & APIs", anim: "plug" },
];

const navLinks = [
  { href: "/#solutions", label: "Solutions" },
  { href: "/products", label: "Products" },
  { href: "/#levels", label: "Levels" },
  { href: "/#engineering", label: "Engineering" },
  { href: "#contact", label: "Contact" },
];

const contactDetails = [
  { label: "Email", value: contactEmail, href: `mailto:${contactEmail}`, icon: Mail },
  { label: "Mobile", value: contactPhone, href: contactPhoneHref, icon: Phone },
  { label: "Location", value: "Tamil Nadu, India", icon: MapPin },
];

function Photo({ src, label, className }: { src: string; label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`bg-cover bg-center ${className ?? ""}`}
      style={{ backgroundImage: `url('${src}')` }}
    />
  );
}

type Feature = { text: string; detail?: string; icon?: typeof Activity };

export function FeaturePanel({
  title,
  icon: TitleIcon,
  items,
  columns,
  bare,
}: {
  title?: string;
  icon?: typeof Activity;
  items: (string | Feature)[];
  columns?: string;
  bare?: boolean;
}) {
  return (
    <div className={bare ? "text-white" : `h-full ${gradientCard} p-3 sm:p-4`}>
      {title ? (
        <div className={`flex items-center gap-3 pb-3 pt-1 text-white ${bare ? "" : "px-2"}`}>
          {TitleIcon ? (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6fe07f] to-[#00a218] text-[#0b100d] shadow-lg shadow-emerald-500/30">
              <TitleIcon className="h-6 w-6" />
            </span>
          ) : null}
          <h4 className="text-lg font-bold leading-snug sm:text-xl">{title}</h4>
        </div>
      ) : null}
      <ul className={columns ?? "grid gap-2"}>
        {items.map((raw) => {
          const item: Feature = typeof raw === "string" ? { text: raw } : raw;
          const ItemIcon = item.icon ?? Check;
          return (
            <li key={item.text} className="spot-row flex items-center gap-3 rounded-[18px] bg-white/[0.07] px-2.5 py-2.5 pr-4 text-white ring-1 ring-inset ring-white/10">
              <span className="spot-row-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3fbf5f]/20 text-[#6fe07f]">
                <ItemIcon className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="text-[15px] font-semibold leading-5">
                {item.text}
                {item.detail ? <span className="mt-1 block text-[13px] font-normal leading-5 text-white/65">{item.detail}</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Logo({ light }: { light?: boolean }) {
  return (
    <Link href="/" aria-label="Paari Seritech home" className="flex shrink-0 items-center">
      <BrandLogo plate={light} className={light ? "h-16 sm:h-20" : "h-10 sm:h-12"} />
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <div className={`${container} flex items-center justify-between gap-4 py-3 sm:py-4`}>
        <div className="flex min-w-0 items-center gap-6 xl:gap-8">
          <Logo />
          <nav className="site-nav hidden lg:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="site-nav-link">{link.label}</a>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4 xl:gap-6">
          <a href={`mailto:${contactEmail}`} aria-label={`Email ${contactEmail}`} className="hidden items-center gap-3 text-sm font-medium text-ink hover:text-brand sm:flex lg:max-xl:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
              <Mail className="h-4 w-4" />
            </span>
            <span className="hidden xl:inline">{contactEmail}</span>
          </a>
          <Link href="/login" className="header-login">
            <span className="header-login-icon">
              <LogIn className="h-4 w-4" />
            </span>
            Login
          </Link>
          <MobileNav links={navLinks} email={contactEmail} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-20 bg-ink text-white">
      <div className={`${container} py-14 sm:py-20`}>
        <div className="grid gap-10 lg:grid-cols-[6fr_5fr] lg:gap-16">
          <div>
            <Eyebrow light className="mb-5">Get in touch</Eyebrow>
            <h2 className={headingSize}>Let&apos;s Build Your <Accent tone="light">Smart Sericulture</Accent> Farm.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/75">
              Contact our team to explore farm monitoring, shed automation, and AI-enabled sericulture solutions tailored to your requirements.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={`mailto:${contactEmail}`} className={pillGreen}>
                <Mail className="h-4 w-4" /> Contact Us
              </a>
              <Link href="/demo" className={pillWhite}>
                <Presentation className="h-4 w-4" /> Request a Product Demonstration
              </Link>
              <a href={whatsappLink(whatsappGreeting)} target="_blank" rel="noopener noreferrer" className={`${pill} bg-[#25D366] text-white hover:bg-[#1eb457]`}>
                <WhatsAppIcon className="h-5 w-5 text-white" /> Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {contactDetails.map((item) => (
              <div key={item.label} className="flex items-center gap-4 rounded-[20px] bg-white/5 p-5 sm:p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <item.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-white/60">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="break-all text-lg font-medium text-white hover:text-[#6fe07f]">{item.value}</a>
                  ) : (
                    <div className="text-lg font-medium text-white">{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 sm:mt-16 md:flex-row md:items-center md:justify-between">
          <Logo light />
          <p className="text-sm text-white/70">
            &copy; {new Date().getFullYear()} Paari Seritech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className={siteShell}>
      <SiteHeader />

      <main>
        <section className="grain relative overflow-hidden bg-gradient-to-b from-[#f3f8f2] via-white to-white">
          <div aria-hidden="true" className="organic-glow -left-24 top-10 h-80 w-80 bg-[#bfe6c4]/60" />
          <div aria-hidden="true" className="organic-glow left-[22%] top-[38%] h-64 w-64 bg-[#f3dfa6]/50" />
          <div className="relative">
          <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[60%] lg:block" style={heroFade}>
            <div className="h-full w-full bg-cover bg-[35%_50%]" style={{ backgroundImage: `url('${images.heroVisual}')` }} />
          </div>

          <div className={`${container} relative py-10 sm:py-14 lg:flex lg:min-h-[560px] lg:items-center lg:py-12`}>
            <div className="max-w-xl lg:w-[44%] lg:max-w-none">
              <Eyebrow>Smart Automation for Modern Sericulture</Eyebrow>
              <h1 className="mt-6 whitespace-nowrap font-display text-[clamp(2.4rem,11vw,4.6rem)] font-bold leading-[1.04] tracking-[-0.02em] text-ink lg:text-[4.5vw] 2xl:text-[5.4rem]">
                <span className="block">
                  From <Accent>Green Leaf</Accent>
                </span>
                <span className="block">
                  to <Accent tone="gold" swash glitter>Golden Silk</Accent>
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                Integrated sensors and automation for healthier mulberry, smarter rearing and premium quality silk.
              </p>

              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                {heroFeatures.map((item) => (
                  <li key={item.text} className="flex flex-col items-center text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#bfe0c6] bg-white/80 text-[#0f5b2c] shadow-[0_4px_14px_rgba(15,91,44,0.08)]">
                      <item.icon className="h-7 w-7" strokeWidth={1.6} />
                    </span>
                    <span className="mt-3 max-w-[8rem] text-sm leading-snug text-ink-soft sm:text-[15px]">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <a href="#solutions" className="inline-flex items-center gap-2.5 rounded-xl bg-[#0f5c2e] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(15,92,46,0.25)] transition hover:bg-[#0b4a24]">
                  Explore Our Solutions <ArrowRight className="h-5 w-5" />
                </a>
                <Link href="/dashboard" className="group inline-flex items-center gap-3 text-base font-medium text-ink">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink/80 transition group-hover:border-[#0f5c2e] group-hover:bg-[#0f5c2e] group-hover:text-white">
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </span>
                  Watch Live Demo
                </Link>
              </div>
            </div>
          </div>

          </div>

          <div className={`${container} lg:hidden`}>
            <Photo
              src={images.heroVisual}
              label="Paari Seritech field sensor, shed controller and silkworm rearing racks"
              className="aspect-[1124/588] w-full rounded-2xl"
            />
          </div>

          <div className={`${container} relative pb-16 pt-12 sm:pb-20 lg:pt-4`}>
            <div className="mb-8 text-center">
              <Eyebrow center>How Silk Is Made</Eyebrow>
              <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
                From <Accent>leaf</Accent> to <Accent tone="gold">silk</Accent>, step by step
              </h2>
            </div>
            <ProcessStory />
          </div>
        </section>

        <section className={section}>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="font-display text-[1.75rem] font-bold leading-[1.3] tracking-[-0.01em] text-ink sm:text-4xl lg:text-[2.75rem]">
                Intelligent Sericulture. Connected Farming. <Accent>Better Possibilities.</Accent>
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-base font-bold text-brand sm:text-lg">
                {heroPromises.map((item) => (
                  <li key={item.text} className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-tint">
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-base leading-7 text-ink-soft">
                Transform traditional mulberry cultivation and silkworm rearing into a smarter, data-driven operation with Paari Seritech—an integrated automation platform designed to connect farm conditions, rearing environments, intelligent insights, and automated control in one ecosystem.
              </p>
              <p className="mt-4 text-base leading-7 text-ink-soft">
                From monitoring soil moisture in mulberry fields to managing temperature and humidity inside silkworm sheds, Paari Seritech helps farmers observe critical conditions, make informed decisions, and progressively automate everyday operations.
              </p>
            </div>
          </div>
        </section>

        <section id="solutions" className={`${section} scroll-mt-24`}>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow center>The Platform</Eyebrow>
            <h2 className={`${heading} mt-4`}>One Platform. Every Stage of <Accent>Sericulture.</Accent></h2>
            <Flourish className="mt-5" />
            <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
              Bring your mulberry farm and silkworm rearing shed together through connected sensors, intelligent controllers, a centralized dashboard, and mobile-friendly monitoring.
            </p>
          </div>

          <RevealGroup className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-2 lg:gap-6">
            {platformScenes.map((scene, index) => (
              <div key={scene.label} className="scene-card relative flex aspect-[4/5] items-end overflow-hidden rounded-[20px] sm:aspect-[5/4]" style={{ "--i": index } as React.CSSProperties}>
                <Photo src={scene.image} label={scene.alt} className="scene-photo absolute inset-0" />
                <div aria-hidden="true" className="scene-shade absolute inset-0" />
                <div className="scene-badge absolute left-4 top-4 sm:left-5 sm:top-5">
                  <span className="scene-badge-dot" />
                  {scene.badge}
                </div>
                <div className="scene-panel relative m-4 w-full rounded-2xl bg-white px-5 py-4 sm:m-5 sm:px-6 sm:py-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                    <span className="scene-icon flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
                      <scene.icon className="h-3.5 w-3.5" />
                    </span>
                    {scene.label}
                    <span aria-hidden="true" className="scene-hint ml-auto rounded-full bg-brand-tint px-2.5 py-1 text-[10px] tracking-[0.12em]">
                      +{scene.points.length} tracked
                    </span>
                  </div>
                  <p className="mt-2 font-display text-lg leading-snug text-ink sm:text-xl lg:text-[1.4rem]">{scene.caption}</p>
                  <div className="scene-more">
                    <div className="min-h-0 overflow-hidden">
                      <ul className="flex flex-wrap gap-2 pt-4">
                        {scene.points.map((point, pointIndex) => (
                          <li key={point.text} className="scene-chip" style={{ "--c": pointIndex } as React.CSSProperties}>
                            <point.icon className="h-3.5 w-3.5 shrink-0 text-brand" />
                            {point.text}
                          </li>
                        ))}
                      </ul>
                      <Link href="/products" className="scene-cta mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark">
                        {scene.cta} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </RevealGroup>

          <RevealGroup className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 xl:grid-cols-4">
            {platformCards.map((item, index) => (
              <article key={item.title} className="spot-card flex flex-col p-6 sm:p-7" style={{ "--i": index } as React.CSSProperties}>
                <div aria-hidden="true" className="spot-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="spot-icon">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-display text-[1.35rem] font-bold leading-snug text-white sm:text-[1.55rem]">{item.title}</h3>
                <p className="mb-6 mt-3 text-[15px] leading-6 text-white/70">{item.detail}</p>
                <div aria-hidden="true" className="spot-bar" />
              </article>
            ))}
          </RevealGroup>
        </section>

        <section id="levels" className={`${section} scroll-mt-24`}>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow center>Choose Your Path</Eyebrow>
            <h2 className={`${heading} mt-4`}>Three Levels of <Accent tone="gold" swash>Smart</Accent> Sericulture</h2>
            <Flourish className="mt-5" />
            <p className="mt-5 text-base leading-7 text-ink-soft">
              Choose the capabilities that match your farm&apos;s needs today, with a pathway to more advanced automation tomorrow.
            </p>
          </div>

          <div className="mt-10 space-y-14 sm:mt-14 lg:space-y-16">
            {levels.map((level, index) => (
              <div key={level.number} className={`grid items-start gap-8 lg:gap-14 ${index % 2 === 1 ? "lg:grid-cols-[7fr_5fr]" : "lg:grid-cols-[5fr_7fr]"}`}>
                <RevealGroup className={`lg:sticky lg:top-24 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="scene-card relative flex min-h-[390px] items-end overflow-hidden rounded-[20px] sm:min-h-[430px] lg:min-h-[440px]">
                    <Photo src={level.image} label={`${level.name} level`} className="scene-photo absolute inset-0" />
                    <div aria-hidden="true" className="scene-shade absolute inset-0" />
                    {/* Level number with the Paari logo, stamped on every level photo. */}
                    <div className="absolute left-4 top-4 flex items-center gap-2.5 rounded-xl bg-white py-1.5 pl-3.5 pr-3 shadow-[0_8px_20px_-10px_rgb(16_18_17_/_0.45)] sm:left-5 sm:top-5 sm:gap-3 sm:pl-4">
                      <span className="font-display text-2xl font-bold italic text-brand [font-variation-settings:'SOFT'_100,'WONK'_1]">{level.number}</span>
                      <span aria-hidden="true" className="h-7 w-px bg-line" />
                      <BrandLogo className="h-7 sm:h-8" />
                    </div>
                    {/* The badge needs the card's full width beside the number and logo, so it waits for wider phones. */}
                    <div className="absolute right-4 top-4 hidden min-[440px]:block sm:right-5 sm:top-5">
                      <div className="scene-badge">
                        <span className="scene-badge-dot" />
                        {level.badge}
                      </div>
                    </div>
                    <div className="scene-panel relative m-5 w-full rounded-2xl bg-white px-6 pb-6 pt-9 text-center">
                      <div className="scene-icon absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-brand text-white">
                        <level.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-[1.75rem] font-bold text-ink">{level.name}</h3>
                      <div className="mt-4 border-t border-line pt-4 text-[15px] text-ink-soft">{level.tagline}</div>
                      <div className="scene-more">
                        <div className="min-h-0 overflow-hidden">
                          <ul className="flex flex-wrap justify-center gap-2 pt-4">
                            {level.highlights.map((point, pointIndex) => (
                              <li key={point.text} className="scene-chip" style={{ "--c": pointIndex } as React.CSSProperties}>
                                <point.icon className="h-3.5 w-3.5 shrink-0 text-brand" />
                                {point.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealGroup>

                <div>
                  <p className="font-display text-[1.4rem] font-light leading-snug text-ink sm:text-[1.7rem] lg:text-[2.1rem]">{level.lead}</p>
                  <p className="mt-4 text-base leading-7 text-ink-soft">{level.body}</p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {level.groups.map((group, groupIndex) => {
                      const wide = level.groups.length % 2 === 1 && groupIndex === level.groups.length - 1;
                      return (
                        <div key={group.title ?? groupIndex} className={wide ? "sm:col-span-2" : ""}>
                          <FeaturePanel title={group.title} icon={group.icon} items={group.items} columns={wide ? "grid gap-2 sm:grid-cols-2" : undefined} />
                        </div>
                      );
                    })}
                  </div>
                  {level.note ? (
                    <p className="mt-8 flex gap-2 text-sm leading-6 text-ink-soft/80">
                      <Info className="mt-1 h-4 w-4 shrink-0" />
                      {level.note}
                    </p>
                  ) : null}
                  {level.idealFor ? (
                    <div className={`${gradientCard} mt-4 flex gap-4 px-5 py-5 text-[15px] leading-6 sm:px-6`}>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6fe07f] to-[#00a218] text-[#0b100d] shadow-lg shadow-emerald-500/30">
                        <Target className="h-6 w-6" />
                      </span>
                      <p className="self-center text-white/80">
                        <span className="font-bold text-[#6fe07f]">Ideal for:</span> {level.idealFor}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="engineering" className={`${section} scroll-mt-24`}>
          <Eyebrow>Built to Last</Eyebrow>
          <h2 className={`${heading} mt-4 max-w-xl`}>Engineered Around <Accent>Your Farm</Accent></h2>
          <div className="mt-8 grid gap-4 sm:mt-10 lg:grid-cols-3">
            {engineered.map((item, index) => (
              <div key={item.title} className={`${gradientCard} p-5 sm:p-7`}>
                <div aria-hidden="true" className="spot-number">0{index + 1}</div>
                <div className="spot-icon">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-display text-[1.6rem] font-bold text-white sm:text-[1.85rem]">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-6 text-white/85">{item.detail}</p>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <FeaturePanel bare title={item.listTitle} items={item.items} columns="grid gap-2 sm:grid-cols-2 lg:grid-cols-1" />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-ink-soft/80">
            Actual compatibility depends on the selected hardware, electrical ratings, installation, and control configuration.
          </p>
        </section>

        <section id="dashboard" className={`${section} scroll-mt-24`}>
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="rounded-[20px] bg-mist p-4 sm:p-7">
              <Photo src={images.dashboard} label="Sericulture monitoring dashboard on a tablet" className="aspect-[645/228] w-full rounded-2xl" />
              <Photo src={images.shed} label="Automated silkworm rearing racks" className="mt-5 aspect-[459/235] w-full rounded-2xl" />
            </div>
            <div>
              <Eyebrow>Command Centre</Eyebrow>
              <h2 className={`${heading} mt-4`}>Your Farm. Your Dashboard. <Accent>Your Control.</Accent></h2>
              <p className="mt-5 text-base leading-7 text-ink-soft">
                Access operational information through a centralized digital interface designed to make complex farm conditions easier to understand.
              </p>
              <div className="mt-8">
                <FeaturePanel items={dashboardPoints.map((item) => ({ text: item.title, detail: item.detail, icon: item.icon }))} />
              </div>
            </div>
          </div>
        </section>

        <section className={section}>
          <div className="rounded-[24px] bg-brand-tint px-4 py-10 sm:rounded-[28px] sm:px-8 sm:py-14 lg:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow center>The Road Ahead</Eyebrow>
              <h2 className={`${heading} mt-4`}>Designed for Growth. <Accent tone="gold">Ready for What&apos;s Next.</Accent></h2>
              <Flourish className="mt-5" />
              <p className="mt-5 text-base leading-7 text-ink-soft">
                Paari Seritech is designed around a modular approach, allowing the system to expand as operational requirements grow.
              </p>
              <p className="mt-6 font-display text-xl italic text-ink">Potential additions include:</p>
            </div>
            <div className="mt-8">
              <div className={`${gradientCard} p-4 sm:p-6`}>
                <ul className="grid grid-cols-3 gap-3 sm:gap-4 xl:grid-cols-9">
                  {growthAdditions.map((item, index) => (
                    <li key={item.text} title={item.text} className="key-tile" style={{ "--i": index } as React.CSSProperties}>
                      <span className="key-icon">
                        <item.icon className={`key-anim-${item.anim} h-7 w-7`} strokeWidth={2.2} />
                      </span>
                      <span className="text-xs font-bold leading-snug text-white sm:text-sm">{item.short}</span>
                      <span className="sr-only">: {item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-ink-soft">
              These capabilities can be introduced according to product development priorities, hardware availability, and customer requirements.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
