/**
 * HTTP Basic Auth gate for admin.mackandlee.com (Phase -1).
 *
 * Per SYSTEM_ADMIN.md §16 Phase -1 the admin site is "Astro static; no Worker
 * complexity yet — basic auth via Cloudflare Access policy in single-password
 * mode". This middleware is the deploy-time stand-in: a single shared
 * user/password protects every route until we replace it with a real CF Access
 * application in Phase 0 (§5 — magic-link identity, identity_map table, roles).
 *
 * To remove: delete this file and configure a Cloudflare Access application
 * over `admin.mackandlee.com` and `*.mackandlee.com`. No code change needed
 * elsewhere.
 */

type Env = {
  BASIC_AUTH_USER?: string;
  BASIC_AUTH_PASS?: string;
};

const REALM = "ml-admin";

function unauthorized(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store",
    },
  });
}

function parseBasic(header: string | null): { user: string; pass: string } | null {
  if (!header || !header.toLowerCase().startsWith("basic ")) return null;
  try {
    const decoded = atob(header.slice(6).trim());
    const idx = decoded.indexOf(":");
    if (idx < 0) return null;
    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}

/**
 * Timing-safe string comparison. We hash both sides with SHA-256 so the byte
 * arrays are guaranteed equal length (32 bytes), then compare in constant
 * time with a fixed XOR-accumulator loop. Hashing first also avoids leaking
 * the secret's length via the comparison itself.
 *
 * Workers exposes `crypto.subtle.timingSafeEqual`, but its type is not in
 * the standard `SubtleCrypto` lib, so a small in-file constant-time compare
 * keeps the middleware portable across typecheckers.
 */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const av = new Uint8Array(ha);
  const bv = new Uint8Array(hb);
  if (av.length !== bv.length) return false;
  let diff = 0;
  for (let i = 0; i < av.length; i++) diff |= av[i]! ^ bv[i]!;
  return diff === 0;
}

/**
 * Public path prefixes — auth is skipped here so the URLs can be embedded in
 * client `<img src>` tags, MDX content, share links, etc.
 *
 *   /m/*  — R2 media reads via functions/m/[[path]].ts. The keys themselves
 *           are content-hashed and effectively unguessable, so the bucket
 *           stays protected from enumeration without an auth gate in front.
 */
const PUBLIC_PREFIXES = ["/m/"] as const;

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;

  if (isPublicPath(new URL(request.url).pathname)) return next();

  const expectedUser = env.BASIC_AUTH_USER;
  const expectedPass = env.BASIC_AUTH_PASS;

  // Fail closed: if either env var is unset, the site is locked. Prevents
  // accidentally exposing the admin if Pages env vars get cleared.
  if (!expectedUser || !expectedPass) {
    return new Response("Admin auth not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const creds = parseBasic(request.headers.get("Authorization"));
  if (!creds) return unauthorized();

  const [userOk, passOk] = await Promise.all([
    safeEqual(creds.user, expectedUser),
    safeEqual(creds.pass, expectedPass),
  ]);
  if (!userOk || !passOk) return unauthorized();

  return next();
};
