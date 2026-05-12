/**
 * GET /m/<key…> — public R2 read endpoint.
 *
 * This route is intentionally **exempt from basic auth** (see
 * functions/_middleware.ts) because the URLs are designed to be pasted into
 * client `<img src>` tags, MDX content, share links, etc. The bucket itself
 * stays private — the only path in is via this function.
 *
 * Key security note: keys are content-hashed (16 hex chars from SHA-256), so
 * enumeration of someone else's media is computationally infeasible.
 *
 * The caching contract here matches what /api/upload sets at PUT time:
 *   - 1 year max-age
 *   - `immutable` (content-hashed paths never change)
 *   - ETag from R2 object metadata, honoring If-None-Match
 *   - Supports HTTP range requests (R2 SDK does this natively)
 *
 * Future: this code moves verbatim to a media domain (`media.mackandlee.com`
 * or per-client). No behavior change there — just a different host.
 */

interface Env {
  MEDIA: R2Bucket;
}

function notFound(): Response {
  return new Response("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
  });
}

function parseRange(value: string | null, size: number): { offset: number; length: number } | null {
  if (!value || !value.startsWith("bytes=")) return null;
  const spec = value.slice("bytes=".length).split(",")[0]!.trim();
  const [startRaw, endRaw] = spec.split("-");
  if (startRaw === undefined) return null;
  if (startRaw === "") {
    // Suffix range: last N bytes.
    const n = Number(endRaw);
    if (!Number.isFinite(n) || n <= 0) return null;
    const offset = Math.max(0, size - n);
    return { offset, length: size - offset };
  }
  const start = Number(startRaw);
  if (!Number.isFinite(start) || start < 0 || start >= size) return null;
  const end = endRaw === "" || endRaw === undefined ? size - 1 : Number(endRaw);
  if (!Number.isFinite(end) || end < start) return null;
  const clampedEnd = Math.min(end, size - 1);
  return { offset: start, length: clampedEnd - start + 1 };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.MEDIA) return new Response("MEDIA binding not configured", { status: 503 });

  const segments = Array.isArray(params.path) ? params.path : params.path ? [params.path] : [];
  if (segments.length === 0) return notFound();
  const key = segments.map((s) => decodeURIComponent(s)).join("/");

  // Reject obvious traversal attempts. Keys are produced by buildKey() and
  // contain only `[a-z0-9/.\-_]`; anything weirder is a red flag.
  if (key.includes("..") || key.startsWith("/")) return notFound();

  const ifNoneMatch = request.headers.get("If-None-Match");
  const rangeHeader = request.headers.get("Range");

  // Honor If-None-Match cheaply via HEAD before fetching bytes.
  const head = await env.MEDIA.head(key);
  if (!head) return notFound();

  if (ifNoneMatch && ifNoneMatch === head.httpEtag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: head.httpEtag,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const range = parseRange(rangeHeader, head.size);

  const object = range
    ? await env.MEDIA.get(key, { range: { offset: range.offset, length: range.length } })
    : await env.MEDIA.get(key);
  if (!object) return notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Accept-Ranges", "bytes");

  if (range) {
    headers.set(
      "Content-Range",
      `bytes ${range.offset}-${range.offset + range.length - 1}/${head.size}`,
    );
    headers.set("Content-Length", String(range.length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set("Content-Length", String(head.size));
  return new Response(object.body, { status: 200, headers });
};
