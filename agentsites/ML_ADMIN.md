# ML ADMIN — Mack & Lee
> Internal guide for M&L team members managing client sites
> built on the Astro + Cloudflare + Claude API stack.
> Read alongside `agentsites/ARCHITECTURE.md` and `agentsites/ANALYTICS.md`.

---

## Parking lot — things to fix later (not blocking)

Items noted in passing. Pick up when there's spare time; none of these block client work.

| Item | Noted | Notes |
|---|---|---|
| `www.mackandlee.com` returns Cloudflare 522 (origin timeout from WPX) | 2026-05-11 | Apex `https://mackandlee.com` works fine; only the `www` variant fails. Pre-existing — WPX vhost likely not configured for `www`. Fix options: (a) Cloudflare Page Rule / Bulk Redirect `www.mackandlee.com/*` → `https://mackandlee.com/$1` (5 min, recommended), or (b) ask WPX to add `www` to the vhost. Low priority because canonical apex works and search engines respect it. |

---

## Stack Overview

```
Figma (design)
  ↓
Cursor (build — Astro + Tailwind)
  ↓
GitHub (source of truth)
  ↓
Cloudflare Pages (hosting — green, free tier)
  ↓
Claude API + n8n (client content pipeline)
  ↓
Client via CLIENT_ADMIN.md
```

---

## Your Tools

| Tool | Purpose | Access |
|------|---------|--------|
| Cursor | Build + structural changes | Your machine |
| GitHub | Repo management | github.com |
| Cloudflare | Hosting, DNS, analytics, R2 | dash.cloudflare.com |
| n8n | Automation pipeline | n8n.io or self-hosted |
| Claude (this) | Design, docs, content, QA | claude.ai |
| GA4 | Analytics | analytics.google.com |
| GTM | Tag management | tagmanager.google.com |

---

## Per-Project Setup Checklist

Complete in this order when onboarding a new client:

### 1. Design phase
- [ ] Figma file created, M&L naming conventions applied
- [ ] DESIGN.md populated
- [ ] MODULES.md initialized
- [ ] Client brand tokens documented
- [ ] Homepage mockup approved by client
- [ ] Key sub-page mockups completed or scaffolded

### 2. Pre-build
- [ ] HANDOFF.md written (use SO as template)
- [ ] ANALYTICS.md implementation section filled in
- [ ] CLIENT_ADMIN.md customized for client
- [ ] GitHub repo created: `ml-[clientname]-site`
- [ ] Repo structure initialized from HANDOFF.md spec
- [ ] Font files sourced and added to `/public/fonts/`
- [ ] Logo exported as SVG from Figma

### 3. Accounts & credentials
- [ ] GA4 property created
- [ ] GTM container created
- [ ] Cloudflare account / Pages project created
- [ ] Microsoft Clarity project created
- [ ] Environment variables documented in `.env.example`
- [ ] Actual `.env` stored in secure password manager
- [ ] n8n workflow duplicated from SO template
- [ ] n8n environment variables set for this client

### 4. Build (Cursor)
- [ ] Primitives built and tested (Button, Rule, etc.)
- [ ] Layout components built (Nav, Footer)
- [ ] All homepage sections built as isolated components
- [ ] Blog collection schema configured
- [ ] Blog landing + post template built
- [ ] Sub-pages scaffolded
- [ ] Responsive behavior verified at 375px, 768px, 1440px
- [ ] All Tailwind tokens used — no hardcoded values
- [ ] All copy via props or content collections — nothing hardcoded

### 5. Analytics
- [ ] GTM snippet in Base.astro via environment variable
- [ ] GA4 tag firing in GTM
- [ ] Clarity tag firing in GTM
- [ ] Standard events verified in GA4 DebugView
- [ ] CTA click events verified
- [ ] Monthly report n8n workflow tested
- [ ] Test report email sent and approved

### 6. Launch
- [ ] DNS pointed to Cloudflare Pages
- [ ] SSL certificate active
- [ ] sitemap.xml generated and submitted to GA4
- [ ] robots.txt configured
- [ ] OG meta tags verified (use opengraph.xyz to check)
- [ ] Page speed verified (Lighthouse > 90 on mobile)
- [ ] Green hosting verified at thegreenwebfoundation.org
- [ ] CLIENT_ADMIN.md delivered to client
- [ ] Claude project set up for client with SITE.md loaded
- [ ] Test: client makes a blog post request, verify full pipeline

---

## Making Structural Changes

Structural changes = anything beyond content and copy.
These go through Cursor, not the Claude pipeline.

**Examples of structural changes:**
- New section type on any page
- Layout modifications
- New page template
- Component redesign
- Tailwind config changes
- New content collection schema fields
- Pipeline modifications

**Process:**
1. Branch from `main`: `git checkout -b feature/[description]`
2. Make changes in Cursor
3. Test locally: `npm run dev`
4. Build check: `npm run build`
5. Push branch → Cloudflare creates preview deploy automatically
6. Share preview URL with client if design change
7. Merge to `main` → auto-deploy to production

**Never push directly to main.**

---

## Content Pipeline — How It Works

```
Client message (Claude)
  ↓
Claude reads codebase context + SITE.md
  ↓
Claude creates/edits file(s)
  ↓
GitHub commit to staging branch
  ↓
Cloudflare auto-deploys preview
  ↓
Preview URL sent to client
  ↓
Client approves → Claude merges to main
  ↓
Production deploy (~30 seconds)
```

### What Claude can create/edit via pipeline:
- `/src/content/blog/*.mdx` — blog posts
- `/src/pages/[lander].astro` — landing pages (from schema)
- Simple copy changes in component props
- Image URL updates

### What requires your involvement:
- Anything outside the above
- New component types
- Schema changes
- Pipeline failures

---

## Analytics Management

### Monthly tasks (automated — verify n8n is running)
- Report generated and sent on 1st of month
- Check n8n execution log for errors

### Quarterly tasks (manual)
- Review GA4 property for data quality
- Check GTM for tag errors
- Verify Clarity sessions recording
- Review landing page conversion rates
- Update ANALYTICS.md if standard has evolved
- Apply any standard upgrades to this client

### Annual tasks
- Annual report generated (upgrade n8n workflow to trigger Dec 31)
- Review and upgrade analytics stack per latest ANALYTICS.md version
- Confirm green hosting status still verified

---

## Environment Variables Reference

```bash
# Astro / Build
PUBLIC_GTM_ID=              # GTM-XXXXXXX
PUBLIC_CLARITY_ID=          # Microsoft Clarity project ID
PUBLIC_GA4_ID=              # G-XXXXXXXXXX

# Server-side (never exposed to client)
GA4_PROPERTY_ID=            # numeric property ID
GA4_API_CREDENTIALS=        # base64 encoded service account JSON

# Pipeline
N8N_REPORT_WEBHOOK=         # n8n webhook URL
CLIENT_REPORT_EMAIL=        # client's monthly report email
GITHUB_REPO=                # org/repo-name
GITHUB_TOKEN=               # fine-grained PAT, staging branch write only
CLOUDFLARE_ACCOUNT_ID=      # for R2 image uploads
CLOUDFLARE_R2_BUCKET=       # client image bucket name
```

Store in:
- Cloudflare Pages dashboard (build-time vars)
- n8n credentials store (pipeline vars)
- Password manager (master copy)
- Never in repo — `.env` is in `.gitignore`

---

## Troubleshooting

### Pipeline not deploying
1. Check n8n execution log
2. Check GitHub Actions tab for errors
3. Check Cloudflare Pages build log
4. Common cause: malformed MDX in blog post

### Client report not sending
1. Check n8n scheduled workflow — did it run?
2. Check GA4 API credentials — not expired?
3. Check SMTP/email credentials in n8n
4. Manual trigger: run n8n workflow manually, check output

### Site down / build failing
1. Check Cloudflare Pages build log first
2. Pull latest, run `npm run build` locally
3. Find the error, fix in Cursor, push fix branch
4. Merge fix to main

### Client can't access Claude project
1. Verify they're using the correct Claude account
2. Verify the project has SITE.md and CLIENT_ADMIN.md loaded
3. Verify GitHub MCP is connected in their Claude settings
4. Test: ask Claude "what site are you managing?" — should respond with client name

---

## Repo Structure Reference

```
/src
  /components
    /sections        ← M&L module components
    /ui              ← primitives
    /layout          ← Nav, Footer
  /content
    /blog            ← client blog posts (.mdx)
  /layouts           ← Base.astro, Page.astro
  /pages             ← routes
/public
  /fonts             ← self-hosted woff2 files
  /images            ← static assets
/ml                  ← M&L system files (not shipped)
  AGENTS.md
  DESIGN.md
  MODULES.md
  HANDOFF.md
  ANALYTICS.md
  CLIENT_ADMIN.md
  ML_ADMIN.md        ← this file
  SITE.md
.env.example         ← committed, no values
.env                 ← never committed
```

---

## When to Involve the Client

| Situation | Action |
|-----------|--------|
| Structural change needed | Brief client, get approval, build in Cursor |
| Design refinement | Show preview link, get feedback |
| New feature request | Evaluate against HANDOFF.md, quote if needed |
| Something breaks | Fix first, inform client after |
| Analytics anomaly | Flag in monthly report or proactively |
| Stack upgrade available | Evaluate, apply to SO first, roll out to others |

---

## Billing Reference (per client)

| Item | Cost | Notes |
|------|------|-------|
| Cloudflare Pages | $0 | Free for static sites |
| Cloudflare R2 | $0 | Free up to 10GB |
| GitHub | $0 | Public or free private |
| Claude API | ~$1-2/mo | Haiku 4.5, Ken-level usage |
| n8n Cloud | $20/mo | Split across clients at scale |
| Domain | ~$1.25/mo | Billed annually |
| **Total** | **~$7-23/mo** | Depending on n8n hosting |

Charge client: $75-150/mo managed hosting.
Move n8n to shared self-hosted VPS when 5+ clients on stack.

---

## Stack Upgrade Process

When ANALYTICS.md, HANDOFF.md, or ARCHITECTURE.md is updated:
1. Note version change in the document
2. Apply to SO first — validate
3. Document what changed in ML_System changelog
4. Roll out to other clients at next maintenance window
5. Update CLIENT_ADMIN.md if client-facing behavior changes

---

## Sustained Outcomes Specifics

- **Repo:** `ml-sustainedoutcomes-site`
- **Cloudflare project:** `sustained-outcomes`
- **Client contact:** Ken Jacobsen
- **Report email:** [Ken's email]
- **Claude project:** Sustained Outcomes (Ken's account)
- **Key events to monitor:** Request a Meeting clicks, Fund This Work clicks
- **Green hosting:** verify at thegreenwebfoundation.org post-launch
- **Blog cadence:** irregular, client-driven
- **Priority landing page:** Oakland Outdoors registration

