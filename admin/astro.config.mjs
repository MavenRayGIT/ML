import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Astro static output. Phase -1 has no Worker/server endpoints in the Astro
// app itself — basic auth lives in `functions/_middleware.ts` (Cloudflare
// Pages Functions). When Cursor SDK is wired in the next pass, we'll add
// server endpoints under `functions/api/*` or switch this to `output: "server"`
// with `@astrojs/cloudflare`. See SYSTEM_ADMIN.md §16 Phase -1 / §6.
export default defineConfig({
  site: "https://admin.mackandlee.com",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
