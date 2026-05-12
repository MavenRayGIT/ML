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

> **Implementation status 2026-05-12 — shipped v5.** v3/v4 used a
> single section-wide progress (`p = (vh - rect.top) / (vh + h)`)
> with staggered top/bot windows inside `p ∈ [0, 1]`. That worked
> for desktop where the section is shorter than the viewport, but
> broke on mobile: FeatureSplit stacks to a single column there,
> so the section becomes ~800px tall in a ~700px viewport — and
> the v4 bot window (`p ∈ [0.35, 0.45]`) completed while the bot
> edge was still BELOW the viewport. By the time the user could
> see the bottom of the section, the angle was already fully
> developed. Read as static.
>
> v5 fixes that by anchoring each edge to its own viewport
> progress (how far that specific edge has crossed the viewport),
> not to overall section progress. Motion is always timed to when
> the user can actually see the edge animating, regardless of how
> tall the section is vs the viewport.
>
> The v1 one-shot entry reveal that sat on `data-reveal="angle-shift"`
> remains dropped — the scroll-tied motion below serves as both the
> entry effect and the through-scroll effect. One coherent motion, no
> fighting transitions.

**Per-edge motion with a natural section-height-aware "tug".**
Each edge animates in its own viewport-progress window. Top develops
as the section enters viewport; bot develops as it later reaches
viewport. The gap between them stretches automatically on tall
sections (mobile) and tightens on short ones (desktop) because the
trigger for bot is simply "bot edge has entered the viewport" —
which happens later on tall sections.

Top-right (100%, 0%) and bottom-left (0%, 100%) are **anchored**
at the section's corners and never move — each diagonal pivots
around its anchor as the two opposite vertices slide inward.

Visually:

- At viewport entry, the panel looks like a normal full-bleed
  rectangle. Brief hold-flat as the top edge enters from below.
- Top edge commits to motion as it crosses the lower half of the
  viewport — tilts down on the left, develops the angled cut at
  a steady pace, finishes around viewport mid-height.
- Top holds at full angle. Bot edge is still below the viewport
  (varies by section height — much longer beat on mobile, shorter
  on desktop).
- Bot edge enters viewport flat, holds briefly, then snaps into
  motion and catches up over the bottom quarter of the viewport —
  tilts up on the right, lands fully angled while the section's
  bottom is still visible.
- Both then hold at full angle for the rest of the section's
  scroll-through.
- Content inside (image, text, eyebrow, headline, body, CTA) stays
  anchored. Only the clip-path moves.

> **Geometry note — why the moving vertices stay inside the box.**
> Earlier attempts moved polygon vertices past the section's box edges
> (e.g. `y < 0` at the top). The clipping engine has nowhere to draw
> outside the box, so it kinks the diagonal against the box edge —
> corners visibly **flatten** instead of the line moving. Here the
> two moving vertices live strictly inside `0px..MAX` and each
> diagonal pivots around an anchored corner. No edge collision, no
> corner flatten — the diagonals develop as straight lines.

Progress is now **per-edge**, anchored to the edge's own viewport
position:

```
e_top = clamp01((vh - rect.top)    / vh)   // 0 = top at viewport bottom, 1 = top at viewport top
e_bot = clamp01((vh - rect.bottom) / vh)   // 0 = bot at viewport bottom, 1 = bot at viewport top
```

- `e_top ∈ [0, 0.15]` — top edge in the lower 15% of the viewport; held flat.
- `e_top ∈ [0.15, 0.50]` — **top edge active window** (0.35 wide). `--angle-grow-top` animates (softly eased) from `0` → `SLOPE × width`.
- `e_top ∈ [0.50, 1]` — top past mid-viewport; held fully angled.
- `e_bot ∈ [0, 0.05]` — bot edge just appeared at viewport bottom; brief hold-flat.
- `e_bot ∈ [0.05, 0.25]` — **bot edge active window** (0.20 wide). `--angle-grow-bot` snaps from `0` → `SLOPE × width`.
- `e_bot ∈ [0.25, 1]` — bot well into viewport; held fully angled.

The two windows are independent — top's progress depends only on `rect.top`, bot's only on `rect.bottom`. Each edge animates as the user is looking at it.

SLOPE = `tan(7°) ≈ 0.1228` — the value the JS uses to scale the depth to section width so the angle reads as the same 7° slope across viewport sizes.
- 1280px section → fully-angled Δ = 157px (calibrated reference)
- 800px section  → fully-angled Δ = 98px
- 375px mobile   → fully-angled Δ = 46px

Re-tuning is four constants in `FeatureSplit.astro`: `TOP_START`,
`TOP_END`, `BOT_START`, `BOT_END` — all in **edge-viewport-progress**
space now. Move `TOP_START` down → top motion begins earlier (less
hold-flat near the bottom of the viewport). Move `TOP_END` up → top
finishes higher in the viewport. Move `BOT_START` up → longer
hold-flat after bot enters viewport. Make windows narrower → motion
commits faster per edge.

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
`IntersectionObserver`) computes each edge's viewport progress
independently, remaps each through its own active window, then
applies a **half-strength smoothstep** ease so the motion eases in
and out at the window boundaries without over-accelerating through
the middle. Each variable is written per frame:

```
smoothstep(t) = t² × (3 - 2t)
ease(t)       = t + 0.5 × (smoothstep(t) - t)   // 50% smoothstep, 50% linear

e_top = clamp01((vh - rect.top)    / vh)
e_bot = clamp01((vh - rect.bottom) / vh)

pTop = ease(remap(e_top, TOP_START=0.15, TOP_END=0.50))
pBot = ease(remap(e_bot, BOT_START=0.05, BOT_END=0.25))
--angle-grow-top = pTop × SLOPE × section.width
--angle-grow-bot = pBot × SLOPE × section.width
```

Why a partial ease? Pure linear remap inside the active window has
hard start/stop at the window edges — slope jumps from 0 to constant
the instant `p` crosses `TOP_START`. Full smoothstep over-corrects in
the other direction — the motion is so eased that the middle of the
window feels accelerated and the edges feel mushy. Averaging the two
softens the window boundaries while keeping the motion's mid-window
velocity close to linear. Tune `EASE_STRENGTH` 0→1 to taste.

The hold-flat / hold-angled phases outside the window do the
structural pacing work; the partial ease inside the window keeps the
motion itself feeling refined without overdoing the curve.

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
