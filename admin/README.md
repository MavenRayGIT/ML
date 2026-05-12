# ml-admin

> Mack & Lee **System Admin** — `admin.mackandlee.com`.
>
> See [`../agentsites/SYSTEM_ADMIN_V1.md`](../agentsites/SYSTEM_ADMIN_V1.md)
> for what we're actually building right now, and
> [`../agentsites/SYSTEM_ADMIN.md`](../agentsites/SYSTEM_ADMIN.md) for
> the long-term Phase 1+ vision. Operational details for Cloudflare
> setup are in [`../agentsites/ops/CLOUDFLARE_SETUP.md`](../agentsites/ops/CLOUDFLARE_SETUP.md).

## Status

**V1 — control panel only.** Dashboard + R2 media upload + auth gate
live. In-browser AI editor (Phase -1 spike) parked after the
~50–100s e2e latency proved unworkable for live editing. Clients
edit in their local Cursor IDE; this app exists to gate the auth,
hold the R2 upload UI, and serve as the API surface for the upcoming
Sync / Push Live buttons that go into the staging-site banner
(Layer 3 of V1).

| Surface | Route | State | Notes |
| --- | --- | --- | --- |
| Admin home | `/` | Live | Site cards dashboard. Static; moves to D1 when multi-client lands. |
| Upload | `/upload`, `POST /api/upload` | Live | Drag-drop multi-file upload to R2. Content-addressed keys, dedupe on repeat, immutable cache headers, image thumbnails + copy-URL button. Site is auto-scoped — `/upload?site=<slug>` from the dashboard; no picker when only one site is in scope. |
| Media serve | `GET /m/<key>` | Live | Public R2 read with `If-None-Match` + Range support. Auth-exempt so URLs paste into client `<img>` tags. |
| Auth | every other route | Live | HTTP Basic Auth via `functions/_middleware.ts`. |
| **Chat (parked)** | `POST /api/chat`, `GET /api/chat/stream` | **Parked under V1** | Code intact. Returns 503 when `CURSOR_API_KEY` env var is unset (recommended). Revival: set the env var + flip `PUBLIC_ML_EDIT_ENABLED=true` on the SO Workers project. |
| **Embed bundle (parked)** | `/embed.js` | **Parked under V1** | Still bundled by `npm run build` and served at this URL. Site-side inclusion is gated by the env var above; under V1 the chat pill is not injected onto staging. |

### V1 sync / push-live API (planned, not built)

These ship in Layer 3 of `SYSTEM_ADMIN_V1.md`:

- `GET  /api/sync-status?client=<slug>` — returns `{ staging_head, deployed_commit, status }` from a GitHub + CF dashboard poll.
- `POST /api/push-live` — merges `staging → main` on the client's repo via GitHub API.

The endpoints will use the same basic-auth middleware as the
existing routes.

## Parked: in-browser AI editor (Phase -1 spike)

Built end-to-end, works, paused. The decision rationale lives in
`SYSTEM_ADMIN_V1.md` §1. Code inventory:

| File / route | What it does | Status |
| --- | --- | --- |
| `functions/api/chat.ts` | POST: creates a Cursor cloud agent on the client's repo `staging` branch, returns SSE stream URL | Live route, callers removed |
| `functions/api/chat/stream.ts` | GET: SSE relay from `api.cursor.com` | Live route, callers removed |
| `src/lib/cursor.ts` | Cursor REST client (REST, not `@cursor/sdk` — SDK won't run on Workers) | Compiled, imported only by `api/chat.ts` |
| `src/lib/system-prompt.ts` | Client-facing system prompt for the Cursor agent | Same |
| `src/lib/cors.ts` | CORS allowlist (`.jpielak.workers.dev`, `.pages.dev`) | **Still active** — covers upload preflights from any future browser surface |
| `src/embed/index.ts`, `src/embed/styles.ts` | Embed bundle: chat pill UI, Shadow DOM, postMessage glue | Compiled to `dist/embed.js` on every build |
| `public/embed.js` URL → static `embed.js.map` | Served from admin domain | URL live; not injected by V1 sites |
| `.github/workflows/auto-merge-cursor-to-staging.yml.disabled` (repo root) | Auto-merge `cursor/**` agent branches into `staging` | Renamed to `.disabled` so GitHub Actions ignores it. Rename back to `.yml` to revive. |

**To re-enable the chat editor:**

1. Set `CURSOR_API_KEY` (secret) on the `ml-admin` Pages project (both Production and Preview envs).
2. Set `PUBLIC_ML_EDIT_ENABLED=true` on the `ml-sustainedoutcomes` Workers project (both envs). Trigger a redeploy.
3. Rename `.github/workflows/auto-merge-cursor-to-staging.yml.disabled` → `.yml`.

No code changes needed. ~5-minute revival.

**To delete the parked code entirely** (only when we're sure we
won't revisit): see commit `555621c` ("ops: disable auto-merge
cursor-to-staging action (V1 pivot)") for the file list to remove.

## Stack

- **Astro 5** (pinned, Rolldown+Tailwind v4 incompatibility in Astro 6 — see ops runbook gotcha #6).
- **Tailwind v4** via `@tailwindcss/vite` — admin palette only (deliberately
  not branded; see [`../agentsites/SYSTEM_ADMIN.md`](../agentsites/SYSTEM_ADMIN.md) §3a).
- **Cloudflare Pages** — `wrangler.jsonc` points the project at `dist/`.
- **Pages Functions** for the basic-auth middleware (no full Worker needed).
- **`esbuild` 0.28+** bundles `src/embed/index.ts` to `dist/embed.js` during build.

## Repo layout

```
admin/
├─ astro.config.mjs
├─ wrangler.jsonc                  # NO observability block — Pages rejects it
├─ functions/                      # Pages Functions — bundled by wrangler at deploy
│  ├─ _middleware.ts               # HTTP Basic Auth; auth-exempt: /m/*, /embed.js*, OPTIONS preflights
│  ├─ api/
│  │  ├─ chat.ts                   # POST: create agent / start run        [PARKED]
│  │  ├─ chat/
│  │  │  └─ stream.ts              # GET: relay upstream SSE               [PARKED]
│  │  └─ upload.ts                 # POST: multipart → R2 PUT → public URL
│  └─ m/
│     └─ [[path]].ts               # GET: stream R2 object, ETag + Range
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ layouts/
   │  └─ Base.astro
   ├─ lib/
   │  ├─ clients.ts                # Static client registry; moves to D1 when multi-client lands
   │  ├─ cors.ts                   # CORS allowlist
   │  ├─ cursor.ts                 # Cursor REST client                    [PARKED — only imported by chat.ts]
   │  ├─ media.ts                  # MIME → category/extension, hash, key builder
   │  └─ system-prompt.ts          # First-turn context blob               [PARKED]
   ├─ embed/                       # [PARKED] — still bundled but not injected by sites under V1
   │  ├─ index.ts                  # Chat pill UI; Shadow DOM; postMessage glue
   │  └─ styles.ts                 # Pill styles
   ├─ pages/
   │  ├─ index.astro               # Dashboard
   │  └─ upload.astro              # /upload UI
   └─ styles/
      └─ global.css
```

Note: `src/components/ChatPanel.astro`, `src/components/StagingIframe.astro`,
and `src/pages/edit/[client].astro` from Phase -1 have been removed.
Their replacement under V1 is "no in-browser editor at all" — Cursor
IDE on the client machine does that job (`SYSTEM_ADMIN_V1.md` §2).

## Local development

```bash
npm install

# Copy the local-secrets template and set a dev password.
cp .dev.vars.example .dev.vars

# Astro dev server (no auth, hot reload). Use this for UI iteration.
npm run dev

# Or: full Pages emulation (Astro static build + functions middleware).
npm run build && npx wrangler pages dev dist
```

The Astro dev server (`npm run dev`) bypasses Pages Functions, so the basic-auth
middleware is **not** in the loop. To exercise the auth gate locally, use
`wrangler pages dev dist` against the built output.

## Deployment

```bash
npm run build      # astro build + bundles dist/embed.js + copies functions/ into dist/
npm run deploy     # wrangler pages deploy dist --project-name=ml-admin
```

In practice we deploy via **Cloudflare Pages Git integration** —
push to `staging` and the production branch triggers a Pages build
automatically. Manual `wrangler pages deploy` is only used for
out-of-band fixes.

Before the first deploy:

1. Create the Pages project and the R2 bucket:
   ```bash
   npx wrangler pages project create ml-admin
   npx wrangler r2 bucket create ml-media
   ```
2. Set environment variables / secrets on the project (Cloudflare dashboard →
   **Workers & Pages → ml-admin → Settings → Variables and Secrets**).
   **Set them on BOTH Production and Preview environments** — see
   `agentsites/ops/CLOUDFLARE_SETUP.md` §5 for why.
   - `BASIC_AUTH_USER` — admin user (env var)
   - `BASIC_AUTH_PASS` — admin password (secret)
   - `CURSOR_API_KEY` — Cursor cloud-agents API key (secret). **Under V1, leave this unset** so `/api/chat` 503s instead of accidentally billing Cursor.

   `BASIC_AUTH_*` missing → the middleware returns HTTP 503 (fail-closed).
   `CURSOR_API_KEY` missing → `/api/chat` returns HTTP 503 (intended under V1).
   `MEDIA` R2 binding missing → `/api/upload` returns HTTP 503.
   The rest of the site keeps working in each case.
3. After the first successful deploy, attach the custom domain
   `admin.mackandlee.com` in the dashboard.

### Why /m/ is auth-exempt

Media URLs are designed to be pasteable into client `<img src>` tags and
MDX bodies; gating them behind admin auth would make them useless. The
bucket itself stays private — the only path in is the function, and keys
are content-hashed (16 hex chars) so enumerating someone else's media is
computationally infeasible. When media moves to a dedicated host
(`media.mackandlee.com` or per-client), drop the prefix from
`PUBLIC_PREFIXES` in `functions/_middleware.ts` and the admin domain stops
serving media.

## Auth swap path (long-term, Phase 0+)

The current `functions/_middleware.ts` is a deploy-time stand-in for the
"basic auth via Cloudflare Access policy in single-password mode" called out
in `SYSTEM_ADMIN.md` §16 Phase -1. When Phase 0 lands the real auth:

1. Create a Cloudflare Access application covering `admin.mackandlee.com` and
   `*.mackandlee.com` (§5 of `SYSTEM_ADMIN.md`).
2. Configure email-OTP and (optionally) Google OAuth identity providers.
3. **Delete `functions/_middleware.ts`** — Access intercepts requests before
   they reach the function pipeline, so the basic-auth gate becomes redundant.
4. Replace the static `src/lib/clients.ts` with reads from the D1 `identity_map`
   and per-client tables.

## Next steps (V1)

Per `SYSTEM_ADMIN_V1.md` §5 Layer 3:

1. **`GET /api/sync-status?client=<slug>`** — poll GitHub for `staging` HEAD,
   Workers Builds API for the last deployed commit on the target Worker. Return
   `{ staging_head, deployed_commit, status: 'in_sync' | 'building' | 'outdated' | 'failed' }`.
2. **`POST /api/push-live`** — open a `staging → main` PR (or fast-forward if
   the diff is clean) via GitHub API, return the PR URL or merge result.
3. **Both endpoints behind basic auth.** No new auth surface.
4. **D1 (optional)** — if we want to log Sync polls or Push-Live events for
   audit, add a small D1 table. Optional for V1.

Layer 4 (R2 media MCP for Cursor) reuses `/api/upload` — no admin-app
changes needed beyond accepting an auth header from the MCP server.

## What this app explicitly does **not** do

- **Edit client codebases at runtime.** Under V1, edits happen in
  Ken's local Cursor IDE. The admin app never runs Cursor against
  the repo.
- **Inject anything into client codebases at build time.** The
  Astro integration that adds `data-ml-block` attributes lives in
  `agentsites/packages/ml-edit-integration/` (Layer 2 of
  `SYSTEM_ADMIN_V1.md`), not here.
- **Carry production credentials in source.** All secrets via Pages
  env vars (production) or `.dev.vars` (local).
