// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  // Production origin — used by Astro for canonical URLs, sitemap, OG/JSON-LD
  // absolute URLs, and the trailing-slash rule. Override per-env via
  // `PUBLIC_SITE_URL` if we ever ship to a different host.
  site: process.env.PUBLIC_SITE_URL || 'https://sustainedoutcomes.com',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx(), partytown()]
});