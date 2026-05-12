/**
 * GET /api/chat/stream?agentId=…&runId=… — relay the upstream SSE stream.
 *
 * This function is intentionally thin: it forwards `Last-Event-ID` (so the
 * browser's EventSource can resume after a dropped connection) and pipes the
 * upstream Response body through unchanged. Event IDs and `id:` lines stay
 * intact end-to-end — no re-encoding, no buffering.
 *
 * Why a separate endpoint from POST /api/chat:
 *   1. EventSource is GET-only and can't send a request body.
 *   2. The upstream stream URL is itself GET-only and run-scoped, so a 1:1
 *      mapping is clearer than tunneling through a single endpoint.
 *
 * Auth: HTTP Basic via functions/_middleware.ts. The CURSOR_API_KEY stays on
 * the server; the browser only ever sees the relayed SSE.
 */

import { streamRun } from "../../../src/lib/cursor";

interface Env {
  CURSOR_API_KEY?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.CURSOR_API_KEY) {
    return new Response("CURSOR_API_KEY is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");
  const runId = url.searchParams.get("runId");
  if (!agentId || !runId) {
    return new Response("agentId and runId are required.", { status: 400 });
  }

  const upstream = await streamRun({
    apiKey: env.CURSOR_API_KEY,
    agentId,
    runId,
    lastEventId: request.headers.get("Last-Event-ID"),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(text || `upstream stream returned ${upstream.status}`, {
      status: upstream.status,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }

  // Forward the stream body as-is. Headers reduced to what SSE clients care
  // about; preserve the retention hint so the browser knows how long resume
  // remains possible.
  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
  };
  const retention = upstream.headers.get("X-Cursor-Stream-Retention-Seconds");
  if (retention) headers["X-Cursor-Stream-Retention-Seconds"] = retention;

  return new Response(upstream.body, { status: 200, headers });
};
