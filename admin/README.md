# ml-admin

> Mack & Lee **System Admin** — `admin.mackandlee.com`.
> Phase -1 shell per [`SYSTEM_ADMIN.md`](../ML/agentsites/SYSTEM_ADMIN.md) §16.

## Status

**Phase -1 — shell + Cursor agent chat + R2 media live.** No D1 yet; per-client
quotas, audit log, and the marker-commit publish gate land in Phase 0.

| Surface | Route | Phase -1 behavior |
| --- | --- | --- |
| Admin home | `/` | Static site cards (Sustained Outcomes seeded). Ready-to-publish + new-page-request slots wired to `src/lib/clients.ts`. |
| Editor | `/edit/<client>` | Chat panel (live Cursor cloud agent) + staging iframe split. AgentId persisted in localStorage. |
| Chat backend | `POST /api/chat`, `GET /api/chat/stream` | First message creates a cloud agent on the client's repo `staging` branch; follow-ups create new runs against the same agent. SSE relayed end-to-end. |
| Upload | `/upload`, `POST /api/upload` | Drag-drop multi-file upload to R2. Content-addressed keys, dedupe on repeat, immutable cache headers, image thumbnails + copy-URL button. Site is auto-scoped — `/upload?site=<slug>` from the editor; no picker when only one site is in scope. |
| Media serve | `GET /m/<key>` | Public R2 read with `If-None-Match` + Range support. Auth-exempt so URLs paste into client `<img>` tags. |
| Auth | every other route | HTTP Basic Auth via `functions/_middleware.ts`. |

### Cursor agent: branch & visibility gap

The cloud-agents REST API only lets you push directly to an existing head
branch when you pass an existing `prUrl`. For Phase -1 we start the agent
from `staging` with `autoCreatePR: false` and let it create its own
`cursor/edit-…` branch per agent. **The iframe still points at the
staging URL**, so edits don't show in the live preview until that branch
is merged. Two clean closures (pick one before pilot start):

1. **Per-branch preview URL in the iframe.** Cloudflare Pages branch
   deploys produce a stable preview URL per branch; surface it back from
   `POST /api/chat` and swap the iframe `src` when the agent reports a
   branch name.
2. **Auto-merge to staging at run end.** Listen for `result` with
   `status: FINISHED`, fast-forward `staging` to the cursor branch via
   GitHub API. Pilot pacing tolerates the ~30s Pages rebuild.

The chat code is structured so either path drops in around the existing
endpoint; `POST /api/chat` already returns `branchName` for the first
turn.

## Stack

- **Astro 6** — static output. No adapter yet; switches to `@astrojs/cloudflare`
  with `output: "server"` once Cursor SDK needs server endpoints.
- **Tailwind v4** via `@tailwindcss/vite` — admin palette only (deliberately
  not branded; see [`SYSTEM_ADMIN.md`](../ML/agentsites/SYSTEM_ADMIN.md) §3a).
- **Cloudflare Pages** — `wrangler.jsonc` points the project at `dist/`.
- **Pages Functions** for the basic-auth middleware (no full Worker needed).

## Repo layout

```
ml-admin/
├─ astro.config.mjs
├─ wrangler.jsonc
├─ functions/                  # Pages Functions — bundled by wrangler at deploy
│  ├─ _middleware.ts           # HTTP Basic Auth (auth-exempt: /m/*)
│  ├─ api/
│  │  ├─ chat.ts               # POST: create agent / start run
│  │  ├─ chat/
│  │  │  └─ stream.ts          # GET: relay upstream SSE
│  │  └─ upload.ts             # POST: multipart → R2 PUT → public URL
│  └─ m/
│     └─ [[path]].ts           # GET: stream R2 object, ETag + Range
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ components/
   │  ├─ ChatPanel.astro       # POSTs /api/chat, EventSource → /api/chat/stream
   │  └─ StagingIframe.astro
   ├─ layouts/
   │  └─ Base.astro
   ├─ lib/
   │  ├─ clients.ts            # Static client registry; moves to D1 in Phase 0
   │  ├─ cursor.ts             # Cursor REST client (REST, not @cursor/sdk)
   │  ├─ media.ts              # MIME → category/extension, hash, key builder
   │  └─ system-prompt.ts      # First-turn context blob
   ├─ pages/
   │  ├─ index.astro
   │  ├─ edit/[client].astro
   │  └─ upload.astro
   └─ styles/
      └─ global.css
```

The chat module talks to `https://api.cursor.com/v1/agents/*` directly
because the official `@cursor/sdk` ships `sqlite3` + `@connectrpc/connect-node`
and won't run in the Workers runtime. See `src/lib/cursor.ts` header for
the swap path if/when an SDK build targets Workers.

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
npm run build      # astro build + copies functions/ into dist/
npm run deploy     # wrangler pages deploy dist --project-name=ml-admin
```

Before the first deploy:

1. Create the Pages project and the R2 bucket:
   ```bash
   npx wrangler pages project create ml-admin
   npx wrangler r2 bucket create ml-media
   ```
2. Set environment variables / secrets on the project (Cloudflare dashboard →
   **Workers & Pages → ml-admin → Settings → Variables and Secrets**):
   - `BASIC_AUTH_USER` — admin user (env var)
   - `BASIC_AUTH_PASS` — admin password (secret)
   - `CURSOR_API_KEY` — Cursor cloud-agents API key (secret)

   `BASIC_AUTH_*` missing → the middleware returns HTTP 503 (fail-closed).
   `CURSOR_API_KEY` missing → `/api/chat` returns HTTP 503.
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

## Auth swap path (Phase 0)

The current `functions/_middleware.ts` is a deploy-time stand-in for the
"basic auth via Cloudflare Access policy in single-password mode" called out
in `SYSTEM_ADMIN.md` §16 Phase -1. When Phase 0 lands the real auth:

1. Create a Cloudflare Access application covering `admin.mackandlee.com` and
   `*.mackandlee.com` (§5).
2. Configure email-OTP and (optionally) Google OAuth identity providers.
3. **Delete `functions/_middleware.ts`** — Access intercepts requests before
   they reach the function pipeline, so the basic-auth gate becomes redundant.
4. Replace the static `src/lib/clients.ts` with reads from the D1 `identity_map`
   and per-client tables (§5, §10).

## Next steps (in order)

1. **Close the iframe-visibility gap.** Pick one of the two paths in the
   "Cursor agent: branch & visibility gap" section above.
2. **Identity + role-gated site picker** (§5). Phase 0 lands `identity_map`
   in D1: a `client-editor` can write to the sites their email is mapped to;
   `ml-admin` writes to all. Today the upload page renders no picker when
   only one site is in scope and locks via `?site=<slug>` from the editor —
   the same UI just gets driven by the role filter once identity exists.
   Now is also the moment to rename `clients.ts` → `sites.ts` and split out
   a separate `Client` record (a client owns one or more sites).
3. **Marker-commit publish detection** (§9a). GitHub webhook → Pages Function
   → D1 `publish_requests`. Surface on the admin home card.
4. **New Page Request intake** (§7g). One D1 table, one card on the home page,
   one prompt blob added to the chat system prompt.
5. **Cost caps + audit log** (§6). Listen to `result` events, record per-run
   spend in D1, enforce per-conversation and per-client caps.
6. **Media follow-ups** (§10):
   - Bunny Stream for video uploads (Phase 2).
   - HEIC server-side conversion (Phase 3).
   - Per-client media quotas via D1 `client_media_config` (Phase 0).
   - Move serving to a dedicated `media.*` domain.

## What this app explicitly does **not** do

- Inject anything into client codebases. The toolbar embed ships in Phase 1
  (§4b, §12), not here.
- Touch any client's source repo directly from the static build — repo writes
  happen through the Cursor SDK once it's wired.
- Carry production credentials in source. All secrets via Pages env vars
  (production) or `.dev.vars` (local).
