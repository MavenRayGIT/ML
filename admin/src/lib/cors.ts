/**
 * CORS helper for the embed.js → admin API boundary.
 *
 * embed.js is loaded from `admin.mackandlee.com/embed.js` but executes on
 * client staging origins (currently `sustainedoutcomes.mackandlee.com`,
 * eventually any `*.mackandlee.com`). Its fetch calls to /api/chat are
 * therefore cross-origin and need:
 *
 *   1. An origin allowlist — we reflect the request Origin back when it
 *      matches one of our subdomains. Wildcard (`*`) is not an option
 *      because requests use `credentials: "include"` and the spec
 *      forbids `*` + credentials.
 *
 *   2. Credentialed responses — `Access-Control-Allow-Credentials: true`
 *      so the browser sends stored HTTP Basic Auth from a prior visit
 *      to admin.mackandlee.com. Phase 0 swaps this for CF Access JWT.
 *
 *   3. Preflight (OPTIONS) handlers on every credentialed endpoint.
 *
 * This helper produces both the preflight response and the headers to
 * sprinkle onto the actual response. Keep it surgical — no body
 * mutations, no logging.
 */

/**
 * Origins permitted to call admin APIs from a browser. Phase -1 keeps
 * this an exact allowlist; Phase 0 widens it to `*.mackandlee.com` via
 * the identity_map (the staging URL is per-client config).
 *
 * Localhost entries cover dev runs of either app (Astro on :4321,
 * `wrangler pages dev` on :8788, SO dev server, etc.).
 */
const ALLOWED_ORIGINS = new Set<string>([
  "https://admin.mackandlee.com",
  "https://sustainedoutcomes.mackandlee.com",
  // dev — keep in sync with Astro / wrangler defaults
  "http://localhost:4321",
  "http://localhost:8788",
  "http://127.0.0.1:4321",
  "http://127.0.0.1:8788",
]);

/**
 * Cross-origin hosts allowed via suffix match. These are the *deploy preview
 * surfaces* the client sites can be served from while we don't yet have
 * stable custom domains pointed at them:
 *
 *   .pages.dev          — Cloudflare Pages branch/commit preview URLs, used
 *                         for any client still on the static Pages stack.
 *   .jpielak.workers.dev — Cloudflare Workers per-branch preview URLs for
 *                         clients on the SSR Workers stack (e.g.
 *                         `staging-ml-sustainedoutcomes.jpielak.workers.dev`).
 *                         Account-scoped: another CF account would have a
 *                         different subdomain and not match this suffix, so
 *                         this isn't equivalent to allowing `.workers.dev`.
 *
 * When we move clients to their real `*.mackandlee.com` domains, those go in
 * the `ALLOWED_ORIGINS` exact-match list above.
 */
const ALLOWED_HOST_SUFFIXES = [".pages.dev", ".jpielak.workers.dev"] as const;

export function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.protocol !== "https:") return false;
    return ALLOWED_HOST_SUFFIXES.some((suffix) => u.hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

/**
 * Headers to add to a credentialed response. Returns an empty object if
 * the origin is not allowed — the response then behaves as a same-origin
 * response and CORS rejects it browser-side, which is the correct
 * outcome (no info leak).
 */
export function corsHeaders(origin: string | null | undefined): Record<string, string> {
  if (!isAllowedOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin!,
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

/**
 * Produce a preflight response for an OPTIONS request. Caller is
 * responsible for routing OPTIONS to this helper — Pages does not give
 * us a single hook to handle it globally without writing a top-level
 * middleware.
 */
export function preflightResponse(request: Request): Response {
  const origin = request.headers.get("Origin");
  const headers: Record<string, string> = {
    ...corsHeaders(origin),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Last-Event-ID, Authorization",
    "Access-Control-Max-Age": "600",
  };
  return new Response(null, { status: 204, headers });
}

/** Merge CORS headers into a response that already exists. */
export function withCors(response: Response, request: Request): Response {
  const origin = request.headers.get("Origin");
  const extra = corsHeaders(origin);
  if (Object.keys(extra).length === 0) return response;
  const merged = new Headers(response.headers);
  for (const [k, v] of Object.entries(extra)) merged.set(k, v);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: merged,
  });
}
