# clients/

One folder per Mack & Lee Track A client. Each folder is a **complete, self-contained** site project: docs, design context, module tracker, and the Astro app.

---

## Current clients

| Folder | Status | Production URL | Staging URL |
|--------|--------|----------------|-------------|
| `sustainedoutcomes/` | Build phase | `sustainedoutcomes.com` (not yet pointed) | `sustained-outcomes.mackandlee.com` |

When a new client is onboarded, add a row here.

---

## What lives in each client folder

```
clients/<client>/
├── CURSOR_BRIEF.md           ← client-specific entry point (current state, build phase)
├── AGENTS.md                 ← client-specific agent overrides (Cursor auto-loads)
├── HANDOFF.md                ← build spec: Figma → Astro components, tokens, props
├── DESIGN.md                 ← design context: Figma URL, brand tokens, page targets
├── MODULES.md                ← module tracker (planned / in-progress / done)
├── README.md                 ← how to run the site locally
├── Welcome-and-Onboarding.md ← client-facing onboarding (one per client, names them)
├── Client-AI-Instructions.md ← system prompt for the client's Claude project
└── site/                     ← the Astro app (Cloudflare Pages build root)
```

Optional, only if needed:

- `OLD_*.md` — archived earlier-track docs (e.g. pre-Track A wireframe notes).
- Client-specific assets, copy decks, content inventories.

---

## Onboarding a new client

Until we build a CLI for this, do it by hand:

1. **Decide track.** Track A (Astro + Cloudflare + Claude pipeline) is the default. Confirm in the project AGENTS.md.
2. **Create the folder.** `cp -r clients/sustainedoutcomes clients/<newclient>` (then delete what's SO-specific from the docs and start filling in).
3. **Scaffold the Astro app.** Inside `clients/<newclient>/site/`:
   ```bash
   npm create astro@latest . -- --template minimal --install --no-git --typescript strict
   npx astro add tailwind mdx partytown --yes
   ```
4. **Configure Cloudflare Pages.** Create a **new** Pages project (one per client). Settings:
   - Root directory: `agentsites/clients/<newclient>/site`
   - Build command: `npm run build`
   - Output: `dist`
   - `NODE_VERSION=22`
5. **DNS.** Until the client owns their domain, attach a `<client>.mackandlee.com` subdomain to the Pages project as staging.
6. **Write `HANDOFF.md`.** Tokens, type scale, component map, build order. Use SO's `HANDOFF.md` as the structural template — but **never** copy SO's tokens or brand values.
7. **Fill in `DESIGN.md`, `MODULES.md`, `Welcome-and-Onboarding.md`.**
8. **Open a fresh Cursor thread** and point it at the new client's `CURSOR_BRIEF.md`.

---

## Sharing code between clients — "Extract on second use"

The rule:

- **First client builds it locally** inside `clients/<client>/site/src/`.
- **Second client needs the same thing** → extract it into `agentsites/packages/<name>/`, then refactor the first client to consume it.
- **Third client onward** → it's a real shared package. Harden its API. Document its options.

This avoids the most common monorepo failure mode: a `packages/` folder full of "almost-generic" code shaped only by the first consumer.

**Concretely**, this means:

- For SO right now, **everything** lives inside `clients/sustainedoutcomes/site/`. There is no shared package layer.
- When the second client signs and needs (say) a blog with the same shape as SO's blog, that's the moment we create `agentsites/packages/blog/` and refactor.
- Don't speculate. Don't pre-extract.

---

## Per-client configuration (when shared packages exist)

When we eventually have shared `features` or `packages`, each client will get a `site.config.ts` at the root of their `site/` folder. Example shape:

```ts
// agentsites/clients/<client>/site/site.config.ts
export default {
  client: 'sustainedoutcomes',
  theme: () => import('./src/styles/theme'),
  features: {
    blog:            { enabled: true, postsPerPage: 10 },
    trafficDashboard:{ enabled: false },
    leadCapture:     { enabled: false },
  },
};
```

This file does **not** exist yet — there's nothing to configure. It's noted here so when extraction happens, we have a known target shape.

---

## What does NOT live in `clients/`

- Cross-client conventions, agent rules, analytics standard, change-request system → in `agentsites/` directly.
- M&L-wide design library, naming conventions, templates → at the repo root in `library/` and `templates/`.
- Shared code (when it exists) → `agentsites/packages/`.

If you find yourself copying the same paragraph into two client briefs, it probably belongs in `agentsites/AGENTS.md` or `agentsites/ARCHITECTURE.md` instead.
