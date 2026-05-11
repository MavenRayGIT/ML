# ANIMATION — Sustained Outcomes
> Motion / interaction spec. Style ID: `Corporate_Elegant`.
> Intended to be reusable across M&L sites — promote to portfolio level
> (`agentsites/ANIMATION.md`) once it's been refined on a second project.

---

## References

| Role | Site | Why |
|------|------|-----|
| Primary | <https://www.whitestonemarketing.com/> | Angled panels, restrained editorial motion, the scroll-tied "blue panel" edge effect we want to replicate on `FeatureSplit`. |
| Restraint floor | <https://www.rezolv.com/> | Hero-only motion. Too sparse on its own — used as the lower bound. |
| Balance target | <https://www.c2experience.com/> | Strong structure, elegant hovers, the "blog rows shift in" pattern used on `BlogPreview`. Avoid the looping / text-reveal excesses on interior pages. |

**Anti-pattern.** Sites where everything fades in, body copy reveals per word/line, looping animations, fast auto-scrolling galleries, image parallax everywhere.

---

## Principles

1. **Subtle by default. Animate only key elements.** Body copy never animates.
2. **Quick.** Hover/click ≤ 300ms. Scroll reveals max ~600ms.
3. **One motion at a time per viewport.** When a section enters view, one decisive reveal — not a cascade.
4. **Hover/click is where polish lives.** Buttons, links, cards get the most attention.
5. **Scroll-tied motion is reserved for structural shapes** (angled panel edges). Not for content reveals.
6. **`prefers-reduced-motion` is the floor**, not an afterthought.

---

## Global tokens (live in `src/styles/global.css` under `@theme`)

```css
--ease-default:    cubic-bezier(0.4, 0, 0.2, 1);   /* Material standard — hovers, clicks */
--ease-out-soft:   cubic-bezier(0.16, 1, 0.3, 1);  /* Whitestone decel — scroll reveals */
--duration-quick:  150ms;   /* hover color/border crossfade */
--duration-base:   250ms;   /* button bg, nav state crossfade, card hover */
--duration-reveal: 400ms;   /* header block reveal, BlogPreview row-shift */
--duration-slow:   600ms;   /* angled-edge clip-path expand (one-shot) */
```

Tailwind v4 exposes these as `duration-quick`, `duration-base`, `ease-default`, etc.

---

## Global defaults

| Surface | Behavior |
|---|---|
| Color / bg / border hover | 150ms `--ease-default` |
| Button hover | 150ms color/bg crossfade. **No scale, no lift.** |
| Card hover (BlogPreview / ServicesGrid / FocusAreas) | See **Card hover — `card-image-contract`** below |
| Inline link hover | Amber `#FFC560` highlight crossfade 200ms (per `HANDOFF.md`) |
| `TextLink` chevron | 200ms `translateX(0 → 4px)` on group hover (per `HANDOFF.md`) |
| Anchor scroll | `scroll-behavior: smooth` |
| Page route transition | **None.** Static loads. |

### Card hover — `card-image-contract`

Refined 2026-05-11: the effect is now a deliberate ~30% image shrink with an excerpt reveal (the earlier "barely-noticeable 3%" was too subtle to register).

- Card's outer container height is **fixed** — does not change on hover.
- Image wrapper has a baseline height. On `BlogPreview` cards that's **260px**.
- On card hover: image wrapper height shrinks to **~70% of baseline** (260 → 182 on BlogPreview, a 78px drop). `object-cover` absorbs the crop.
- Body excerpt is **line-clamped at 3 lines** at rest (`max-height` matches the clamp). On hover, the clamp is removed and `max-height` grows by exactly the pixels the image released — so the card footprint is unchanged.
- Transition: 250ms `--ease-default` on both `height` and `max-height`. The image shrink + excerpt grow read as one synchronized motion.
- **No** shadow change, **no** scale, **no** translate.
- Mobile (< 768px): hover is not a meaningful gesture; the contract is suppressed via `@media` and cards render with auto height + unclamped copy.

Net effect: card "trades vertical real estate" on hover — image compresses, more excerpt copy reveals, same footprint.

---

## Per-module behavior

| Module | Motion |
|---|---|
| `Nav` | State crossfade (over-hero ↔ scrolled-white ↔ amber): 250ms `--ease-default`. No shrink, no slide. Mobile drawer: 250ms slide-in from right. |
| `HeroFullbleed` | On load: eyebrow → headline → body → CTA staggered. 400ms `--ease-out-soft`, 80ms stagger between elements, opacity + 8px `translateY`. Hero photo: static. |
| `FocusAreas` (Cards3Col) | Header block (eyebrow + H2 + intro body) reveals as one unit on viewport entry: 400ms `--ease-out-soft`, opacity + 12px Y. **Cards do not animate individually** — they're already present when the header reveal finishes. |
| `FeatureSplit` — angled variants (ERB, "Ready to get started") | See **Angle-shift** below. |
| `FeatureSplit` — plain variants (Founder) | Header block reveal only. No clip-path. |
| `VideoSection` | Static. Play button hover: 150ms scale `1 → 1.05`. |
| `ServicesGrid` | Header block reveal; cards static (or `card-image-contract` if cards have images). |
| `BlogPreview` | See **BlogPreview row-shift** below. |
| `ContactSection` / `ContactAmber` | Static. Inputs: 150ms focus-ring crossfade. |
| `ContactModal` | Scrim fade 200ms; panel `scale(0.98 → 1)` + opacity 200ms `--ease-default`. ESC + scrim-click close. |
| `CTABand` | Static. Buttons get the global hover. |
| `Footer` | Static. |

### Angle-shift — `FeatureSplit` angled variants

> **Implementation status 2026-05-11 — shipped.** v2 design is now
> wired in `FeatureSplit.astro`. The v1 one-shot entry reveal that
> sat on `data-reveal="angle-shift"` was intentionally dropped — the
> scroll-tied motion described below now serves as both the entry
> effect and the through-scroll effect, so there's exactly one
> animation reading at a time. One coherent motion, no fighting
> transitions.

**Single motion — clip-path edges spread on scroll.** As the user
scrolls through the section, the **top angled edge lifts up 0 → 24px**
and the **bottom angled edge drops down 0 → 24px** as a function of
scroll progress through the section's viewport range. Net: the panel
appears to open up vertically by ~48px total. Content (image, text,
eyebrow, headline, body, CTA) stays anchored — only the diagonal
clipping edges move.

Progress is defined exactly like the CSS `animation-timeline: view()`
model — `cover 0% → cover 100%`:

```
p = (viewport.height - rect.top) / (viewport.height + rect.height)
```

- `p = 0` — section top is at viewport bottom (just entering from below)
- `p = 0.5` — section is roughly centred in the viewport
- `p = 1` — section bottom is at viewport top (just exited above)

Progress is mapped **linearly** to the two CSS vars (`--angle-top`,
`--angle-bot`). Structural motion reads more honestly without easing —
the timing-function shape would compete with the user's scroll velocity.

Implementation lives in `FeatureSplit.astro`:

```css
.feature-split-angled {
  --angle-top: 0px;
  --angle-bot: 0px;
  clip-path: polygon(
    0%   calc(10%  - var(--angle-top)),
    100% calc(0%   - var(--angle-top)),
    100% calc(90%  + var(--angle-bot)),
    0%   calc(100% + var(--angle-bot))
  );
}
```

A small inline script (rAF-throttled scroll listener gated by
`IntersectionObserver`, ~40 LoC) writes the vars per frame for every
in-view angled section. `prefers-reduced-motion: reduce` short-circuits
the script and `!important`-locks both vars to 0 so the section reads
in its tight resting silhouette.

Could be ported to pure CSS via `animation-timeline: view()` once
Safari and Firefox catch up — until then the JS path is the only path
that works in every shipping browser. The JS approach is cheap enough
(one rAF per frame, one getBoundingClientRect per in-view section) that
the swap isn't urgent.

### BlogPreview row-shift

Three cards stagger in once on viewport entry. 80ms stagger between cards, 400ms `--ease-out-soft` per card, opacity + 16px `translateX` from the left. Observer disconnects after fire — re-entries do not re-fire.

---

## "Barely noticeable" accents (use sparingly)

Only apply when the element exists in the design.

- **`SectionEyebrow` reveal** — two-beat entrance:
  1. Lead rule wipes left-to-right via `scaleX(0 → 1)`, **400ms** `--ease-out-soft`, `transform-origin: left`.
  2. Label fades opacity 0 → 1, **250ms** `--ease-out-soft`, **delay 250ms** so the label appears just before the rule finishes wiping (~150ms overlap — the "Webflow feel").
  - If the eyebrow has no lead rule, the label still fades in on entry but the 250ms delay drops (handled via `:has(.eyebrow-rule)`).
  - The reveal lives on the eyebrow itself (`data-reveal="eyebrow"`). It composes cleanly with a parent `data-reveal="hero"` or `data-reveal="header"` — the parent's fade-up rides on top of the eyebrow's internal wipe + fade.
- **Section divider rules**: same `scaleX` reveal on entry.
- Headlines that wrap onto multiple lines animate **as one block**, never per-line.

---

## Hard `no`s for `Corporate_Elegant`

- No body-copy fade-in.
- No per-word / per-line text reveals.
- No looping animations. (Auto-scrolling client-logo strips are OK only if requested explicitly, slow ≥ 30s, pause-on-hover.)
- No image parallax. Scroll-tied motion is reserved for angled-edge structural elements.
- No fade-on-scroll for every section.
- No full-page transition between routes.
- No spring overshoot. Always decelerating ease.

---

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Functional state changes (Nav state, modal open/close) still occur — just instantly.

---

## Implementation contract

- One `data-reveal="header|hero|row-shift|stagger|eyebrow|none"` attribute on a target element (sections AND smaller accents like `SectionEyebrow` both opt in). Angled `FeatureSplit` is the deliberate exception — its motion is scroll-progress not viewport-entry, so it doesn't go through the observer at all.
- Single ~30-line vanilla-JS `IntersectionObserver` in `Base.astro` reads the attribute and applies a `data-revealed` flag. **No motion library.**
- IntersectionObserver: `threshold: 0.15`, `rootMargin: '0px 0px -10% 0px'`.
- Scroll-tied angled-edge motion: rAF + IntersectionObserver script, ~40 LoC, ships in `FeatureSplit.astro`. CSS `animation-timeline: view()` is a candidate refactor once Safari + Firefox catch up.
- All entry reveals are **once-only** — observer disconnects after each target fires.
- Nesting is supported: a parent (`hero`/`header`) reveal composes with a child (`eyebrow`) reveal because they operate on disjoint properties (parent: container opacity + translateY; child: rule scaleX + label opacity).
- Every transition obeys `--ease-default` or `--ease-out-soft` and one of the four duration tokens. No bespoke easings or durations elsewhere.

---

## Per-section data-reveal map

| Section | `data-reveal` |
|---|---|
| `HeroFullbleed` | `hero` on the content stack (load-time staggered fade-up of direct children) |
| `FocusAreas` | `header` on the header block; `row-shift` on the card row |
| `FeatureSplit` (angled) | none — clip-path is driven by the scroll-progress script (see Angle-shift above) |
| `FeatureSplit` (plain) | `header` on the section |
| `VideoSection` | none |
| `ServicesGrid` | `header` on the header block |
| `BlogPreview` | none on the row (cards static); `header` on the headline |
| `ContactSection` / `ContactAmber` | none |
| `CTABand` | none |
| `Footer` | none |
| `SectionEyebrow` (any use) | `eyebrow` on the eyebrow itself — composes with its parent's reveal |

---

## Open / refinement notes

- The angle-shift magnitude (±24px each direction, ±48px total) is calibrated to Whitestone's blue-panel scale. Single knob — `MAX` in the inline script + the matching `24px` in the CSS docstring — bump in lockstep if it reads as too strong or too weak.
- Italic font weights are not yet shipped (`public/fonts/` ships uprights only — the italic source files exist under `src/assets/fonts/` and can be added when prose blockquotes / `<em>` need them).
