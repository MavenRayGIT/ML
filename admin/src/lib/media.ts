/**
 * Media upload helpers shared by `functions/api/upload.ts` and the upload UI.
 *
 * Phase -1 scope (SYSTEM_ADMIN.md §10):
 *   - Images and docs land in R2 as raw bytes, content-addressed.
 *   - Storage layout: `<client>/<category>/YYYY/MM/<hash>.<ext>`.
 *   - Public serve via /m/<key> on the admin domain. Eventually moves to a
 *     dedicated media domain.
 *
 * Out of Phase -1 scope (rejected with a clear error):
 *   - Video — goes to Bunny Stream once that integration is wired (§10 / Phase 2).
 *   - HEIC server-side conversion — deferred to Phase 3 per §16. HEIC files
 *     are accepted in raw form so the upload doesn't fail outright; the
 *     consuming page is responsible for converting them, or the future
 *     Phase 3 worker re-encodes them in place.
 */

export type MediaCategory = "images" | "docs";

interface MimeRule {
  category: MediaCategory;
  extension: string;
}

/** MIME type → category + safe extension. The MIME is the authority; the
 * client-provided filename is ignored when picking the extension. */
const MIME_TABLE: Record<string, MimeRule> = {
  // images
  "image/jpeg": { category: "images", extension: "jpg" },
  "image/png": { category: "images", extension: "png" },
  "image/webp": { category: "images", extension: "webp" },
  "image/avif": { category: "images", extension: "avif" },
  "image/gif": { category: "images", extension: "gif" },
  "image/svg+xml": { category: "images", extension: "svg" },
  "image/heic": { category: "images", extension: "heic" },
  "image/heif": { category: "images", extension: "heif" },
  // docs
  "application/pdf": { category: "docs", extension: "pdf" },
  "application/msword": { category: "docs", extension: "doc" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    category: "docs",
    extension: "docx",
  },
  "application/vnd.ms-excel": { category: "docs", extension: "xls" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    category: "docs",
    extension: "xlsx",
  },
  "text/plain": { category: "docs", extension: "txt" },
  "text/csv": { category: "docs", extension: "csv" },
  "text/markdown": { category: "docs", extension: "md" },
};

/** MIME prefixes that the API explicitly rejects with a helpful message. */
const REJECTED_PREFIXES: { prefix: string; reason: string }[] = [
  {
    prefix: "video/",
    reason:
      "Video uploads route to Bunny Stream, which isn't wired in Phase -1 yet. Email Mack for now.",
  },
  {
    prefix: "audio/",
    reason: "Audio uploads aren't supported in Phase -1.",
  },
];

/** Cloudflare Workers / Pages Functions per-request body limit. */
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MiB

export interface MediaClassification {
  category: MediaCategory;
  extension: string;
  contentType: string;
}

export type MediaClassificationResult =
  | { ok: true; value: MediaClassification }
  | { ok: false; status: number; error: string };

/** Validates the MIME of an incoming upload and resolves a safe extension. */
export function classifyUpload(contentType: string | null): MediaClassificationResult {
  if (!contentType) {
    return { ok: false, status: 400, error: "Upload is missing a content type." };
  }
  const normalized = contentType.split(";", 1)[0]!.trim().toLowerCase();

  for (const { prefix, reason } of REJECTED_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return { ok: false, status: 415, error: reason };
    }
  }

  const rule = MIME_TABLE[normalized];
  if (!rule) {
    return {
      ok: false,
      status: 415,
      error: `Unsupported content type: ${normalized}.`,
    };
  }
  return {
    ok: true,
    value: { category: rule.category, extension: rule.extension, contentType: normalized },
  };
}

/** Validates size before reading bytes into memory. */
export function checkSize(size: number): { ok: true } | { ok: false; status: number; error: string } {
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, status: 400, error: "Upload is empty." };
  }
  if (size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `Upload exceeds the ${Math.floor(MAX_UPLOAD_BYTES / 1024 / 1024)} MiB limit.`,
    };
  }
  return { ok: true };
}

/** Hex-encode a byte buffer. */
function toHex(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < view.length; i++) {
    out += view[i]!.toString(16).padStart(2, "0");
  }
  return out;
}

/** SHA-256 of the upload, truncated to 16 hex chars (64 bits). Content-
 * addressed naming means repeated uploads of the same bytes collapse to one
 * object, and URLs are effectively unguessable. */
export async function hashContent(body: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", body);
  return toHex(digest).slice(0, 16);
}

/** Builds the R2 key per the SYSTEM_ADMIN.md §10 layout. UTC YYYY/MM. */
export function buildKey(args: {
  clientSlug: string;
  category: MediaCategory;
  hash: string;
  extension: string;
  now?: Date;
}): string {
  const now = args.now ?? new Date();
  const year = now.getUTCFullYear().toString().padStart(4, "0");
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${args.clientSlug}/${args.category}/${year}/${month}/${args.hash}.${args.extension}`;
}

/** Builds the public URL for a key relative to the request URL. */
export function buildPublicUrl(origin: string, key: string): string {
  return `${origin}/m/${key}`;
}
