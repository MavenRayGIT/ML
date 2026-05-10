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

## Reading Order — Do This Before Writing Any Code

Read these files in order. They live under **`agentsites/`** at the repository
root of `MavenRayGIT/ML` (same path locally and on GitHub).

1. `ML_AGENTS.md` — global rules for how to work on M&L projects
2. `ML_ARCHITECTURE.md` — stack decisions, workflow, delivery process
3. `HANDOFF_v2.md` — **primary build spec** — Figma → Astro component map,
   tokens, typography, spacing, component props, build order
4. `ANALYTICS.md` — tracking and reporting spec
5. `sustainedoutcomes/DESIGN.md` — design context, Figma file URL, page targets
6. `sustainedoutcomes/MODULES.md` — modules in flight for this project

Do not start building until you have read all six.

---

## Figma Reference

- **File:** https://www.figma.com/design/5UU5GrdYf669t3wpLgJkix/Wireframes
- **Master homepage:** node 141:536 (Homepage – Desktop, final)
- **Brand/tokens:** node 141:898 (Brand style tile, authoritative)

The Figma file contains the complete visual design.
HANDOFF_v2.md maps every section to an Astro component with props.
When Figma and HANDOFF_v2.md conflict — ask before proceeding.

---

## Stack

```
Framework:    Astro (latest)
Styling:      Tailwind CSS — tokens defined in HANDOFF_v2.md
Content:      MDX — blog posts in /src/content/blog/
Hosting:      Cloudflare Pages
Repo:         GitHub (main = production, staging = preview)
Fonts:        Self-hosted woff2 — Mona Sans, Libre Franklin
Analytics:    GA4 + GTM + Microsoft Clarity — all via GTM
Pipeline:     Claude API + n8n (post-build, not your concern now)
```

---

## Non-Negotiable Rules

1. **Read HANDOFF_v2.md before writing any component.**
   Every token, every font size, every spacing value is specified.
   Do not invent values.

2. **Never hardcode brand colors.** Use Tailwind tokens only.
   Token definitions are in HANDOFF_v2.md → Design Tokens.

3. **Never hardcode copy.** All text via component props
   or MDX content collections. Nothing literal in components.

4. **All copy is black `#020302`.** No color variations on text.
   Links use amber `#FFC560` highlight pattern — see HANDOFF_v2.md
   → Link & Interactive Patterns.

5. **Mona Sans headlines use -3% letter spacing (negative, tight).**
   Eyebrow ALL CAPS labels use +3% (positive, spaced out).
   See HANDOFF_v2.md → Type Scale.

6. **Build in the order specified.** Tokens → fonts → primitives →
   layout → sections → pages. Do not build pages before components.

7. **Test each component in isolation before composing pages.**

8. **Responsive: verify at 375px, 768px, 1440px before handoff.**
   Lighthouse score > 90 on mobile required.

9. **Main branch is protected.** Never push directly to main.
   All work goes to staging branch. PRs only to main.

10. **`agentsites/` docs do not ship in the site bundle.** They stay in git for
    humans and Claude; the Astro app (e.g. `agentsites/sustainedoutcomes/`) has
    its own `dist/`. Do not point Cloudflare Pages at the whole `agentsites/`
    tree unless that folder is only the app — use the app subfolder as the
    build root.

---

## Build Order

Follow this exactly. Each step should be complete and tested
before moving to the next.

### Step 1 — Tailwind config
Define all tokens from HANDOFF_v2.md → Design Tokens.
Colors, typography scale, spacing, maxWidth.
No components yet — tokens only.

### Step 2 — Base.astro
Self-hosted font loading (@font-face declarations).
GTM snippet via @astrojs/partytown.
Global CSS: inline link styles, body defaults.
Viewport meta, OG meta slots.

### Step 3 — UI Primitives
Build and test in isolation:
- `Button.astro` — 5 variants per HANDOFF_v2.md → Button Variants
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
Key mobile behaviors per HANDOFF_v2.md → Responsive.

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
Node version:      18
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

## Files in `agentsites/` (your full context)

| File | Purpose |
|------|---------|
| `CURSOR_BRIEF.md` | This file — start here |
| `HANDOFF_v2.md` | Primary build spec — Figma → Astro |
| `ML_AGENTS.md` | Global M&L agent rules |
| `ML_ARCHITECTURE.md` | Stack decisions and workflow |
| `ANALYTICS.md` | Tracking and reporting spec |
| `sustainedoutcomes/DESIGN.md` | Design context and Figma reference |
| `sustainedoutcomes/MODULES.md` | Module tracker |
| `DEVHANDOFF.md` | Developer independence guide |
| `CLIENT_ADMIN.md` | Client content management guide |
| `SO_Welcome-and-Onboarding.md` | Client onboarding document |
| `SO_Client-AI-Instructions.md` | Claude system prompt (placeholder) |
| `CHANGE_REQUEST.md` | Change request system spec |
| `ML_ADMIN.md` | M&L internal management guide |

