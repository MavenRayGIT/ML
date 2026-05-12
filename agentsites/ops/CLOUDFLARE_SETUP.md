# CLOUDFLARE SETUP — Operational Runbook

> Everything we learned the hard way standing up `ml-admin` (Pages)
> and `ml-sustainedoutcomes` (Workers SSR) during the V1 spike.
>
> **Audience:** M&L team or any future agent setting up a new
> Cloudflare project for an M&L client site.
>
> **Read alongside:** `SYSTEM_ADMIN_V1.md` (V1 plan),
> `SYSTEM_ADMIN.md` (long-term spec), `ARCHITECTURE.md` (Track A
> stack).

---

## 1. Project inventory (current state, 2026-05-12)

| Project | Type | Branch (canonical URL) | Custom domain | Purpose |
|---|---|---|---|---|
| `ml-admin` | Pages | `staging` | `admin.mackandlee.com` | Admin dashboard + R2 upload + auth gate |
| `ml-sustainedoutcomes` | Workers | `staging` | `sustainedoutcomes.mackandlee.com` | SO staging (SSR) |
| `sustainedoutcomes-prod` | Pages | `main` | (placeholder, TBD) | SO production — kept until SO launches with real client domain |

**Account-scoped Worker hostname:** `*.jpielak.workers.dev`. Branch
previews on the Worker project follow the pattern
`<branch-slug>-ml-sustainedoutcomes.jpielak.workers.dev`.

---

## 2. Setting up a new SSR site (Workers)

For when we onboard a client onto the SSR/Workers stack. Use SO's
setup as the template.

### 2a. Astro side

In the site's directory (`agentsites/clients/<client>/site/`):

```bash
npm install @astrojs/cloudflare wrangler
```

`astro.config.mjs`:

```js
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    // adapter generates dist/wrangler.json on every build
  }),
  // ...
});
```

`src/middleware.ts` for SSR cache control:

```ts
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();
  // tune per site; sensible default for marketing pages:
  response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=300');
  return response;
};
```

Prerender static-friendly routes:

```ts
// src/pages/blog/[...slug].astro
export const prerender = true;
```

Add to `.gitignore`:

```
.wrangler/
```

**Do NOT** create a hand-written `wrangler.jsonc` at the site root.
The adapter generates `dist/wrangler.json` at build time. A
hand-written file at the root causes Workers Builds to validate the
`main` field before `astro build` runs, and the file it references
(`dist/server/entry.mjs`) doesn't exist yet → build fails.

### 2b. Cloudflare side

1. **Cloudflare dashboard → Workers & Pages → Create application →
   Workers → Import a repository.**
2. Pick the repo (`MavenRayGIT/ML`).
3. Configure the build:
   - **Root directory:** `agentsites/clients/<client>/site/`
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy`
   - **Production branch:** the branch whose deploys serve the
     canonical Worker URL. **For V1 SO this is `staging`** because
     `sustainedoutcomes.mackandlee.com` is our staging URL. When SO
     launches with its own domain, flip this to `main`.
   - **Node version:** `22` (Astro 6 requires >=22.12.0)
4. Save and run the first build.
5. After the first successful build, attach the staging custom
   domain via **Workers & Pages → `<project>` → Settings → Domains
   & Routes → Add custom domain**.

### 2c. "Production branch" terminology — read this carefully

In Workers Builds, "Production branch" means **the branch whose
deploys serve the canonical Worker URL** (e.g.
`<project>.<account>.workers.dev`) and any custom domains attached
to the production environment. It does **not** mean "this branch is
literally production traffic."

For V1 SO:

- `staging` is the Workers Builds "Production branch"
- `sustainedoutcomes.mackandlee.com` (staging URL) is attached to it
- This is correct because staging is our only deploy target for now

When SO launches with a real client domain:

- Flip "Production branch" to `main`
- Attach the client's real domain to the `main` (production) deploy
- Move `sustainedoutcomes.mackandlee.com` to a `staging` preview
  environment on the same Worker (Workers Builds supports
  per-branch environments)

---

## 3. Setting up a new admin/dashboard site (Pages + Functions)

`ml-admin` uses Cloudflare Pages (static) with Pages Functions for
the backend. Use its setup as the template.

### 3a. Astro side

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  vite: { plugins: [tailwindcss()] },
  // NO adapter
});
```

`wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "ml-admin",
  "compatibility_date": "2025-09-01",
  "pages_build_output_dir": "./dist",
  "vars": {
    /* env vars at deploy time */
  },
  "r2_buckets": [
    { "binding": "MEDIA", "bucket_name": "ml-media" }
  ]
  /* NO observability block — Pages doesn't support it (Workers-only) */
}
```

**Things to NOT put in `wrangler.jsonc` for a Pages project:**

- `observability` block — Pages projects reject it at validation, will
  fail the deploy with `Configuration file for Pages projects does
  not support "observability"`.
- `main` field — Pages doesn't use it.
- `routes` — custom domains are configured in the dashboard.

`functions/_middleware.ts` for HTTP Basic Auth:

```ts
export const onRequest: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const path = url.pathname;

  if (PUBLIC_EXACT.includes(path)) return ctx.next();
  if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) return ctx.next();
  if (ctx.request.method === 'OPTIONS') return ctx.next();

  const user = ctx.env.BASIC_AUTH_USER;
  const pass = ctx.env.BASIC_AUTH_PASS;
  if (!user || !pass) {
    return new Response('Admin auth not configured.', { status: 503 });
  }
  // ... constant-time compare and return 401 on mismatch
};
```

**Gotcha:** `crypto.subtle.timingSafeEqual` does not exist in the
Workers runtime. Implement a manual constant-time XOR-loop comparison
to avoid timing attacks. Do **not** use `===`.

### 3b. Cloudflare side

1. **Cloudflare dashboard → Workers & Pages → Create application →
   Pages → Connect to Git.**
2. Pick the repo, configure:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `admin/`
   - **Node version env var:** `NODE_VERSION=22`
3. Set environment variables (in the dashboard, both Production AND
   Preview environments — that bit cost us an hour):
   - `BASIC_AUTH_USER` (variable)
   - `BASIC_AUTH_PASS` (secret)
   - `CURSOR_API_KEY` (secret — only if chat endpoints in use; V1
     should leave this unset)
4. Create R2 bucket if not already:
   ```bash
   npx wrangler r2 bucket create ml-media
   ```
   Then bind it in `wrangler.jsonc` under `r2_buckets`.
5. Trigger a fresh deploy after env vars are set (they don't apply
   to existing builds).
6. After the first successful deploy, attach the custom domain
   `admin.mackandlee.com`.

---

## 4. Custom domains

### Workers projects (e.g. `ml-sustainedoutcomes`)

**Add custom domains via the Cloudflare dashboard, not in
`wrangler.jsonc`.**

- **Cloudflare dashboard → Workers & Pages → `<project>` → Settings →
  Domains & Routes → Add → Custom domain.**
- DNS is automatic if the apex zone is on Cloudflare.
- Workers Builds preserves dashboard-attached domains across deploys.
  The deploy step uploads a new Worker version; the routes (domains)
  are attached to the Worker, not the version.

**Why not in `wrangler.jsonc`:** the `routes` field is for
`wrangler deploy` CLI workflows, where the CLI overwrites the
Worker's routes from local config on every run. We don't use that —
we use Workers Builds (git-triggered CI). Dashboard domains and
local config are independent. Adding `routes` to wrangler config
would risk a future build error (the `@astrojs/cloudflare` adapter
generates its own `dist/wrangler.json`; merging a hand-written root
config is finicky).

CF dashboard sometimes shows a banner "add this domain to your
wrangler config." Safe to ignore for our flow.

### Pages projects (e.g. `ml-admin`)

Same — **add via dashboard**, under **Pages → `<project>` →
Custom domains**. Pages projects don't use a `routes` field in
config anyway.

---

## 5. Environment variables

### Pages project env var locations matter

Cloudflare Pages distinguishes between:

- **Production** env vars — applied to `main` (or whatever the
  Production branch is) builds.
- **Preview** env vars — applied to every other branch's build
  preview.

**You usually want both.** If you only set Production, branch
preview builds will be missing the value, which produces fun
behaviors like "the basic-auth middleware returns 503 only on
preview URLs." We hit this and lost an hour. Set both.

### Workers project env vars

Same dichotomy: **Production** and **Preview**. Same advice — set
both unless you have a specific reason not to.

`wrangler.jsonc` `vars` block is the non-secret default. Anything
secret (API keys, passwords) → set via dashboard as **Secrets**,
not as plain `vars`.

### Variables in use today

`ml-admin` (Pages):

| Name | Type | Used by |
|---|---|---|
| `BASIC_AUTH_USER` | var | `functions/_middleware.ts` |
| `BASIC_AUTH_PASS` | secret | `functions/_middleware.ts` |
| `CURSOR_API_KEY` | secret | `functions/api/chat.ts` (parked under V1; remove if not needed) |

`ml-sustainedoutcomes` (Workers):

| Name | Type | Used by |
|---|---|---|
| `PUBLIC_ML_EDIT_ENABLED` | var | Site `Page.astro` — gates chat-pill inclusion. Set to `false` in V1. |
| `PUBLIC_ML_ADMIN_ORIGIN` | var | Same — origin the chat pill calls (`https://admin.mackandlee.com`). |

R2 bucket bindings:

| Project | Binding | Bucket |
|---|---|---|
| `ml-admin` | `MEDIA` | `ml-media` |

---

## 6. Branch-preview URLs

Workers Builds and Pages both create preview URLs for non-production
branches:

| Platform | Pattern |
|---|---|
| Pages | `<branch-slug>.<project>.pages.dev` (e.g. `staging.ml-admin.pages.dev`) |
| Workers | `<branch-slug>-<project>.<account>.workers.dev` (e.g. `staging-ml-sustainedoutcomes.jpielak.workers.dev`) |

The Workers URL pattern is **account-scoped**: another CF account
would have a different subdomain. Our CORS allowlist on the admin
API uses `.jpielak.workers.dev` suffix-match, which is safe-ish
because it's account-scoped. If we move CF accounts, that suffix
needs to change.

**Pitfall:** the canonical URL (`<project>.<account>.workers.dev`)
sometimes serves a stale deployment even after a fresh push to the
production branch. We hit this multiple times during the SSR
migration spike. Workarounds:

- Hard-refresh with cache disabled.
- Check the **Deployments** tab in the dashboard to confirm the
  most recent deploy was successful AND is the "Production" deploy
  (not a preview).
- Use the per-deployment URL (a long unique ID in the deployments
  list) as the source of truth when verifying a fresh build.

---

## 7. Gotchas — the full list

In rough order of how much time each one cost us:

| # | Gotcha | Fix |
|---|---|---|
| 1 | Pages env vars set on Production only → preview builds broken | Set on both Production and Preview environments |
| 2 | Pages rejects `observability` block in `wrangler.jsonc` | Remove the block; it's Workers-only |
| 3 | Hand-written `wrangler.jsonc` at SSR site root → build fails because `main` field references a not-yet-built file | Delete it; let the `@astrojs/cloudflare` adapter generate `dist/wrangler.json` |
| 4 | `astro check` hangs forever in some environments | Skip it; rely on `astro build` for type errors |
| 5 | esbuild peer-dep conflict between Vite 8 / `@tailwindcss/vite` / Astro 6 (Rolldown) | Pin `esbuild` to `^0.28.0` |
| 6 | Astro 6 Rolldown not compatible with `@tailwindcss/vite` (specific bug) | Downgrade to Astro 5 in `ml-admin` until upstream fixes; SSR SO site is on Astro 6 because we needed the cloudflare adapter |
| 7 | `crypto.subtle.timingSafeEqual` doesn't exist on Workers runtime | Manual constant-time XOR-loop |
| 8 | Workers project "Production branch" defaulted to `main`, served wrong content | Change to `staging` (or whichever branch is canonical for that surface) under Settings |
| 9 | Stale Workers preview aliases serving old content | Use the canonical URL (bare `<project>.<account>.workers.dev`) and the deployments list; ignore old `<branch>-<project>...` URLs |
| 10 | Astro static output strips ordinary HTML comments during minification | Use `<!--! preserved-comment -->` syntax if you need a comment in output |
| 11 | `wrangler pages dev` permission errors in sandboxed contexts | Run with elevated permissions outside sandbox |
| 12 | `@cursor/sdk` ships `sqlite3` + `@connectrpc/connect-node`, won't run on Workers | Use the REST API directly (`api.cursor.com/v1/agents/*`) |
| 13 | Cursor cloud agent forces commits to `cursor/<id>` branches; not configurable | Either auto-merge them into target branch (we did this, now disabled) or accept the per-run branch |
| 14 | R2 bucket declared in `wrangler.jsonc` but not actually created → deploy fails with "R2 bucket 'ml-media' not found" | Create the bucket before deploy: `npx wrangler r2 bucket create <name>` |
| 15 | Embed.js from admin domain → cross-origin to client site → fetch fails | CORS allowlist `.jpielak.workers.dev` (or actual client domains) in `src/lib/cors.ts` |

---

## 8. Migration playbook: SO launch (future)

When Sustained Outcomes is ready to go live with a real client
domain (e.g. `sustainedoutcomes.com`), do this checklist:

1. **Verify staging Worker is healthy.** Click through every page
   on `sustainedoutcomes.mackandlee.com`. Check no SSR-specific
   issues.
2. **Configure the Worker for two branch environments:**
   - Production branch → `main`. Attach client's real domain.
   - Preview branch → `staging`. Reattach
     `sustainedoutcomes.mackandlee.com` here.
3. **Test prod branch with a placeholder push to `main`.** Verify
   it builds and serves at the new client domain (DNS preflight).
4. **Decommission `sustainedoutcomes-prod` Pages project** once the
   Worker is serving the real domain successfully:
   - Remove its custom domain (if it has one)
   - Delete the project
5. **Update `agentsites/clients/sustainedoutcomes/CURSOR_BRIEF.md`**
   to reflect the new prod URL.
6. **Update this runbook** with the final URL structure.

---

## 9. Things we did NOT do (and why)

- **Did not migrate `ml-admin` to Workers.** Pages + Functions is
  simpler for a small admin app. No reason to migrate unless we
  hit a Pages-specific limitation.
- **Did not use Cloudflare Access yet.** V1 keeps HTTP Basic Auth
  on `admin.mackandlee.com`. Access lands in Phase 0 of the
  long-term spec when we add multi-user identity.
- **Did not consolidate to a single Worker for staging + prod.**
  Deferred until SO launches. The benefit (consistency) doesn't
  outweigh the migration cost while prod is still placeholder.
- **Did not use Cloudflare Smart Placement.** Default placement is
  fine for our latency profile (US-based clients, US-based CF data
  centers).

---

## 10. Version history

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-05-12 | Initial runbook capturing everything learned during the V1 spike. SSR migration of SO site, ml-admin standup, CF dashboard quirks, env var pitfalls. |
