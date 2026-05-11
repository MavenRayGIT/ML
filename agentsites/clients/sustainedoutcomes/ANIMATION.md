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

### Angle-grow — `FeatureSplit` angled variants

> **Implementation status 2026-05-11 — shipped v3.** v2 (corners
> flatten as polygon vertices go outside the box) and v2.5 (both
> diagonals translate by ±24px) were both replaced by this v3 design
> after on-staging review: the visual delta was too subtle to register
> in either case. v3 is a clearer model — the section starts as a
> plain rectangle and the angle **grows in** as the user scrolls.
>
> The v1 one-shot entry reveal that sat on `data-reveal="angle-shift"`
> remains dropped — the scroll-tied motion below serves as both the
> entry effect and the through-scroll effect. One coherent motion, no
> fighting transitions.

**Staggered motion — top and bottom edges develop on separate scroll
windows.** The section enters the viewport as a **plain rectangle**
(no angle) and holds flat for the first ~25% of its scroll-through.
The **top edge** then develops as the section approaches mid-viewport
(p=0.25 → p=0.50). After top finishes, the **bottom edge** follows on
a slow stagger (p=0.50 → p=0.80). Top-right (0% from top, at the right
edge) and bottom-left (100% from top, at the left edge) are
**anchored** at the section's corners and never move — each diagonal
pivots around its anchor.

Visually:

- At viewport entry, the panel looks like a normal full-bleed
  rectangle. No drama. Holds flat for the first quarter of its scroll.
- As the section approaches the middle of the viewport, the top edge
  commits to motion — tilts down on the left, develops the angled
  cut.
- Once the top edge has finished developing, the bottom edge starts
  its own motion — tilts up on the right.
- Both then hold at full angle until the section exits the top of the
  viewport.
- Content inside (image, text, eyebrow, headline, body, CTA) stays
  anchored. Only the clip-path moves.

The hold-then-move-then-hold pattern is the point: it reads as a
deliberate "this is moving now" beat rather than a
continuous-but-imperceptible drift. The stagger between edges
reinforces that beat — top finishes, then bot starts. Sequential,
not synchronized.

> **Geometry note — why the moving vertices stay inside the box.**
> Earlier attempts moved polygon vertices past the section's box edges
> (e.g. `y < 0` at the top). The clipping engine has nowhere to draw
> outside the box, so it kinks the diagonal against the box edge —
> corners visibly **flatten** instead of the line moving. In v3 the
> two moving vertices live strictly inside `0px..MAX` and each
> diagonal pivots around an anchored corner. No edge collision, no
> corner flatten — the diagonals develop as straight lines.

Progress is defined exactly like the CSS `animation-timeline: view()`
model — `cover 0% → cover 100%`:

```
p = (viewport.height - rect.top) / (viewport.height + rect.height)
```

- `p ∈ [0, 0.25]` — section is entering; both edges held flat (`--angle-grow-top: 0; --angle-grow-bot: 0`).
- `p ∈ [0.25, 0.50]` — **top edge active window**. `--angle-grow-top` animates linearly from `0` → `SLOPE × width`. Bot still flat.
- `p ∈ [0.50, 0.80]` — **bot edge active window**. `--angle-grow-bot` animates linearly from `0` → `SLOPE × width`. Top now held at full angle.
- `p ∈ [0.80, 1]` — section exiting; both edges held fully angled.

SLOPE = `tan(7°) ≈ 0.1228` — the value the JS uses to scale the depth to section width so the angle reads as the same 7° slope across viewport sizes.
- 1280px section → fully-angled Δ = 157px (calibrated reference)
- 800px section  → fully-angled Δ = 98px
- 375px mobile   → fully-angled Δ = 46px

Re-tuning the stagger is four constants in `FeatureSplit.astro`:
`TOP_START`, `TOP_END`, `BOT_START`, `BOT_END`. Make windows narrower → motion commits faster per edge. Increase `BOT_START - TOP_END` → longer pause between top finishing and bot starting (slower stagger). Set `BOT_START < TOP_END` → edges overlap (less sequential feel).

Progress is mapped **linearly** to the single CSS var (`--angle-grow`).
Structural motion reads more honestly without easing — the
timing-function shape would compete with the user's scroll velocity.

Implementation lives in `FeatureSplit.astro`:

```css
.feature-split-angled {
  --angle-grow-top: 0px;            /* flat — fallback if JS never runs */
  --angle-grow-bot: 0px;
  clip-path: polygon(
    0%   var(--angle-grow-top),
    100% 0%,
    100% calc(100% - var(--angle-grow-bot)),
    0%   100%
  );
}

@media (prefers-reduced-motion: reduce) {
  .feature-split-angled {
    --angle-grow-top: 12.28vw !important;   /* width-relative full angle */
    --angle-grow-bot: 12.28vw !important;
  }
}
```

A small inline script (rAF-throttled scroll listener gated by
`IntersectionObserver`) remaps the raw scroll progress through two
edge-specific active windows and writes each variable per frame:

```
pTop = remap(p, TOP_START=0.25, TOP_END=0.50)   // 0 outside window, 0→1 inside
pBot = remap(p, BOT_START=0.50, BOT_END=0.80)
--angle-grow-top = pTop × SLOPE × section.width
--angle-grow-bot = pBot × SLOPE × section.width
```

SLOPE = `tan(7°) ≈ 0.1228`. Width-relative so the **7° apparent
slope** is consistent across viewport sizes — wider sections get more
absolute pixels of depth.

`prefers-reduced-motion: reduce` short-circuits the script and
`!important`-locks both vars to `12.28vw` (= the CSS equivalent of
`SLOPE × width` when the section is full-bleed, which all angled
FeatureSplits are by design), so reduced-motion users see the
fully-angled silhouette statically.

The angled section is also promoted to its own GPU compositor layer
(`will-change: clip-path; transform: translateZ(0); backface-visibility:
hidden;`) — without that the per-frame clip-path repaint forces a
re-rasterization of the section content and the diagonal's
anti-aliasing dances against the pixel grid (visible as flicker /
vibration). The image inside the section gets the same treatment so
its sub-pixel positioning (from the seam-fix rule) doesn't compound
the issue.

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

- The angle-grow magnitude (`SLOPE = tan(7°) ≈ 0.1228`, ~7° slope / 12.28% rise) was calibrated by live-tuning on staging — earlier passes at 2.15° were too subtle to read as a deliberate visual gesture, 7° is the value that lands on the design intent without overpowering the section content. Single knob: `SLOPE` in the inline script + the matching `12.28vw` in the `prefers-reduced-motion` rule in `<style>`. Bump both in lockstep if the angle needs more (or less) energy. Slope is width-relative so the value works the same on mobile, tablet, and ultrawide.
- If the motion ever needs to extend *past* the section's vertical bounds (e.g. the angled wedges should reach further into the section than the bounding box allows), the next refactor is an SVG-overlay approach: render the section as a plain rectangle and overlay two SVG polygons at top and bottom whose points animate on scroll. SVG overflow-visible lets the diagonal extend outside the section box without engaging the clip-path corner-flatten failure mode. Sticking with clip-path until/unless that's needed — fewer DOM nodes, one CSS rule, one var.
- Italic font weights are not yet shipped (`public/fonts/` ships uprights only — the italic source files exist under `src/assets/fonts/` and can be added when prose blockquotes / `<em>` need them).
