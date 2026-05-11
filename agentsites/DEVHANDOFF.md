# DEV HANDOFF — Sustained Outcomes
> Complete technical handoff package for any developer, AI or human,
> to take over, maintain, or extend this site independently.
> No dependency on Mack & Lee to understand or operate this codebase.

---

## What This Is

This document packages everything a developer needs to:
- Understand what was built and why
- Run the site locally
- Make structural changes
- Extend or replace the content pipeline
- Move to a different host
- Onboard their own AI tooling

This site was built by Mack & Lee using the M&L Track A stack.
All decisions are documented here and in the supporting files listed below.

---

## Repository

```
Repo:     github.com/[org]/ml-sustainedoutcomes-site
Branch:   main (production)
          staging (preview / client review)
```

Clone and run locally:
```bash
git clone https://github.com/[org]/ml-sustainedoutcomes-site
cd ml-sustainedoutcomes-site
npm install
cp .env.example .env   # fill in your values
npm run dev            # http://localhost:4321
npm run build          # production build to /dist
```

---

## Stack

| Layer | Tool | Version | Notes |
|-------|------|---------|-------|
| Framework | Astro | latest | Static site generator |
| Styling | Tailwind CSS | latest | All tokens in tailwind.config.mjs |
| Content | MDX | via @astrojs/mdx | Blog posts in /src/content/blog/ |
| Hosting | Cloudflare Pages | — | Auto-deploy from main branch |
| Repo | GitHub | — | Source of truth |
| Analytics | GA4 + GTM + Clarity | — | See ANALYTICS.md |
| Pipeline | Claude API + n8n | — | Optional — replaceable |

No WordPress. No database. No server. Pure static output.

---

## Hosting

**Current:** Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Auto-deploys on push to `main`
- Preview deploys on all other branches
- Verified green hosting (thegreenwebfoundation.org)

**To move to a different host:**
Any static host works — Vercel, Netlify, GitHub Pages, AWS S3 + CloudFront.
Change the build target in `astro.config.mjs` if needed.
Update DNS to point to new host.
No other changes required — the site is fully portable.

**To self-host:**
Run `npm run build` → serve the `/dist` folder from any web server.
No Node.js required at runtime.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values.
All variables documented in `.env.example`.

```bash
# Analytics
PUBLIC_GTM_ID=              # GTM-XXXXXXX
PUBLIC_GA4_ID=              # G-XXXXXXXXXX
PUBLIC_CLARITY_ID=          # Microsoft Clarity project ID

# GA4 Reporting API (server-side only)
GA4_PROPERTY_ID=
GA4_API_CREDENTIALS=        # base64 encoded service account JSON

# Content Pipeline (optional — only needed if using Claude API pipeline)
N8N_REPORT_WEBHOOK=
CLIENT_REPORT_EMAIL=
GITHUB_TOKEN=               # fine-grained PAT, staging branch write only
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_ACCOUNT_ID=
```

If you're not using the Claude API pipeline, the pipeline variables
are not required. The site runs without them.

---

## Codebase Map

```
/src
  /components
    /sections          ← page section components (one per M&L module)
    /ui                ← primitives: Button, Rule, Pill
    /layout            ← Nav.astro, Footer.astro
  /content
    /blog              ← blog posts as .mdx files
  /layouts
    Base.astro         ← html shell, head, font loading, GTM
    Page.astro         ← Base + Nav + Footer
  /pages
    index.astro        ← homepage
    blog/
      index.astro      ← blog landing
      [slug].astro     ← individual post template
    about.astro
    consulting.astro
    initiatives.astro
    support.astro
    partners.astro
    contact.astro
/public
  /fonts               ← self-hosted woff2 (Mona Sans, Libre Franklin)
  /images              ← static assets, logo SVG
/ml                    ← documentation (not shipped in build output)
```

---

## Design System

All brand tokens are defined as Tailwind utilities in `tailwind.config.mjs`.
Never hardcoded in components — always referenced via token name.

**Colors:**
```js
olive.dark    #171601    // dark section backgrounds
olive         #333003    // buttons and rules on light bg
amber         #FFC560    // primary CTA color
sage          #D4E8C1    // text and rules on dark bg
sage.muted    #A6B880    // body text on dark bg
body          #40403D    // body text on light bg
gray.bg       #F7F7F5    // light section backgrounds
foot.bg       #1A1801    // footer background
```

**Fonts:**
```
Mona Sans Bold          — display headlines
Libre Franklin Regular  — body copy
Libre Franklin SemiBold — eyebrows, buttons, nav
Inter Regular           — service/card titles
```

**Spacing:**
```
Section padding:  128px vertical (96px compact)
Content width:    1312px max (64px margins)
Page width:       1440px max
```

Full design context: `DESIGN.md`
Full component map: `HANDOFF.md`

---

## Adding Content

### New blog post
Create `/src/content/blog/YYYY-MM-DD-slug.mdx`:

```mdx
---
title: "Post Title"
date: 2025-06-01
category: "Access to Nature"
excerpt: "Optional summary shown on blog landing page."
image: "https://your-image-url.com/photo.jpg"
author: "Ken Jacobsen"
draft: false
---

Your content here. MDX supports standard markdown
plus HTML and custom components.

![Alt text](https://image-url.com/photo.jpg)

<iframe
  width="560" height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  allowfullscreen
/>
```

Valid categories: `Access to Nature` | `Connecting with Nature` | `Business Sustainability`

### New landing page
Create `/src/pages/your-slug.astro`.
Required frontmatter fields are documented in `HANDOFF.md → Landing Page Schema`.
GA4 event name must be defined — see `ANALYTICS.md`.

### New page
Create `/src/pages/page-name.astro`.
Use `Page.astro` as layout — it includes Nav and Footer automatically.

---

## Component Architecture

Every page section is a self-contained Astro component.
Components accept props — no hardcoded content.
Composition happens in page files.

```astro
---
// index.astro
import HeroFullbleed from '../components/sections/HeroFullbleed.astro';
import FocusAreas from '../components/sections/FocusAreas.astro';
import FeatureSplit from '../components/sections/FeatureSplit.astro';
---

<Page>
  <HeroFullbleed
    headline="Strategy Rooted in Purpose."
    eyebrow="Mission-Focused Advisory Services"
    image="/images/hero.jpg"
    ctaText="Request a meeting"
    ctaHref="/contact"
  />
  <FocusAreas ... />
  <FeatureSplit ... />
</Page>
```

Full component prop reference: `HANDOFF.md`

---

## Analytics

GA4 + GTM + Microsoft Clarity.
All tracking fires via GTM — no direct script tags in components.
Standard events documented in `ANALYTICS.md`.

To add a new tracked event:
1. Add GTM trigger + GA4 event tag in GTM dashboard
2. Note the event in `ANALYTICS.md`

Monthly reports fire automatically via n8n on the 1st of each month.
To replace the reporting pipeline, see the n8n workflow spec in `ANALYTICS.md`.

---

## Content Pipeline (Optional)

The Claude API + n8n pipeline enables the client to manage
content through a Claude conversation. It is optional —
the site functions completely without it.

**To replace with your own pipeline:**
The pipeline does one thing: creates/edits files in the repo
and pushes commits to the staging branch. Any tool that can
write to GitHub can replace it.

**To disable entirely:**
Remove n8n environment variables from Cloudflare Pages.
Client manages content by editing files directly in GitHub
or through any other method of their choice.

**Pipeline documentation:** `ANALYTICS.md → n8n Report Workflow`

---

## Replacing the AI Tooling

This codebase has no dependency on any specific AI tool.

The `/ml` folder contains plain markdown files.
Any AI with access to the repo can read them and
understand the codebase, design system, and content rules.

**To use with Cursor:**
Open the repo in Cursor. The `/ml` files load as context automatically.

**To use with GitHub Copilot:**
Load `agentsites/AGENTS.md` and the client's `HANDOFF.md` as context files.

**To use with any other AI:**
Paste the contents of `agentsites/AGENTS.md`, the client's `HANDOFF.md`,
and `DESIGN.md` as system context.

**To use with a human developer:**
This document is the starting point. All decisions are documented.
No institutional knowledge lives outside these files.

---

## Going Independent — Full Autonomy Checklist

If you are taking over this site completely:

### Accounts to transfer
- [ ] GitHub repo — transfer ownership or fork
- [ ] Cloudflare Pages project — add your account as owner
- [ ] GA4 property — add as admin, remove M&L access
- [ ] GTM container — add as admin, remove M&L access
- [ ] Microsoft Clarity — add as admin, remove M&L access
- [ ] Domain registrar — transfer or update nameservers
- [ ] n8n workflow — export from M&L n8n, import to your instance

### Credentials to rotate
- [ ] `GITHUB_TOKEN` — generate your own fine-grained PAT
- [ ] `GA4_API_CREDENTIALS` — create your own service account
- [ ] `N8N_REPORT_WEBHOOK` — update to your n8n instance
- [ ] Cloudflare API token — if used in pipeline

### Documentation to keep
All `/ml` files travel with the repo.
No documentation lives outside this codebase.

### What you don't need from M&L
- No proprietary tooling
- No licensed components
- No external dependencies beyond the npm packages in package.json
- No ongoing access to M&L systems

---

## Support

This site was built by Mack & Lee.
For questions about this codebase: [M&L contact]

For questions about the content pipeline,
analytics setup, or AI tooling: [M&L contact]

All decisions are documented in the `/ml` folder.
If something isn't documented, that's a gap — let us know.

