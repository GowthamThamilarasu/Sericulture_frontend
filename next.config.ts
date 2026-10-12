import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  return {
    devIndicators: false,
    // `npm run build` writes a static copy of the site to ./build, ready to upload to any web host.
    output: "export",
    // Only the production build goes to ./build; `next dev` keeps its files in .next.
    distDir: phase === PHASE_PRODUCTION_BUILD ? "build" : ".next",
    // Emit /about/index.html instead of /about.html so plain web servers resolve clean URLs.
    trailingSlash: true,
  };
}
