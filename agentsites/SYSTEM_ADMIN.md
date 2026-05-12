# SYSTEM ADMIN — Mack & Lee
> Specification for the M&L multi-tenant admin app (`admin.mackandlee.com`)
> and the in-page client toolbar.
> Version: 1.3 — Phase -1 spike completed; SDK-admin model superseded
> for the near term by `SYSTEM_ADMIN_V1.md` (2026-05-12 pivot).
> Read alongside `SYSTEM_ADMIN_V1.md` (what we're actually building
> now), `ops/CLOUDFLARE_SETUP.md` (operational runbook),
> `ARCHITECTURE.md`, `CHANGE_REQUEST.md`, `ML_ADMIN.md`, and
> `CLIENT_ADMIN.md`.

---

> ## ⚠️ Active near-term plan: `SYSTEM_ADMIN_V1.md`
>
> The Phase -1 spike (built end of 2026-05-12) implemented the chat
> pill + Cursor cloud agent + auto-merge action against the real SO
> site. It works. The end-to-end latency (~50–100s from "do this" to
> "see it on staging") makes it unworkable for live editing of a
> one-client marketing site.
>
> **What's active right now:** see `SYSTEM_ADMIN_V1.md`. Clients edit
> locally in Cursor IDE (live HMR); staging is preview + control
> panel only; M&L doesn't run an in-browser chat editor.
>
> **What this doc remains:** the target architecture for Phase 1+
> (multi-client, centralized AI ops). The Phase -1 → Phase 5 plan
> below is paused, not deleted — the work compounds when we revisit.
>
> When to come back to this doc: when V1's economics break (client
> #2, or operational drag of asking every client to bring Cursor
> Pro). See `SYSTEM_ADMIN_V1.md` §8 for revisit triggers.

---

## Status

Specification only. Phase -1 was built and is now parked (see
`SYSTEM_ADMIN_V1.md` for what's active). Phases 0–5 below are still
target architecture, not built.
Implementation sequencing in §16.

**Pilot client:** Sustained Outcomes (Ken). Treated as the pilot for
the entire System Admin product line — built at-cost during the
pilot in exchange for real-world feedback driving the v1 design.

This doc resolves the **v2 client-toolbar concept** parked in
`ML_ADMIN.md`. That parking-lot entry should be marked done with a
link to this file once Phase 0 lands.

---

## 1. What this is

The **System Admin** is one product with two surfaces:

| Surface | URL | Audience |
|---|---|---|
| **Admin Home** | `admin.mackandlee.com` | M&L team, client users, stakeholders |
| **Toolbar** | injected into every `<client>.mackandlee.com` staging site | Same — embedded in-context |

Same login, same identity, same data. The Admin Home is the
dashboard. The Toolbar is the same product reaching into a client's
staging site so editing happens where the page lives.

It owns:

- Identity (who can edit what)
- The AI editing experience (Cursor SDK-backed chat)
- Media uploads (R2 + Bunny Stream)
- The promote pipeline (per-page and entire-site)
- Help & presence
- Change-request entry points

It does **not** own:

- Per-client codebases (those stay in each client's repo)
- Hosting (Cloudflare Pages, unchanged)
- Analytics infra (GA4 + GTM + Clarity, unchanged)
- The Change Request backbone (GitHub Issues per `CHANGE_REQUEST.md`,
  unchanged — System Admin is just a friendlier entry point)

---

## 2. Why a separate app

Three reasons, locked in:

1. **No per-client forking.** Toolbar lives once at
   `admin.mackandlee.com`; every client site loads it via embed
   script. One codebase, N clients.
2. **One identity layer.** Cloudflare Access covers
   `admin.mackandlee.com` + `*.mackandlee.com` under a single policy.
3. **Centralized AI.** The Cursor SDK agent runs in the admin
   Worker. System prompts, audit logs, model routing, token caps —
   all in one place.

This was already the answer parked in `ML_ADMIN.md` on 2026-05-11.
This spec just makes it real.

---

## 3. Architecture overview

```
                 admin.mackandlee.com
                          │
                  Cloudflare Worker (Hono)
              ┌──────────┼──────────┐
              ▼          ▼          ▼
      Admin Home SPA   embed.js   API routes
                          │
                          ▼ loaded by every
                          ▼ <client>.mackandlee.com
                          ▼ staging site
                  ┌───────────────┐
                  │ Client Toolbar │ (mockup design)
                  └───────────────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
        Cursor SDK   GitHub API   R2 / Bunny
       (programmatic) (commits,    (uploads)
                       PRs)
```

| Layer | Tech | Why |
|---|---|---|
| Worker runtime | Cloudflare Workers + Hono | Stays inside the existing CF stack |
| Dashboard SPA | Astro w/ islands | Matches client-site stack; M&L already builds Astro daily |
| Identity | Cloudflare Access | Free up to 50 users, magic links, integrates trivially with Workers |
| State | D1 | Per-client config, identity map, audit log, presence state |
| Object storage | R2 | Images and docs (free to 10GB) |
| Image transforms | Cloudflare Images | $5/mo, automatic resize/WebP/AVIF |
| Video | Bunny Stream | Cheap, already validated by M&L |
| AI agent | `@cursor/sdk` (cloud runtime) | Skips ~3 weeks of agent-loop work; aligns with M&L's own toolchain |
| Repo operations | GitHub API + MCP | Commit, branch, PR, label |
| Chat (help) | Chatwoot (self-hosted on CF) or Intercom | TBD — see §17 |
| Notifications | n8n (existing) | Reuse the pipeline already in place |

### 3a. Framework independence contract

The admin app and client sites are **fully decoupled** at the framework
level. Changing one does not affect the other.

This is a deliberate constraint. The admin app's framework choice
(Astro today, possibly something else tomorrow) is an **internal admin
decision** — not a portfolio standard. Track A's stack defined in
`ARCHITECTURE.md` (Astro + Tailwind + Cloudflare for client sites) is
unaffected by this spec and continues to govern all client work.

The admin app and client sites communicate only through four
framework-agnostic surfaces:

| Boundary | Format | Owned by |
|---|---|---|
| `embed.js` | Plain JavaScript via `<script>` tag | Admin app |
| `data-ml-block` attributes | HTML attributes | Client site |
| `/_ml/manifest.json` | JSON file at a known URL | Client site (built by a per-framework emitter) |
| Admin API endpoints | HTTPS / REST + WebSocket for chat streaming | Admin app |

**Hard rules:**

- The admin app **does not import** from any client codebase.
- Client codebases **do not import** from the admin app.
- No shared component packages between the two.
- No shared build pipelines.
- Any per-framework integration code (currently: the Astro manifest
  emitter) lives on the client side and is framework-specific. A
  future Track C in a different framework would ship its own emitter
  that produces the same `/_ml/manifest.json` shape.

**What this protects:**

- The admin app can switch frameworks (Astro → SvelteKit → HTMX → …)
  without touching client repos.
- Client sites can stay Astro forever, or one client can move to a
  different framework, without touching the admin app.
- Track B (WordPress) clients can in principle adopt the System
  Admin too — they just need to emit a `manifest.json` and respect
  the `data-ml-block` convention.

If a future change tempts you to violate this contract (e.g., "let's
import a UI component from the admin into a client site"), don't.
Re-implement, or extract the shared piece to a framework-agnostic
package (Web Components or plain HTML+CSS).

---

## 4. The two surfaces

### 4a. Admin Home — `admin.mackandlee.com`

A logged-in landing page with per-client dashboard cards.

**For a single-site client (Ken, today):**

| Card | Content |
|---|---|
| Site card | Site name, staging URL, **Open Editor** button, current Draft/Submitted/Live status |
| **Ready to publish** | "N changes ready to publish since [date]." Visible to M&L only on client view; visible to client as confirmation that their last "push site" was received. Click → review diff → **Publish all pending**. See §9a. |
| **New page requests** | List of structured intakes Ken's agent captured (audience, CTA, sections). M&L-only. Click → opens Cursor IDE with the intake summarized in a draft prompt. |
| Analytics summary | This month's traffic + top events, from existing n8n report |
| Pending change requests | Count + status, link out to GitHub Issues view (M&L-only) |
| Recent changes | Last 5 edits in plain-English (see below) |
| **Your Plan** (client view) | Current tier (Essentials/Standard/Premium), what's included, "Request upgrade/downgrade" link. Phase 5 deliverable. |
| Help | M&L presence indicator + "Send a message" button |
| Monthly report | Current MTD + last month's PDF link |

**Recent changes — plain-English shape (not "commits"):**

```
Updated homepage hero copy             — 2 hours ago
Created blog post "Erb Fellowship..."   — yesterday
Promoted About page to live             — 3 days ago
Replaced partner logo for Oakland Cty   — last week
```

Each row links to staging (drafts) or production (live changes).
The data source is `git log` + commit trailers (Page / Pages),
translated into plain language by a small mapping function.

**For a multi-site client (when this happens):** list of site cards,
same shape per row.

**For M&L logged in:** portfolio dashboard. All clients, color-coded
by health signals (broken build, pending CR, stale staging, storage
near quota).

### 4b. Toolbar — embedded on staging

Mirrors the mockup. Replaces the current `StagingBanner.astro`.

```
┌──────────────────────────────────────────────────────────────────┐
│ M&L │ ? │ Sustained Outcomes > Staging │ PAGE Home │ STATUS Draft│
│     │   │                              │           │             │
│                                       [Promote Page ▾] [+] [📁] [⊕] [✱] [×]│
└──────────────────────────────────────────────────────────────────┘
                  Promote Page  ◄── primary action
                  Promote Site  ◄── secondary (in dropdown)
```

**The toolbar renders on staging only.** It is never injected into
production. Production sites have no toolbar markup, no embed
script, no admin coupling — end users see a clean page.

**Per-button behavior:**

| Button | v1 behavior |
|---|---|
| **M&L logo** | Click: returns to `admin.mackandlee.com`. Hover (when user has access to >1 site): shows project switcher dropdown with the other accessible sites. |
| **? (Ask)** | Opens help modal: presence indicator + chat widget + offline ticket form |
| **Breadcrumb** | `<Client> > <Environment>` — Staging is fixed for now; future: Preview/Live |
| **PAGE** | Current page slug, auto-detected from URL |
| **STATUS** | `Draft` / `Submitted` / `Live` — see status state machine below |
| **Promote Page** | Per-page promotion via commit-tag cherry-pick + build-verify (§9). Moves status: Draft → Submitted. |
| **Promote Site** | Whole `staging → main` merge with confirmation dialog listing affected pages |
| **+ Add** | Modal with three options: Page / Blog / Landing — each opens AI chat prefilled (§7) |
| **📁 Add Media** | Upload modal, auto-routes by file type (§10) |
| **⊕ Select** | Toggles element-label overlay (§8); click an element copies block ID |
| **✱ AI** | Opens Cursor-SDK chat panel inline (§6) |
| **×** | Collapses toolbar to corner handle (matches current StagingBanner behavior) |

**Status state machine:**

| State | Definition | What user sees |
|---|---|---|
| `Live` | Current page on staging matches `main` exactly | Page is published. Nothing pending. |
| `Draft` | Page has unmerged commits on `staging` and no open PR for them | Edits made; not yet submitted for promotion. |
| `Submitted` | Page's promote PR is open (post-Promote Page, pre-merge) | Sent to M&L for review. Waiting on approval. |

**Composite state:** when a page has both an open PR *and* new
unsubmitted commits on top, the status reads **`Draft (1 pending)`**
— with the underlying PR linked from the activity log. UI stays
simple; the detail is one click away.

**Anatomy notes:**

- Toolbar is a pure overlay (does not push page content down) —
  same rule as current `StagingBanner.astro`.
- Collapse-to-handle and fade-on-scroll behavior carries over.
- States persisted to `localStorage` per device, same as today.
- When logged out, toolbar shows a minimal "Sign in to edit" CTA;
  no edit buttons rendered.

---

## 5. Auth

### Policy

Cloudflare Access protects:

- `admin.mackandlee.com` (the dashboard)
- `*.mackandlee.com` (every staging site, for the toolbar's API calls)

Both under a **single Access application** so one sign-in covers
both surfaces.

### Identity providers (in priority order)

1. **Email OTP / magic link** — default; works for everyone
2. **Google OAuth** — optional; for clients who already use Workspace
3. **GitHub OAuth** — M&L only

### Roles

| Role | How identified | Permissions | Session length |
|---|---|---|---|
| `ml-admin` | `*@mackandlee.com` | All clients, all actions, presence toggle | 30 days |
| `client-editor` | Email in `identity_map` table with role=editor | Edit + promote their assigned client(s) | 7 days |
| `client-viewer` | Same table, role=viewer | View staging + analytics; no edit, no promote | 24 hours |
| `anonymous` | No Access JWT | Cannot load toolbar; staging site renders without it | — |

Magic-link reverification at session expiry. Cloudflare Access
configured per-role.

### `identity_map` table (D1)

```sql
CREATE TABLE identity_map (
  email      TEXT PRIMARY KEY,
  clients    TEXT NOT NULL,        -- JSON array: ["sustainedoutcomes"] or ["*"]
  role       TEXT NOT NULL,        -- 'admin' | 'editor' | 'viewer'
  added_at   INTEGER NOT NULL,
  added_by   TEXT NOT NULL
);
```

M&L adds rows when onboarding a new client user. Three rows for SO
v1:

| email | clients | role |
|---|---|---|
| `*@mackandlee.com` | `["*"]` | admin |
| `ken@sustainedoutcomes.org` | `["sustainedoutcomes"]` | editor |
| (future board reviewers) | `["sustainedoutcomes"]` | viewer |

### Request flow

1. Browser hits `<client>.mackandlee.com`, page renders
2. `embed.js` calls `admin.mackandlee.com/api/session`
3. Cloudflare Access intercepts; if no JWT, returns 302 to magic-link flow
4. After sign-in, JWT is in request headers; Worker looks up `identity_map`
5. Returns `{ role, clients, currentClient }` to the toolbar
6. Toolbar renders the right buttons for the role

---

## 6. The AI agent

### Implementation

Programmatic Cursor agent via `@cursor/sdk`, cloud runtime, invoked
from the admin Worker per conversation.

```ts
// pseudo, current SDK shape — confirm against latest skill at build time
import { Agent } from '@cursor/sdk';

const agent = await Agent.create({
  runtime: 'cloud',
  repo:    `${clientGitHubOrg}/${clientRepo}`,
  branch:  'staging',
  systemPrompt: assembleSystemPrompt(client, page),
  mcps: [
    githubMcp(client),
    r2Mcp(client),
    bunnyMcp(client),
  ],
});

for await (const event of agent.prompt(userMessage)) {
  // stream to toolbar chat panel via WebSocket
}
```

### System prompt assembly (per turn)

Concatenated from:

- `agentsites/AGENTS.md` (portfolio rules)
- `clients/<client>/Client-AI-Instructions.md` (client-specific tone, rules)
- `clients/<client>/HANDOFF.md` (component map, what's content vs structural)
- Current page context: file path, recent commits on that page, the toolbar state
- A short footer that re-states the **content-only boundary** (see below)

### The content-only boundary

The agent may edit:

- `src/content/**` (collections — blog posts, etc.)
- Component props in `.astro` files (text, image URLs, button targets)
- Landing page files matching the landing schema in `ARCHITECTURE.md`
- Media references (URLs from R2/Bunny uploads)

The agent must NOT edit:

- Component files themselves (`src/components/sections/*`, `src/components/ui/*`, `src/components/layout/*`)
- `tailwind.config.mjs`, `astro.config.mjs`, any config
- Content collection schemas (`src/content/config.ts`)
- Anything outside the client's `site/` directory

When a request crosses the line, the agent opens a Change Request
(GitHub Issue with the `change-request` label per `CHANGE_REQUEST.md`)
and tells the user. Same mechanic that exists today — System Admin
just makes it one click.

### Model routing

Cursor handles model selection internally. We pin defaults via the
agent config:

| Use case | Default | Escalate to |
|---|---|---|
| Routine copy edit, image swap | low-cost tier | mid tier on retry |
| New blog post | mid tier | — |
| New landing page (schema-driven) | mid tier | high tier if validation fails |
| Multi-step / ambiguous request | mid tier | high tier on the second turn |

### Token / cost caps

Per conversation: $0.50 soft cap (agent pauses to confirm
continuation), $2.00 hard cap (agent stops).
Per client per month: $15 of model spend (alerts M&L at 80%).

### Audit log

Every conversation logged to D1 in the **admin Worker only** —
nothing about agent interactions is stored on the client's staging
site or in their repo.

```sql
CREATE TABLE agent_runs (
  id              TEXT PRIMARY KEY,
  client          TEXT NOT NULL,
  user_email      TEXT NOT NULL,
  page            TEXT,
  turns           INTEGER,
  cost_usd        REAL,
  commits         TEXT,         -- JSON array of SHAs
  messages        TEXT,         -- JSON array of {role, content} turns
  started_at      INTEGER,
  ended_at        INTEGER
);
```

**Retention:** 90 days. Documented in `CLIENT_ADMIN.md` and
`Welcome-and-Onboarding.md` so clients know.

**Access in v1:** M&L-only. Visible from the Admin Home portfolio
dashboard, not on the per-client client-facing view. No client-facing
interaction history UI is built in v1 — defer to v2 if a client asks
for it.

---

## 7. + Add — page creation as a dedicated mode

Page **creation** is a different experience from page **editing**.

- **Editing** happens in the staging toolbar with overlay + chat
  panel — surgical changes to pages that already exist (§4, §8).
- **Creation** opens a dedicated full-canvas workspace: chat on the
  left, live preview on the right, modeled after the Cursor IDE
  experience. No blank templates, no form gallery — a conversation
  that yields a page.

### 7a. Click + Add → opens `admin.mackandlee.com/create/<client>`

Three options in the entry modal:

```
What are you adding?
  [ Page ]    [ Blog post ]    [ Landing page ]

  ── or ──

  [ Open in Cursor IDE ]   ← higher-fidelity path for installed users
```

The three template choices each open the /create route in a new
tab with the chat prefilled per template.

### 7b. /create layout

```
┌─────────────────────────────────────────────────────────────┐
│ Admin > <Client> > Create new <Page | Blog post | Landing>  │
├──────────────────────────┬──────────────────────────────────┤
│  Chat with agent          │  Live preview                    │
│  ─────────────────        │  ┌──────────────────────────┐   │
│                           │  │                          │   │
│  Agent: What's the        │  │  (renders draft branch   │   │
│  page for?                │  │   live as commits land)  │   │
│                           │  │                          │   │
│  You: Oakland Outdoors    │  │                          │   │
│  summer registration      │  │                          │   │
│                           │  │                          │   │
│  Agent: Got it. Who's     │  │                          │   │
│  the audience?            │  └──────────────────────────┘   │
│  ...                      │   draft branch:                 │
│                           │   draft/new-page-<timestamp>    │
│  [Open in Cursor IDE →]   │   [Save draft] [Discard]        │
└──────────────────────────┴──────────────────────────────────┘
```

### 7c. Mechanics

1. /create creates a branch `draft/new-page-<timestamp>` from `main`.
2. Cloudflare Pages auto-builds a preview deploy on every push to
   that branch (~20-30s per commit).
3. The iframe points at the preview URL; refreshes when the build
   completes.
4. The Cursor SDK agent has its system prompt augmented with the
   appropriate schema (page / blog / landing) and walks the
   conversation, committing as it goes.
5. **Save draft** merges the draft branch into `staging`. User is
   redirected to `<client>.mackandlee.com/<new-slug>` — now in
   normal Edit mode (toolbar + overlay).
6. **Discard** deletes the branch silently.

The 20-30s build cadence is acceptable for create-flow turns
(chat-and-think cycles), but unusable for typing-level edits —
which is exactly why Edit mode stays in-page on staging where the
agent edits in place without waiting for builds.

### 7d. Pages as content-collection entries

To keep new-page creation on the content-only side of the §6
boundary, "Page" is structured as a content-collection entry, not
a new `.astro` file:

```
src/content/pages/<slug>.mdx          ← what the agent writes
src/pages/[...slug].astro             ← generic page renderer (one file)
src/lib/sections/registry.ts          ← allowlist of section types
```

A page MDX file:

```mdx
---
title: Oakland Outdoors Summer
slug: oakland-outdoors-summer
sections:
  - type: hero-fullbleed
    headline: "..."
    image: /media/...
  - type: feature-split
    direction: image-left
    ...
---
```

The agent composes pages by writing MDX with sections drawn from
the registry. **Adding a new section type still requires a Change
Request** — same boundary as today.

### 7e. Schemas (existing, reused)

| Template | Schema source |
|---|---|
| Page | `src/content/config.ts` collection: `pages` (TBD — defined during SO refactor in Phase 2) |
| Blog post | Existing `blog` collection schema in `src/content/config.ts` |
| Landing page | Schema defined in `ARCHITECTURE.md` §Landing Page Standard |

### 7f. SO refactor — moved to Phase 4

Sustained Outcomes today has `index.astro`, `about.astro`, etc. as
hand-written `.astro` files. Before /create can ship for SO, these
must move to the content-collection model:

1. Create `src/content/pages/` collection with config in `src/content/config.ts`.
2. Build `src/pages/[...slug].astro` generic renderer that consumes the collection.
3. Build `src/lib/sections/registry.ts` mapping section type → component.
4. Migrate `index.astro`, `about.astro`, `work.astro`, etc. to MDX entries.
5. Delete the original `.astro` files.

This is the **single most invasive change** in the System Admin
rollout. Deferred to Phase 4 (§16) — page creation routes to M&L
in earlier phases so this refactor isn't on the critical path.

### 7g. Page creation in Phase -1 through Phase 3 — routes to M&L

Before /create ships in Phase 4, "new page" requests are handled by
M&L in Cursor IDE. The client's agent stays on the content-only side
of the boundary.

**The flow:**

1. Client says in chat: *"I'd like to add a page for our new mentor program."*
2. Agent: *"I can edit pages but new pages are something Mack handles. Let me capture what you have in mind so he has everything he needs to start."*
3. Agent walks a structured intake: audience, CTA, hero image, key sections, tone notes.
4. Agent calls an admin API endpoint creating a **New Page Request** entry in D1 (`page_requests` table: client, summary, intake JSON, created_at, status).
5. Entry appears in M&L's Admin Home "New page requests" card; n8n fires an email notification.
6. M&L opens Cursor IDE with the intake summary as a prompt, builds the page, pushes to staging.
7. M&L marks the request done. Client's agent reads the D1 entry on next chat turn and replies: *"Mack built the page — it's on staging at /mentors. Want to refine the copy?"*
8. From here on, the new page is editable via normal chat like any other page.

**Why this is the right pilot pattern:**

- M&L sees every page-creation conversation in Ken's own words, which is gold for designing the eventual /create mode in Phase 4.
- No structural decisions made by the SDK agent.
- No pages-as-content-collection refactor needed until Phase 4.

This entire flow ships in Phase -1 — minimal effort, just an intake
prompt in the system context and one D1 table.

---

## 8. Element selector — the labels system

**The point of the Select button: replace screenshots.** Today,
referencing an element requires a screenshot, paste, and hoping the
AI identifies the right thing. The label overlay turns that into a
two-token reference: hover, click, paste.

### Build-time annotation

Every editable element in every client codebase emits a stable
`data-ml-block` attribute at build time:

```astro
<!-- src/components/sections/HeroFullbleed.astro -->
<section data-ml-block={`${pageSlug}/hero`}>
  <h1 data-ml-block={`${pageSlug}/hero/headline`}>{headline}</h1>
  <p  data-ml-block={`${pageSlug}/hero/subheadline`}>{subheadline}</p>
  ...
</section>
```

These IDs are stable across builds (driven by component file path +
slot name, not auto-incrementing). They survive rerenders, refactors
of unrelated components, and design tweaks.

### Human-readable labels

The canonical ID is plumbing. **Clients never see the ID; they see
the label.** Two label sources:

1. **Auto-derived from the ID path.** `home/hero/headline` →
   `"Homepage > Hero > Headline"` (slug-to-title-case + segment join).
   Handles 90% of blocks.

2. **Override via `data-ml-label` attribute.** When auto-derivation
   produces something awkward, the component author writes a clean
   label:

```astro
<FeaturedCard
  data-ml-block="home/featured-card-2"
  data-ml-label="Featured story (second slot)"
>
```

### `/_ml/manifest.json`

Each client site emits a build-time manifest at `/_ml/manifest.json`:

```json
{
  "client": "sustainedoutcomes",
  "version": "2026-05-12T15:23:00Z",
  "blocks": {
    "home/hero/headline": {
      "label":  "Homepage > Hero > Headline",
      "source": "prop",
      "file":   "src/pages/index.astro",
      "prop":   "heroHeadline"
    },
    "blog/erb-fellowship/title": {
      "label":  "Blog > Erb Fellowship Kickoff > Title",
      "source": "collection",
      "file":   "src/content/blog/erb-fellowship.mdx",
      "field":  "title"
    },
    "about/intro/body": {
      "label":    "About > Intro Section > Body",
      "source":   "slot",
      "file":     "src/pages/about.astro",
      "selector": "section#intro > div.prose"
    }
  }
}
```

**The `source` field** tells the agent which tool to use:

| `source` | Tool the agent uses | Where the content lives |
|---|---|---|
| `prop` | `edit_component_prop` | A prop passed to a component in an `.astro` file |
| `collection` | `edit_collection_field` | A frontmatter field in a content collection entry |
| `slot` | `edit_slot_content` | Free-form HTML/MDX between component tags |

The toolbar fetches the manifest once per session. The agent
receives the manifest as part of its system prompt and uses label
or ID — whichever the user provides — to resolve to a file +
location.

### Overlay UX (the Select button)

The overlay is a **binary toggle**:

- **Off** (default): page renders normally. No outlines, no badges.
- **On**: every editable block on the page simultaneously shows a
  1px outline + a label badge in the corner. The user sees the full
  editable surface at a glance.

Click `⊕ Select` → on. Click `⊕` again → off. State persists in
`localStorage` so the user's preferred mode survives reloads.

The overlay turns the page into a click-to-reference surface. Every
block becomes a `@mention` clients can build into a message before
sending. This is the key UX of the editing experience.

### Interaction model (overlay must be on)

| Interaction | Result |
|---|---|
| **Hover** a block | Cursor changes to pointer; outline thickens slightly as a clickability cue. Labels are already visible — hover does not reveal them. |
| **Click** a block | Adds label as a chip to the chat input. Auto-opens chat panel if closed and focuses the input. |
| **Right-click** a block | Opens context menu (below) |
| **Cmd/Ctrl+Click** | Copy label to clipboard, no chat interaction |
| **Shift+Click** | Add chip without focusing the input — lets the user keep selecting before typing |
| **Long-press** (touch) | Same as right-click — context menu |
| **Already-chipped block** | Renders with a filled dot on the badge: `● Homepage > Hero > Headline`. Re-clicking removes the chip from chat. |

With the overlay off, clicks pass through to the underlying page
normally (links, buttons, etc. work as usual). The overlay only
intercepts events when explicitly toggled on.

### Right-click context menu

```
┌────────────────────────────────┐
│ ✱  Add to chat        (Enter)  │ ◄ default highlighted
│ 📋 Copy label                  │
│ 🆔 Copy block ID                │
├────────────────────────────────┤
│ ✏️  Edit text inline...         │ ◄ text blocks only
│ 🖼️  Replace media...            │ ◄ media blocks only
├────────────────────────────────┤
│ 👁  View in code (M&L only)     │ ◄ ml-admin role only
└────────────────────────────────┘
```

Menu is **element-aware**: only shows actions valid for that block's
`source` type.

| Action | Available on | Behavior |
|---|---|---|
| Add to chat | All blocks | Adds chip to chat input |
| Copy label | All blocks | Copies the label to clipboard |
| Copy block ID | All blocks | Copies the canonical ID (`home/hero/headline`) |
| Edit text inline | `source: prop|collection|slot` where value is a string | Small inline contenteditable popup; saves on enter, commits via the agent |
| Replace media | Blocks tagged as image/video URLs | Opens the Add Media modal (§10), scoped to replace the current value |
| View in code | `ml-admin` role only | Opens the source file at the right line in `github.com/<repo>` |

### Chat input as a staging area

The chat input renders staged references as **chips** before
sending:

```
┌─────────────────────────────────────────────────────────┐
│ [Homepage > Hero > Headline ×] [Homepage > Hero > Sub ×]│
│ make both of these more casual                          │
│                                              [Send →]   │
└─────────────────────────────────────────────────────────┘
```

Sent message format (what the agent receives):

```
[Homepage > Hero > Headline] [Homepage > Hero > Subheadline]
make both of these more casual
```

Chip behavior:

- Each chip has a small `×` to remove it.
- Hovering a chip re-highlights the matching element on the page
  (brief outline pulse).
- Chips persist across chat-panel collapse/expand within a session.
- Pressing **Backspace** at the start of the input deletes the
  most recent chip (Slack pattern).
- Maximum 10 chips per message to keep agent context bounded.

### Why this combination matters

The label system replaced screenshots with labels. The chip system
replaces one-label-per-message with multi-reference messages.

| Before | After |
|---|---|
| "Change the homepage headline." (turn 1) | "[chip][chip][chip] make all three more casual" (turn 1) |
| "Also the subheadline." (turn 2) | (one turn, agent edits all three in parallel) |
| "Also the CTA." (turn 3) | |
| 3 turns, 3 model calls | 1 turn, 1 model call |

Real token savings, real time savings, real reduction in agent
confusion ("which element did you mean?").

This is the screenshot-replacement mechanism the System Admin is
built around.

### Label resolution in the agent

The agent's system prompt teaches it to recognize labels in user
messages — both as bracketed chips and as natural-language
references. So:

> *"[Homepage > Hero > Headline] change to 'Welcome Home'."*
> *"On Homepage > Hero > Headline, change to 'Welcome Home'."*
> *"Change the headline on Homepage Hero to 'Welcome Home'."*

…all resolve via the manifest. The agent prefers exact label
match, falls back to fuzzy match, asks for clarification if
ambiguous. **No screenshots needed.**

### Label resolution in the agent

The agent's system prompt teaches it to recognize labels in user
messages. So natural-language references like:

> *"On Homepage > Hero > Headline, change it to say 'Welcome Home'."*
> *"Update the headline on Homepage Hero."*
> *"Change the About Intro body to..."*

…all resolve via the manifest. The agent prefers exact label match,
falls back to fuzzy match, asks for clarification if ambiguous.
**No screenshots needed.** This is the screenshot-replacement
mechanism the System Admin is built around.

---

## 9. Publish pipeline

The publish mechanism evolves across phases. §9a covers the simple
marker-commit pattern used in Phase -1 through Phase 2. §9b covers
the full per-page promote pipeline that ships in Phase 3.

## 9a. Phase -1 → Phase 2: Marker-commit + bundled M&L gate

While the toolbar's Promote Page button is not yet built, "publish"
is triggered by the client saying **"push site"** (or equivalent) in
chat. The agent makes a marker commit; M&L reviews + merges in
batches.

### Trigger

When the agent recognizes a publish intent ("push site", "publish",
"make this live", etc.), it:

1. Confirms with the user one more time.
2. Makes an **empty marker commit** on the staging branch:
   ```
   git commit --allow-empty -m "PUBLISH-REQUEST: <human-readable summary>"
   ```
3. Tells the user: *"Got it — Mack will publish this shortly. You'll see it live within an hour or so."*

### Detection

A GitHub webhook on the client's repo fires on every commit. The
admin Worker filters for commits starting with `PUBLISH-REQUEST:` and
updates D1:

```sql
CREATE TABLE publish_requests (
  client                TEXT PRIMARY KEY,
  last_request_at       INTEGER,     -- timestamp of latest marker commit
  last_request_summary  TEXT,        -- human-readable summary
  last_published_at     INTEGER,     -- timestamp of last completed publish
  pending_changes_count INTEGER      -- staging vs main commits since last publish
);
```

### Bundled M&L review

The admin dashboard's site card shows:

| State | Display |
|---|---|
| `last_published_at >= last_request_at` | Site card is normal. No pill. |
| `last_request_at > last_published_at` | **"Ready to publish — N changes since [date]"** pill on the site card. Click → review diff → **Publish all pending** button. |

**One click publishes everything Ken queued, regardless of how many
edits or marker commits accumulated.** No per-edit review required.

Optional **daily digest**: n8n cron at 5pm checks for any client
where `last_request_at > last_published_at`. If yes, emails M&L a
summary with a one-click publish link. M&L opts in or out via a flag
in identity_map.

### Publish action

When M&L clicks **Publish all pending**:

1. Admin Worker creates a PR `staging → main` titled with the
   marker commit summaries
2. M&L reviews the diff (the PR page is the review surface)
3. Merge → Cloudflare Pages auto-deploys to production
4. n8n fires email to client: *"Your changes are live at [URL]"*
5. D1 row updates `last_published_at`; pill disappears from dashboard

### Why this works as a bridge

- Zero new UI on the client side — they just talk to chat normally
- Single review per publish, regardless of edit count
- Same commit-tagging discipline that Phase 3 will use (just additive — `PUBLISH-REQUEST:` markers instead of `Page:` trailers)
- Hand-off to Phase 3 is clean: marker commits stop being created once the toolbar's Promote button ships

## 9b. Phase 3+: Per-page promote pipeline

### Commit-tagging convention

Every commit the agent makes carries a Git trailer:

```
Update homepage hero copy

Page: home
```

Multi-page commits use:

```
Update site footer

Pages: home, about, work, blog
```

The agent emits these automatically based on the files it edits.
M&L commits (in Cursor) follow the same convention manually — easy
because Cursor's commit-message UI lets us paste a trailer.

### Per-page promote (default)

`Promote Page` button:

1. Toolbar calls `POST /api/promote` with `{ client, page }`
2. Worker:
   a. Lists unmerged commits on `staging` with `Page: <slug>` or `Pages: ... <slug> ...` trailer
   b. Creates branch `promote/<slug>-<timestamp>` from `main`
   c. Cherry-picks those commits onto the branch
   d. Runs build verification (Cloudflare Pages preview build)
   e. If build green → opens PR for M&L approval
   f. If build red → returns dependency conflict to toolbar (see below)
3. Toolbar shows status; on PR merge, refreshes the page state

### Dependency conflict UX

When the build fails because the cherry-pick missed a dependency:

```
┌─────────────────────────────────────────────────────────┐
│ Can't promote Home alone                                │
│                                                         │
│ Home's changes need the Hero component update, which   │
│ is also used by About (still in draft).                │
│                                                         │
│   ○ Promote Home + About together                       │
│   ○ Promote everything (Promote Site)                   │
│   ○ Cancel                                              │
└─────────────────────────────────────────────────────────┘
```

The Worker computes affected pages from the file list and surfaces
the choice. No silent expansion of scope.

### Entire-site promote

`Promote Site` (in the dropdown next to `Promote Page`):

1. Confirmation dialog listing every page with draft changes
2. Standard `staging → main` merge
3. Same build verification
4. PR opens for M&L approval, then merges to `main`

### Rollback

Not a button — a prefilled prompt in the AI chat:

```
[Toolbar pre-fills:]  "Roll back the About page to its state on
                       [date picker]."
```

The agent finds the commit at that date, creates a revert PR for
that page, and walks the user through approval. Reuses the promote
pipeline's PR mechanic. No separate rollback infra.

---

## 10. Media uploads

### Routing

| File type | Destination | Why |
|---|---|---|
| Images (JPG, PNG, WebP, AVIF, SVG) | R2 + Cloudflare Images | Free storage to 10GB; CF Images $5/mo for transforms |
| **HEIC** (iPhone default) | Server-side convert → JPG (or WebP) → R2 + CF Images | Browsers don't render HEIC natively; clients will upload phone photos without realizing |
| Video (MP4, MOV) | Bunny Stream | M&L's validated choice; cheaper than CF Stream and Vimeo |
| PDF, DOCX, etc. | R2 (no transform) | Just file hosting |

### Upload UX

Click `📁 Add Media` → modal with drag-and-drop. After upload:

- Returns the public URL to the clipboard
- If AI chat is open: pushes URL into the chat input
- Image previews show a thumbnail with copy/embed/replace options
- HEIC files show a "converting…" state before the URL appears (~2-3s)

### Storage layout

```
r2://ml-media/
  <client>/
    images/  YYYY/MM/  <hash>.<ext>
    docs/    YYYY/MM/  <hash>.<ext>
```

Bunny Stream uses a per-client video library configured in the Bunny
dashboard during onboarding (see `ML_ADMIN.md` per-client setup
checklist).

### Per-client setup at onboarding

Bunny Stream and R2 are **not zero-config per client**. Each new
client requires a one-time setup pass (~30 min) covering:

1. Create a Bunny Stream library; capture the per-client API key
2. Create the client's R2 bucket; configure CORS for uploads from `<client>.mackandlee.com`
3. Configure Cloudflare Images (one-time per CF account)
4. Store per-client API keys in CF Workers secrets, named
   `MEDIA_<CLIENT>_BUNNY_API_KEY` / `MEDIA_<CLIENT>_R2_BUCKET`
5. Add a row to D1 `client_media_config` mapping client slug → secret names + quota overrides

This is documented in the `ML_ADMIN.md` per-client setup checklist.

### Per-client quotas

| Item | Default | Overage |
|---|---|---|
| R2 storage | 20 GB | $0.02/GB/mo (CF cost + small markup) |
| CF Images | First 100k stored | Pass-through |
| Bunny Stream storage | 50 GB | $0.01/GB/mo |
| Bunny Stream bandwidth | 100 GB/mo | $0.01/GB |

Defaults can be **overridden per-client** at onboarding via the
`client_media_config` D1 row. Use cases: photography-heavy clients
get more R2; video-heavy clients get more Bunny bandwidth.

Surface usage in the Admin Home dashboard. Alert at 80%. Bill at
month-end.

### Media add-on pricing

$10/mo per client covers the default bundle above. Documented in
`Welcome-and-Onboarding.md` for clients who need it; bundled into
the managed fee.

---

## 11. Help — the `?` button

### Presence

A single bit in D1 (`presence` table) toggled by M&L from the Admin
Home dashboard. Three states: `online`, `office hours`, `offline`.

| State | Behavior |
|---|---|
| `online` | "We're here — start a chat" button opens the chat widget |
| `office hours` | "Available 9-5 ET — start a chat" — same chat opens |
| `offline` | Chat hidden; only the message form is shown |

Future: wire presence to Slack status or calendar. Not v1.

### Chat widget — Chatwoot (locked in for v1)

**Chatwoot self-hosted** on Fly.io or a small VPS.

- Free (open source)
- Decent UX, accepted convention
- One install effort (~half a day) for the entire portfolio
- Webhook + REST API for routing tickets and integrations

Revisit at 5+ active Track A clients — if Chatwoot's UX or ops cost
becomes a friction, move to Intercom (~$39/mo) or build a custom
widget.

For v1: deploy a single Chatwoot instance at
`help.mackandlee.com`. Multi-tenancy is handled via inbox/conversation
metadata, not separate instances.

### Offline / no-reply fallback

If chat is offline OR no reply in 2 minutes:

```
┌──────────────────────────────────────────────┐
│ Looks like Mack & Lee are away.              │
│ Send a message — they'll reply by email.     │
│                                              │
│  Subject: [_______________________________]  │
│  Message: [_______________________________]  │
│           [_______________________________]  │
│                                              │
│              [ Send message ]                │
└──────────────────────────────────────────────┘
```

Submitting creates a GitHub Issue with the `help-request` label
(added to `CHANGE_REQUEST.md` in this spec rollout) and fires the
existing n8n notification flow. The "send message" path is fully
reused infrastructure — no new ticketing system.

---

## 12. Per-client codebase contract

The contract below is **Phase 1+ scope**. In Phase -1 and Phase 0, the
client's site needs **no code changes** — Ken edits via the standalone
`admin.mackandlee.com/edit/<client>` page, which talks to the repo via
GitHub API rather than via in-page injection. The codebase contract
kicks in only when the embed script ships in Phase 1.

Every Track A client site must, from Phase 1 onward, do four things
to be System-Admin-compatible:

### 12a. Load the embed script (behind a feature flag)

In `src/layouts/Page.astro`, the embed script and the existing
`<StagingBanner />` **coexist** during transition. The embed script
is loaded unconditionally; whether it renders the toolbar is gated
by a feature flag:

```astro
<script
  src="https://admin.mackandlee.com/embed.js"
  data-ml-client={import.meta.env.PUBLIC_ML_CLIENT_SLUG}
  data-ml-toolbar-enabled={import.meta.env.PUBLIC_ML_TOOLBAR_ENABLED}
  defer
></script>

{import.meta.env.PUBLIC_ML_TOOLBAR_ENABLED !== 'true' && (
  <StagingBanner />
)}
```

And add to `.env.example`:

```bash
PUBLIC_ML_CLIENT_SLUG=sustainedoutcomes
PUBLIC_ML_TOOLBAR_ENABLED=false
```

The embed script no-ops on production builds (it checks the URL).
On staging, it only renders the toolbar when
`PUBLIC_ML_TOOLBAR_ENABLED=true`. When the toolbar is enabled,
`StagingBanner` is suppressed at the template level.

### 12a-bis. Migration sequence for an existing client (SO)

| Step | When | Outcome |
|---|---|---|
| 1. Add embed script + flag (default `false`) | Phase 1 start | Script loads, returns minimal payload. StagingBanner still renders. Zero visible change. |
| 2. Verify script loads cleanly on staging | Phase 1 start | No 404s, no CSP issues, no console errors. |
| 3. Build toolbar features behind the flag | Phase 1 mid | M&L tests on a preview deploy with flag=true. |
| 4. Flip flag to `true` on staging | End of Phase 1 | Toolbar appears. StagingBanner suppressed. |
| 5. Delete `StagingBanner.astro` | Follow-up PR after flag has been on for 2+ weeks | Cleanup once stable. |

Lower risk than a one-shot swap. If the embed has any bug,
flipping the flag back to `false` instantly restores the
StagingBanner experience.

### 12b. Annotate editable elements

Add `data-ml-block` attributes to every editable element in every
section component. One pass per existing component, documented in
`HANDOFF.md` going forward.

### 12c. Emit the manifest

Astro integration (lives at `agentsites/packages/ml-manifest/` once
extracted, in `clients/<client>/site/` for the first client) that
walks the rendered output during `astro build` and writes
`/_ml/manifest.json` mapping block IDs to file + prop.

### 12d. Use the commit-tagging convention

Every commit from the agent emits a `Page: <slug>` trailer. The
agent handles this; M&L follows it manually in Cursor.

### Migration plan for Sustained Outcomes

1. Add `PUBLIC_ML_CLIENT_SLUG` and `PUBLIC_ML_TOOLBAR_ENABLED=false` to env
2. Load the embed script alongside `<StagingBanner />` per §12a-bis sequence
3. Annotate components incrementally; until annotated, those blocks
   are not toolbar-editable but the rest of the toolbar works
4. Wire the manifest emitter as a small Astro integration
5. Backfill commit trailers for the current staging branch (one-time
   `git rebase --exec` pass, or just accept the gap and start fresh
   from the cutover)
6. Pre-Phase-2: complete the pages-as-content-collection refactor
   (§7f) so `+ Add → Page` can write to a collection

---

## 13. Pricing & cost model

### Per-client M&L cost increment (over current ARCHITECTURE.md table)

| Item | Cost/mo |
|---|---|
| Cloudflare Images | $5 (shared across portfolio at low volume; $5/100k images) |
| Bunny Stream | ~$3 (per active client, allowance bundled) |
| Cursor SDK / API usage | $3-8 per active client per month |
| Admin Worker | $0 at this scale (CF Workers free tier covers it) |
| D1 storage | $0 at this scale |
| Chat widget hosting | $5 (Chatwoot on Fly.io or similar) — amortized portfolio-wide |
| **Total new** | **~$11-21 per client per month** |

### What M&L charges

Current target: $75-150/mo managed hosting (from `ARCHITECTURE.md`).
After System Admin: same ceiling, more of the budget consumed by AI
+ media. Margin holds at the high end; tightens at the low end.

Recommendation: introduce a tiered managed plan:

| Tier | Monthly | Includes |
|---|---|---|
| Essentials | $99 | Hosting, monthly report, content updates via System Admin (capped) |
| Standard | $149 | + media add-on, higher AI cap, priority help |
| Premium | $249 | + sprint hours, monthly review call |

Tier *names* can be revisited before formal pricing (alternative
proposal: Hosted / Managed / Partnership). Names don't block build.

### Ken / Sustained Outcomes — pilot pricing

Ken is the pilot for the System Admin product line. During the
build phase he runs **at-cost**:

- Hosting + media + AI usage billed at M&L's actual cost
- No premium / tier markup until System Admin v1.0 ships
- M&L absorbs the Cursor Pro seat ($20/mo) for any pilot-specific
  testing as a build cost
- Formal billing tier (likely Standard) confirmed with Ken
  post-launch

This is documented in `clients/sustainedoutcomes/CURSOR_BRIEF.md`
and the Welcome doc so there's no ambiguity.

---

## 14. Lock-in protection

The "no lock-in" promise from `ARCHITECTURE.md §Client Autonomy`
holds:

| What clients keep | How |
|---|---|
| Source code | GitHub repo, owned by them |
| Content | All in `src/content/` (Markdown/MDX) |
| Media | R2 bucket migratable to their CF account; Bunny library transferable |
| Identity | Their email is the credential — Access policy can be detached |

| What goes away on independence | How |
|---|---|
| Toolbar | Remove the `<script src="admin.mackandlee.com/embed.js">` tag |
| AI editing | Switch to claude.ai project / Cursor / any AI per `DEVHANDOFF.md` |
| Promote pipeline | Use GitHub PRs directly |
| Help button | Email M&L (or whoever they engage) directly |

`DEVHANDOFF.md` updates: document the embed script, the manifest
emitter, the data-ml-block attributes (so a future dev or AI knows
what they're for and how to remove them cleanly).

---

## 15. n8n workflow additions

Existing flows in `CHANGE_REQUEST.md` are reused unchanged. New
flows:

| Trigger | Action |
|---|---|
| Storage usage > 80% of quota (D1 alert) | Email M&L with client + current usage |
| Agent cost > 80% of monthly cap | Email M&L; soft-pause agent until M&L reviews |
| New `help-request` GitHub Issue | Email M&L (reuses existing notification) |
| Daily presence report | Email M&L digest: which clients edited yesterday |

---

## 16. Build phasing

Seven phases total. **Phase -1 ships in 3-5 days** and unblocks Ken so
the pilot starts immediately. Phases 0-5 then build the proper System
Admin in parallel with Ken's real editing work — his feedback informs
each phase.

### Phase -1 — Pilot mode (3-5 days)

The minimum viable path to get Ken editing his real site. Built on
Cursor SDK from the start so we test the production stack from day 1.

**What ships:**

- `admin.mackandlee.com/edit/<client>` — single page, basic-auth gated
- Cursor SDK chat panel (left) + staging iframe (right)
- R2 bucket for SO + image uploader at `/upload` (basic auth)
- Cursor SDK system prompt assembled from `Client-AI-Instructions.md` + `HANDOFF.md`
- "Push site" via marker-commit pattern (see §9a)
- Bundled M&L gate via dashboard pill + optional daily digest (§9a)
- New Page Request flow (§7g) — agent intake + D1 `page_requests` table
- Minimal admin landing at `admin.mackandlee.com` with site card + Ready to publish + New page requests
- Cloudflare Pages project for `admin.mackandlee.com` (Astro static; no Worker complexity yet — basic auth via Cloudflare Access policy in single-password mode)

**What does NOT ship:**

- Toolbar embed on staging (Phase 1)
- Full Cloudflare Access / multi-user identity (Phase 0)
- Element overlay, chips (Phase 2)
- Per-page promote, status states (Phase 3)
- /create mode + pages refactor (Phase 4)
- Help widget, presence (Phase 5)

**Tasks:**

| Task | ~Time |
|---|---|
| Stand up `admin.mackandlee.com` Cloudflare Pages site with basic-auth gate | 0.5 day |
| Build `/edit/<client>` page (chat panel + iframe layout, Astro) | 1 day |
| Wire Cursor SDK + system prompt assembly + commit attribution | 1 day |
| R2 bucket + uploader page at `/upload` | 0.5 day |
| n8n flow: marker commit detected → admin dashboard "Ready to publish" indicator + optional daily digest | 0.5 day |
| New Page Request intake prompt + D1 table + dashboard card | 0.5 day |
| Test end-to-end with M&L playing Ken | 0.5 day |
| Brief Ken (recorded short video + 30-min call) | 0.5 day |

**Definition of done:** Ken visits `admin.mackandlee.com/edit/sustainedoutcomes`,
authenticates, makes a content edit through chat, sees it on staging,
says "push site," M&L receives the indicator + diff, clicks publish,
change is live.

### Phase 0 — Foundation (~1 week)

Upgrade the static Pages site to a proper Worker + dashboard.

- Worker + Hono routes
- Cloudflare Access replaces basic auth — per-user identity, magic links
- D1 schemas: `identity_map`, `presence`, `agent_runs`,
  `publish_requests`, `page_requests`, `client_media_config`
- Admin Home dashboard (full set of cards from §4a)
- "Your Plan" card (initially static text per tier)
- /edit/<client> page survives as the editing surface during this phase

**Definition of done:** Ken logs in via magic link, sees his site card,
sees recent changes in plain English, sees current plan, sees ready-to-publish
indicator. Editing continues via /edit/<client> page.

### Phase 1 — MVP toolbar (~2 weeks)

embed.js + toolbar UI on staging. Cursor SDK chat panel moves from
`/edit/<client>` into the embedded toolbar. **No Promote button yet** —
"push site" continues to trigger M&L gate via marker commit.

- `embed.js` builds and serves from the Worker
- Toolbar UI rendering (port collapse + fade-on-scroll behavior from `StagingBanner.astro`)
- AI button → Cursor SDK chat panel inline
- SO codebase change: load embed script behind `PUBLISH_ML_TOOLBAR_ENABLED` flag, parallel with `StagingBanner` (per §12a-bis)
- `/edit/<client>` page redirects to staging URL once toolbar is stable

**Definition of done:** Ken edits homepage hero via in-page toolbar chat,
sees it on staging, says "push site," M&L publishes via the bundled gate.

### Phase 2 — Editing primitives (~2 weeks)

The labels system + media + +Add for blog/landing. Page creation still
routes to M&L (§7g).

- `data-ml-block` annotations across SO components (one-time pass)
- `data-ml-label` overrides where auto-derived labels are awkward
- Manifest emitter (Astro integration)
- ⊕ Select binary overlay toggle + chip-staging chat input
- 📁 Add Media modal (R2 + Bunny via per-client config); replaces standalone `/upload`
- + Add → Blog post and Landing page conversational flows
- + Add → Page still routes to M&L via New Page Request (§7g)
- Per-client storage quota tracking + Admin Home usage card

**Definition of done:** Ken uses overlay to chip elements into chat,
creates a blog post + landing page through conversation, uploads media
via the toolbar modal.

### Phase 3 — Promote pipeline (~2 weeks)

The full per-page promote system from §9b lands.

- Commit-tagging convention enforced in agent (`Page:` trailer)
- Promote Page button + per-page cherry-pick + build-verify
- Promote Site (whole `staging → main` merge with confirmation dialog)
- Status state machine: Draft / Submitted / Live + composite (`Draft (N pending)`)
- Dependency conflict UX (promote-with-expanded-scope dialog)
- Rollback prefilled prompts in chat
- HEIC server-side conversion on media uploads
- Marker-commit pattern (§9a) retires — `push_site` agent tool replaces it

**Definition of done:** Ken promotes individual pages without M&L
involvement for routine changes. M&L gate downgrades from "review-before"
to "review-after if needed."

### Phase 4 — +Add Page + pages refactor (~1-2 weeks)

The biggest structural change. Bring /create mode online.

- Pages-as-content-collection refactor for SO (§7f)
- `src/lib/sections/registry.ts` — section type allowlist
- `/create/<client>` dedicated route on admin domain (chat + iframe preview, draft-branch mechanism per §7c)
- + Add → Page wires up to /create
- New Page Request flow (§7g) becomes the fallback path, not the primary

**Definition of done:** Ken creates new pages end-to-end without M&L,
restricted to the section-type registry.

### Phase 5 — Polish (~1 week)

- Chatwoot widget deployed at `help.mackandlee.com`
- ? button: presence + chat widget + offline ticket form (§11)
- Admin Home enhancements: storage card, AI cost card, presence toggle for M&L
- Audit log retention enforced (90d)
- Multi-site project switcher dropdown on toolbar logo (latent; activates if a client has >1 site)
- Final cleanup: delete `StagingBanner.astro` from SO

**Definition of done:** Full mockup-equivalent experience shipped.
System Admin v1.0 done.

### Phasing summary

| Phase | Duration | Pilot value to Ken |
|---|---|---|
| -1 | 3-5 days | "I can edit my real site today" |
| 0 | ~1 week | "I have a real login and dashboard" |
| 1 | ~2 weeks | "Editing happens on the site itself, not a separate page" |
| 2 | ~2 weeks | "I click instead of describing things; I can add blog posts and landing pages" |
| 3 | ~2 weeks | "I publish without pinging Mack" |
| 4 | ~1-2 weeks | "I create new pages on my own" |
| 5 | ~1 week | "It's a finished product" |
| **Total** | **~8-11 weeks** part-time | Ken unblocked in week 1 |

---

## 17. Open decisions

Most decisions were resolved during the v1 walk-through. Two
remain open before Phase 0 can start.

### Resolved (during walk-through, 2026-05-12)

| # | Question | Decision |
|---|---|---|
| 2 | Dashboard framework | **Astro.** Reuses M&L skill. Framework-independence contract in §3a guarantees this can change later without affecting client sites. |
| 3 | Per-page promotion mechanism | **Optimistic build-verify.** Dependency conflicts surfaced interactively. |
| 4 | Chat widget | **Chatwoot self-hosted** for v1. Revisit at 5+ clients. |
| 5 | Cloudflare Images timing | **Day 1.** $5/mo, automatic responsive images. |
| 6 | Token cap UX | **Pause-and-confirm at $0.50, hard-stop at $2.00.** Already in §6. |
| — | Multi-tenant vs single-tenant for SO first | **Multi-tenant from day 1.** Deliberate exception to extract-on-second-use rule. |
| — | Status state machine | **Draft / Submitted / Live**, with composite `Draft (N pending)`. |
| — | Page creation surface | **`admin.mackandlee.com/create/<client>`** as a dedicated mode with chat + iframe preview. IDE fallback link available. |
| — | Pages as data | **Content-collection entries** rendered by generic `[...slug].astro`. SO refactor required pre-Phase-2 (§7f). |
| — | Element selector model | **Binary overlay toggle** with chip-staging chat input. |
| — | Audit log | **D1 on admin domain, 90-day retention, M&L-only view in v1.** |
| — | Embed script rollout | **Feature-flagged with `PUBLIC_ML_TOOLBAR_ENABLED`** running in parallel with `StagingBanner` during transition. |
| — | HEIC support | **Yes, server-side convert** to JPG/WebP on upload. |
| — | Media quotas | **20GB R2 / 50GB Bunny / 100GB bandwidth as default**, M&L overrides per client at onboarding via `client_media_config` D1 row. |

### Newly resolved (2026-05-12, end of v1.1 walk-through)

| # | Question | Decision |
|---|---|---|
| 1 | Repo location | **Monorepo: `MavenRayGIT/ML/admin/`** (revised 2026-05-12 PM; was: "`ml-admin` — new GitHub repo"). Reversed after weighing the operational cost of fetching `agentsites/AGENTS.md` + `clients/<client>/HANDOFF.md` from GitHub API per chat turn (for system-prompt assembly, §6) against the lifecycle-separation benefit of a sibling repo. Monorepo wins: local file reads, no API surface, no rate-limit concerns. Client-extraction promises in `DEVHANDOFF.md` are unaffected — they were already a per-client surgical step regardless of admin location. |
| — | Phase -1 AI surface for Ken | **Cursor SDK from day 1.** Skip Cursor IDE for client. Tests production stack from pilot start. **(Reversed 2026-05-12 PM after Phase -1 spike measured ~50–100s end-to-end latency; see `SYSTEM_ADMIN_V1.md`.)** |
| — | Phase -1 ↔ Phase 2 publish mechanism | **Marker-commit + bundled M&L gate** (§9a). No Promote button until Phase 3. **(Parked under V1; see `SYSTEM_ADMIN_V1.md` §5 Layer 3 — Push Live button replaces marker-commits at one-client scale.)** |
| — | New page handling pre-Phase-4 | **Routes to M&L via structured intake** (§7g). M&L builds in Cursor IDE. |
| — | Ken's pilot pricing | **At-cost during build phase.** Formal tier post-launch. **(Revised under V1: Ken pays for Cursor Pro $20/mo directly; M&L only absorbs admin hosting cost. See `SYSTEM_ADMIN_V1.md`.)** |

### Newly resolved (2026-05-12 evening, post Phase -1 spike → V1 pivot)

| # | Question | Decision |
|---|---|---|
| V1-1 | Near-term editing surface (1–4 clients) | **Cursor IDE on client machine.** Astro dev server HMR gives <1s feedback for free. Browser-hosted SDK chat reserved for Phase 1+. Documented in `SYSTEM_ADMIN_V1.md`. |
| V1-2 | Build platform for SO | **Cloudflare Workers SSR (kept).** Static Pages was the alternative; SSR's ~30s build/deploy beats Pages' ~90s for the staging Sync button UX, and we already paid the migration cost. |
| V1-3 | What to do with all the Phase -1 code | **Park in repo, don't delete.** Auto-merge action renamed `.disabled`; embed pill gated by `PUBLIC_ML_EDIT_ENABLED` env var; chat endpoints respond 503 with `CURSOR_API_KEY` removed. Revival is a config flip, not a rebuild. Full inventory in `SYSTEM_ADMIN_V1.md` §4. |
| V1-4 | Sync button mechanic | **Option A: status display + manual refresh, no active build trigger.** Workers Builds auto-deploys reliably; manual trigger adds complexity for marginal gain. |
| V1-5 | Push Live mechanic | **Whole-site `staging → main` merge via GitHub API.** No per-page promote in V1. |

### Still open

| # | Question | Recommendation | Resolved? |
|---|---|---|---|
| 7 | Ken's billing tier post-pilot: Essentials / Standard / Premium | **Standard ($149)** likely fit. Confirm with Ken after Phase 5. | TBD post-launch |
| — | Tier naming: Essentials / Standard / Premium vs Hosted / Managed / Partnership | Either works. Not blocking. Pick before formal pricing rolls out. | TBD post-launch |

### Open decisions for v2 (not blocking)

| # | Topic | Note |
|---|---|---|
| v2-1 | Embedded Claude SDK chat (vs current deep-link approach) | Currently in §6 we're using Cursor SDK. Could move to direct Anthropic/OpenAI later if cost/control demands it. |
| v2-2 | Client-facing audit log UI | Defer until a client asks. |
| v2-3 | Inline text edit action (right-click → Edit text inline...) | Phase 3+; engineer separately. |
| v2-4 | Presence auto-sync (Slack/calendar) | v1 is manual toggle. |
| v2-5 | OAuth providers (Google, Microsoft) | v1 is magic links only. |

---

## 18. Implementation notes for Cursor (when build starts)

When the build session opens:

- Read the **`@cursor/sdk` skill** before any agent code — pricing,
  API surface, and runtime options change. The SDK is the right
  primitive; latest API is the source of truth.
- Read the **Cloudflare `workers-best-practices` skill** for the
  Worker. Streaming, bindings, observability gotchas.
- Read the **Cloudflare `wrangler` skill** before configuring
  `wrangler.jsonc`.
- Read the **Cloudflare `agents-sdk` skill** to compare against
  Cursor SDK — there's overlap and we may want to use both (Cursor
  for the AI loop, CF Agents SDK for the WebSocket transport and
  Durable Object session state).
- Reuse `StagingBanner.astro`'s collapse / fade / persistence
  behavior — well-tested, port the logic directly into the toolbar.

Build order inside Phase 0:

1. Worker + Hono routes
2. Cloudflare Access policy
3. D1 schemas and seed
4. Admin Home SPA pages (list + identity)
5. Cursor SDK smoke test (a "hello" agent run from a Worker route)
6. Then move to Phase 1

---

## 19. Glossary

| Term | Meaning |
|---|---|
| **System Admin** | This product. Both `admin.mackandlee.com` and the toolbar. |
| **Admin Home** | The dashboard at `admin.mackandlee.com` |
| **Toolbar** | The in-page UI injected into staging sites |
| **Block** | Any element with a `data-ml-block` attribute; the editing unit |
| **Manifest** | `/_ml/manifest.json` mapping block IDs to code locations |
| **Promote** | Cherry-pick or merge from `staging` to `main` |
| **Page (status)** | Tag on commits identifying the page(s) they affect |

---

## 20. Version history

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-05-12 (AM) | Initial spec from System Admin v1 design session. Resolves `ML_ADMIN.md` parking-lot v2 toolbar concept. |
| 1.1 | 2026-05-12 (PM) | Pilot-first restructure. Added Phase -1 (Cursor SDK pilot at `admin.mackandlee.com/edit/<client>`, 3-5 days). Split §9 into marker-commit pattern (§9a, early phases) and per-page pipeline (§9b, Phase 3+). Added §7g (New Page Request flow for pre-Phase-4 phases). Moved pages-as-content-collection refactor from pre-Phase-2 to Phase 4. Added "Ready to publish" and "New page requests" and "Your Plan" cards to Admin Home. Resolved repo decision (`ml-admin` new repo). Documented Ken's at-cost pilot pricing. |
| 1.2 | 2026-05-12 (later PM) | Reversed the §17 "ml-admin as separate repo" decision. Admin app now lives inside the `MavenRayGIT/ML` monorepo at `admin/`. Driver: SDK system-prompt assembly (§6) reads `agentsites/AGENTS.md` + `clients/<client>/HANDOFF.md` per turn — local file reads are dramatically simpler than per-turn GitHub API fetches. No code changes elsewhere in the spec. |
| 1.3 | 2026-05-12 (evening) | Added V1 pivot banner pointing to `SYSTEM_ADMIN_V1.md`. Phase -1 spike was built end-to-end (admin shell + chat pill + Cursor agent + auto-merge + SSR migration of SO site) and proved that the model works but is too slow (~50–100s e2e) for live editing at one-client scale. Phase -1 → Phase 5 plan parked; near-term work shifts to "Cursor IDE locally + staging control panel" per the new doc. The long-term spec (Phase 1+ multi-client) remains the target. No content removed from this doc — Phase -1 code parked in repo, revivable with config flips. New decisions logged in §17. |
