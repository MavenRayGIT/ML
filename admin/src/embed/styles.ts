/**
 * Shadow-DOM CSS for embed.js.
 *
 * Lives in a string literal so esbuild bundles it into the IIFE — no
 * separate stylesheet, no extra request, no CSP `style-src` concern.
 *
 * The Shadow DOM gives us style isolation in both directions: nothing
 * we set here leaks into the host page, and nothing on the host page
 * (Tailwind, reset stylesheets, etc.) leaks into the drawer. The host
 * site keeps full ownership of its visual surface.
 *
 * Variables stay aligned with `ml-admin/src/styles/global.css` so the
 * drawer looks like an extension of the admin app, not the client
 * site. (It is an admin tool that happens to render on the client
 * domain — separating it visually is the right cue.)
 */

export const SHADOW_CSS = `
:host {
  all: initial;
  contain: layout style;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1c1f1c;
  --ml-ink: #020302;
  --ml-ink-soft: #1a1d1a;
  --ml-paper: #ffffff;
  --ml-mute: #f3f3f1;
  --ml-line: #e3e3df;
  --ml-text: #1c1f1c;
  --ml-text-soft: #5b605b;
  --ml-accent: #d72511;
  --ml-drawer-w: 420px;
}

*, *::before, *::after { box-sizing: border-box; }
button { font: inherit; cursor: pointer; }

/* ===== Launcher (collapsed state) ===== */

.launcher {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483646;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px 10px 12px;
  background: var(--ml-ink);
  color: var(--ml-paper);
  border: none;
  border-radius: 999px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.launcher:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1); }
.launcher:focus-visible { outline: 2px solid var(--ml-accent); outline-offset: 2px; }
.launcher .logo {
  display: inline-grid;
  place-items: center;
  width: 22px; height: 22px;
  border-radius: 4px;
  background: var(--ml-paper);
  color: var(--ml-ink);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.launcher[hidden] { display: none !important; }

/* ===== Drawer ===== */

.drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: var(--ml-drawer-w);
  max-width: 100vw;
  z-index: 2147483647;
  background: var(--ml-paper);
  border-left: 1px solid var(--ml-line);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.2s ease;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.08);
}
.drawer[data-open="true"] { transform: translateX(0); }

.drawer header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--ml-line);
  background: var(--ml-paper);
}
.drawer header .logo {
  display: inline-grid; place-items: center;
  width: 22px; height: 22px; border-radius: 4px;
  background: var(--ml-ink); color: var(--ml-paper);
  font-size: 9px; font-weight: 700; letter-spacing: 0.05em;
}
.drawer header .title { flex: 1; font-size: 13px; font-weight: 600; }
.drawer header .title small {
  display: block;
  font-size: 11px;
  font-weight: 400;
  color: var(--ml-text-soft);
  margin-top: 1px;
}
.drawer header .iconbtn {
  border: 1px solid var(--ml-line);
  background: var(--ml-paper);
  color: var(--ml-text);
  width: 28px; height: 28px;
  border-radius: 6px;
  display: inline-grid; place-items: center;
  font-size: 14px;
  transition: background 0.1s ease;
}
.drawer header .iconbtn:hover { background: var(--ml-mute); }
.drawer header .iconbtn:focus-visible { outline: 2px solid var(--ml-accent); outline-offset: 1px; }

/* Status pill */

.statusbar {
  padding: 8px 14px;
  border-bottom: 1px solid var(--ml-line);
  background: var(--ml-mute);
  font-size: 11px;
  color: var(--ml-text-soft);
  display: flex; align-items: center; gap: 8px;
  min-height: 32px;
}
.statusbar .dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--ml-text-soft);
  flex: 0 0 auto;
}
.statusbar[data-status="thinking"] .dot,
.statusbar[data-status="streaming"] .dot {
  background: var(--ml-accent);
  animation: ml-pulse 1.2s ease-in-out infinite;
}
.statusbar[data-status="error"] .dot { background: #b8190a; animation: none; }
.statusbar[data-status="done"] .dot { background: #2f7d32; animation: none; }

@keyframes ml-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* Message log */

.log {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex; flex-direction: column; gap: 10px;
  background: var(--ml-paper);
}
.empty {
  margin: auto;
  text-align: center;
  color: var(--ml-text-soft);
  font-size: 12px;
  max-width: 280px;
  line-height: 1.5;
}
.empty strong { color: var(--ml-text); font-weight: 600; display: block; margin-bottom: 4px; font-size: 13px; }

.bubble {
  display: block;
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}
.bubble.user {
  background: var(--ml-ink);
  color: var(--ml-paper);
  align-self: flex-end;
  border-bottom-right-radius: 3px;
}
.bubble.agent {
  background: var(--ml-mute);
  color: var(--ml-text);
  align-self: flex-start;
  border-bottom-left-radius: 3px;
}
.bubble.system {
  align-self: stretch;
  text-align: center;
  background: transparent;
  color: var(--ml-text-soft);
  font-size: 11px;
  padding: 4px 0;
  font-style: italic;
}
.bubble.error {
  align-self: stretch;
  background: #fdecea;
  color: #6b0e0e;
  border: 1px solid #f4b6b1;
  font-size: 12px;
}

/* Composer */

.composer {
  border-top: 1px solid var(--ml-line);
  padding: 10px 12px 12px;
  background: var(--ml-paper);
  display: flex; flex-direction: column; gap: 8px;
}
.composer textarea {
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  resize: vertical;
  border: 1px solid var(--ml-line);
  border-radius: 6px;
  padding: 8px 10px;
  font: inherit;
  font-size: 13px;
  color: var(--ml-text);
  background: var(--ml-paper);
  outline: none;
}
.composer textarea:focus { border-color: var(--ml-ink-soft); }
.composer textarea:disabled { background: var(--ml-mute); color: var(--ml-text-soft); }
.composer .row {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.composer .hint { font-size: 11px; color: var(--ml-text-soft); }
.composer .send {
  padding: 7px 14px;
  border-radius: 6px;
  background: var(--ml-ink);
  color: var(--ml-paper);
  border: none;
  font-size: 12px;
  font-weight: 500;
}
.composer .send:hover:not(:disabled) { background: var(--ml-ink-soft); }
.composer .send:focus-visible { outline: 2px solid var(--ml-accent); outline-offset: 2px; }
.composer .send:disabled { opacity: 0.5; cursor: not-allowed; }

/* Backdrop catches stray clicks when drawer is open on narrow viewports */

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483645;
  background: rgba(0, 0, 0, 0.18);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;
}
@media (max-width: 720px) {
  :host { --ml-drawer-w: 100vw; }
  .backdrop[data-open="true"] { opacity: 1; pointer-events: auto; }
}
`;
