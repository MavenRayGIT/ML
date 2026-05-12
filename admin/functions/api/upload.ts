/**
 * POST /api/upload — multipart upload to R2.
 *
 * Form fields:
 *   site         — required, site slug from src/lib/clients.ts
 *                  (today site_slug == client_slug; diverges when multi-site
 *                  clients land in Phase 0)
 *   file         — required, the binary upload
 *
 * Behavior:
 *   1. Validate the form, the client, the MIME type, and the size.
 *   2. SHA-256 the bytes, take the first 16 hex chars as the content hash.
 *   3. Compute the R2 key: `<client>/<category>/YYYY/MM/<hash>.<ext>`.
 *      If an object at that key already exists (same content), do not re-put.
 *   4. R2 PUT with content-type + an `immutable` cache-control hint via
 *      customMetadata.
 *   5. Return `{ url, key, size, contentType, deduped }` as JSON.
 *
 * Auth: HTTP Basic via functions/_middleware.ts. The R2 binding is
 * server-side only; nothing reaches the browser.
 *
 * Out of scope for Phase -1:
 *   - HEIC server-side conversion (Phase 3).
 *   - Cloudflare Images integration (Phase 2).
 *   - Bunny Stream for video (Phase 2). Videos are rejected here with a
 *     human-readable message; see src/lib/media.ts REJECTED_PREFIXES.
 */

import { getClient } from "../../src/lib/clients";
import {
  buildKey,
  buildPublicUrl,
  checkSize,
  classifyUpload,
  hashContent,
} from "../../src/lib/media";

interface Env {
  MEDIA: R2Bucket;
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MEDIA) {
    return jsonError(503, "R2 binding MEDIA is not configured on this environment.");
  }

  // Parse the multipart body. Workers natively support FormData on Request.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "Body must be multipart/form-data.");
  }

  const siteSlug = (form.get("site") ?? "").toString().trim();
  if (!siteSlug) return jsonError(400, "Form field `site` is required.");

  // Phase -1: site slug is the same as the client slug in `clients.ts`.
  // Phase 0 introduces a separate Site record; `getClient` becomes `getSite`
  // and the role gate (identity_map) decides which sites the caller can write
  // to. The validation logic here doesn't change shape.
  const site = getClient(siteSlug);
  if (!site) return jsonError(404, `Unknown site: ${siteSlug}.`);

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError(400, "Form field `file` is required.");

  const sizeCheck = checkSize(file.size);
  if (!sizeCheck.ok) return jsonError(sizeCheck.status, sizeCheck.error);

  const classification = classifyUpload(file.type);
  if (!classification.ok) return jsonError(classification.status, classification.error);
  const { category, extension, contentType } = classification.value;

  // Reading the whole file into memory is fine for the 100 MiB cap; if we
  // raise the cap later, switch to a streaming hash + multipart PUT.
  const bytes = await file.arrayBuffer();
  const hash = await hashContent(bytes);
  const key = buildKey({ clientSlug: site.slug, category, hash, extension });

  // Skip re-uploading identical content. R2 HEAD is cheap and saves a PUT
  // for assets that already exist (logos, repeated brand images, etc.).
  let deduped = false;
  try {
    const head = await env.MEDIA.head(key);
    if (head) deduped = true;
  } catch {
    // HEAD failures fall through to a PUT; better to re-upload than block.
  }

  if (!deduped) {
    await env.MEDIA.put(key, bytes, {
      httpMetadata: {
        contentType,
        // Content-addressed → immutable. 1 year matches the "immutable" CDN
        // convention; the /m/[[path]].ts handler echoes the same header.
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        site: site.slug,
        category,
        originalName: file.name.slice(0, 256),
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  const origin = new URL(request.url).origin;
  const url = buildPublicUrl(origin, key);

  return new Response(
    JSON.stringify({
      url,
      key,
      size: file.size,
      contentType,
      category,
      deduped,
    }),
    { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
  );
};
