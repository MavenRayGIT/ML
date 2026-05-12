/**
 * embed.js — M&L in-page client toolbar (Phase -1, drawer-only).
 *
 * Loaded as a cross-origin script on `*.mackandlee.com` staging sites:
 *
 *   <script
 *     src="https://admin.mackandlee.com/embed.js"
 *     data-ml-edit="<client-slug>"
 *     defer></script>
 *
 * Behavior:
 *   - Reads `data-ml-edit` (slug) and the script `src` (admin origin).
 *   - Mounts a Shadow DOM root that hosts a launcher + drawer.
 *   - Drawer is a vanilla chat UI talking to /api/chat + /api/chat/stream.
 *   - agentId is persisted in localStorage, scoped to (origin, slug), so
 *     the conversation survives reloads on the same staging site.
 *
 * Out of scope for this file (separate todos):
 *   - Element overlay (hover labels, click-to-pin) — depends on the
 *     `/_ml/manifest.json` emitter from the Astro integration.
 *   - Visibility of agent edits — the agent edits its own `cursor/…`
 *     branch; staging only reflects edits after a merge. Documented gap.
 *
 * Auth (Phase -1): fetches use `credentials: "include"`. Admin protects
 * itself with HTTP Basic; the browser sends those creds cross-origin
 * if the user has visited admin.mackandlee.com first. A 401 surfaces
 * inline as a "Sign in at admin.mackandlee.com first" message. Phase 0
 * replaces this with a Cloudflare Access JWT cookie set on
 * `.mackandlee.com`, which works transparently.
 */

import { SHADOW_CSS } from "./styles";

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

interface BootConfig {
  /** Client slug — matches src/lib/clients.ts. */
  site: string;
  /** Origin of the admin app (where /api/chat lives). */
  adminOrigin: string;
}

/**
 * Find the script tag that loaded us. `document.currentScript` is the
 * cheap path for synchronous loads; for `defer`/`async` we fall back
 * to a selector. `data-ml-edit` is the marker — if multiple embeds
 * ever load on one page, the first wins (warn in console).
 */
function resolveBoot(): BootConfig | null {
  const current = document.currentScript as HTMLScriptElement | null;
  const candidates: HTMLScriptElement[] = [];
  if (current && current.dataset.mlEdit) candidates.push(current);
  document.querySelectorAll<HTMLScriptElement>("script[data-ml-edit]").forEach((el) => {
    if (!candidates.includes(el)) candidates.push(el);
  });
  if (candidates.length === 0) {
    console.warn("[ml-edit] no <script data-ml-edit=…> found; embed will not load.");
    return null;
  }
  if (candidates.length > 1) {
    console.warn("[ml-edit] multiple <script data-ml-edit=…> tags found; using the first.");
  }
  const tag = candidates[0]!;
  const site = (tag.dataset.mlEdit ?? "").trim();
  if (!site) {
    console.warn("[ml-edit] script tag has empty data-ml-edit.");
    return null;
  }
  let adminOrigin: string;
  try {
    adminOrigin = new URL(tag.src, location.href).origin;
  } catch {
    console.warn("[ml-edit] could not derive admin origin from script src.");
    return null;
  }
  return { site, adminOrigin };
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type AgentStatus = "idle" | "thinking" | "streaming" | "done" | "error";

interface Message {
  id: string;
  role: "user" | "agent" | "system" | "error";
  text: string;
  /** Set after the agent's terminal event so we know not to mutate further. */
  finalized?: boolean;
}

interface SessionState {
  agentId: string | null;
  /** Most recent run's id — used while a stream is active. */
  runId: string | null;
  status: AgentStatus;
  /** Append-only message log. */
  messages: Message[];
  /** Active EventSource, if any. */
  stream: EventSource | null;
  /** Pending send guard so users can't double-fire. */
  busy: boolean;
}

function storageKey(adminOrigin: string, site: string): string {
  return `ml-edit:agent:${adminOrigin}:${site}`;
}

function loadAgentId(cfg: BootConfig): string | null {
  try {
    return localStorage.getItem(storageKey(cfg.adminOrigin, cfg.site));
  } catch {
    return null;
  }
}

function saveAgentId(cfg: BootConfig, id: string | null): void {
  try {
    if (id) localStorage.setItem(storageKey(cfg.adminOrigin, cfg.site), id);
    else localStorage.removeItem(storageKey(cfg.adminOrigin, cfg.site));
  } catch {
    /* storage disabled — fall back to in-memory state only */
  }
}

// ---------------------------------------------------------------------------
// UI construction (vanilla DOM in a shadow root)
// ---------------------------------------------------------------------------

interface UIRefs {
  shadow: ShadowRoot;
  launcher: HTMLButtonElement;
  drawer: HTMLDivElement;
  backdrop: HTMLDivElement;
  statusbar: HTMLDivElement;
  statusLabel: HTMLSpanElement;
  log: HTMLDivElement;
  empty: HTMLDivElement;
  textarea: HTMLTextAreaElement;
  sendBtn: HTMLButtonElement;
  closeBtn: HTMLButtonElement;
  resetBtn: HTMLButtonElement;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  }
  // `appendChild` (not `append`) because @cloudflare/workers-types is on the
  // tsconfig and its global types poison `Element.append`'s overloads — using
  // the simpler `Node.appendChild` keeps DOM resolution clean here.
  for (const c of children) {
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

function mountUI(cfg: BootConfig): UIRefs {
  // Host element — we attach the shadow root here. Inert by default so the
  // host page's scroll/keyboard handling is untouched until the user opens
  // the drawer.
  const host = document.createElement("div");
  host.id = "ml-edit-root";
  host.style.cssText = "all: initial; position: static;";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = SHADOW_CSS;
  shadow.appendChild(style);

  // Launcher button (collapsed state).
  const launcher = el(
    "button",
    {
      type: "button",
      class: "launcher",
      "aria-label": "Open M&L edit drawer",
      "aria-haspopup": "dialog",
    },
    [
      el("span", { class: "logo" }, ["M&L"]),
      el("span", {}, ["Edit"]),
    ],
  );

  // Backdrop (mobile only — see CSS media query).
  const backdrop = el("div", { class: "backdrop", "data-open": "false" });

  // Drawer chrome.
  const closeBtn = el("button", { type: "button", class: "iconbtn", "aria-label": "Close edit drawer" }, ["×"]);
  const resetBtn = el(
    "button",
    { type: "button", class: "iconbtn", "aria-label": "Reset conversation", title: "New conversation" },
    ["⟲"],
  );
  const header = el("header", {}, [
    el("span", { class: "logo" }, ["M&L"]),
    el("span", { class: "title" }, [
      "Edit",
      el("small", {}, [`${cfg.site} · staging`]),
    ]),
    resetBtn,
    closeBtn,
  ]);

  const statusLabel = el("span", {}, ["Ready"]) as HTMLSpanElement;
  const statusbar = el("div", { class: "statusbar", "data-status": "idle", role: "status", "aria-live": "polite" }, [
    el("span", { class: "dot" }),
    statusLabel,
  ]) as HTMLDivElement;

  const empty = el("div", { class: "empty" }, [
    el("strong", {}, ["Tell the agent what to change."]),
    "It will edit on the staging branch. You'll see updates here while it works.",
  ]) as HTMLDivElement;
  const log = el("div", { class: "log" }, [empty]) as HTMLDivElement;

  const textarea = el("textarea", {
    placeholder: "What should change on this page?",
    rows: "3",
    "aria-label": "Message to the editing agent",
  }) as HTMLTextAreaElement;
  const sendBtn = el("button", { type: "button", class: "send" }, ["Send"]) as HTMLButtonElement;
  const composer = el("div", { class: "composer" }, [
    textarea,
    el("div", { class: "row" }, [
      el("span", { class: "hint" }, ["⏎ to send · ⇧⏎ for newline"]),
      sendBtn,
    ]),
  ]);

  const drawer = el("div", { class: "drawer", role: "dialog", "aria-label": "M&L edit drawer", "data-open": "false" }, [
    header,
    statusbar,
    log,
    composer,
  ]) as HTMLDivElement;

  shadow.appendChild(backdrop);
  shadow.appendChild(drawer);
  shadow.appendChild(launcher);

  return { shadow, launcher, drawer, backdrop, statusbar, statusLabel, log, empty, textarea, sendBtn, closeBtn, resetBtn };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "Ready",
  thinking: "Thinking…",
  streaming: "Replying…",
  done: "Done",
  error: "Error",
};

function setStatus(ui: UIRefs, state: SessionState, status: AgentStatus, label?: string): void {
  state.status = status;
  ui.statusbar.setAttribute("data-status", status);
  ui.statusLabel.textContent = label ?? STATUS_LABELS[status];
}

function ensureBubble(ui: UIRefs, state: SessionState, msg: Message): HTMLDivElement {
  if (state.messages.length === 1 && ui.empty.parentElement) {
    ui.empty.remove();
  }
  let node = ui.log.querySelector<HTMLDivElement>(`[data-mid="${msg.id}"]`);
  if (!node) {
    node = el("div", { class: `bubble ${msg.role}`, "data-mid": msg.id }, [msg.text]) as HTMLDivElement;
    ui.log.appendChild(node);
  } else {
    node.textContent = msg.text;
  }
  // Auto-scroll only if user is already near the bottom — don't yank the
  // page out from under them if they're reading earlier turns.
  const nearBottom = ui.log.scrollTop + ui.log.clientHeight >= ui.log.scrollHeight - 80;
  if (nearBottom) ui.log.scrollTop = ui.log.scrollHeight;
  return node;
}

function appendMessage(ui: UIRefs, state: SessionState, role: Message["role"], text: string): Message {
  const msg: Message = { id: cryptoId(), role, text };
  state.messages.push(msg);
  ensureBubble(ui, state, msg);
  return msg;
}

function appendDelta(ui: UIRefs, state: SessionState, role: "agent", delta: string): Message {
  const last = state.messages[state.messages.length - 1];
  if (last && last.role === role && !last.finalized) {
    last.text += delta;
    ensureBubble(ui, state, last);
    return last;
  }
  return appendMessage(ui, state, role, delta);
}

function cryptoId(): string {
  // Avoid `crypto.randomUUID` for older browser support; this is plenty.
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function resetSession(ui: UIRefs, state: SessionState, cfg: BootConfig): void {
  if (state.stream) {
    state.stream.close();
    state.stream = null;
  }
  state.agentId = null;
  state.runId = null;
  state.messages = [];
  state.busy = false;
  saveAgentId(cfg, null);
  ui.log.replaceChildren(ui.empty);
  setStatus(ui, state, "idle");
  ui.textarea.disabled = false;
  ui.sendBtn.disabled = false;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

interface ChatResponse {
  agentId: string;
  runId: string;
  branchName: string | null;
}

interface ChatErrorBody {
  error?: string;
  retryable?: boolean;
  upstream?: string | null;
}

async function postChat(cfg: BootConfig, body: {
  clientSlug: string;
  message: string;
  agentId?: string | null;
  pageUrl?: string;
}): Promise<ChatResponse> {
  const response = await fetch(`${cfg.adminOrigin}/api/chat`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientSlug: body.clientSlug,
      message: body.message,
      agentId: body.agentId ?? undefined,
      pageUrl: body.pageUrl,
    }),
  });

  if (!response.ok) {
    let detail: ChatErrorBody = {};
    try {
      detail = (await response.json()) as ChatErrorBody;
    } catch {
      /* non-JSON error body — leave detail empty */
    }
    if (response.status === 401) {
      throw new Error("Sign in at admin.mackandlee.com first, then reload this page.");
    }
    throw new Error(detail.error ?? `Admin returned ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as ChatResponse;
}

function openStream(
  cfg: BootConfig,
  agentId: string,
  runId: string,
  handlers: {
    onAssistant: (text: string) => void;
    onThinking?: (text: string) => void;
    onStatus?: (status: string) => void;
    onResult?: (status: string) => void;
    onError: (msg: string) => void;
    onDone: () => void;
  },
): EventSource {
  const url = new URL(`${cfg.adminOrigin}/api/chat/stream`);
  url.searchParams.set("agentId", agentId);
  url.searchParams.set("runId", runId);
  const es = new EventSource(url.toString(), { withCredentials: true });

  const parse = (raw: string): unknown => {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  es.addEventListener("assistant", (e) => {
    const data = parse((e as MessageEvent<string>).data) as { text?: string };
    if (data?.text) handlers.onAssistant(data.text);
  });
  es.addEventListener("thinking", (e) => {
    if (!handlers.onThinking) return;
    const data = parse((e as MessageEvent<string>).data) as { text?: string };
    if (data?.text) handlers.onThinking(data.text);
  });
  es.addEventListener("status", (e) => {
    if (!handlers.onStatus) return;
    const data = parse((e as MessageEvent<string>).data) as { status?: string };
    if (data?.status) handlers.onStatus(data.status);
  });
  es.addEventListener("result", (e) => {
    const data = parse((e as MessageEvent<string>).data) as { status?: string };
    if (handlers.onResult && data?.status) handlers.onResult(data.status);
  });
  es.addEventListener("error", (e) => {
    // Two cases: a typed "error" event from upstream, or a transport error.
    // MessageEvent.data is only present on the upstream-typed variant.
    const evt = e as MessageEvent<string>;
    if (typeof evt.data === "string" && evt.data.length > 0) {
      const data = parse(evt.data) as { message?: string; code?: string };
      handlers.onError(data?.message ?? "Stream error.");
    } else if (es.readyState === EventSource.CLOSED) {
      handlers.onError("Connection closed.");
    } else {
      // Transient — EventSource will auto-retry. Don't surface noise.
    }
  });
  es.addEventListener("done", () => {
    handlers.onDone();
  });

  return es;
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

function openDrawer(ui: UIRefs): void {
  ui.drawer.setAttribute("data-open", "true");
  ui.backdrop.setAttribute("data-open", "true");
  ui.launcher.hidden = true;
  // Focus moves to the composer so the user can start typing immediately.
  requestAnimationFrame(() => ui.textarea.focus());
}

function closeDrawer(ui: UIRefs): void {
  ui.drawer.setAttribute("data-open", "false");
  ui.backdrop.setAttribute("data-open", "false");
  ui.launcher.hidden = false;
}

async function handleSend(cfg: BootConfig, ui: UIRefs, state: SessionState): Promise<void> {
  if (state.busy) return;
  const text = ui.textarea.value.trim();
  if (!text) return;

  ui.textarea.value = "";
  state.busy = true;
  ui.sendBtn.disabled = true;
  ui.textarea.disabled = true;

  appendMessage(ui, state, "user", text);
  setStatus(ui, state, "thinking");

  let response: ChatResponse;
  try {
    response = await postChat(cfg, {
      clientSlug: cfg.site,
      message: text,
      agentId: state.agentId,
      pageUrl: location.href,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Send failed.";
    appendMessage(ui, state, "error", msg);
    setStatus(ui, state, "error", "Couldn't reach admin");
    state.busy = false;
    ui.sendBtn.disabled = false;
    ui.textarea.disabled = false;
    ui.textarea.focus();
    return;
  }

  // Persist agentId on the first successful turn.
  if (!state.agentId) {
    state.agentId = response.agentId;
    saveAgentId(cfg, response.agentId);
  }
  state.runId = response.runId;

  // Open the stream and wire handlers. The bubble for the agent reply gets
  // created lazily on the first text delta.
  setStatus(ui, state, "streaming");
  const finish = (status: AgentStatus, label?: string) => {
    if (state.stream) {
      state.stream.close();
      state.stream = null;
    }
    const last = state.messages[state.messages.length - 1];
    if (last && last.role === "agent") last.finalized = true;
    setStatus(ui, state, status, label);
    state.busy = false;
    ui.sendBtn.disabled = false;
    ui.textarea.disabled = false;
    ui.textarea.focus();
  };

  state.stream = openStream(cfg, response.agentId, response.runId, {
    onAssistant: (chunk) => appendDelta(ui, state, "agent", chunk),
    onResult: (status) => {
      if (status === "FINISHED") finish("done", "Done");
      else if (status === "ERRORED") {
        appendMessage(ui, state, "error", "Agent run errored. Try again.");
        finish("error");
      } else if (status === "CANCELLED") {
        appendMessage(ui, state, "system", "Cancelled.");
        finish("idle", "Cancelled");
      }
    },
    onError: (msg) => {
      appendMessage(ui, state, "error", msg);
      finish("error");
    },
    onDone: () => {
      // Some streams end with `done` before `result` — treat as success
      // unless the status already moved to error.
      if (state.status !== "error") finish("done", "Done");
    },
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function init(): void {
  const cfg = resolveBoot();
  if (!cfg) return;

  // Guard against double-injection.
  if (document.getElementById("ml-edit-root")) {
    console.warn("[ml-edit] embed already mounted; skipping.");
    return;
  }

  const ui = mountUI(cfg);
  const state: SessionState = {
    agentId: loadAgentId(cfg),
    runId: null,
    status: "idle",
    messages: [],
    stream: null,
    busy: false,
  };

  if (state.agentId) {
    appendMessage(
      ui,
      state,
      "system",
      "Resumed previous session. Type to continue, or use ⟲ to start fresh.",
    );
  }

  ui.launcher.addEventListener("click", () => openDrawer(ui));
  ui.closeBtn.addEventListener("click", () => closeDrawer(ui));
  ui.backdrop.addEventListener("click", () => closeDrawer(ui));
  ui.resetBtn.addEventListener("click", () => {
    if (state.busy) return;
    if (state.messages.length > 0 && !confirm("Start a new conversation? Current chat will be cleared.")) return;
    resetSession(ui, state, cfg);
  });

  ui.sendBtn.addEventListener("click", () => {
    void handleSend(cfg, ui, state);
  });
  ui.textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend(cfg, ui, state);
    }
  });

  // Esc closes the drawer when it's open and the composer isn't mid-IME.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && ui.drawer.getAttribute("data-open") === "true") {
      const active = (ui.shadow.activeElement as HTMLElement | null);
      if (active && active.tagName === "TEXTAREA" && (e as KeyboardEvent).isComposing) return;
      closeDrawer(ui);
    }
  });

  // Tidy up if the page is being torn down mid-stream.
  window.addEventListener("beforeunload", () => {
    if (state.stream) state.stream.close();
  });
}

// `defer` guarantees DOMContentLoaded has fired by the time we run, but
// guard anyway so a direct injection still works.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
