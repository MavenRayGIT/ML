# ARCHITECTURE — Mack & Lee
> Global workflow, stack standards, and delivery process for all M&L projects.
> Read this before starting any new project.
> Version: 2.0 — updated to reflect Astro + Cloudflare + Claude API stack.

---

## Two Delivery Tracks

M&L delivers websites on one of two tracks depending on client needs:

| Track | Stack | When to use |
|-------|-------|-------------|
| **A — Managed AI** | Astro + Tailwind + Cloudflare + Claude API | Client comfortable with AI interface, blog-driven, low structural change frequency |
| **B — WordPress** | WordPress + Breakdance | Client requires visual editor, complex dynamic content, plugin ecosystem |

**Default to Track A** for new clients unless they explicitly need a visual editor.
Sustained Outcomes is the reference implementation for Track A.

---

## Track A — Full Stack Spec

```
Design:     Figma (M&L standard)
Framework:  Astro (latest)
Styling:    Tailwind CSS
Content:    Markdown / MDX in /src/content/
Hosting:    Cloudflare Pages (green, free tier)
Repo:       GitHub
Pipeline:   Claude API + n8n
Reporting:  Claude API + GA4 Data API
```

### Why this stack
- **Astro:** static output, fast, blog-native content collections, AI-readable code
- **Tailwind:** utility classes, easy for Claude API to target and edit precisely
- **Cloudflare Pages:** verified green hosting, free for static sites, global CDN, auto-deploy
- **Claude API:** powers client content pipeline — blog posts, landing pages, copy updates
- **n8n:** orchestrates pipeline and monthly reporting automation
- **Markdown/MDX:** plain text files, AI-native, no database, no security updates

### Astro dependencies
```
astro@latest
@astrojs/tailwind
@astrojs/mdx
@astrojs/partytown    ← loads GTM off main thread
tailwindcss@latest
```

---

## Track A — Folder Structure

```
/src
  /components
    /sections          ← one .astro file per M&L module
    /ui                ← primitives: Button, Rule, Pill, etc.
    /layout            ← Nav, Footer
  /content
    /blog              ← .mdx files, one per post
  /layouts
    Base.astro         ← html shell, head, fonts
    Page.astro         ← Base + Nav + Footer
  /pages               ← routes (.astro files)
/public
  /fonts               ← self-hosted woff2 files
  /images              ← static assets
/ml                    ← M&L system files (not shipped to client)
  AGENTS.md
  DESIGN.md
  MODULES.md
  HANDOFF.md
  ANALYTICS.md
  CLIENT_ADMIN.md
  ML_ADMIN.md
  [ProjectName]_Client-AI-Instructions.md
.env.example           ← committed, no values
.env                   ← never committed
```

---

## Track A — Per-Project Cost

| Item | Cost/mo |
|------|---------|
| Cloudflare Pages | $0 |
| Cloudflare R2 (images) | $0 up to 10GB |
| GitHub | $0 |
| Claude API (Haiku 4.5) | ~$1-2 |
| n8n Cloud | $20 (split across clients at scale) |
| Domain | ~$1.25 |
| **Total** | **~$7-23/mo** |

Move n8n to shared self-hosted VPS when 5+ clients are on Track A.
Target client charge: $75-150/mo managed hosting.

---

## Workflow Phases — Track A

### 1. Discovery
- Business requirements
- Content inventory
- Client technical comfort assessment
- Track A vs. B decision
- Project brief written

### 2. Design — Figma
- M&L visual standard applied
- Desktop mockup (1440px) — full page
- Mobile mockup (390px) — key screens only
- Tablet and intermediate breakpoints handled in code
- Mockup input requirements (see below) must be met before starting
- Section-by-section approval process
- MODULES.md updated as modules are built

### 3. Handoff
- HANDOFF.md written — maps Figma → Astro components
- ANALYTICS.md implementation section completed
- All environment variables documented
- Font files sourced
- Logo exported as SVG

### 4. Build — Cursor
- Reads HANDOFF.md + DESIGN.md + MODULES.md
- Builds primitives first, then layout, then sections, then pages
- No hardcoded colors — Tailwind tokens only
- No hardcoded copy — props or content collections only
- Responsive verified at 375px, 768px, 1440px
- Lighthouse score > 90 on mobile before launch

### 5. Analytics Setup
- GA4 property + GTM container created
- Standard events implemented per ANALYTICS.md
- Monthly report n8n workflow configured and tested

### 6. Launch
- DNS → Cloudflare Pages
- Green hosting verified at thegreenwebfoundation.org
- sitemap.xml submitted
- OG meta verified
- CLIENT_ADMIN.md delivered
- Client Claude project set up with Client-AI-Instructions loaded
- Pipeline tested end-to-end: client request → preview → publish

### 7. Ongoing
- Client manages content via Claude
- M&L handles structural changes via Cursor
- Monthly report delivered automatically
- Stack upgrades applied per ML_ADMIN.md process

---

## Mockup Input Requirements

**These must be resolved BEFORE any Figma work begins.**
If any item is missing or unresolvable — STOP and request it.

### Reference site
- Must be a URL Claude can access
- If Claude cannot access it (403, bot block) — STOP
  Request a screenshot or PDF export from the client
- Reference site informs: font sizes, spacing, layout density,
  color application, section rhythm, interaction patterns
- Claude must be able to SEE the reference before designing anything

### Brand tokens
- Cannot be extracted from Figma via MCP tools
- Must be provided explicitly: hex values, font names, weights
- Required: primary, secondary, background, text, accent colors
- Required: headline font, body font, weight usage

### Copy and content
- Wireframe-to-mockup pass: lorem ipsum for all body copy
- Wireframes inform content hierarchy only
- Copy refinement pass happens after layout is approved

### Images
- Must be uploaded directly to chat or verified accessible URLs
- Claude cannot read raw image files from external URLs
- If any image is missing or inaccessible — STOP
- Do not substitute placeholders without flagging the gap

### Section intent
- As each section is designed, Claude asks one clarifying question
  about who it targets and what action it drives
- Do not assume section purpose from wireframe structure alone

---

## Wireframe Fidelity at Mockup Phase

Wireframes define content hierarchy and section intent — not layout.

If reference site or client direction conflicts with wireframe layout:
1. Flag the gap explicitly
2. Explain the reason
3. Ask how to resolve
4. Do not treat wireframes as rigid layout specs

**Example:** wireframe shows split hero → reference site shows
full-bleed hero → flag it → confirm → adapt.
Reference site and client direction take precedence over
wireframe structure once confirmed.

---

## Figma Write Policy

**Never make edits in Figma without explicit per-request permission.**
Propose → get greenlight → write. Every time. Prior approval does not carry over.

Reads are always allowed (get_design_context, get_screenshot).
Scope reads to specific nodes — never call metadata on document root.

### Page safety rule
Before writing to any Figma page:
1. Read all existing children on that page
2. List them explicitly
3. Only remove what is explicitly confirmed for deletion
Never use a blanket page clear without per-item permission.

Treat all non-Claude artifacts on the working page as untouchable:
- Reference screenshots placed by the user
- Image assets placed by the user
- Annotations or notes
- Any layer not created by Claude in the current session

### Mockup process
- Thumbnail first — always sketch inline before any Figma work
- One section at a time — get approval then build
- Screenshot after every write to verify output
- If screenshot tool fails to render image fills — note it, ask client to verify in Figma

---

## Client AI Interface

### Track A clients manage their site through Claude
- Client uses claude.ai with their Sustained Outcomes (or equivalent) project
- [ProjectName]_Client-AI-Instructions.md loaded as system prompt
- GitHub MCP connected to client's Claude account
- Client never uses Cursor, GitHub UI, or any developer tool

### What clients can do via Claude
- Create and publish blog posts
- Create landing pages (from defined schema)
- Update copy on existing pages
- Add/update images and video embeds
- Simple content changes

### What requires M&L (Cursor)
- New section types or layout changes
- Design modifications
- New component types
- Schema changes
- Pipeline failures

### Client AI instructions file
Named: `[ProjectName]_Client-AI-Instructions.md`
Completed at build phase — placeholder created during design phase.
Contains: site context, content rules, tone of voice, what client can/cannot change.

---

## Responsive Design

| Scope | Where |
|-------|-------|
| Desktop mockup (1440px) | Figma |
| Mobile mockup (390px) | Figma — key screens only |
| Tablet + intermediate breakpoints | Cursor / code |
| Responsive reflow logic | Cursor / Breakdance (Track B) |

Mobile Figma frames are visual reference only —
not pixel-perfect specs for every state.

Key mobile behaviors (Track A):
- Nav collapses to hamburger at 768px
- 3-col grids stack to 1-col
- Feature splits stack: image top, text below
- Hero font reduces to 48px
- Section padding reduces to 64px vertical

---

## Analytics Standard

See `ANALYTICS.md` for full specification.

Every Track A site ships with:
- GA4 + GTM + Microsoft Clarity
- Standard event tracking (CTA clicks, scroll depth, blog reads)
- Landing page schema with auto-wired conversion tracking
- Monthly AI-generated executive summary via n8n + Claude API
- Cloudflare Web Analytics as privacy-friendly fallback

Analytics standard is versioned. When updated, apply to all active clients.

---

## Landing Page Standard

Every landing page created via Claude pipeline defines:
```
title, slug, headline, subheadline, heroImage,
ctaText, ctaHref, trackingGoal, ga4EventName,
metaTitle, metaDescription, ogImage
```

Claude validates schema before creating the page.
Missing required fields → Claude asks before proceeding.

---

## Module Naming Convention

Format: `type_variant_v[n]`

Type prefixes:
`hero` `cards` `cta` `feature-split` `accordion`
`testimonial` `logos` `stats` `form` `nav` `header` `footer`
`blog` `featured-card`

Primitives (no prefix):
`button` `pill` `nav-arrow` `link` `input` `label` `badge`

Variants use Figma Component Properties — not separate components.
Separate module only when grid/structure differs fundamentally.

---

## Module Scope & Promotion

| Status | Where | When |
|--------|-------|------|
| `project` | Active project Figma file | First time built |
| `candidate ★` | Same file, tagged in MODULES.md | Used 2+ times or clearly reusable |
| `promoted` | M&L Library Figma file + spec written | Validated, ready for cross-project use |

Default to project scope.
Promote to global only after validation.
Never silently create cross-project artifacts.

---

## Stack Upgrade Process

When any ML_System document is updated:
1. Note version change in the document
2. Apply to reference client (SO) first — validate
3. Document what changed in ML_System changelog
4. Roll out to other clients at next maintenance window
5. Update CLIENT_ADMIN.md if client-facing behavior changes

---

## Per-Project Files

Every project folder contains:

| File | Purpose |
|------|---------|
| `AGENTS.md` | Project-scoped agent instructions |
| `DESIGN.md` | Figma URL, tokens, page targets, content notes |
| `MODULES.md` | Module tracker for this project |
| `HANDOFF.md` | Figma → Astro component map + build spec |
| `ANALYTICS.md` | Implementation section for this project |
| `CLIENT_ADMIN.md` | Client-facing guide to managing site via Claude |
| `ML_ADMIN.md` | Internal M&L management guide (global, not per-project) |
| `[Name]_Client-AI-Instructions.md` | Claude system prompt for client project |
| `HANDOFF.md` (build phase) | Figma frames → component map + Cursor spec |

---

## Reference Implementation

**Sustained Outcomes** is the first Track A client.
All Track A decisions, patterns, and documents established here
become the template for future clients.

Figma: https://www.figma.com/design/5UU5GrdYf669t3wpLgJkix/Wireframes
Mockup page: Mockups v1 (client-styled reference)


---

## Client Autonomy — No Lock-In Policy

Every M&L Track A delivery includes a complete developer handoff package.
Clients can take their site and operate it fully independently
with any developer, AI tool, or in-house team they choose.

**What travels with every site:**
- Full source code in a GitHub repo the client owns
- `/ml` documentation folder — all decisions documented
- `DEVHANDOFF.md` — complete technical handoff guide
- `CLIENT_ADMIN.md` — client content management guide
- `[Name]_Client-AI-Instructions.md` — loadable into any AI
- `.env.example` — all required variables documented

**What clients are never dependent on:**
- M&L tooling or systems
- Proprietary components or licenses
- Any specific AI provider
- M&L's n8n instance (replaceable or removable)

**The `/ml` documentation is AI-agnostic.**
Claude, Copilot, Cursor, Gemini, or any future model
can read these files and operate the site.

This is a feature, not a risk. Clients who know they can leave
are clients who choose to stay.

**DEVHANDOFF.md** is generated at launch and kept current.
Any structural change that affects the handoff must update DEVHANDOFF.md.


---

## Change Request System

All code-level changes on Track A sites go through the
Change Request system defined in `CHANGE_REQUEST.md`.

**Backbone:** GitHub Issues (free, AI-native, repo-linked)
**Client experience:** Claude conversation + email only
**M&L experience:** GitHub Issues + email notifications
**Sprint management:** GitHub Milestones

Key principle: Claude does the work first, M&L reviews
at the key moment. Quality control without labor overhead.

See `CHANGE_REQUEST.md` for full specification.

