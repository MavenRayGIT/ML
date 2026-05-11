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
| `Nav.astro` | done | 3 scroll states — section-driven via `data-nav-bg`. **Dark state is transparent** (hero gradient supplies contrast). 74px desktop · 56px mobile · 20px page gutter on mobile. Mobile = hamburger → full amber overlay. |
| `Footer.astro` | done | 3-col, icon + wordmark logo, amber tagline, cream copyright. No divider rule (amended). |
| `Page.astro` | done | Base + StagingBanner + Nav + Footer (`src/layouts/`). `hasHero` skips top padding so heroes sit flush; banner is a pure overlay (no chrome reflow). |
| `StagingBanner.astro` | done | Collapsible (× → corner handle → click to re-open), fade-on-scroll, localStorage-persisted. Suppress with `PUBLIC_HIDE_STAGING_BANNER=true`. |

Visual review page: [`/dev/layout`](site/src/pages/dev/layout.astro) (4-band scroll-state demo for the nav, full footer).

## Sections — homepage order (`src/components/sections/`)

Decisions for the homepage compose are recorded in [`HANDOFF.md`](HANDOFF.md) →
*Open Questions for Client (resolved 2026-05-11)*. Status reflects the
homepage build only — variants outside the homepage default still ship via
component props.

| Component | Status | Notes |
| --- | --- | --- |
| `HeroFullbleed.astro` | done | 3 variants in one component. Homepage default = `photo-blocks`. The per-line bg rects are **painted as SVG** (inline painter measures lines via `Range.getClientRects()`, draws into a `<g opacity="0.51">`). SVG group flattens the rects into an opaque union before applying alpha, so overlap is invisible and lines merge into a single seamless shape — letting the H1 keep the design's tight `0.85` leading without alpha-band artifacts. Repaints on resize + `fonts.ready`. |
| `FocusAreas.astro` | done | Homepage default = **left-aligned** intro block above the 3-col card grid. Images locked to 16:9 (was square — refined 2026-05-11). |
| `FeatureSplit.astro` | done | Reused 3× on homepage: ERB (image-left, dark, angled), Oakland (image-right, light, angled), Founder (image-left, light, **`contained`** — image stays inside `max-w-content` per 2026-05-11). |
| `VideoSection.astro` | done | Bunny Stream iframe embed (16:9, preload). Bunny owns the poster + play UI — section renders the iframe directly. |
| `ServicesGrid.astro` | done | 3-col grid: image top, H3 title, body, TextLink. Optional header block (eyebrow + headline + body). |
| `BlogPreview.astro` | done | "Latest Insights" — 3 most-recent posts via prop. Entry animation removed (was `row-shift`; cards now static). |
| `ContactSection.astro` | planned | `/contact` only (full split). **Not on the homepage** — see resolved decisions in HANDOFF.md. |
| `ContactAmber.astro` | planned | Compact amber "Let's talk" form. Library module for ad-hoc inline use; not on the homepage. |
| `ContactModal.astro` | planned | Modal wrapper around `ContactAmber` — `data-modal="contact"`. Library module. |
| `CTABand.astro` | done | Dark-green band, eyebrow + H2 + two CTAs. Closes the homepage in place of any inline contact form. |

## Blog modules (Cursor-designed — see `CURSOR_BRIEF.md` → Blog Templates)

| Component | Status | Notes |
| --- | --- | --- |
| `blog_landing-hero_v1` | planned | Featured post large card — top of `/blog` |
| `blog_filter-bar_v1` | planned | Category pills + search input row |
| `blog_detail-hero_v1` | planned | Post title, category, date, author header |
| `blog_detail-prose_v1` | planned | MDX prose styles — body, h2, h3, pullquote, images |

## Archived module list (Design v1 / Breakdance naming)

[`OLD_MODULES.md`](OLD_MODULES.md)
