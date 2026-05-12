/**
 * Thin Cursor cloud-agents REST client.
 *
 * Why REST, not @cursor/sdk: the official SDK ships `sqlite3` and
 * `@connectrpc/connect-node`, neither of which run on the Cloudflare Workers
 * runtime. The cloud-agents REST API at https://api.cursor.com/v1/agents/*
 * has full parity for the operations Phase -1 needs (create agent, create
 * follow-up run, stream events, cancel). When the SDK adds a Workers-safe
 * build, this module becomes the single replacement point.
 *
 * Auth: HTTP Basic with the API key as the username and an empty password
 * (i.e. `Authorization: Basic <base64("<key>:")>`).
 *
 * Reference:
 *   https://cursor.com/docs/cloud-agent/api/endpoints
 *
 * Stream-event payload shapes are documented inline alongside each event in
 * `StreamEvent` below.
 */

const API_BASE = "https://api.cursor.com";

export interface CursorAgent {
  id: string;
  name?: string;
  status: "ACTIVE" | "ARCHIVED" | string;
  url?: string;
  latestRunId?: string;
  branchName?: string;
}

export interface CursorRun {
  id: string;
  agentId: string;
  status:
    | "CREATING"
    | "RUNNING"
    | "FINISHED"
    | "ERRORED"
    | "CANCELLED"
    | string;
}

export interface CreateAgentInput {
  apiKey: string;
  promptText: string;
  repoUrl: string;
  startingRef: string;
  branchName?: string;
  autoCreatePR?: boolean;
  skipReviewerRequest?: boolean;
  modelId?: string;
}

export interface CreateRunInput {
  apiKey: string;
  agentId: string;
  promptText: string;
}

/**
 * Builds the `Authorization: Basic …` header value for the Cursor API.
 * The key goes in the username slot; the password is intentionally empty.
 */
function basicAuthHeader(apiKey: string): string {
  return "Basic " + btoa(`${apiKey}:`);
}

/**
 * Wraps a failing upstream response into a structured error. Distinguishes
 * "the request never started" (4xx/5xx from this endpoint) from "the agent
 * run failed" (FINISHED with status=ERRORED, observed via the stream), as
 * the SDK skill recommends.
 */
export class CursorApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "CursorApiError";
  }
  get isRetryable(): boolean {
    return this.status === 408 || this.status === 429 || this.status >= 500;
  }
}

async function readError(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

export async function createAgent(input: CreateAgentInput): Promise<{ agent: CursorAgent; run: CursorRun }> {
  const body: Record<string, unknown> = {
    prompt: { text: input.promptText },
    repos: [{ url: input.repoUrl, startingRef: input.startingRef }],
    autoCreatePR: input.autoCreatePR ?? false,
    skipReviewerRequest: input.skipReviewerRequest ?? true,
  };
  if (input.branchName) body.branchName = input.branchName;
  if (input.modelId) body.model = { id: input.modelId };

  const response = await fetch(`${API_BASE}/v1/agents`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(input.apiKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new CursorApiError(
      response.status,
      `createAgent failed: ${response.status} ${response.statusText}`,
      await readError(response),
    );
  }

  return (await response.json()) as { agent: CursorAgent; run: CursorRun };
}

export async function createRun(input: CreateRunInput): Promise<{ run: CursorRun }> {
  const response = await fetch(`${API_BASE}/v1/agents/${encodeURIComponent(input.agentId)}/runs`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(input.apiKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: { text: input.promptText } }),
  });

  if (!response.ok) {
    throw new CursorApiError(
      response.status,
      `createRun failed: ${response.status} ${response.statusText}`,
      await readError(response),
    );
  }

  return (await response.json()) as { run: CursorRun };
}

/**
 * Opens a streaming connection to a run. Returns the raw upstream `Response`
 * — the function endpoint pipes its body through unchanged so SSE event ids
 * (and `Last-Event-ID` resumption) flow end-to-end without re-encoding.
 *
 * Pass `lastEventId` to resume after a dropped client connection.
 */
export async function streamRun(args: {
  apiKey: string;
  agentId: string;
  runId: string;
  lastEventId?: string | null;
}): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: basicAuthHeader(args.apiKey),
    Accept: "text/event-stream",
  };
  if (args.lastEventId) headers["Last-Event-ID"] = args.lastEventId;

  return fetch(
    `${API_BASE}/v1/agents/${encodeURIComponent(args.agentId)}/runs/${encodeURIComponent(args.runId)}/stream`,
    { method: "GET", headers },
  );
}

/**
 * Documented stream event payloads, for the client-side parser.
 *   `status`    — { runId, status }
 *   `assistant` — { text }            (text delta — concatenate to current bubble)
 *   `thinking`  — { text }            (reasoning delta — show subtly if at all)
 *   `tool_call` — { ... }             (tool status; payload not strictly typed yet)
 *   `heartbeat` — { }                 (keepalive — ignore)
 *   `result`    — { runId, status }   (terminal status for this run)
 *   `error`     — { code, message }
 *   `done`      — { }                 (stream over)
 */
export type StreamEventName =
  | "status"
  | "assistant"
  | "thinking"
  | "tool_call"
  | "heartbeat"
  | "result"
  | "error"
  | "done";
