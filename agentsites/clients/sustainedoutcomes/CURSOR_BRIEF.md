# CURSOR BRIEF — Sustained Outcomes
> Single entry point for Cursor. Read this first, then follow
> the reading order below before writing any code.
> Every decision is documented. Do not assume — read the docs.

---

## What You Are Building

A static marketing website for Sustained Outcomes, a mission-focused
advisory consultancy run by Ken Jacobsen. The site is built on the
Mack & Lee Track A stack: Astro + Tailwind CSS, hosted on Cloudflare
Pages, maintained post-launch via Claude API pipeline.

**This is not a WordPress site. No CMS. No database. No plugins.**
Content lives in MDX files. The client manages content through Claude.
You build the structure. Claude maintains it.

---

## Current state (May 2026)

Read this before reading anything else — it tells you what already exists.

- **Repo:** `MavenRayGIT/ML`, cloned to `/Users/jpielak/Documents/PROJECTS/ML_System/ML`.
- **Astro app location:** `agentsites/clients/sustainedoutcomes/site/` — this is the Cloudflare Pages **build root**, not the repo root.
- **Stack installed:** Astro 6, **Tailwind CSS v4** (`@tailwindcss/vite`, CSS-based config in `src/styles/global.css`), `@astrojs/mdx`, `@astrojs/partytown`. Local `npm run build` works.
- **Live URL (staging environment):** <https://sustained-outcomes.mackandlee.com>. Currently serves a **hand-rolled placeholder** (a "Sustained Outcomes" headline with "In development" eyebrow). The real homepage from `HANDOFF.md` is **not** built yet — it's still on Step 1 of the Build Order below.
- **Cloudflare Pages:** connected to `main`, **Root directory** `agentsites/clients/sustainedoutcomes/site`, **Build** `npm run build`, **Output** `dist`, **`NODE_VERSION=22`**.
- **Image assets already in repo:** 6 photos in `site/src/assets/` (`image 3.jpg`, `image 6.jpg`, `image 9.jpg`, `image 10.jpg`, `image 11.jpg`, `image 12.jpg`). **Spaces in filenames work but should be renamed** (e.g. `hero-erb.jpg`) before referencing in components.
- **User context:** the M&L partner driving this project is a **designer, not a developer**. Prefer step-by-step instructions when running anything outside Cursor (terminal commands, Cloudflare dashboard clicks, etc.).

## Open items / known divergences from the spec

- **Cloudflare Pages root directory needs updating.** After the repo restructure (clients folder), the Cloudflare Pages project root must be changed from `agentsites/sustainedoutcomes/site` to `agentsites/clients/sustainedoutcomes/site`. Until that's done, the next deploy will fail.
- **`staging` branch does not exist yet.** The brief specifies `staging` → PR → `main`, but everything so far has been pushed directly to `main`. Create the `staging` branch and configure Cloudflare branch deploys *before* starting real page work.
- **Tailwind v4, not v3.** The `tailwind.config.mjs` snippets in `HANDOFF.md` are written in legacy v3 style (`theme.extend.colors`, etc.). The installed Tailwind is **v4**, which uses **`@theme { … }`** inside `src/styles/global.css`. Translate the token *values* exactly; the *form* will be CSS, not a JS config.
- **`ContactAmber`, `ContactModal`, and the blog modules** listed in `MODULES.md` and the Amendments section of `HANDOFF.md` are **planned**, not built. Don't assume they exist.

---

## Reading Order — Do This Before Writing Any Code

Paths are relative to this file (`agentsites/clients/sustainedoutcomes/`):

1. `../../CURSOR_BRIEF.md` — portfolio entry point (skim if not already read)
2. `../../AGENTS.md` — portfolio rules (auto-loaded by Cursor)
3. `../../ARCHITECTURE.md` — Track A stack and workflow
4. `HANDOFF.md` — **primary build spec** — Figma → Astro component map,
   tokens, typography, spacing, component props, build order
5. `../../ANALYTICS.md` — tracking and reporting spec
6. `DESIGN.md` — design context, Figma file URL, page targets
7. `MODULES.md` — modules in flight for this project

Do not start building until you have read all of these.

---

## Figma Reference

- **File:** https://www.figma.com/design/5UU5GrdYf669t3wpLgJkix/Wireframes
- **Master homepage:** node 141:536 (Homepage – Desktop, final)
- **Brand/tokens:** node 141:898 (Brand style tile, authoritative)

The Figma file contains the complete visual design.
`HANDOFF.md` maps every section to an Astro component with props.
When Figma and `HANDOFF.md` conflict — ask before proceeding.

---

## Stack

```
Framework:    Astro 6
Styling:      Tailwind CSS v4 — tokens defined in HANDOFF.md
Content:      MDX — blog posts in /src/content/blog/
Hosting:      Cloudflare Pages
Repo:         GitHub (main = production, staging = preview)
Fonts:        Self-hosted woff2 — Mona Sans, Libre Franklin
Analytics:    GA4 + GTM + Microsoft Clarity — all via GTM
Pipeline:     Claude API + n8n (post-build, not your concern now)
```

---

## Non-Negotiable Rules

1. **Read HANDOFF.md before writing any component.**
   Every token, every font size, every spacing value is specified.
   Do not invent values.

2. **Never hardcode brand colors.** Use Tailwind tokens only.
   Token definitions are in `HANDOFF.md` → Design Tokens.

3. **Never hardcode copy.** All text via component props
   or MDX content collections. Nothing literal in components.

4. **All copy is black `#020302`.** No color variations on text.
   Links use amber `#FFC560` highlight pattern — see `HANDOFF.md`
   → Link & Interactive Patterns.

5. **Mona Sans headlines use -3% letter spacing (negative, tight).**
   Eyebrow ALL CAPS labels use +3% (positive, spaced out).
   See `HANDOFF.md` → Type Scale.

6. **Build in the order specified.** Tokens → fonts → primitives →
   layout → sections → pages. Do not build pages before components.

7. **Test each component in isolation before composing pages.**

8. **Responsive: verify at 375px, 768px, 1440px before handoff.**
   Lighthouse score > 90 on mobile required.

9. **Main branch is protected.** Never push directly to main.
   All work goes to staging branch. PRs only to main.

10. **`agentsites/` docs do not ship in the site bundle.** They stay in git for
    humans and Claude. Cloudflare Pages root is **`agentsites/clients/sustainedoutcomes/site`**, never the wider `agentsites/` tree.

---

## Build Order

Follow this exactly. Each step should be complete and tested
before moving to the next.

### Step 1 — Tailwind config
Define all tokens from `HANDOFF.md` → Design Tokens.
Colors, typography scale, spacing, maxWidth.
No components yet — tokens only.

### Step 2 — Base.astro
Self-hosted font loading (@font-face declarations).
GTM snippet via @astrojs/partytown.
Global CSS: inline link styles, body defaults.
Viewport meta, OG meta slots.

### Step 3 — UI Primitives
Build and test in isolation:
- `Button.astro` — 5 variants per `HANDOFF.md` → Button Variants
- `TextLink.astro` — amber > chevron, animated hover (nudge right)
- `SectionEyebrow.astro` — ALL CAPS, +3% tracking
- `Rule.astro` — 1px horizontal rule, color as prop

### Step 4 — Layout
- `Nav.astro` — 3 states (dark/white/amber), IntersectionObserver scroll
- `Footer.astro` — 3-col nav, logo, tagline, rule, copyright
- `Page.astro` — Base + Nav + Footer wrapper

### Step 5 — Sections (in homepage order)
- `HeroFullbleed.astro`
- `FocusAreas.astro`
- `FeatureSplit.astro` (reused for initiatives + founder)
- `VideoSection.astro`
- `ServicesGrid.astro`
- `BlogPreview.astro`
- `ContactSection.astro`
- `CTABand.astro`

### Step 6 — Content
- Blog collection schema (`/src/content/config.ts`)
- Blog post template (`/src/pages/blog/[slug].astro`)
- Blog landing page (`/src/pages/blog/index.astro`)

### Step 7 — Pages
- `index.astro` — homepage (compose from Step 5 sections)
- `about.astro`
- `consulting.astro`
- `initiatives.astro`
- `support.astro`
- `partners.astro`
- `contact.astro`

### Step 8 — Analytics
Wire GA4 events per ANALYTICS.md:
- CTA button clicks (Request a Meeting, Fund This Work)
- Contact form submits
- Blog post reads (75% scroll depth)
- Outbound link clicks

### Step 9 — Responsive pass
Verify all breakpoints: 375px (mobile), 768px (tablet), 1440px (desktop).
Key mobile behaviors per `HANDOFF.md` → Responsive.

### Step 10 — Quality check
- Lighthouse mobile score > 90
- All Tailwind tokens used — no hardcoded values
- All text via props — no hardcoded copy
- All fonts loading correctly
- GTM firing in preview

---

## Open Questions

Resolve these with the client/M&L before building affected components:

1. **FocusAreas layout:** centered or left-aligned?
2. **Founder section:** Variant A (green button) or B (amber button)?
3. **Contact form:** full split layout or simple amber centered?
4. **Video section:** real video content or placeholder for now?
5. **Nav State 3 (amber):** when does this appear?

If you encounter anything not covered in the docs — stop and ask.
Do not assume. Do not invent. Flag it.

---

## Environment Variables

Required before running locally:

```bash
# .env (copy from .env.example, never commit)
PUBLIC_GTM_ID=             # GTM-XXXXXXX
PUBLIC_GA4_ID=             # G-XXXXXXXXXX
PUBLIC_CLARITY_ID=         # Microsoft Clarity project ID
GA4_PROPERTY_ID=           # numeric GA4 property ID
GA4_API_CREDENTIALS=       # base64 encoded service account JSON
N8N_REPORT_WEBHOOK=        # n8n webhook URL
CLIENT_REPORT_EMAIL=       # Ken's email for monthly reports
GITHUB_TOKEN=              # fine-grained PAT, staging branch only
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_BUCKET=
```

Also add all PUBLIC_ vars to Cloudflare Pages dashboard:
Settings → Environment Variables.

---

## Deployment

```
Branch: main       → auto-deploy to production
Branch: staging    → auto-deploy to preview URL
Build command:     npm run build
Output directory:  dist
Node version:      22 (Astro 6 requires >=22.12.0; set `NODE_VERSION=22` on Cloudflare Pages)
```

Never merge to main directly. All changes via PR from staging.

---

## What Happens After You Build

Post-launch, the Claude API pipeline takes over routine content updates.
Ken (the client) will manage blog posts and landing pages through
a Claude conversation — not through any CMS or code editor.

Your job is to build a clean, well-documented, token-driven codebase
that Claude can read and edit confidently. Comments in components
help Claude understand what each prop does and where content lives.

The `agentsites/` docs are Claude's reference — keep them in the repo, outside
the Astro `dist/` output.

---

## Your full doc context

In this folder (`agentsites/clients/sustainedoutcomes/`):

| File | Purpose |
|------|---------|
| `CURSOR_BRIEF.md` | This file — start here |
| `AGENTS.md` | Client-specific agent overrides |
| `HANDOFF.md` | Primary build spec — Figma → Astro |
| `DESIGN.md` | Design context and Figma reference |
| `MODULES.md` | Module tracker |
| `README.md` | How to run the site locally |
| `Welcome-and-Onboarding.md` | Client onboarding document |
| `Client-AI-Instructions.md` | Client's Claude system prompt |

In the portfolio root (`agentsites/`):

| File | Purpose |
|------|---------|
| `CURSOR_BRIEF.md` | Portfolio entry point |
| `AGENTS.md` | Portfolio agent rules |
| `ARCHITECTURE.md` | Track A stack and workflow |
| `ANALYTICS.md` | Tracking and reporting spec |
| `DEVHANDOFF.md` | Developer independence guide |
| `CLIENT_ADMIN.md` | Client content management guide |
| `CHANGE_REQUEST.md` | Change request system spec |
| `ML_ADMIN.md` | M&L internal management guide |

---

## Blog Templates — Cursor Responsibility

Blog landing and blog detail pages are **not** designed in Figma. Cursor
owns the design and build of these templates.

### Reference

- Layout/UX reference: <https://www.whitestonemarketing.com/insights>
  (use for layout patterns, filtering UI, post detail structure)
- Design system: `HANDOFF.md` — all tokens, fonts, spacing apply
- Compose from existing modules where possible (see [`MODULES.md`](MODULES.md))
- Design net-new only where existing modules don't fit
- Log any net-new modules in `MODULES.md` with status
  `planned` (or `project` if it warrants library promotion later)

### Blog Landing — `/blog`

Requirements:

- Hero: `hero_page-title_v1` — "From the Blog"
- Featured post: large card at top — image, category, title, excerpt,
  text-link. Most recent post by default.
- Post grid: `cards_3col-blog_v1` pattern for remaining posts
- Pagination: load-more button OR page 1/2/3 — Cursor decides based on
  Astro content collection best practice
- Tag/category filter: pill buttons across the top, one per category —
  "All", "Access to Nature", "Connecting with Nature",
  "Business Sustainability"
  - Active state: amber fill `#FFC560`, black text
  - Inactive state: `border-[#083928]` outline, black text
- Search: simple text input, filters posts by title and excerpt.
  Client-side filtering only (no server needed for Ken's volume).
  Style: white input, `border-[#E2E2E2]`, placeholder muted `#9A9A9A`.
- Filter + search sit in the same row above the post grid.
- CTA band: `cta-band_dark_v1` at the bottom.

### Blog Detail — `/blog/[slug]`

Requirements:

- Hero: post title (Mona Sans Bold 48px), category pill, date, author —
  dark green `#083928` bg or `hero_page-title_v1`
- Prose body: MDX content
  - Max width: 760px centered (narrower than page content width)
  - Body: Libre Franklin Regular 18px, lh 30px, black
  - H2: Mona Sans Bold 32px, -3% tracking
  - H3: Mona Sans Bold 24px, -3% tracking
  - Inline links: `inline-link` pattern (amber highlight on hover)
  - Blockquote / pull quote: amber left border `#FFC560` 3px, Mona Sans
    Bold 24px, italic, indented
  - Inline image: full prose width, border-radius 2px
  - Full-width image: breaks out of prose width to full content width
    (1312px), border-radius 2px
  - Video embed: full prose width, 16:9 aspect ratio, rounded
- Related posts: `cards_3col-blog_v1` — 3 posts from the same category.
  Label: "More from the Blog".
- CTA band: `cta-band_dark_v1` at the bottom.

### Search + tags — implementation notes

- Filtering is client-side — all posts loaded, JS filters display.
- Use Astro's content collection to generate static post data.
- Pass all posts as a JSON data attribute on the filter component.
- No external search service needed at Ken's post volume.
- If post volume grows beyond ~200 posts, consider Pagefind (Astro-native
  static search) — note this in code comments.

### Net-new blog modules

Cursor must create and log these in `MODULES.md`:

| Module | Notes |
|--------|-------|
| `blog_landing-hero_v1` | Featured post large card — top of blog landing |
| `blog_filter-bar_v1` | Category pills + search input row |
| `blog_detail-hero_v1` | Post title, category, date, author header |
| `blog_detail-prose_v1` | MDX prose styles — body, h2, h3, pullquote, images |

---

## Image Assets

All project images live at:

```
agentsites/clients/sustainedoutcomes/site/src/assets/
```

Use Astro's `<Image />` component from `astro:assets` so the build pipeline
can optimize, convert to WebP, and lazy-load.

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/[filename]';
---
<Image src={heroImage} alt="Description" />
```

Do **not** put project images in `/public/images/` — that bypasses
optimization. `/public/` stays reserved for files that must be served as-is
(favicon, font `woff2` files, OG share images referenced by absolute URL).

---

## Deployment Environment

| Branch | URL | Purpose |
|--------|-----|---------|
| `staging` | `sustained-outcomes.mackandlee.com` | All development work lands here |
| `main` | `sustainedoutcomes.com` (when DNS is moved) | Production — merge only, never push direct |

**All Cursor work goes to the `staging` branch.** Never commit to `main`
directly. Production deploys via PR: `staging` → `main` only.

Ken reviews everything at `sustained-outcomes.mackandlee.com` before
anything goes live at `sustainedoutcomes.com`.

