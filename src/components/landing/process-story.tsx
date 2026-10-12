"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardList, Droplets, Pause, Play, Refrigerator, Sparkles, Thermometer, Warehouse } from "lucide-react";

import { ProcessScene } from "@/components/landing/process-scenes";

// Animated walkthrough of silk production: a silk thread runs between the steps while each one is explained in turn.
const steps = [
  {
    label: "Mulberry Cultivation",
    image: "/landing/process/mulberry-cultivation.jpg",
    story: "Everything starts in the field. Mulberry leaves are the only food silkworms eat, so healthy, well-watered plants decide the quality of the silk to come.",
    fact: "Leaves are ready for harvest about 10–12 weeks after pruning.",
    help: "Soil moisture sensing, drip irrigation and fertigation keep every plot in the right range.",
    helpIcon: Droplets,
  },
  {
    label: "Leaf Harvesting",
    image: "/landing/process/leaf-harvesting.jpg",
    story: "Tender, fresh leaves are picked and kept cool and moist. Leaves that dry out lose nutrition, and the worms eat less.",
    fact: "Leaves are fed fresh several times a day.",
    help: "Leaf-storage temperature and humidity monitoring keeps harvested leaves fresh for longer.",
    helpIcon: Refrigerator,
  },
  {
    label: "Silkworm Rearing",
    image: "/landing/process/silkworm-rearing.jpg",
    story: "Silkworms feed and grow through five stages, called instars, inside the rearing shed. Each stage needs its own temperature and humidity.",
    fact: "In about 25 days a silkworm grows around 10,000 times heavier.",
    help: "Shed sensors and automation hold temperature, humidity, CO₂ and ammonia for each instar.",
    helpIcon: Thermometer,
  },
  {
    label: "Cocoon Harvesting",
    image: "/landing/process/cocoon-harvesting.jpg",
    story: "Fully grown worms spin a cocoon from a single continuous thread of silk. Once spinning is complete, the cocoons are collected and sorted by quality.",
    fact: "Spinning a cocoon takes the worm 2–3 days.",
    help: "Spinning-stage climate control and batch records protect cocoon quality and price.",
    helpIcon: Warehouse,
  },
  {
    label: "Silk Reeling",
    image: "/landing/process/silk-reeling.jpg",
    story: "Cocoons are softened in hot water so the filament loosens. Threads from several cocoons are unwound together and reeled into raw silk yarn.",
    fact: "One cocoon holds several hundred metres of unbroken filament.",
    help: "Production and quality records trace each reel back to its batch and shed.",
    helpIcon: ClipboardList,
  },
  {
    label: "Value Added Products",
    image: "/landing/process/value-added-products.jpg",
    story: "Raw silk is twisted, dyed and woven into yarn, fabric and sarees. This is where green leaf finally becomes golden silk.",
    fact: "Well-reared cocoons give finer, stronger and more even silk.",
    help: "Traceable data from farm to fabric helps prove quality to buyers.",
    helpIcon: Sparkles,
  },
];

const STEP_SECONDS = 6;

export function ProcessStory() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Only play while the section is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const playing = visible && !hovered && !stopped;
  const step = steps[active];
  const progress = (active / (steps.length - 1)) * 100;

  return (
    <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative">
        {/* The silk thread: a faint track with a gold thread that grows to the active step. */}
        <div aria-hidden="true" className="absolute left-[8.33%] right-[8.33%] top-10 hidden h-[3px] -translate-y-1/2 rounded-full bg-[#e3eee4] sm:block sm:top-[2.75rem] lg:top-12 xl:top-14">
          <div className="story-thread h-full rounded-full" style={{ width: `${progress}%` }} />
          <div className="story-spark" style={{ left: `${progress}%` }} />
        </div>

        <ol className="relative grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-6">
          {steps.map((item, index) => {
            const isActive = index === active;
            const done = index < active;
            return (
              <li key={item.label} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-current={isActive ? "step" : undefined}
                  className="group flex flex-col items-center text-center outline-none"
                >
                  <span
                    className={`story-circle relative h-20 w-20 rounded-full border bg-white p-1.5 transition duration-500 sm:h-[5.5rem] sm:w-[5.5rem] lg:h-24 lg:w-24 xl:h-28 xl:w-28 ${
                      isActive ? "story-circle-active scale-110 border-[#d9b25a]" : done ? "border-[#9fd0aa]" : "border-[#d7e8da] opacity-80 group-hover:opacity-100"
                    }`}
                  >
                    <span
                      className={`block h-full w-full rounded-full bg-cover bg-center transition duration-500 ${isActive ? "" : "saturate-[0.85]"}`}
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    <span
                      className={`absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold italic transition duration-500 ${
                        isActive ? "bg-[#c99a2e] text-white" : done ? "bg-[#0f5c2e] text-white" : "bg-white text-[#0f5c2e] shadow"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </span>
                  <span className={`mt-4 max-w-[8rem] font-display text-[15px] font-bold leading-snug transition-colors sm:text-base xl:text-lg ${isActive ? "text-[#8f620c]" : "text-[#123d22]"}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="relative mt-10 overflow-hidden rounded-[28px] border border-[#e6dcc0] bg-gradient-to-br from-[#fbf7ec] via-white to-[#f1f8f1] shadow-[0_20px_50px_-30px_rgba(15,91,44,0.35)]">
        <div className="h-1 w-full bg-[#efe7d2]">
          <div
            key={active}
            className="story-progress h-full bg-gradient-to-r from-[#1d8a3d] to-[#c99a2e]"
            style={{ animationDuration: `${STEP_SECONDS}s`, animationPlayState: playing ? "running" : "paused" }}
            onAnimationEnd={() => setActive((index) => (index + 1) % steps.length)}
          />
        </div>

        <div key={active} className="story-in grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,15rem)_minmax(0,19rem)] lg:items-center lg:gap-8 lg:p-10 xl:grid-cols-[auto_minmax(0,1fr)_18rem_20rem] xl:gap-10">
          <div className="hidden font-display text-[5.5rem] font-bold italic leading-none text-[#c99a2e]/30 [font-variation-settings:'SOFT'_100,'WONK'_1] lg:block">
            {String(active + 1).padStart(2, "0")}
          </div>

          <div>
            <div className="eyebrow">
              Step {active + 1} of {steps.length}
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">{step.label}</h3>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">{step.story}</p>
            <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-white/80 px-3.5 py-2 text-sm font-semibold text-[#8f620c] ring-1 ring-[#eadfc2]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> {step.fact}
            </p>
          </div>

          <div className="mx-auto aspect-[3/2] w-full max-w-[18rem] rounded-2xl bg-white/70 p-2 ring-1 ring-[#eadfc2]">
            <ProcessScene index={active} label={step.label} />
          </div>

          <div className="rounded-2xl bg-[#0f5c2e] p-5 text-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8ee59b]">
              <step.helpIcon className="h-4 w-4" /> How Paari helps
            </div>
            <p className="mt-2 text-[15px] leading-6 text-white/90">{step.help}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setStopped((value) => !value)}
          aria-label={stopped ? "Play the silk process animation" : "Pause the silk process animation"}
          className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0f5c2e] shadow ring-1 ring-[#e6dcc0] transition hover:bg-[#0f5c2e] hover:text-white"
        >
          {stopped ? <Play className="ml-0.5 h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
        </button>
      </div>
    </div>
  );
}
