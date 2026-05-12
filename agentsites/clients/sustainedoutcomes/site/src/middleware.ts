/**
 * Astro middleware — SSR cache headers.
 *
 * Every request to a non-prerendered route flows through here before
 * the route renders. We tune `Cache-Control` based on environment so
 * that:
 *
 *   - Production (`sustainedoutcomes.com` / `sustainedoutcomes.mackandlee.com`)
 *     gets a short edge cache. Visitors get sub-50ms TTFB on repeat hits,
 *     while Ken's content edits still surface within ~10–15s.
 *
 *   - Branch preview URLs (the `*.pages.dev` deploys for `cursor/*`
 *     branches the agent creates) skip cache entirely so a refresh
 *     always hits the latest source — required for the chat-edit-see
 *     loop to feel realtime.
 *
 *   - Prerendered routes (currently only `/blog/[...slug]`) are not
 *     touched here; CF Pages serves them straight from the static
 *     asset bucket with its own caching.
 *
 * The decision uses `PUBLIC_HIDE_STAGING_BANNER` as the production
 * signal — production deploys already set this to suppress the
 * staging banner overlay, and we re-use the same flag here so a
 * single env var controls "this is production" globally.
 */

import { defineMiddleware } from 'astro:middleware';

const PRODUCTION_CACHE = 'public, s-maxage=10, stale-while-revalidate=60';
const PREVIEW_CACHE    = 'no-cache, no-store, must-revalidate';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Only annotate document responses — let asset routes (`_image`,
  // `_astro/*`, fonts) keep whatever cache headers Astro/CF set.
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('text/html')) return response;

  const isProduction =
    import.meta.env.PUBLIC_HIDE_STAGING_BANNER === 'true';

  response.headers.set(
    'Cache-Control',
    isProduction ? PRODUCTION_CACHE : PREVIEW_CACHE,
  );

  return response;
});
