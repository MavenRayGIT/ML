/**
 * POST /api/chat — start a new agent run.
 *
 * Body: { clientSlug: string, message: string, agentId?: string, pageUrl?: string }
 *
 * Behavior:
 *   - First turn  (no agentId): creates a Cursor cloud agent via POST /v1/agents,
 *                               prepending the system-context blob to the user
 *                               message. Returns { agentId, runId }.
 *   - Follow-up   (agentId set): creates a new run via POST /v1/agents/{id}/runs.
 *                               Conversation/workspace state carries over.
 *
 * Stream is NOT delivered here — the browser then opens an EventSource against
 * /api/chat/stream?agentId=…&runId=… (split because EventSource is GET-only and
 * the upstream Cursor SSE is read-only too). See ./chat/stream.ts.
 *
 * Auth: relies on functions/_middleware.ts (HTTP Basic). The Cursor API key
 * (env.CURSOR_API_KEY) is server-side only; nothing about it reaches the
 * browser.
 */

import { CLIENTS, getClient } from "../../src/lib/clients";
import { preflightResponse, withCors } from "../../src/lib/cors";
import { createAgent, createRun, CursorApiError } from "../../src/lib/cursor";
import { buildSystemContext } from "../../src/lib/system-prompt";

interface Env {
  CURSOR_API_KEY?: string;
}

interface ChatBody {
  clientSlug?: string;
  message?: string;
  agentId?: string;
  pageUrl?: string;
}

function jsonError(status: number, message: string, extra?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => preflightResponse(request);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.CURSOR_API_KEY) {
    return withCors(jsonError(503, "CURSOR_API_KEY is not configured on this environment."), request);
  }

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return withCors(jsonError(400, "Body must be JSON."), request);
  }

  const message = (body.message ?? "").trim();
  const clientSlug = (body.clientSlug ?? "").trim();
  if (!message) return withCors(jsonError(400, "message is required."), request);
  if (!clientSlug) return withCors(jsonError(400, "clientSlug is required."), request);

  const client = getClient(clientSlug);
  if (!client) {
    return withCors(
      jsonError(404, `Unknown client: ${clientSlug}.`, {
        validClients: CLIENTS.map((c) => c.slug),
      }),
      request,
    );
  }

  try {
    if (!body.agentId) {
      // First turn — create the agent. Prepend the system context to the
      // user's message; the REST API has no separate systemPrompt field.
      const systemContext = buildSystemContext({ client, pageUrl: body.pageUrl });
      const promptText = `${systemContext}${message}`;
      const repoUrl = `https://github.com/${client.repo}`;

      const { agent, run } = await createAgent({
        apiKey: env.CURSOR_API_KEY,
        promptText,
        repoUrl,
        startingRef: "staging",
        // Phase -1: agent creates its own `cursor/…` branch. User won't see
        // edits on staging until that branch is merged — the marker-commit
        // publish flow (§9a) is the eventual bridge. Documented gap.
        autoCreatePR: false,
        skipReviewerRequest: true,
      });

      return withCors(
        new Response(
          JSON.stringify({ agentId: agent.id, runId: run.id, branchName: agent.branchName ?? null }),
          { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
        ),
        request,
      );
    }

    // Follow-up turn — same agent, new run.
    const { run } = await createRun({
      apiKey: env.CURSOR_API_KEY,
      agentId: body.agentId,
      promptText: message,
    });

    return withCors(
      new Response(
        JSON.stringify({ agentId: body.agentId, runId: run.id, branchName: null }),
        { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
      ),
      request,
    );
  } catch (err) {
    if (err instanceof CursorApiError) {
      return withCors(
        jsonError(err.status >= 400 && err.status < 600 ? err.status : 502, err.message, {
          retryable: err.isRetryable,
          upstream: err.body ?? null,
        }),
        request,
      );
    }
    const errMessage = err instanceof Error ? err.message : "unknown error";
    return withCors(jsonError(500, `chat startup failed: ${errMessage}`), request);
  }
};

// Only POST is exported; Pages returns 405 automatically for other methods.
