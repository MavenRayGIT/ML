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
| `Button.astro` | done | 5 variants (amber-fill, green-fill, amber-outline, green-outline, amber-ghost). Polymorphic `<a>` / `<button>`. `modal` prop for ContactModal trigger. |
| `TextLink.astro` | done | Amber `>` chevron + 250ms nudge-right hover. |
| `InlineLink.astro` | done | Amber underline default → amber background highlight on hover. Component form of the global `.prose a` rule. |
| `SectionEyebrow.astro` | done | Mona Sans SemiBold 11px, +3% tracking, ALL CAPS. Colours: black / amber / white / cream. Optional 32px lead rule. |
| `Rule.astro` | done | Semantic `<hr>`, 1px line via background-color. 6 colour options. |

Visual review page: [`/dev/primitives`](site/src/pages/dev/primitives.astro) (noindex, every variant on every relevant background + full type-scale sampler).

## Layout (`src/components/layout/`)

| Component | Status | Notes |
| --- | --- | --- |
| `Nav.astro` | planned | Dark / white / amber states |
| `Footer.astro` | planned | 3-col, logo, tagline, rule |
| `Page.astro` | planned | Base + Nav + Footer (`src/layouts/`) |

## Sections — homepage order (`src/components/sections/`)

| Component | Status | Notes |
| --- | --- | --- |
| `HeroFullbleed.astro` | planned | 3 variants: `photo-blocks`, `photo-gradient`, `color-only` — see HANDOFF.md → Amendments |
| `FocusAreas.astro` | planned | Layout TBD — see open questions in brief |
| `FeatureSplit.astro` | planned | Initiatives + founder; diagonal-edge scroll animation on `init_erb` + `init_ready` |
| `VideoSection.astro` | planned | Placeholder vs real TBD |
| `ServicesGrid.astro` | planned | |
| `BlogPreview.astro` | planned | |
| `ContactSection.astro` | planned | `/contact` only (full split); homepage uses `ContactAmber` if needed |
| `ContactAmber.astro` | planned | Compact amber "Let's talk" form — homepage / inline use |
| `ContactModal.astro` | planned | Modal wrapper around `ContactAmber` — `data-modal="contact"` |
| `CTABand.astro` | planned | |

## Blog modules (Cursor-designed — see `CURSOR_BRIEF.md` → Blog Templates)

| Component | Status | Notes |
| --- | --- | --- |
| `blog_landing-hero_v1` | planned | Featured post large card — top of `/blog` |
| `blog_filter-bar_v1` | planned | Category pills + search input row |
| `blog_detail-hero_v1` | planned | Post title, category, date, author header |
| `blog_detail-prose_v1` | planned | MDX prose styles — body, h2, h3, pullquote, images |

## Archived module list (Design v1 / Breakdance naming)

[`OLD_MODULES.md`](OLD_MODULES.md)
