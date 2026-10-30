import { hostname, networkInterfaces } from "node:os";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// Every IPv4 address this machine has on the local network, plus its Bonjour name (e.g. my-mac.local),
// so phones and other computers on the same Wi-Fi can open the dev site.
function lanHosts() {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((net) => net && net.family === "IPv4" && !net.internal)
    .map((net) => net!.address);
  const name = hostname().replace(/\.local$/, "");
  return [...addresses, `${name}.local`];
}

export default function nextConfig(phase: string): NextConfig {
  return {
    devIndicators: false,
    // Lets `next dev` serve its scripts when the site is opened by LAN address instead of localhost.
    allowedDevOrigins: lanHosts(),
    // `npm run build` writes a static copy of the site to ./build, ready to upload to any web host.
    output: "export",
    // Only the production build goes to ./build; `next dev` keeps its files in .next.
    distDir: phase === PHASE_PRODUCTION_BUILD ? "build" : ".next",
    // Emit /about/index.html instead of /about.html so plain web servers resolve clean URLs.
    trailingSlash: true,
  };
}
