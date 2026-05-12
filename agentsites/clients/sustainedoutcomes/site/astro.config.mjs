// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Production origin — used by Astro for canonical URLs, sitemap, OG/JSON-LD
  // absolute URLs, and the trailing-slash rule. Override per-env via
  // `PUBLIC_SITE_URL` if we ever ship to a different host.
  site: process.env.PUBLIC_SITE_URL || 'https://sustainedoutcomes.com',

  /**
   * SSR via Cloudflare Pages.
   *
   * Why: with the M&L admin editor (admin.mackandlee.com), Ken edits the
   * site via a chat drawer; each edit lands as a git commit on a
   * `cursor/…` branch. A static build re-renders the entire site on
   * every commit (~30–90s) — too slow for an "edit and see it" pilot
   * experience. SSR turns each page into a per-request render against
   * the current branch source, so a deploy is just a Worker bundle
   * upload (~5–15s) and the next request shows the edit immediately.
   *
   * Caching strategy: see `src/middleware.ts`. Production gets a short
   * edge cache (`s-maxage=10, swr=60`) so visitors get fast TTFB but
   * Ken's edits surface within ~10s. Branch preview deploys (the
   * agent's `cursor/*` URLs) bypass cache so a refresh always hits
   * SSR — no waiting for cache to expire while editing.
   *
   * Image handling: `imageService: 'passthrough'` serves images
   * unprocessed in the Worker. Astro's default Sharp pipeline is
   * build-time only; Workers don't ship it. If we later need on-the-fly
   * image optimization, swap to `'cloudflare'` (uses CF Image Resizing
   * — note that it requires a paid CF Images plan to be enabled).
   *
   * Routes that opt out of SSR with `export const prerender = true`:
   *   - /blog/[...slug] — needs `getStaticPaths` for content collection.
   *     Blog post edits will still rebuild the worker (no slower than
   *     other edits), but the route's render is baked at build time.
   */
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      // Enables `Astro.locals.runtime.env` to reach CF bindings during
      // `astro dev`. Off in CI builds.
      enabled: true,
    },
  }),

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx(), partytown()]
});