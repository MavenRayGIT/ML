# SYSTEM ADMIN — V1 (pragmatic)

> What we're actually building right now. Pivoted away from the full
> SDK-driven admin in `SYSTEM_ADMIN.md` (v1.2) after the platform
> proved too slow for live editing at our current scale.
>
> **Version: 1.0 — 2026-05-12**
> **Status:** active. Supersedes `SYSTEM_ADMIN.md` Phase -1 → Phase 5
> as the near-term plan. The long-term spec in `SYSTEM_ADMIN.md`
> remains the target for Phase 1+ scale (multiple clients, full
> in-page chat-driven editing), to be revisited.
>
> Read alongside `SYSTEM_ADMIN.md` (long-term spec),
> `ops/CLOUDFLARE_SETUP.md` (runbook), and `ARCHITECTURE.md` (Track A
> stack standard).

---

## 1. Why we pivoted

We built the SDK admin model end-to-end during the Phase -1 spike:
basic-auth admin shell, R2 media uploads, in-page chat pill embedded
into the SO staging site, Cursor cloud agent making commits, GitHub
Action auto-merging agent branches into `staging`, and SSR migration
of the SO site to Cloudflare Workers so staging would rebuild faster.

It worked end-to-end. The latency didn't.

**Real measured end-to-end loop:**

| Step | Time |
|---|---|
| Cursor agent responds in chat | ~30–60s |
| Workers Build picks up the push and deploys | ~20–40s |
| Total: client says "do this" → client sees it on staging | **~50–100s** |

For a one-line headline change this is unworkable. The original
estimate of 5–15s assumed live-source rendering with no build step
— Workers Builds doesn't work that way, and the cloud agent's
think-time is itself ~30s. We can compress neither in the current
architecture.

The honest verdict: the SDK admin model is the right design for
**Phase 1+ when there are multiple clients and centralized AI
operations make sense**. It's the wrong design for **one client on a
marketing site who already knows Cursor IDE**, where the IDE's
local Astro dev server delivers true HMR (<1s feedback) for free.

### What this changes

- **No browser-hosted AI editor.** Clients use Cursor IDE locally.
- **Staging site is preview + control panel.** No editor on it.
- **M&L doesn't pay LLM tokens.** Client pays Cursor Pro ($20/mo).
  At one client this is a wash; at scale it shifts costs in our favor.
- **All the parked code stays in the repo.** Re-enabling the SDK
  admin is a config flip + a workflow rename, not a rebuild.

---

## 2. V1 architecture

```
        ┌──────────────────────────────────────────┐
        │  Ken's machine                           │
        │                                          │
        │  Cursor IDE                              │
        │   └─ /agentsites/clients/sustainedoutcomes/site/
        │       └─ npm run dev   (Astro HMR, <1s)  │
        │                                          │
        │  Cursor agent edits scoped by:           │
        │   - .cursor/rules/*.mdc (files allowlist)│
        │   - AGENTS.md (V1 workflow rules)        │
        │   - cursor hooks (defense-in-depth)      │
        │   - dev-mode overlay (label hover)       │
        │                                          │
        │  Commits to:  staging  (no PR, no agent  │
        │              branches)                   │
        └──────────┬───────────────────────────────┘
                   │ git push
                   ▼
                GitHub: MavenRayGIT/ML
                   │
                   │   on push to `staging`:
                   │   Cloudflare Workers Build deploys
                   ▼
        ┌──────────────────────────────────────────┐
        │  sustainedoutcomes.mackandlee.com         │
        │  (Cloudflare Workers, SSR)               │
        │                                          │
        │  Black staging banner contains:          │
        │   - Sync status pill (in-sync/building/  │
        │     outdated, polls GitHub + CF)         │
        │   - Push Live button (staging → main)    │
        │   - Responsive viewport toggle           │
        └──────────────────────────────────────────┘

                   ┌──────────────────────┐
                   │ admin.mackandlee.com │
                   │ (Cloudflare Pages)   │
                   │                      │
                   │ - basic auth gate    │
                   │ - dashboard          │
                   │ - /upload (R2)       │
                   │ - /api/sync-status   │
                   │ - /api/push-live     │
                   └──────────────────────┘
```

### Roles of each surface

| Surface | Owns | Does NOT own |
|---|---|---|
| **Cursor IDE on client's machine** | The editing experience. Live preview via Astro dev server HMR. Commits to `staging`. | Anything cloud-side. |
| **`sustainedoutcomes.mackandlee.com`** (Workers SSR) | Production-like preview of `staging` branch. Hosts the staging banner control surface. | Editing. |
| **`admin.mackandlee.com`** (Pages) | Auth gate, dashboard, R2 media uploads, control-panel API endpoints (sync status, push live). | In-page editing UI. |

---

## 3. What's live today (as of 2026-05-12)

### Infrastructure

- **3 Cloudflare projects** (down from 4 after consolidation):
  - `ml-admin` (Pages) at `admin.mackandlee.com`
  - `ml-sustainedoutcomes` (Workers) at `sustainedoutcomes.mackandlee.com`
  - `sustainedoutcomes-prod` (Pages) at the placeholder prod URL — kept until SO launches with a real client domain
- **R2 bucket** `ml-media` — content-addressed media storage
- **SO site migrated to SSR on Workers** via `@astrojs/cloudflare`
  adapter. `output: "server"`, cache-control middleware, `prerender = true`
  on blog detail routes.

### Admin app (`ml-admin`)

| Route | Status | Notes |
|---|---|---|
| `/` | Live | Site cards dashboard |
| `/upload` | Live | Drag-drop R2 upload, content-addressed keys, dedupe |
| `/m/<key>` | Live | Public media serve (auth-exempt) |
| `/api/upload` | Live | Backing endpoint for upload page |
| `_middleware.ts` | Live | HTTP Basic Auth (BASIC_AUTH_USER + BASIC_AUTH_PASS env vars) |

### Sustained Outcomes site

| Aspect | State |
|---|---|
| Repo | `MavenRayGIT/ML`, app root `agentsites/clients/sustainedoutcomes/site/` |
| Staging URL | `sustainedoutcomes.mackandlee.com` |
| Staging branch | `staging` (Workers Builds Production branch) |
| Prod URL | TBD (currently placeholder Pages project) |
| Stack | Astro 6 SSR + Tailwind v4 + MDX |
| Build/deploy | Workers Builds on `git push staging` |
| Embed.js inclusion | Gated on `PUBLIC_ML_EDIT_ENABLED` (now set to false; chat pill not shown) |

---

## 4. What's parked (built but disabled)

Everything below stays in the repo. **Do not delete.** It's the
substrate for Phase 1+ if/when we scale beyond one client.

### Disabled GitHub Action

| Path | Status | Revival |
|---|---|---|
| `.github/workflows/auto-merge-cursor-to-staging.yml.disabled` | Disabled (GitHub Actions ignores `.disabled` suffix) | Rename back to `.yml`. Last working commit: `555621c`. |

The action auto-merges `cursor/**` agent branches into `staging` so
in-page chat edits land on the staging preview without manual PR
review. Disabled because V1 has no agents pushing to `cursor/**`.

### Admin app endpoints (built, not called)

| Path | Status | Revival |
|---|---|---|
| `admin/functions/api/chat.ts` | Live route, not called | Re-enable embed pill (next row) and clients flip back. |
| `admin/functions/api/chat/stream.ts` | Live route, not called | Same. |
| `admin/src/lib/cursor.ts` | Compiled, unreferenced by V1 callers | Imported by chat.ts above. |
| `admin/src/lib/system-prompt.ts` | Compiled, unreferenced | Imported by chat.ts above. |
| `admin/src/lib/cors.ts` | **Still active** (preflights cover all `/api/*` from `.workers.dev` previews) | N/A — keep. |

The endpoints still respond to POST/GET. They will 503 if
`CURSOR_API_KEY` is unset (recommended to remove from prod env so
nothing accidentally bills Cursor). They will 200 if it is set.

### Embed script (chat pill)

| Path | Status | Revival |
|---|---|---|
| `admin/src/embed/*` (TS sources) | Still bundled at build time → `admin/dist/embed.js` | N/A — keep. |
| `admin/embed.js` serving from `admin.mackandlee.com/embed.js` | Live URL, returns the bundle | N/A — keep. |
| Site inclusion (`agentsites/clients/sustainedoutcomes/site/src/layouts/Page.astro`) | Conditional on `PUBLIC_ML_EDIT_ENABLED` env var | Set the env var to `true` on the Workers project. |

When the env var is `false` (V1 default), the `<script>` tag is not
emitted, no pill is shown, the chat endpoints aren't called.

### Admin app system prompt content

`admin/src/lib/system-prompt.ts` contains the client-facing system
prompt we wrote and rewrote during the spike. It's not in use under
V1 but it's a documented artifact of what worked and didn't on the
chat tone front. Read it before redesigning the prompt in Phase 1+.

### Why we keep all of this

| | If we delete it now | If we keep it parked |
|---|---|---|
| Re-enabling V1.5 (chat editor as opt-in) | Rebuild from spec | Flip 2 env vars |
| Phase 1+ at 5+ clients | Rebuild from spec | Add Cloudflare Access in front of existing endpoints |
| Cost while parked | $0 saved | $0 (routes are cold) |
| Cognitive load | Low (less code) | Moderate (parked sections in docs) |

Trade-off is small in our favor. The build effort to recreate
this from spec is ~1 week.

---

## 5. V1 layers — what's next

Sequenced for incremental wins. Each layer is independent of the
others and delivers visible value on its own.

### Layer 1 — Cursor packet for Ken (~1 day)

Make Ken's local Cursor IDE behave correctly without us manually
walking him through what to ask the agent.

| Deliverable | Path |
|---|---|
| Files-scope rules for the SO Cursor agent | `agentsites/clients/sustainedoutcomes/.cursor/rules/*.mdc` |
| V1 workflow doc — commit-to-staging, no PRs, no cloud agents | Rewrite `agentsites/clients/sustainedoutcomes/AGENTS.md` |
| Client-facing onboarding — "install Cursor, open this folder, here's the loop" | New `agentsites/clients/sustainedoutcomes/CLIENT_README.md` |
| Optional commit hook rejecting out-of-scope changes | `agentsites/clients/sustainedoutcomes/.cursor/hooks/` |

Rules scope the agent to:
- ✅ `src/pages/**` — page content
- ✅ `src/content/**` — collections
- ✅ `src/assets/**` — media references
- ❌ `src/components/**/*.astro` internals
- ❌ `*.config.*`, `tsconfig.json`, etc.
- ❌ `src/content/config.ts` (schema)
- ❌ anything outside `agentsites/clients/sustainedoutcomes/site/`

### Layer 2 — element overlay (~2 days)

Replace screenshots-as-references with a label overlay Ken can
toggle on inside his local dev server.

| Deliverable | Path |
|---|---|
| Astro integration that walks `.astro` files at build time and tags editable elements with `data-ml-block="<derived-label>"` | `agentsites/packages/ml-edit-integration/` |
| Dev-mode overlay UI: toggleable, draws labels on hover | Same package, dev-only client script |
| Manifest emitted at build time (block ID → file:line) | `dist/_ml/manifest.json` (per-site) |

This is identical in shape to the Phase 2 plan in `SYSTEM_ADMIN.md`
§8. The difference: it runs in Ken's local dev server, not in a
browser-hosted toolbar over the staging URL. Same code can serve
both surfaces later if we revive the toolbar.

### Layer 3 — staging banner control panel (~2 days)

Replace the static "STAGING" banner on `sustainedoutcomes.mackandlee.com`
with a thin control surface.

| Deliverable | Path |
|---|---|
| Sync status pill — polls GitHub for `staging` HEAD + Workers Builds for last deployed commit. Renders `🟢 In sync` / `🟡 Building` / `🔵 Outdated` / `🔴 Build failed`. Includes a force-refresh button (hard reload + cache bust). | Site layout: `agentsites/clients/sustainedoutcomes/site/src/components/...` |
| `GET /api/sync-status?client=sustainedoutcomes` returning `{ staging_head, deployed_commit, status }` | `admin/functions/api/sync-status.ts` |
| Push Live button — POSTs to admin, triggers `staging → main` merge via GitHub API, returns PR or merge result. Includes confirmation dialog. | `admin/functions/api/push-live.ts` |
| Responsive viewport toggle — icon group (desktop / tablet / mobile) that resizes the body via a wrapper iframe or CSS max-width clamp | Site banner component |

**Sync pill** is "Option A" — status display + manual refresh, **no**
active build trigger. Reasoning: Workers Builds reliably auto-deploys
on `git push staging`; we don't need to manually re-trigger from the
banner. If a build fails, the pill shows red and links to the
Workers Builds log.

### Layer 4 — R2 media MCP for Cursor (~2 days)

Let Ken upload media from his IDE without exposing R2 credentials
on his machine.

| Deliverable | Path |
|---|---|
| Custom MCP server exposing `upload_media(filepath) → url` | `agentsites/packages/ml-media-mcp/` |
| Registered in Ken's `.cursor/mcp.json` | Documented in CLIENT_README |
| Server proxies through `admin.mackandlee.com/api/upload` using a per-client token (one-time install, not in repo) | Same |

Ken says "upload `~/Desktop/foo.jpg`," the MCP calls the admin API,
the admin signs the upload to R2, returns the public `/m/<key>` URL,
the agent pastes the URL into MDX. No API tokens on Ken's machine.

### Layer sequencing rationale

1. **Layer 1 first** — without it, Ken's agent can do damage. Once
   guardrails are in place, the rest can ship in any order.
2. **Layer 2 second** — biggest UX delta vs current state. Replaces
   screenshots, which Ken has explicitly asked for.
3. **Layer 3 third** — staging banner improvements feel polished but
   are not blockers. Ken can use staging fine without the pill.
4. **Layer 4 last** — Ken can paste image URLs manually until then;
   it's a convenience win, not a blocker.

---

## 6. Decisions log

All decisions resolved in the 2026-05-12 walk-through. Where a
decision overrides one in `SYSTEM_ADMIN.md`, the override is noted.

| Topic | Decision | Notes |
|---|---|---|
| Editing surface | **Cursor IDE on client machine, not browser** | Overrides `SYSTEM_ADMIN.md` §4b (Toolbar) and §6 (AI agent) for V1. Long-term spec still targets in-page toolbar for Phase 1+. |
| Client's Cursor plan | **Cursor Pro ($20/mo, client pays)** | Cleaner cost model than M&L absorbing per-token spend. |
| Build platform for SO | **Cloudflare Workers SSR (kept)** | Reverting to static Pages would only save ~$5/mo and lose the snappier-Sync-button benefit. |
| Production branch | **`staging` is the Workers Builds "Production branch" for now** | Misleading terminology — when SO launches we flip "Production branch" to `main`. Documented in `ops/CLOUDFLARE_SETUP.md`. |
| Auto-merge action | **Disabled (renamed `.disabled`)** | Re-enable with a single rename if/when V1.5 brings back chat editing. |
| Embed.js | **Disabled via `PUBLIC_ML_EDIT_ENABLED=false`** | Code still bundles and serves; just not injected. |
| CORS allowlist for admin API | **Includes `.jpielak.workers.dev`** | Required so V1.5 embed pill works from Workers preview URLs. |
| Sync button mechanic | **Option A — status pill + manual refresh, no active build trigger** | Auto-deploys are reliable enough; manual trigger adds complexity for marginal gain. |
| Push Live mechanic | **Whole-site merge `staging → main` via GitHub API** | No per-page promote in V1. |
| Media uploads | **Keep current R2 upload page; add MCP for Cursor** | Phase 2 of `SYSTEM_ADMIN.md` had R2 in the toolbar; V1 splits it: page for browser, MCP for IDE. |
| Responsive preview | **Viewport toggle in staging banner (Layer 3)** | Replaces "open dev tools and resize" workflow. |
| Element labels | **Astro integration + dev-mode overlay in IDE (Layer 2)** | Same underlying mechanism as `SYSTEM_ADMIN.md` §8; different surface. |
| CF project consolidation | **3 projects (was 4)** | Deleted orphan `sustainedoutcomes-staging` Pages project; moved its custom domain to the Worker. |
| `wrangler.jsonc` at SO root | **Deleted — adapter generates `dist/wrangler.json`** | Hand-written file caused build failures (validating `main` field before `astro build` ran). |
| Custom domains | **Tracked via CF dashboard, not in wrangler config** | Workers Builds reads dashboard state, not local config. Documented in `ops/CLOUDFLARE_SETUP.md`. |

---

## 7. Lessons learned (high level)

Operational details live in `ops/CLOUDFLARE_SETUP.md`. Things worth
remembering at the strategy level:

1. **Build time matters as much as agent time.** Any cloud-build
   step (Pages OR Workers Builds) adds 20–90s to the feedback loop.
   No cloud architecture beats local dev server HMR for live editing.
2. **The Cursor cloud agents API forces `cursor/<id>` branches.**
   You cannot make the cloud agent push directly to your existing
   branch — it creates a per-run branch and you reconcile after.
   This is fine for occasional async edits, ugly for live editing.
3. **`@cursor/sdk` does not run in Cloudflare Workers.** Ships
   `sqlite3` + `@connectrpc/connect-node`. Use the REST API directly
   (`api.cursor.com/v1/agents/*`) from Workers.
4. **`crypto.subtle.timingSafeEqual` does not exist in the Workers
   runtime.** Implement constant-time XOR-loop in user code.
5. **Astro 6 + Rolldown + `@tailwindcss/vite` had compatibility
   issues at the time we tested.** We're pinned to Astro 5 in
   `ml-admin` until the Rolldown bug is resolved upstream.
6. **HTML comments get stripped by Astro static-output minification.**
   Use `<!--! ... -->` (preserved-comment syntax) if you need them.
7. **Workers Builds "Production branch" ≠ production.** It just means
   "the branch whose deploys serve the canonical URL." Easy to
   misread when reading `SYSTEM_ADMIN.md` casually.
8. **Cloudflare Pages does not support an `observability` block in
   `wrangler.jsonc`** — that's Workers-only. Will silently fail the
   build.

---

## 8. When to revisit

Revisit this V1 doc when any of these are true:

- We onboard client #2 (the moment one-client economics stop applying).
- Client wants centralized credential management (we can't expect
  every client to install Cursor Pro and manage their own GitHub auth).
- Cursor's cloud agent latency drops below ~10s p50 (changes the math).
- We have a real "live source" rendering option (no build step) on
  Workers — D1 or KV-backed page content, Workers Smart Placement,
  etc. — that beats local HMR for first-time-visit speed.

Until then: this is V1.

---

## 9. References

| Doc | Use |
|---|---|
| `SYSTEM_ADMIN.md` | Long-term spec (Phase 1+, multi-client). Currently superseded by this doc for the near term. |
| `ops/CLOUDFLARE_SETUP.md` | Operational runbook for Workers Builds, Pages, custom domains, env vars. |
| `ARCHITECTURE.md` | Track A stack standard (unchanged by V1 pivot). |
| `ML_ADMIN.md` | Internal M&L team guide (per-client setup checklist updated for V1). |
| `clients/sustainedoutcomes/AGENTS.md` | Client-specific Cursor agent guardrails (to be rewritten in Layer 1). |
| `clients/sustainedoutcomes/CLIENT_README.md` | Client-facing onboarding (to be written in Layer 1). |
| `admin/README.md` | Admin app code-level docs (updated for V1). |

---

## 10. Version history

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-05-12 | Initial V1 spec capturing the SDK-admin pivot. Decision rationale, parked-work inventory, V1 layers, lessons learned. |
