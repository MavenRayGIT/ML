# CURSOR BRIEF — agentsites (product line)

> Entry point for any AI agent working in the `agentsites/` tree.
> Read this first, then route to the right client folder.

---

## What `agentsites/` is

A **product line**: Mack & Lee's AI-driven static-site platform.

Each site:

- Astro + Tailwind CSS v4 + MDX, hosted on **Cloudflare Pages**.
- No CMS, no database. Content is MDX files in the repo.
- Maintained post-launch by a Claude API + n8n pipeline (Track A).
- One Cloudflare Pages project per client; build root is that client's `site/` folder.

This folder holds the **portfolio-level standards** (everything that applies to every client) plus a `clients/` folder where each client lives.

---

## How to use this folder

### If you are working on a specific client

1. Skim this file.
2. Read `AGENTS.md` (portfolio rules — always applies).
3. Read `ARCHITECTURE.md` (Track A stack and workflow).
4. Open the client folder under `clients/<client>/`.
5. Read **that client's** `CURSOR_BRIEF.md` → `HANDOFF.md` → `DESIGN.md` → `MODULES.md`.

The client brief tells you what's built so far, what's next, and any client-specific divergences from the portfolio defaults.

### If you are setting up a new client

1. Read `clients/README.md` for the product-line model and the new-client checklist.
2. Use the existing `clients/sustainedoutcomes/` folder as the reference implementation.
3. Don't extract anything into shared `packages/` until at least two clients need the same thing (see `clients/README.md` → "Extract on second use").

---

## Folder layout

```
agentsites/
├── CURSOR_BRIEF.md           ← this file
├── AGENTS.md                 ← portfolio agent rules (Cursor auto-loads)
├── ARCHITECTURE.md           ← Track A stack + workflow
├── ANALYTICS.md              ← analytics standard (all clients)
├── DEVHANDOFF.md             ← developer-handoff guide template
├── CLIENT_ADMIN.md           ← client-side admin guide template
├── ML_ADMIN.md               ← internal M&L management
├── CHANGE_REQUEST.md         ← change-request system
└── clients/
    ├── README.md             ← how clients are organized + onboarding
    └── sustainedoutcomes/    ← first client (reference implementation)
        ├── CURSOR_BRIEF.md   ← SO-specific entry point
        ├── AGENTS.md         ← SO-specific overrides (Cursor auto-loads)
        ├── HANDOFF.md        ← SO build spec (tokens, components, props)
        ├── DESIGN.md         ← SO design context + Figma reference
        ├── MODULES.md        ← SO module tracker
        ├── README.md         ← how to run the SO site locally
        ├── Welcome-and-Onboarding.md      ← client onboarding (Ken)
        ├── Client-AI-Instructions.md      ← Ken's Claude system prompt
        ├── OLD_*.md          ← archived pre-Track A docs
        └── site/             ← the Astro app (Cloudflare Pages build root)
```

There is **no** `agentsites/packages/` or `agentsites/features/` folder yet, and there should not be one until a second client needs the same module SO already has. See `clients/README.md`.

---

## Non-negotiables (apply to every client)

1. **Read the client's `HANDOFF.md` before writing any code.** Every token, font size, and spacing value is specified there. Do not invent values.
2. **Never hardcode brand colors.** Use the client's design tokens in `src/styles/global.css` (Tailwind v4 `@theme` block).
3. **Never hardcode copy.** All text via component props or MDX content collections.
4. **Build in this order:** tokens → fonts → primitives → layout → sections → pages.
5. **Test each component in isolation** before composing pages.
6. **Responsive verified at 375 / 768 / 1440 px** before handoff. Lighthouse > 90 on mobile.
7. **`main` is protected.** Work on `staging`, PR into `main`. (Set this up per client when their Pages project is wired.)
8. **`agentsites/` markdown does not ship in the site bundle.** Cloudflare Pages root is always a client's `site/` subfolder, never the `agentsites/` tree.

Detailed rules — Figma policy, mockup process, naming, scope rules — are in `AGENTS.md`.

---

## Stack (Track A)

```
Framework:    Astro 6+
Styling:      Tailwind CSS v4 (CSS-based @theme config)
Content:      MDX in src/content/
Hosting:      Cloudflare Pages
Repo:         GitHub (MavenRayGIT/ML); main = prod, staging = preview
Fonts:        Self-hosted woff2 per client
Analytics:    GA4 + GTM + Microsoft Clarity, loaded via @astrojs/partytown
Pipeline:     Claude API + n8n (post-launch content)
Node:         22 (Astro 6 requires >=22.12.0; set NODE_VERSION=22 on Pages)
```

---

## Where to look for context

| Question | File |
|----------|------|
| What's the workflow? Track A vs B? | `ARCHITECTURE.md` |
| What rules do I follow as an agent? | `AGENTS.md` (and the client's `AGENTS.md`) |
| What analytics ship on every site? | `ANALYTICS.md` |
| How does the change-request pipeline work? | `CHANGE_REQUEST.md` |
| How do I onboard a new client? | `clients/README.md` |
| What's the spec for the SO build? | `clients/sustainedoutcomes/HANDOFF.md` |
| What's the current build state for SO? | `clients/sustainedoutcomes/CURSOR_BRIEF.md` |

If a question isn't answered by these docs — **stop and ask**. Do not invent.
