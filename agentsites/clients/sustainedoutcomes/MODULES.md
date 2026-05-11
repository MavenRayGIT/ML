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

## Archived module list (Design v1 / Breakdance naming)

[`OLD_MODULES.md`](OLD_MODULES.md)
