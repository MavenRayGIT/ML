# MODULES — Sustained Outcomes (Track A)

Astro components for this project. Specs and props: [`HANDOFF.md`](HANDOFF.md). Build order: [`CURSOR_BRIEF.md`](CURSOR_BRIEF.md) → Build Order.

## Status values

- `planned` — specified in handoff, not started
- `in_progress` — active in dev
- `done` — implemented and reviewed
- `needs_design` — blocked on Figma / open questions in brief

## UI primitives (`src/components/ui/`)

| Component | Status | Notes |
| --- | --- | --- |
| `Button.astro` | done | `variant` × `surface` matrix (amber-fill / green-fill / outline / outline-emph × light / dark / amber). Polymorphic `<a>` / `<button>`. `modal` prop for ContactModal trigger. |
| `TextLink.astro` | done | 18×18 amber chip with white chevron glyph. Hover: chip amber→green-dark, chevron nudges right (Corporate_Elegant 250ms). |
| `InlineLink.astro` | done | Amber underline default → amber background highlight on hover. Component form of the global `.prose a` rule. |
| `SectionEyebrow.astro` | done | Mona Sans SemiBold 11px, +3% tracking, ALL CAPS. Colours: black / amber / white / cream. Optional 32px lead rule. |
| `Rule.astro` | done | Semantic `<hr>`, 1px line via background-color. 8 colour options. |

Visual review page: [`/dev/primitives`](site/src/pages/dev/primitives.astro) (noindex, every variant on every relevant background + full type-scale sampler).

## Layout (`src/components/layout/`)

| Component | Status | Notes |
| --- | --- | --- |
| `Nav.astro` | done | 3 scroll states — section-driven via `data-nav-bg`. **Dark state is transparent at rest**; once scrolled (`data-nav-compact="true"`, threshold 32px) it picks up `rgba(8,57,40,0.88)` + `backdrop-filter blur(8px)` so hero copy passing under no longer collides. In compact, the desktop nav itself **shrinks 74→56px**, logo 40→32px circle / 28→22px wordmark, and CTA padding 24×12 → 18×8 — all transitioning together (250ms). 74/56px desktop · 56px mobile · 20px page gutter on mobile. **Hamburger up to 1100px** (`--breakpoint-nav` / `nav:` Tailwind variant) — keeps the full row from wrapping on narrow laptops. Mobile = hamburger → full amber overlay. |
| `Footer.astro` | done | 3-col, icon + wordmark logo, amber tagline, cream copyright. No divider rule (amended). |
| `Page.astro` | done | Base + StagingBanner + Nav + Footer (`src/layouts/`). `hasHero` skips top padding so heroes sit flush; banner is a pure overlay (no chrome reflow). |
| `StagingBanner.astro` | done | Collapsible (× → corner handle → click to re-open), expandable panel via chevron (SEO/AIO ● System default, Analytics ○ Not configured, Ticketing ○ Not configured — Tier 2 promotes these to interactive tiles), fade-on-scroll, localStorage-persisted. Suppress with `PUBLIC_HIDE_STAGING_BANNER=true`. |
| `BlogPostingJsonLd.astro` | done | `src/components/seo/` — JSON-LD `BlogPosting` payload for blog detail pages. All fields auto-derived from MDX frontmatter; no override surface in v1 (Tier 2 adds optional `seoTitle`, `keywords`, `updated`, `noindex`, `canonical`). |

Visual review page: [`/dev/layout`](site/src/pages/dev/layout.astro) (4-band scroll-state demo for the nav, full footer).

## Sections — homepage order (`src/components/sections/`)

Decisions for the homepage compose are recorded in [`HANDOFF.md`](HANDOFF.md) →
*Open Questions for Client (resolved 2026-05-11)*. Status reflects the
homepage build only — variants outside the homepage default still ship via
component props.

| Component | Status | Notes |
| --- | --- | --- |
| `HeroFullbleed.astro` | done | 3 variants in one component. Homepage default = `photo-blocks`. The per-line bg rects are **painted as SVG** (inline painter measures lines via `Range.getClientRects()`, draws into a `<g opacity="0.51">`). SVG group flattens the rects into an opaque union before applying alpha, so overlap is invisible and lines merge into a single seamless shape — letting the H1 keep the design's tight `0.85` leading without alpha-band artifacts. Repaints on resize + `fonts.ready`. Body copy uses `data-hero-block-mode="block"` to draw one solid union rect snapped to the bottom of the headline block. **`size` prop** (added 2026-05-11): `full` → `max(100vh, 788px)` (homepage); `sub` → `max(70vh, 540px)` (interior pages — about/consulting/initiatives/support/partners). |
| `FocusAreas.astro` | done | Homepage default = **left-aligned** intro block above the 3-col card grid. Images locked to 16:9 (was square — refined 2026-05-11). |
| `FeatureSplit.astro` | done | Reused 3× on homepage: ERB (image-left, dark, angled), Oakland (image-right, light, angled), Founder (image-left, light, **`contained`** — image stays inside `max-w-content` per 2026-05-11). **`prevBg` / `nextBg` props** (added 2026-05-11): adjacent-section blend for the angled clip-path wedges. Section is wrapped in a `feature-split-frame` div that hosts two coloured plates (top half = `prevBg`, bottom half = `nextBg`); the clipped section sits in front so its triangular wedges reveal the matching colour instead of the page background. Enum: `white \| amber \| cream \| green-dark \| gray-light`. No-op on non-angled sections. Wired on /support → VideoSection (amber), homepage Oakland → VideoSection (amber), /partners → CTABand (green-dark). |
| `VideoSection.astro` | done | Bunny Stream iframe embed (16:9, preload). Bunny owns the poster + play UI — section renders the iframe directly. |
| `ServicesGrid.astro` | done | 3-col grid: image top, H3 title, body, TextLink. Optional header block (eyebrow + headline + body). |
| `BlogPreview.astro` | done | "Latest Insights" — 3 most-recent posts via prop. Entry animation removed (was `row-shift`; cards now static). |
| `ContactSection.astro` | done | `/contact` only (full split). Form structurally complete — `<form method="POST">` with named fields, required flags, autocomplete, hidden `_subject`. Backend wiring (Cloudflare Pages Function / Formspree) is Step 8 work — `formAction` prop is currently unwired. **Not on the homepage** — see resolved decisions in HANDOFF.md. |
| `ContactAmber.astro` | planned | Compact amber "Let's talk" form. Library module for ad-hoc inline use; not on the homepage. |
| `ContactModal.astro` | planned | Modal wrapper around `ContactAmber` — `data-modal="contact"`. Library module. |
| `CTABand.astro` | done | Dark-green band, eyebrow + H2 + two CTAs. Closes the homepage in place of any inline contact form. |

## Blog modules (`src/components/blog/`)

Sustained Outcomes blog system — Step 7. Decisions for this build
(per user direction 2026-05-11, Everlywell reference):

- **Detail page** — title block, scrollable body with **persistent
  sidebar TOC**, share-by-copy-URL, optional inline / sidebar promo
  banners (stub for v1), related-articles row at the bottom.
- **Landing page** — list of all posts, **native `<select>` category
  filter** (no chip rail), visible category tag on each card. No
  latest/oldest sort. No keyword search yet — both deferred to v2.

| Component | Status | Notes |
| --- | --- | --- |
| `BlogCard.astro` | done | Reusable post card with the Step-5 card-image-contract hover (image shrinks 30% on hover, excerpt expands into the released space, card footprint stays fixed). Two sizes: `lg` (homepage / landing grid, 500px tall) and `sm` (related row at bottom of detail, 420px tall). Visible amber category pill above the title. Single source of truth — `BlogPreview`, `BlogCardGrid`, and `BlogRelated` all consume it. |
| `BlogFilterBar.astro` | done | Native `<select>` category dropdown with per-category counts + "All (N)" default. Client-side filter — toggles `[hidden]` on `[data-blog-card]` inside the nearest `[data-blog-page]`. No URL state synced (v2). Empty-state element revealed when filter narrows to zero. |
| `BlogCardGrid.astro` | done | 3-col / 2-col / 1-col responsive grid. Exposes `data-blog-grid` + per-card `data-category` for the filter script. Server-renders every post; filter is JS-progressive (works with JS off). |
| `BlogDetailHero.astro` | done | Editorial title block — eyebrow row (category + date + duration), H1 (`text-h2-lg`, not the hero scale), excerpt, "By Author", optional cover image at `max-w-[1100px]`. Sits inside the standard content margin — no full-bleed photo hero on posts. |
| `BlogToc.astro` | done | Persistent sticky sidebar TOC (H2-level only) at `position: sticky; top: 96px`. Active section tracked by `IntersectionObserver` (top-of-viewport heuristic) — adds `[data-active]` + amber tick. Collapses to a `<details>` element above the article below 1024px. JS-progressive: anchor links still navigate if the observer doesn't load. |
| `BlogShareButton.astro` | done | Copy current URL to clipboard via `navigator.clipboard.writeText` (with `execCommand` fallback). Inline label swaps to "Link copied" for 1.6s. No social-network share intents — those would clutter the sidebar for now. |
| `BlogPromoBanner.astro` | done | Stub callout (heading + body + CTA) for download / register / newsletter promos. Two visual styles: `amber` (light sidebar) and `dark` (green panel). Content currently hardcoded per-page; a banners content collection is a v2 lift. |
| `BlogRelated.astro` | done | Bottom-of-post related row — 3× `BlogCard size="sm"`, same-category-first with top-up from other categories. Renders nothing when no related posts. |
| `.prose` (MDX body styles in `global.css`) | done | Vertical-rhythm rules for h2 / h3 / p / ul / ol / blockquote / hr / code / pre / img inside MDX bodies. `scroll-margin-top: 96px` on headings so #anchor jumps clear the nav. Anchor rule pre-existed from Step 3. |

## Pages (`src/pages/`)

Composed from the section modules above. All copy is **placeholder for
visual review** and will be drafted with Ken at the client review
milestone — final copy is not in scope for the build pass.

| Route | File | Status | Notes |
| --- | --- | --- | --- |
| `/` | `index.astro` | done | Homepage — Step 5 composition. |
| `/about` | `about.astro` | done | Hero + 2× FeatureSplit (story + practice) + VideoSection + CTABand. |
| `/consulting` | `consulting.astro` | done | Hero + ServicesGrid + FeatureSplit (sample engagement, angled-dark) + FeatureSplit (process, contained) + CTABand. Anchors: `#strategy`, `#engagement`, `#systems`. |
| `/initiatives` | `initiatives.astro` | done | Hero + FocusAreas (3 initiatives) + 3× FeatureSplit (ERB angled-dark, Oakland angled-light, Next contained) + CTABand. Anchors: `#erb`, `#oakland`, `#next`. |
| `/support` | `support.astro` | done | Hero + FocusAreas (3 ways to support, centered) + FeatureSplit (why non-profit, angled-dark) + VideoSection + CTABand. |
| `/partners` | `partners.astro` | done | Hero (color-only) + FocusAreas (current partners, centered) + FeatureSplit (become a partner, angled-dark) + CTABand. |
| `/contact` | `contact.astro` | done | Slim intro block (no full hero — form is the focus) + ContactSection + CTABand. Form unwired pending Step 8. |
| `/blog` | `blog/index.astro` | done | Intro block + `BlogFilterBar` + `BlogCardGrid` + `CTABand`. Reads from `getCollection('blog', !draft)`, newest-first. Category dropdown + counts derived from the loaded posts. |
| `/blog/[...slug]` | `blog/[...slug].astro` | done | Static-paths over every published post. `BlogDetailHero` → two-col body (`.prose` left + sticky sidebar with `BlogToc` / `BlogShareButton` / `BlogPromoBanner` right) → `BlogRelated` → `CTABand`. 3 sample posts seeded in `src/content/blog/`. |

## Motion Polish Pass (deferred — pick up after page composition)

Tracked refinements that are best tuned **after** all pages are
composed, so motion is dialed in against the final visual context
(rather than against placeholder pages) and we tune once instead of
twice. Scheduled for the polish stage after Step 6 (page composition)
and Step 7 (MDX/blog), and before Step 9 (final QA). Each item has a
defined acceptance criterion so it can be scoped and shipped
independently.

| Item | Status | Acceptance criterion |
| --- | --- | --- |
| Angled-edge scroll motion | deferred | On every `FeatureSplit` with `angled=true`, the top/bottom `clip-path` edges spread outward as the section scrolls through the viewport (top edge `10% → ~4%`, bottom edge `90% → ~96%`). Tied to viewport scroll position via `IntersectionObserver` ratio or rAF + `getBoundingClientRect`, ±24px max travel. Suppress when `prefers-reduced-motion: reduce`. Mobile (<768px): static. |
| Auto-scrolling brand/initiative gallery | deferred | On `/about`, a horizontally auto-scrolling row of partner / press / community logos, ~30s loop, pauses on hover, suppressed on `prefers-reduced-motion`. Speed slower than c2's reference (which the brief called out as "too fast"). |
| Hero parallax (decision + maybe build) | deferred | Decide whether the photo in `HeroFullbleed`'s `photo-blocks` variant should translate Y at 0.3–0.4× scroll speed. If yes, build the same way: rAF-throttled, reduced-motion guard, mobile off. If no, document the decision in `ANIMATION.md`. |
| Scroll-tied page-level reveal pass | deferred | One sweep through every section to confirm reveals fire at the right scroll position now that pages are composed — `IntersectionObserver` threshold and `rootMargin` may need per-section tuning. Currently all use `{ threshold: 0.15, rootMargin: '0px 0px -10% 0px' }`. |
| Eyebrow re-entry behaviour | deferred | Currently single-shot per page load (`unobserve` after first reveal). Confirm in context of long pages that this still reads as intended, or reverse to re-trigger on each entry. Spec note 2026-05-11: user explicitly OK'd single-shot for now. |
| Continuous animation audit | deferred | One pass to confirm no "always running" loops (rotating shapes, pulsing dots, etc.) have crept in — the brief explicitly calls out the looping animation on c2 as something to avoid. |

When picking up the polish pass: drive each item from a single
`motion-pass` working branch with a screenshot diff per change. Don't
re-litigate the design decisions — these were locked 2026-05-11.

## Blog v2 (deferred from Step 7)

Items the user explicitly OK'd for "later" or "maybe later" during the
Step 7 conversation. Captured here so they aren't lost.

| Item | Status | Notes |
| --- | --- | --- |
| Keyword search on `/blog` | deferred | User: "We may want a keyword search? we don't have to have it now." Likely implementation: small client-side fuzzy index over title + excerpt + tags, no server round-trip. |
| URL-state filter sync on `/blog` | done | `?category=` is now read on load and pre-selects the dropdown; changes write back via `replaceState`. Wired 2026-05-11 alongside the clickable category chip on blog detail pages. |
| Banner content collection | deferred | `BlogPromoBanner` v1 takes inline props; a `banners` content collection (similar shape to `blog`) would let banners be CMS-managed and reused across posts without touching MDX. |
| Web Share API fallback | deferred | `BlogShareButton` currently always copies URL. A native share sheet on mobile (where it works) would be a nice progressive enhancement. |
| H3-depth TOC | deferred | TOC currently lists H2 only. Optional flag on `BlogToc` to drop down a level when posts get long and structured. |

## SEO / AIO

Tier 1 — wired 2026-05-11. All meta auto-derived from MDX frontmatter
(no per-post override surface yet).

| Output | Source | Where |
|---|---|---|
| `<title>` | `frontmatter.title` + " — Sustained Outcomes" | `Base.astro` |
| `<meta name="description">` | `frontmatter.excerpt` (fallback to "{title} — a field note...") | `Base.astro` |
| `<link rel="canonical">` | computed `<Astro.site>/blog/<slug>/` | `Base.astro` |
| `og:type` | hardcoded `article` for blog detail | `blog/[...slug].astro` |
| `og:image` | `frontmatter.image` resolved via `getImage({ width: 1200 })`, absolute URL | `blog/[...slug].astro` |
| `article:published_time` / `article:modified_time` | `frontmatter.date` (modified == published in v1) | `Base.astro` ← `articleMeta` |
| `article:author` | `frontmatter.author` | `Base.astro` ← `articleMeta` |
| `article:section` | `frontmatter.category` | `Base.astro` ← `articleMeta` |
| JSON-LD `BlogPosting` | derived from all of the above + publisher (Sustained Outcomes + SO icon as logo) | `BlogPostingJsonLd.astro` in `head` slot |

The staging banner's expandable panel surfaces the SEO/AIO row as
"System default" so the client can tell at a glance the page is
publishing valid Tier 1 meta with no manual configuration.

### Tier 2 (deferred — promotes when the client wants control)

| Field | Purpose | Wiring impact |
|---|---|---|
| `seoTitle?: string` | SERP-tuned title, shorter / keyword-led | Override `<title>` when present, fall back to existing title |
| `seoDescription?: string` | SERP-tuned description | Override meta description |
| `keywords?: string[]` | Per-post keywords for AIO tagging | Render into JSON-LD `keywords` + multiple `article:tag` meta |
| `updated?: Date` | Last-revised date — Google rewards freshness | Override `dateModified` + `article:modified_time` |
| `noindex?: boolean` | Publish live but block indexing | Emit `<meta name="robots" content="noindex, nofollow">` |
| `canonical?: string` | Syndicated-content support | Override canonical link |
| `ogImage?: string` | Override the auto-derived cover for social previews | Replace OG image URL |

When Tier 2 ships, the staging panel's SEO/AIO row promotes to an
interactive tile: open a Cursor/Claude session on this page's
frontmatter to edit any of the above, or jump to a global SEO
defaults config.

### Tier 3 (site-wide pass, future)

- `twitter:site` handle (Base.astro)
- `@astrojs/sitemap` integration → `/sitemap.xml`
- Explicit `robots.txt` allowing GPTBot / ClaudeBot / PerplexityBot / Googlebot + pointing to sitemap
- Optional RSS feed at `/blog/feed.xml`
- Site-wide `Organization` JSON-LD in `Base.astro` (sameAs LinkedIn etc. once known)

## Archived module list (Design v1 / Breakdance naming)

[`OLD_MODULES.md`](OLD_MODULES.md)
