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
| `TextLink.astro` | done | Amber `>` chevron + 250ms nudge-right hover. |
| `InlineLink.astro` | done | Amber underline default → amber background highlight on hover. Component form of the global `.prose a` rule. |
| `SectionEyebrow.astro` | done | Mona Sans SemiBold 11px, +3% tracking, ALL CAPS. Colours: black / amber / white / cream. Optional 32px lead rule. |
| `Rule.astro` | done | Semantic `<hr>`, 1px line via background-color. 8 colour options. |

Visual review page: [`/dev/primitives`](site/src/pages/dev/primitives.astro) (noindex, every variant on every relevant background + full type-scale sampler).

## Layout (`src/components/layout/`)

| Component | Status | Notes |
| --- | --- | --- |
| `Nav.astro` | done | 3 scroll states (dark/white/amber) — section-driven via `data-nav-bg`. Mobile = hamburger → full amber overlay. |
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
| `HeroFullbleed.astro` | planned | 3 variants in one component. Homepage default = `photo-blocks` (dark-green bg blocks behind text). |
| `FocusAreas.astro` | planned | Homepage default = **left-aligned** intro block above the 3-col card grid. |
| `FeatureSplit.astro` | planned | Reused 3× on homepage: Initiative ERB (image-left), Initiative Oakland (image-right), Founder (Variant B = amber-fill CTA). Diagonal-edge scroll animation on the two initiatives. |
| `VideoSection.astro` | planned | Bunny Stream iframe embed (16:9, preload). Bunny owns the poster + play UI — section renders the iframe directly. |
| `ServicesGrid.astro` | planned | 3-col grid: image top, H4 title, body, TextLink. |
| `BlogPreview.astro` | planned | "Latest Insights" — 3 most-recent posts from the content collection. |
| `ContactSection.astro` | planned | `/contact` only (full split). **Not on the homepage** — see resolved decisions in HANDOFF.md. |
| `ContactAmber.astro` | planned | Compact amber "Let's talk" form. Library module for ad-hoc inline use; not on the homepage. |
| `ContactModal.astro` | planned | Modal wrapper around `ContactAmber` — `data-modal="contact"`. Library module. |
| `CTABand.astro` | planned | Dark-green band, 320px, eyebrow + H2 + two CTAs. Closes the homepage in place of any inline contact form. |

## Blog modules (Cursor-designed — see `CURSOR_BRIEF.md` → Blog Templates)

| Component | Status | Notes |
| --- | --- | --- |
| `blog_landing-hero_v1` | planned | Featured post large card — top of `/blog` |
| `blog_filter-bar_v1` | planned | Category pills + search input row |
| `blog_detail-hero_v1` | planned | Post title, category, date, author header |
| `blog_detail-prose_v1` | planned | MDX prose styles — body, h2, h3, pullquote, images |

## Archived module list (Design v1 / Breakdance naming)

[`OLD_MODULES.md`](OLD_MODULES.md)
