"use client";

import { useEffect, useRef } from "react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Activity, ArrowDownRight, ArrowRight, BatteryCharging, Cloud, CloudRain, CloudSun, Compass, Cylinder, Droplet, Droplets, Fan, FlaskConical, Gauge, Leaf, Lightbulb, RadioTower, Sprout, Sun, TestTube, Thermometer, Umbrella, Waves, Wifi, Wind, Zap } from "lucide-react";

const specFont = Space_Grotesk({ subsets: ["latin"] });
const specMono = JetBrains_Mono({ subsets: ["latin"] });

type Product = {
  name: string;
  group: "Gateway" | "Shed" | "Field";
  image: string;
  alt: string;
  wide?: boolean;
  tall?: boolean; // portrait photo: shown taller than the square size
  summary: string;
  features: string[];
  motifs: (typeof Activity)[];
};

// Where the faint property icons sit behind each product, and how far each drifts with scroll.
const motifSlots = [
  { className: "left-[3%] top-[24%] h-24 w-24 sm:h-36 sm:w-36", rotate: -12, drift: 70 },
  { className: "right-[20%] top-[7%] h-14 w-14 sm:h-24 sm:w-24", rotate: 14, drift: -45 },
  { className: "left-[22%] bottom-[30%] h-12 w-12 sm:h-20 sm:w-20", rotate: 8, drift: 100 },
  { className: "right-[4%] bottom-[34%] h-20 w-20 sm:h-32 sm:w-32", rotate: -8, drift: -80 },
];

const products: Product[] = [
  {
    name: "LoRa Gateway",
    group: "Gateway",
    image: "/products/lora-gateway.png",
    alt: "Paari Seritech LoRa gateway: a white weatherproof enclosure with two antennas and four cable glands",
    tall: true,
    summary: "LoRa Gateway: the weatherproof hub that links every Paari Seritech device on the farm and in the shed, and connects them to the internet.",
    features: ["Local-area (LoRa) link to all the devices on the farm", "Ethernet, Wi-Fi and GSM modem connectivity", "Runs on its internal battery", "Dual supply: solar powered and DC powered"],
    motifs: [RadioTower, Wifi, BatteryCharging, Sun],
  },
  {
    name: "Shed Controller",
    group: "Shed",
    image: "/products/shed-controller.png",
    alt: "Paari Seritech shed automation controller with touchscreen showing shed environment readings",
    wide: true,
    summary: "Shed Automation Controller: a wall-mounted touchscreen that shows the shed environment and connects to the equipment that manages it.",
    features: ["Shows temperature, humidity, CO₂, NH₃, light and door status", "Connections for heater, fan, cooling, humidifier and lights", "Dashboard, Trends, Control, Alerts and Settings screens", "Wall-mounted enclosure with a built-in touchscreen"],
    motifs: [Thermometer, Fan, Lightbulb, Droplet],
  },
  {
    name: "Multi Sensor Control System",
    group: "Shed",
    image: "/products/multi-sensor-control.png",
    alt: "Paari Seritech multi sensor control system: a weatherproof enclosure with LoRa and ESP-NOW antennas, status lights and five cable ports",
    wide: true,
    summary: "Multi Sensor Control System: one weatherproof unit that reads the shed's sensors (temperature, humidity, leaf moisture, CO₂ and light) and controls equipment such as ventilation.",
    features: [
      "Connects any sensor: two I²C / analog / digital ports and RS485 (Modbus)",
      "LoRa and ESP-NOW wireless technology",
      "Battery operated and solar powered, with a 12–24 V DC input",
      "Input / output port to control equipment such as ventilation fans",
    ],
    motifs: [RadioTower, Thermometer, Sun, BatteryCharging],
  },
  {
    name: "Environmental Sensor",
    group: "Shed",
    image: "/products/environmental-sensor.png",
    alt: "Paari Seritech environmental sensor, shown closed and with the cover open",
    wide: true,
    summary: "Shed Environmental Sensor: one sealed unit for indoor or outdoor use, with a ventilated shield on top.",
    features: ["Measures temperature (°C) and humidity (%RH)", "Measures CO₂ and NH₃ in ppm", "Suitable for indoor or outdoor mounting", "Ventilated shield above a sealed sensor housing"],
    motifs: [Thermometer, Cloud, Wind, Droplet],
  },
  { name: "Soil Moisture", group: "Field", image: "/products/soil-moisture.png", alt: "Paari Seritech soil moisture sensor", summary: "Soil Moisture Sensor", features: ["Measures soil moisture in the mulberry field", "Two-prong probe placed directly in the soil", "Supports soil-moisture-based irrigation and pump control"], motifs: [Droplets, Sprout, Droplet, Leaf] },
  { name: "Soil Temperature", group: "Field", image: "/products/soil-temperature.png", alt: "Paari Seritech soil temperature sensor", summary: "Soil Temperature Sensor", features: ["Measures soil temperature at the root zone", "Slim probe placed directly in the soil", "Adds soil conditions to crop-management decisions"], motifs: [Thermometer, Sun, Sprout, Thermometer] },
  { name: "Soil EC", group: "Field", image: "/products/soil-ec.png", alt: "Paari Seritech soil EC sensor", summary: "Soil EC Sensor", features: ["Measures the electrical conductivity (EC) of the soil", "Probe placed directly in the soil", "Supports fertigation recommendations against a target EC"], motifs: [Zap, Activity, Sprout, Zap] },
  { name: "Soil pH", group: "Field", image: "/products/soil-ph.png", alt: "Paari Seritech soil pH sensor", summary: "Soil pH Sensor", features: ["Measures soil pH", "Probe placed directly in the soil", "Adds soil chemistry to crop-management decisions"], motifs: [FlaskConical, TestTube, Sprout, FlaskConical] },
  { name: "Water EC", group: "Field", image: "/products/water-ec.png", alt: "Paari Seritech water EC sensor", summary: "Water EC Sensor", features: ["Measures the electrical conductivity (EC) of irrigation water", "Tracks water quality before it reaches the field", "Supports fertilizer dosing and mixing control"], motifs: [Waves, Zap, Droplet, Activity] },
  { name: "Flow Sensor", group: "Field", image: "/products/flow.png", alt: "Paari Seritech flow sensor", summary: "Flow Sensor", features: ["Measures water flow in the irrigation line", "Fits in line with threaded connections", "Records irrigation activity and water use"], motifs: [Waves, ArrowRight, Droplets, ArrowRight] },
  { name: "Pressure Sensor", group: "Field", image: "/products/pressure.png", alt: "Paari Seritech pressure sensor", summary: "Pressure Sensor", features: ["Measures water pressure in the irrigation line", "Threaded fitting for the pipework", "Helps confirm that pumps and valves are delivering water"], motifs: [Gauge, Activity, Droplet, Gauge] },
  { name: "Tank Level", group: "Field", image: "/products/tank-level.png", alt: "Paari Seritech tank level sensor", summary: "Tank Level Sensor", features: ["Measures the water level in the storage tank", "Submersible probe on a cable", "Supports tank filling and level management"], motifs: [Cylinder, Waves, Droplets, Cylinder] },
  { name: "Rain Sensor", group: "Field", image: "/products/rain.png", alt: "Paari Seritech rain sensor", summary: "Rain Sensor", features: ["Detects rainfall at the farm", "Mounted outdoors in the open", "Supports weather-aware irrigation recommendations"], motifs: [CloudRain, Umbrella, Droplets, CloudRain] },
  { name: "Weather Station", group: "Field", image: "/products/weather-station.png", alt: "Paari Seritech weather station", summary: "Weather Station", features: ["Measures wind speed", "Measures wind direction", "Adds local weather conditions to the dashboard"], motifs: [Wind, Compass, CloudSun, Wind] },
];

const tints = ["#f3eedf", "#e6f3ea", "#f3eedf", "#dfe9e2"];
const accents = ["#00a218", "#e3b23c", "#0c7a28", "#00a218"];

export function ProductShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Drives the scroll effects: per-scene progress (--p), velocity skew (--skew) and badge rotation (--spin).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));

    // Feature bullets replay their entrance each time a panel scrolls into view.
    root.classList.add("fx-on");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute("data-inview", entry.isIntersecting);
      },
      { threshold: 0.3 },
    );
    root.querySelectorAll("[data-reveal]").forEach((block) => observer.observe(block));
    let last = window.scrollY;
    let skew = 0;
    let raf = 0;

    const frame = () => {
      const y = window.scrollY;
      const target = Math.max(-14, Math.min(14, (y - last) * 0.35));
      last = y;
      skew += (target - skew) * 0.12;
      root.style.setProperty("--skew", `${skew.toFixed(2)}deg`);
      root.style.setProperty("--spin", `${(y * 0.25).toFixed(1)}deg`);

      const vh = window.innerHeight;
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) continue;
        scene.style.setProperty("--p", ((rect.top + rect.height / 2 - vh / 2) / vh).toFixed(3));
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      root.classList.remove("fx-on");
    };
  }, []);

  // Each group's first product carries the anchor the page header buttons jump to.
  const anchors = new Map((["Gateway", "Shed", "Field"] as const).map((group) => [products.findIndex((product) => product.group === group), group.toLowerCase()]));

  return (
    <div ref={rootRef}>
      {products.map((product, index) => {
        const accent = accents[index % accents.length];
        const number = String(index + 1).padStart(2, "0");
        return (
          <section
            key={product.name}
            data-scene
            id={anchors.get(index)}
            className="relative flex min-h-[78vh] scroll-mt-16 flex-col overflow-hidden lg:min-h-[92vh]"
            style={{ backgroundColor: tints[index % tints.length] }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div
                className="absolute left-1/2 top-[42%] h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
                style={{ backgroundColor: accent }}
              />
              {motifSlots.map((slot, slotIndex) => {
                const Motif = product.motifs[slotIndex % product.motifs.length];
                return (
                  <Motif
                    key={slotIndex}
                    strokeWidth={1.1}
                    className={`absolute opacity-[0.16] will-change-transform ${slot.className}`}
                    style={{ color: accent, transform: `translate3d(0, calc(var(--p, 0) * ${slot.drift}px), 0) rotate(${slot.rotate}deg)` }}
                  />
                );
              })}
            </div>

            <div aria-hidden="true" className={`${specFont.className} pointer-events-none absolute inset-0 flex flex-col justify-center gap-1 overflow-hidden sm:gap-2`}>
              {product.features.map((feature, rowIndex) => {
                const outlined = rowIndex % 2 === 1;
                return (
                  <div
                    key={feature}
                    className="-ml-[30%] w-max whitespace-nowrap text-[clamp(2.2rem,5.6vw,6.5rem)] font-bold leading-[1.12] tracking-[-0.03em] will-change-transform"
                    style={{
                      color: outlined ? "transparent" : "#ffffff",
                      WebkitTextStroke: outlined ? "1.5px #ffffff" : undefined,
                      transform: `translate3d(calc(var(--p, 0) * ${outlined ? -22 : 22}%), 0, 0) skewX(var(--skew, 0deg))`,
                    }}
                  >
                    {Array.from({ length: 4 }, () => feature).join("  •  ")}
                  </div>
                );
              })}
            </div>

            <div className="relative mx-auto grid w-full max-w-[1920px] flex-1 items-center gap-6 px-5 py-10 sm:px-8 justify-items-center xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:justify-items-stretch xl:gap-10 lg:px-12 lg:py-14 2xl:px-16">
              <div className="w-full max-w-[30rem] self-center xl:max-w-[26rem]">
                <div className={`${specMono.className} text-xs font-medium uppercase tracking-[0.3em] text-ink/70`}>
                  {product.group} · {number}
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-[-0.015em] text-ink sm:text-4xl xl:text-3xl 2xl:text-5xl">{product.name}</h2>
                <p className="mt-4 text-base leading-7 text-ink/80 sm:text-lg">{product.summary}</p>
              </div>

              <div className="relative flex items-center justify-center">
                <div
                  aria-hidden="true"
                  className="absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 sm:-left-16 sm:h-40 sm:w-40"
                  style={{ transform: "translateY(-50%) rotate(var(--spin, 0deg))" }}
                >
                  <svg viewBox="0 0 200 200" className="h-full w-full">
                    <defs>
                      <path id={`ring-${index}`} d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
                    </defs>
                    <circle cx="100" cy="100" r="96" fill="none" stroke="#101211" strokeOpacity="0.25" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="#101211" strokeOpacity="0.25" />
                    <text fontSize="13" letterSpacing="5" fill="#101211" fontWeight="600">
                      <textPath href={`#ring-${index}`}>VIEW PRODUCT · VIEW PRODUCT · VIEW PRODUCT ·</textPath>
                    </text>
                    <circle cx="100" cy="100" r="22" fill="#101211" />
                    <circle cx="100" cy="100" r="13" fill={accent} />
                    <circle cx="94" cy="94" r="4" fill="#ffffff" />
                  </svg>
                </div>

                <div
                  role="img"
                  aria-label={product.alt}
                  className={`relative bg-contain bg-center bg-no-repeat mix-blend-multiply will-change-transform ${
                    product.wide
                      ? "aspect-[4/3] w-[min(86vw,560px)] xl:w-[min(40vw,620px)]"
                      : product.tall
                        ? "aspect-[11/14] w-[min(66vw,340px)] xl:w-[min(26vw,400px)]"
                        : "aspect-square w-[min(60vw,300px)] xl:w-[min(24vw,360px)]"
                  }`}
                  style={{
                    backgroundImage: `url('${product.image}')`,
                    transform: "translate3d(0, calc(var(--p, 0) * -110px), 0) rotate(calc(var(--p, 0) * -6deg))",
                  }}
                />
              </div>

              <div
                data-reveal
                className={`${specFont.className} w-full max-w-[30rem] self-center rounded-[28px] border border-white/70 bg-white/65 p-6 text-ink shadow-xl shadow-emerald-950/10 backdrop-blur-md sm:p-8 xl:justify-self-end`}
              >
                <div className={`${specMono.className} flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em]`} style={{ color: accent }}>
                  <span className="h-px w-8" style={{ backgroundColor: accent }} />
                  Features
                </div>
                <ul className="mt-3 text-[17px] font-medium leading-7 text-ink/85 sm:text-lg">
                  {product.features.map((feature, featureIndex) => (
                    <li key={feature} className="feature-item flex items-start gap-4" style={{ "--i": featureIndex, "--accent": accent } as React.CSSProperties}>
                      <span
                        className={`${specMono.className} feature-dot mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white`}
                        style={{ backgroundColor: accent }}
                      >
                        <span className="relative z-10">{String(featureIndex + 1).padStart(2, "0")}</span>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex h-11 w-9 items-center justify-center border border-ink/60">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
