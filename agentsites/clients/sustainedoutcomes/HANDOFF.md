# HANDOFF — Sustained Outcomes
> Authoritative token values from Figma nodes 141:536 (homepage)
> and 141:898 (brand style tile).
> Read alongside `DESIGN.md`, `MODULES.md`, and `../../ANALYTICS.md`.

---

## Project Context

- **Client:** Sustained Outcomes (Ken Jacobsen)
- **Phase:** Build
- **Figma file:** https://www.figma.com/design/5UU5GrdYf669t3wpLgJkix/Wireframes
- **Master page node:** 141:536 — Homepage – Desktop (final)
- **Brand node:** 141:898 — Brand style tile (authoritative tokens)
- **Stack:** Astro + Tailwind CSS + Cloudflare Pages + GitHub
- **Content:** Markdown / MDX in `/src/content/`
- **AI maintenance:** Claude API + n8n pipeline

---

## Design Tokens — Authoritative

Extracted from Figma node 141:898. These are final.
No olive. No sage. All copy is black.

### Colors

```js
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      green: {
        dark:    '#083928',              // nav, dark sections, footer, buttons
        mid:     'rgba(8,57,40,0.5)',    // overlay variant
      },
      black:     '#020302',              // ALL copy — no exceptions
      amber: {
        DEFAULT: '#FFC560',              // primary CTA, main links, highlights
        pale:    '#FCE695',              // pale amber variant
        light:   'rgba(255,197,96,0.5)', // amber 50% overlay
      },
      teal:      'rgba(13,179,121,0.5)', // accent
      gray: {
        mid:     '#939B98',              // supporting gray
        light:   '#E2E2E2',             // light gray
        bg:      '#F7F7F5',             // light section background
        ph:      '#D9D9D6',             // image placeholders
      },
      muted:     '#9A9A9A',              // form placeholder text only
    },
  }
}
```

### Typography

```js
// tailwind.config.mjs
theme: {
  extend: {
    fontFamily: {
      display: ['Mona Sans',      'sans-serif'], // all headlines
      body:    ['Libre Franklin', 'sans-serif'], // all body copy
      ui:      ['Inter',          'sans-serif'], // UI labels only
    },
    // Letter spacing — Mona Sans headlines use NEGATIVE tracking
    letterSpacing: {
      'display': '-0.03em',   // -3% — all Mona Sans headlines
      'tight':   '-0.02em',   // tighter variant
      'eyebrow': '0.03em',    // +3% — ALL CAPS section labels
      'btn':     '0.015em',   // +1.5% — button labels
    },
  }
}
```

### Type Scale (from node 141:536)

| Role | Font | Weight | Size | Line-height | Tracking |
|------|------|--------|------|-------------|----------|
| Hero H1 | Mona Sans | Bold | 72px | 0.85 | -3% |
| Section H2 large | Mona Sans | Bold | 48px | 44px | -3% |
| Section H2 | Mona Sans | Bold | 40px | normal | -3% |
| Card title | Mona Sans | Bold | 24px | normal | -3% |
| Blog card title | Mona Sans | Bold | 20px | 0.85 | -3% |
| Eyebrow | Mona Sans | SemiBold | 11px | normal | +3% ALL CAPS |
| Body large | Libre Franklin | Regular | 16px | 26px | normal |
| Body | Libre Franklin | Regular | 15px | 24px | normal |
| Body small | Libre Franklin | Regular | 14px | 22px | normal |
| Nav links | Libre Franklin | SemiBold | 13px | normal | normal |
| Footer links | Libre Franklin | Regular | 13px | normal | normal |
| Button | Libre Franklin | SemiBold | 11px | normal | +1.5% |
| Caption | Libre Franklin | Regular | 12px | normal | normal |

All copy color: `#020302` (black). No exceptions.

---

## Self-Hosted Fonts

```css
/* Base.astro */
@font-face {
  font-family: 'Mona Sans';
  src: url('/fonts/mona-sans-bold.woff2') format('woff2');
  font-weight: 700; font-display: swap;
}
@font-face {
  font-family: 'Mona Sans';
  src: url('/fonts/mona-sans-semibold.woff2') format('woff2');
  font-weight: 600; font-display: swap;
}
@font-face {
  font-family: 'Mona Sans';
  src: url('/fonts/mona-sans-light.woff2') format('woff2');
  font-weight: 300; font-display: swap;
}
@font-face {
  font-family: 'Libre Franklin';
  src: url('/fonts/libre-franklin-regular.woff2') format('woff2');
  font-weight: 400; font-display: swap;
}
@font-face {
  font-family: 'Libre Franklin';
  src: url('/fonts/libre-franklin-semibold.woff2') format('woff2');
  font-weight: 600; font-display: swap;
}
@font-face {
  font-family: 'Libre Franklin';
  src: url('/fonts/libre-franklin-bold.woff2') format('woff2');
  font-weight: 700; font-display: swap;
}
```

---

## Link & Interactive Patterns

### Text link / text button (standalone)
- 18×18 **amber square chip** LEFT of label, with a **white chevron** glyph
  inside (refined 2026-05-11 — was a bare amber `>` glyph).
- Label: Libre Franklin SemiBold, 13px, black `#020302`
- Hover (`duration-base` 250ms, `ease-default`):
  - chip background animates amber → green-dark
  - chevron nudges right (translateX +2px)
- Reduced-motion: transitions collapse to ~0ms (global rule); colour swap
  still applies on hover.

```html
<!-- Pattern (see TextLink.astro for the canonical implementation) -->
<a class="group inline-flex items-center gap-3 font-body text-nav text-black">
  <span class="inline-flex h-[18px] w-[18px] items-center justify-center
               bg-amber transition-colors duration-base ease-default
               group-hover:bg-green-dark">
    <!-- white chevron glyph (svg path) -->
  </span>
  <span>Learn more</span>
</a>
```

### Inline text links (within body copy)
- Default: black text, amber underline
- Hover: amber `#FFC560` background highlight behind text,
  black copy on top — smooth CSS transition
- NOT a color change on the text — highlight appears behind it

```css
/* Global inline link style */
.prose a {
  color: #020302;
  text-decoration: underline;
  text-decoration-color: #FFC560;
  background-color: transparent;
  transition: background-color 0.2s ease;
  padding: 0 2px;
}
.prose a:hover {
  background-color: #FFC560;
  text-decoration: none;
}
```

---

## Spacing & Layout

```js
// tailwind.config.mjs
theme: {
  extend: {
    spacing: {
      'section':    '128px', // standard section vertical padding
      'section-sm': '96px',  // compact section padding
      'section-xs': '64px',  // mobile section padding
      'margin':     '64px',  // standard left/right page margin
    },
    maxWidth: {
      'page':    '1440px',  // max page width
      'content': '1312px',  // max content width (1440 - 128px margins)
    },
  }
}
```

### Section wrapper pattern

```astro
<!-- Standard section -->
<section class="w-full bg-[token]">
  <div class="max-w-[1312px] mx-auto px-16 py-[128px]">
    <!-- content -->
  </div>
</section>

<!-- Full-bleed image section -->
<section class="w-full relative overflow-hidden min-h-[788px]">
  <img class="absolute inset-0 w-full h-full object-cover" />
  <div class="absolute inset-0 bg-gradient-to-b ..." />
  <div class="relative z-10 max-w-[1312px] mx-auto px-16 py-[128px]">
    <!-- content -->
  </div>
</section>
```

---

## Button Variants

All buttons: Libre Franklin SemiBold, 11px, tracking +1.5%,
border-radius 2px, ALL CAPS, padding 12px 24px.
Hover: 150ms colour crossfade only. No scale, no lift.

**Amended 2026-05-11** — Mack & Lee feedback after primitives review:
hover behaviour locked in, `amber-ghost` removed (no brown in the design;
on hero use the dark-surface variants over the hero's dark green wash),
`outline × light` text colour corrected from `#020302` (black) to
`#083928` (green-dark) so it reads as a green outlined button.

**Amended 2026-05-11 (b)** — added `surface="amber"` so buttons sitting on
the amber-bg nav state (Nav state 3) and any future amber section hover
to *white* rather than amber-on-amber, which is invisible. Same logic
drives the nav-link hover override in State 3 (amber → white).

### Variant × Surface

Four variants, three surface contexts. `amber-fill` looks identical at
rest on light vs dark vs amber but hovers differently to maintain
contrast against its background. `outline-emph` is the high-attention
twin of `outline` for cases where the standard green-bordered outline
is too quiet (e.g. the scrolled-white nav CTA).

| Variant | Surface | Bg | Border | Text | Hover |
|---|---|---|---|---|---|
| `amber-fill` | `light` (default) | `#FFC560` | none | `#020302` black | bg → `#083928` green-dark · text → `#FFC560` amber |
| `amber-fill` | `dark` | `#FFC560` | none | `#020302` black | bg → `#FFFFFF` white · text → `#083928` green-dark |
| `green-fill` | `light` (default) | `#083928` | none | `#FFC560` amber | bg → `#FFC560` amber · text → `#083928` green-dark |
| `green-fill` | `amber` | `#083928` | none | `#FFC560` amber | bg → `#FFFFFF` white · text → `#083928` green-dark |
| `outline` | `light` (default) | transparent | `#083928` | `#083928` green-dark | border → `#FFC560` amber · text held |
| `outline` | `dark` | transparent | `#FFC560` | `#FFC560` amber | border → `#FFFFFF` white · text held |
| `outline` | `amber` | transparent | `#083928` | `#083928` green-dark | border → `#FFFFFF` white · text held |
| `outline-emph` | `light` (default) | transparent | `#FFC560` | `#083928` green-dark | bg → `#FFC560` amber · text → `#020302` black |

`amber-fill × amber` and `outline-emph × amber` are not designed —
the component aliases them to the nearest sensible variant rather
than failing.

### Used on

- `amber-fill` / `light` — light-bg primary (homepage hero CTA when over a light hero, ServicesGrid, BlogPreview, ContactSection submit when on white)
- `amber-fill` / `dark` — hero primary CTA over dark green wash / hero photo, dark CTABand primary
- `green-fill` / `light` — light-bg primary alternate (Meet Ken, footer Submit, embedded forms)
- `green-fill` / `amber` — primary CTA on any amber-bg section
- `outline` / `light` — light-bg secondary (Learn more, Read more)
- `outline` / `dark` — dark-bg / hero secondary (Watch the video, Get involved)
- `outline` / `amber` — amber-bg secondary + nav CTA in amber state
- `outline-emph` / `light` — high-attention CTA on white (scrolled nav state)

### Removed

- `amber-ghost` — replaced by `amber-fill` or `outline` with `surface="dark"`.

---

## Nav — 3 States

Nav height: 74px desktop · **56px mobile**. Logo left at the page gutter
(64px desktop · 20px mobile). Links right. CTA far right.

| State | Bg | Links (rest) | Link hover | CTA |
|-------|-----|--------------|------------|-----|
| Over hero (dark) | **transparent** (was `#083928`) — hero gradient supplies contrast | `#F2F7E5` cream | `#FFC560` amber | `outline` × `dark` (amber border + amber text → hover white border) |
| Scrolled (white) | white | `#050803` near-black | `#FFC560` amber | `outline-emph` × `light` (amber border + green-dark text → hover fills amber with black text) |
| Amber bg | `#FFC560` | `#050803` near-black | `#FFFFFF` white | `outline` × `amber` (green-dark border + green-dark text → hover white border) |

**Amended 2026-05-11 (b)** — Nav state 3 link hover changed from amber to
white, CTA changed from `outline × light` to `outline × amber`. Both
swap the amber accent to white because amber-on-amber is invisible.

**Amended 2026-05-11 (c)** — `data-nav-state="dark"` background is now
transparent. Over the hero photo the nav lets the image read through;
over a green-dark section the green wash behind the nav still shows
through as before, so the visual outcome on dark sections is identical.
The hero's own 342px top gradient (`rgba(5,8,3,0.82) → transparent`)
provides the contrast for the cream links + light logo.

Transition: sections opt in via `data-nav-bg="dark|white|amber"` on
their root element. A scroll-throttled hit-test against
`nav.getBoundingClientRect().bottom + 1` picks the topmost matching
section — so the probe adapts automatically to the responsive 56/74px
nav height.

Nav links: Consulting · Initiatives · About · Blog · Support Us
CTA label: "Request a meeting" (sentence case in nav)
Mobile: hamburger → full amber overlay, links Title Case (not all caps),
hover white, green-fill CTA at bottom.

---

## Folder Structure

```
/src
  /components
    /sections
      HeroFullbleed.astro
      FocusAreas.astro
      FeatureSplit.astro
      ServicesGrid.astro
      VideoSection.astro
      BlogPreview.astro
      ContactSection.astro
      CTABand.astro
    /ui
      Button.astro
      TextLink.astro       ← > chevron animated link
      InlineLink.astro     ← amber highlight inline link
      SectionEyebrow.astro
      Rule.astro
    /layout
      Nav.astro
      Footer.astro
  /content
    /blog                  ← .mdx files
  /layouts
    Base.astro
    Page.astro
  /pages
    index.astro
    blog/index.astro
    blog/[slug].astro
    about.astro
    consulting.astro
    initiatives.astro
    support.astro
    partners.astro
    contact.astro
/public
  /fonts                   ← woff2 files
  /images
/ml                        ← M&L docs, not in build
```

---

## Component Map — Homepage

### `HeroFullbleed.astro`
- Three variants: `photo-blocks` (homepage default), `photo-gradient`,
  `color-only`. See `/dev/hero` for the visual review.
- Full viewport height, min 788px
- Full-bleed photo, two gradient overlays
  - Top: `rgba(5,8,3,0.82)` → transparent, 342px, mix-blend-multiply
  - Bottom: dark overlay on lower 40%
- Content: left-aligned, lower third
  - H1: Mona Sans Bold 72px desktop · 44–48px mobile, white, -3% tracking
  - **H1 line-height: 1.0 when `photo-blocks` is active** (was 0.85);
    the per-line semi-transparent bg rects compound their alpha when
    they overlap, producing "lens"-stripe artifacts. Locked at `1.0` so
    adjacent rects exactly touch. The other two variants keep `0.85`.
    Decided 2026-05-11.
  - Body: Libre Franklin Regular 15px, white, lh 24px
  - Primary CTA: `amber-fill` button (surface auto-tunes per variant)
  - Secondary CTA: `outline` button
- Props: `{ variant, eyebrow, headline, body, image, imageAlt, primaryCta, secondaryCta }`

### `FocusAreas.astro`
- Bg: white
- Two layout variants (centered / left-aligned) — confirm with client
- Eyebrow: Mona Sans SemiBold 11px, black, +3% tracking, ALL CAPS
- H2: Mona Sans Bold 48px, black, -3% tracking
- Body: Libre Franklin Regular 15px, black, lh 24px
- 3-col grid: image 227×227px, card title 24px, body 14px, TextLink
- Props: `{ eyebrow, headline, body, items: [{ title, body, image, href }] }`

### `FeatureSplit.astro`
- Reused for: Initiative ERB, Initiative Oakland, Founder
- Props control: imagePosition (left/right), dark (bool), angled (bool),
  **contained (bool)**, cta variant
- Dark variant bg: `#083928`
- Light variant bg: white
- **Two layout modes:**
  - default — image flush to page edge (breaks out of `max-w-content`).
    Used by ERB + Oakland.
  - `contained` — image stays inside `max-w-content` + page gutter so it
    doesn't hit the viewport edge. Used by Founder per 2026-05-11
    refinement ("image of Ken should not go to browser edge").
- Image: 639×622px desktop in the default layout
- Text block: eyebrow + H2 (40px) + body (16px, lh 26px) + button
- Props: `{ eyebrow, headline, body, image, imagePosition, dark, angled, contained, cta }`

### `VideoSection.astro`
- Bg: `#FFC560` amber — full width, strong visual break
- Full-width video thumbnail with centered play button SVG
- Duration label: Libre Franklin SemiBold 10px, right-aligned
- Below: Mona Sans Bold 24px title + Libre Franklin 16px body
- Props: `{ videoUrl, thumbnail, duration, title, body }`

### `ServicesGrid.astro`
- Bg: white
- 3-col grid: image top, Mona Sans Bold 24px title, body 14px, TextLink
- Props: `{ items: [{ title, body, image, href }] }`

### `BlogPreview.astro`
- Bg: white
- Centered header: Mona Sans Bold 40px "Latest Insights"
- 3 cards, 400px wide, white bg, drop shadow `rgba(0,0,0,0.08)`
  - Image: 296×243px, object-cover, overflows card top
  - Title: Mona Sans Bold 20px, lh 0.85
  - Body: Libre Franklin Regular 16px, lh 23px
  - Link: TextLink ("Read the article")
- Card left positions: 86px, 518px, 950px
- Data: Astro content collection, latest 3 posts (Step 6)
- Props: `{ headline?, posts, linkText? }`
- **Entry animation removed 2026-05-11** — was `row-shift` (cards slide
  in from the left, 80ms stagger). Felt fussy on this section; cards
  now render static. The `row-shift` utility itself remains for other
  sections (FocusAreas still uses it).

### `ContactSection.astro`
- Bg: white (left info) + form fields right
- Left: eyebrow + H2 "Let's start a conversation" + contact details
- Right form: First/Last Name row, Email/Organization row,
  Message full-width, Submit green-fill button
- Field style: white bg, border-radius 4px, placeholder muted `#9A9A9A`
- Props: `{ eyebrow, headline, contactInfo, formAction }`

### `CTABand.astro`
- Bg: `#083928`, 320px tall
- Centered: eyebrow + H2 + two amber-outline buttons side by side
- Eyebrow: `#FFC560` amber, "GET INVOLVED"
- H2: Mona Sans Bold 40px, white, -3% tracking
- Props: `{ eyebrow, headline, primaryCta, secondaryCta }`

### `Footer.astro`
- Bg: `#083928`, 300px
- Logo top-left
- Tagline: Libre Franklin Regular 14px, `#FFC560`, lh 22px
- 3 nav columns at 560px, 820px, 1080px
  - Heads: Libre Franklin SemiBold 13px, white
  - Links: Libre Franklin Regular 13px, `#FFC560`
- Copyright: Libre Franklin Regular 12px, `#F2F7E5`

**Amended 2026-05-11** — cream divider rule removed from footer.

---

## Blog Content Schema

```ts
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    date:        z.date(),
    category:    z.enum([
      'Access to Nature',
      'Connecting with Nature',
      'Business Sustainability'
    ]),
    excerpt:     z.string().optional(),
    image:       z.string().optional(),
    duration:    z.string().optional(),
    author:      z.string().default('Ken Jacobsen'),
    draft:       z.boolean().default(false),
  }),
});
```

---

## Landing Page Schema

```ts
{
  title:           string
  slug:            string
  headline:        string
  subheadline:     string
  heroImage:       string
  ctaText:         string
  ctaHref:         string
  trackingGoal:    'form_submit' | 'click' | 'scroll_depth'
  ga4EventName:    string
  metaTitle:       string
  metaDescription: string
  ogImage:         string
}
```

---

## Responsive

| Breakpoint | Width | Key changes |
|------------|-------|-------------|
| Mobile | < 768px | Nav → hamburger; nav height 56px; **page gutter 20px** (`--spacing-margin` overridden in `@media` — was 64px); logo: 32px icon + 18px wordmark; hero H1 → 44px; 3-col → 1-col |
| Tablet | 768–1024px | 2-col grids, reduced padding |
| Desktop | > 1024px | Full Figma layout (nav 74px, gutter 64px) |

Feature splits on mobile: image top, text below (stacked).

---

## Analytics

See `ANALYTICS.md` for full spec.
GTM via `PUBLIC_GTM_ID` env var, loaded via `@astrojs/partytown`.
Priority events: CTA clicks, contact form submits, blog reads.

---

## Cloudflare Pages Config

```
Build command:  npm run build
Output dir:     dist
Node version:   22 (Astro 6 requires >=22.12.0; `NODE_VERSION=22` on Pages)
```

Auto-deploy: main → production. All other branches → preview.

---

## Cursor Build Order

1. Tailwind config — tokens only, no components
2. Base.astro — font loading, GTM, global styles (inline/text link CSS)
3. UI primitives — Button, TextLink, InlineLink, SectionEyebrow, Rule
4. Layout — Nav (3 states + scroll behavior), Footer
5. Sections — in page order: Hero, FocusAreas, FeatureSplit,
   VideoSection, ServicesGrid, BlogPreview, ContactSection, CTABand
6. Blog — content collection config, landing template, post template
7. Pages — index.astro (compose from sections), then sub-pages
8. Responsive pass — verify 375px, 768px, 1440px
9. Analytics — GTM events wired per ANALYTICS.md
10. Lighthouse check — score > 90 mobile before handoff

---

## Open Questions for Client (resolved 2026-05-11)

All resolved at the start of Step 5 (Sections) — recorded here so future Claude
sees the locked decision instead of an open question.

- [x] **HeroFullbleed (homepage):** **`photo-blocks`** variant — full-bleed photo
      with dark-green `rgba(8,57,40,0.51)` bg blocks behind the headline + body
      copy, so legibility holds regardless of the photo. All three variants
      (`photo-blocks` / `photo-gradient` / `color-only`) still ship in the same
      component via the `variant` prop for use on other pages.
- [x] **FocusAreas layout:** **left-aligned**. Eyebrow + H2 + intro body anchor
      to the left of the 3-col grid; the cards themselves still span the row.
- [x] **Founder section (FeatureSplit):** **Variant B** — amber-fill button.
      Treat the founder block as a high-attention conversion CTA.
- [x] **Homepage contact:** **none on the homepage**. The full split form is
      `/contact`-only. Any homepage contact intent rides on `CTABand` + the
      nav "Request a meeting" CTA. `ContactAmber` / `ContactModal` stay in the
      module library for ad-hoc use but are not wired into the homepage.
- [x] **VideoSection:** **real video**, hosted on Bunny Stream.
      Embed: `https://player.mediadelivery.net/embed/599963/ddc1b13b-708b-4976-a36f-1198dd2f931d`
      (16:9, `preload=true`, autoplay off, loop off, responsive). Bunny owns
      the poster + play-button UI, so the section renders the iframe directly
      instead of a custom thumbnail+SVG.
- [x] **Nav State 3 (amber bg):** **parked** — section-driven only (any section
      that opts into `data-nav-bg="amber"`). Not a per-page default and not a
      hover state. Revisit only if a future page wants amber as its baseline.

---

## Amendments — From Figma Annotations (node 141:536)

Annotations added directly to the Figma file as teal note boxes
(`bg-[#62ffe2]`, `rounded-[10px]`). Read via `get_design_context`.
All confirmed below.

### Hero — 3 Variants

Three hero variants exist in the design. All share the same base component
(`HeroFullbleed.astro`) — controlled via props.

**Variant A — Photo with BG blocks** (node `154:985`)
- Full-bleed photo background
- Semi-transparent dark green bg blocks behind headline and body copy
- Ensures legibility regardless of photo brightness
- Use when photo contrast cannot be guaranteed
- `bg-[rgba(8,57,40,0.51)]` blocks behind text (already in design)

**Variant B — Photo with gradient only** (original spec)
- Full-bleed photo background
- Top and bottom gradient overlays only
- No bg blocks behind text
- Use when photo is dark enough for contrast

**Variant C — Color bg, no photo** (nodes `154:987`, `154:990`)
- No image — solid or gradient color background
- `linear-gradient(166deg, #ffffff 50.9%, rgba(252,230,149,0.49) 159.4%)`
- Use for interior pages or when no suitable photo is available

```astro
// HeroFullbleed.astro props
{
  variant:   'photo-blocks' | 'photo-gradient' | 'color-only'
  image?:    string   // required for photo variants
  headline:  string
  body:      string
  primaryCta:    { text: string, href: string }
  secondaryCta?: { text: string, href: string }
}
```

### Scroll Animation — Diagonal Feature-Split Sections

**Applies to:** (nodes `154:1007`, `154:1010`)
- `feature-split_init1_erb` (Sustainable Business Innovation Cohort)
- `feature-split_init2_ready` (Ready to get started block)
- Any section using the diagonal/angled edge treatment

**Animation spec:**
- Trigger: section enters viewport (IntersectionObserver)
- Effect: subtle vertical reveal — diagonal top and bottom edges expand
  outward together as the section comes into view
- The angled/diagonal lines at the top and bottom of the section should
  collapse to center before viewport entry, then expand to full width on entry
- Timing: ~600ms ease-out
- Do not autoplay — only triggers once on scroll entry
- Cursor to determine exact CSS implementation (clip-path animation or
  transform scale recommended)

```css
/* Suggested approach */
.feature-split-animated {
  clip-path: polygon(0 8%, 100% 0%, 100% 92%, 0% 100%);
  transition: clip-path 600ms ease-out;
}
.feature-split-animated.in-view {
  clip-path: polygon(0 0%, 100% 0%, 100% 100%, 0% 100%);
}
```

### Button Variants — Attention Levels

**Note from annotation** (node `154:1004`):
"options with buttons — dark and bright, depending on attention needed"

Buttons have two attention tiers:

**High attention** — amber fill or amber outline
- Use for primary actions, hero CTAs, main conversion points
- `bg-[#ffc560] text-black` (filled)
- `border-[#ffc560] text-[#ffc560]` (outline on dark bg)

**Lower attention** — dark green fill or dark green outline
- Use for secondary actions, supporting CTAs
- `bg-[#083928] text-[#ffc560]` (filled)
- `border-[#083928] text-[#083928]` (outline on light bg)
- `border-black text-black` (outline — lowest emphasis)

Cursor should offer all variants via the `Button` component's `variant` prop
as specified above in **Button Variants**.

### Contact Form — Page Assignment

**Note from annotation** (node `154:1013`):
"This is for the contact page"

The full split contact form (`ContactSection.astro`) belongs on `/contact`
only — not the homepage.

The homepage uses the simpler amber centered form (`ContactAmber.astro` —
"Let's talk") *if* a contact section is needed on the homepage at all.
Confirm with client whether the homepage needs a contact section.

### Modal Contact Form — Optional Variant

**Note from annotation** (node `154:1016`):
"optional for links that might need a modal instead of going to the contact page"

Build a modal variant of the contact form for use cases where navigating to
`/contact` would interrupt the user flow.

**Usage:** inline CTAs that trigger a contact form overlay without leaving
the current page.

**Implementation:**
- Reuse `ContactAmber.astro` form fields inside a modal wrapper
- Trigger via any CTA with `data-modal="contact"`
- Modal: centered overlay, dark scrim, amber form panel
- Close on scrim click or ESC key
- Form submits to the same endpoint as the `/contact` form

```astro
// ContactModal.astro
// Triggered by: <Button modal="contact">Get in touch</Button>
// Same fields as ContactAmber: Name, Email, Message, Submit
```

### Figma Annotation Method — Confirmed

Annotations added as teal note boxes (`bg-[#62ffe2]`, `rounded-[10px]`)
directly on the Figma canvas are readable via `get_design_context`. This is
the confirmed method for passing design notes to Claude and Cursor.

Use this method for all future annotations on this file. Format:
`NOTE: [instruction]`.

---

## Module Architecture

Every section is a named module per M&L convention. Pages are compositions
of modules — not monolithic templates.

**Full module registry and page map:** [`MODULES.md`](MODULES.md).

Key principles for Cursor:

- Build each module as a standalone Astro component.
- Test each module in isolation at `/dev/[module-name]`.
- Compose pages by importing modules in the order defined in `MODULES.md`.
- Never put page-specific logic inside a module.
- All content via props — modules are dumb, pages are smart.

```astro
// index.astro — homepage composition example
---
import HeroFullbleedBlocks from '../components/sections/HeroFullbleedBlocks.astro';
import Cards3ColImage from '../components/sections/Cards3ColImage.astro';
import FeatureSplitImageLeft from '../components/sections/FeatureSplitImageLeft.astro';
// ... etc
---
<Page>
  <HeroFullbleedBlocks headline="Strategy Rooted in Purpose" ... />
  <Cards3ColImage variant="centered" headline="Three Areas of Focus" items={focusAreas} />
  <FeatureSplitImageLeft variant="dark" headline="Sustainable Business..." ... />
  <!-- etc -->
</Page>
```

---

## Image Assets

All project images live at:

```
agentsites/clients/sustainedoutcomes/site/src/assets/
```

Use Astro's `<Image />` component from `astro:assets` for **all** project
images. Astro's image pipeline handles optimization, WebP conversion, and
lazy loading automatically when assets are in `src/assets/`.

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/[filename]';
---
<Image src={heroImage} alt="Description" />
```

Do **not** put project images in `/public/images/` — that bypasses the
build-time optimization pipeline. `/public/` stays reserved for files that
must be served as-is (e.g. `favicon`, font `woff2` files, OG share images
referenced by absolute URL).

---

## Deployment Environment

### Branches → environments

| Branch | Environment | URL | Auto-deploy |
|--------|-------------|-----|-------------|
| `main` | Production | `sustainedoutcomes.com` (when DNS is moved) | ✅ On merge |
| `staging` | Staging | `sustained-outcomes.mackandlee.com` | ✅ On push |

Never push directly to `main`. All work goes to `staging` first. Production
deploys via PR merge only: `staging` → `main`.

### Cloudflare Pages setup

One Cloudflare Pages project, two custom domains:

- `sustainedoutcomes.com` → mapped to `main` branch (production).
- `sustained-outcomes.mackandlee.com` → mapped to `staging` branch.

DNS for `sustainedoutcomes.com` will point to Cloudflare Pages once the
client owns the domain. The M&L subdomain stays active permanently as
staging.

### Workflow

```
Development (Cursor / Claude)
    ↓ push
staging branch
    ↓ auto-deploy
sustained-outcomes.mackandlee.com
    ↓ reviewed + approved
PR: staging → main
    ↓ merged + auto-deploy
sustainedoutcomes.com (live)
```

### Client review

Ken reviews all changes at `sustained-outcomes.mackandlee.com` before
anything goes live at `sustainedoutcomes.com`. This applies to both code
changes (Cursor) and content changes (Claude pipeline — staging branch first).

### Change-request pipeline

The Claude pipeline commits to the `staging` branch only. Ken approves via
the staging preview. The pipeline merges to `main` on Ken's approval. See
[`CHANGE_REQUEST.md`](CHANGE_REQUEST.md) for the full process.

