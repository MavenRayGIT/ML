# HANDOFF — Sustained Outcomes v2
> Supersedes HANDOFF.md v1.
> Authoritative token values from Figma nodes 141:536 (homepage)
> and 141:898 (brand style tile).
> Read alongside DESIGN.md, MODULES.md, ANALYTICS.md.

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
- Amber `>` chevron LEFT of label
- Label: Libre Franklin SemiBold, 13px, black `#020302`
- Hover: chevron nudges right — subtle CSS transform translateX animation
- Implementation: Cursor to determine exact animation values

```html
<!-- Pattern -->
<a class="text-link group flex items-center gap-2">
  <span class="text-amber transition-transform
    group-hover:translate-x-1">&gt;</span>
  <span class="font-body font-semibold text-label
    text-black">Learn more</span>
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

| Variant | Bg | Border | Text | Used on |
|---------|-----|--------|------|---------|
| `amber-fill` | `#FFC560` | none | `#020302` black | Hero primary, light bg primary |
| `green-fill` | `#083928` | none | `#FFC560` amber | Light bg primary (Meet Ken, Submit) |
| `amber-outline` | transparent | `#FFC560` | `#FFC560` | Dark section secondary |
| `green-outline` | transparent | `#083928` | `#020302` | Light bg secondary |
| `amber-ghost` | `rgba(52,49,3,0.49)` | `#FFC560` | `#FFC560` | Hero secondary CTA |

---

## Nav — 3 States

Nav height: 74px. Logo left at 64px. Links right. CTA far right.

| State | Bg | Links | CTA |
|-------|-----|-------|-----|
| Over hero | `#083928` | `#F2F7E5` | amber-outline |
| Scrolled (white) | white | `#050803` | amber-outline |
| Amber bg | `#FFC560` | `#050803` | green-outline |

Transition: IntersectionObserver on hero bottom edge.
State 1 → State 2 on scroll past hero.
Nav links: Consulting, Initiatives, About, Blog, Support Us
CTA label: "Request a meeting" (sentence case in nav)

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
- Full viewport height, min 788px
- Full-bleed photo, two gradient overlays
  - Top: `rgba(5,8,3,0.82)` → transparent, 342px, mix-blend-multiply
  - Bottom: dark overlay on lower 40%
- Content: left-aligned, lower third
  - H1: Mona Sans Bold 72px, white, -3% tracking, lh 0.85
  - Body: Libre Franklin Regular 15px, white, lh 24px
  - Primary CTA: amber-fill button
  - Secondary CTA: amber-ghost button
- Props: `{ headline, body, image, primaryCta, secondaryCta }`

### `FocusAreas.astro`
- Bg: white
- Two layout variants (centered / left-aligned) — confirm with client
- Eyebrow: Mona Sans SemiBold 11px, black, +3% tracking, ALL CAPS
- H2: Mona Sans Bold 48px, black, -3% tracking
- Body: Libre Franklin Regular 15px, black, lh 24px
- 3-col grid: image 227×227px, card title 24px, body 14px, TextLink
- Props: `{ eyebrow, headline, body, items: [{ title, body, image, href }] }`

### `FeatureSplit.astro`
- Reused for: Initiative ERB, Initiative Oakland, Founder (×2 variants)
- Props control: imagePosition (left/right), dark (bool), ctaVariant
- Dark variant bg: `#083928`
- Light variant bg: white
- Image: 639×622px, flush to page edge (not constrained to content width)
- Text block: eyebrow + H2 (40px) + body (16px, lh 26px) + button
- Props: `{ eyebrow, headline, body, image, imagePosition, dark, cta }`

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
  - Link: `>` in amber, "Read the Article" in black
- Card left positions: 86px, 518px, 950px
- Data: Astro content collection, latest 3 posts
- Props: `{ headline, count: 3 }`

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
- Divider: `#F2F7E5` 1px rule
- Copyright: Libre Franklin Regular 12px, `#F2F7E5`

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
| Mobile | < 768px | Nav → hamburger, hero H1 → 48px, 3-col → 1-col, padding → 64px |
| Tablet | 768–1024px | 2-col grids, reduced padding |
| Desktop | > 1024px | Full Figma layout |

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

## Open Questions for Client (resolve before build)

- [ ] Which FocusAreas layout: centered or left-aligned?
- [ ] Which Ken Jacobsen section: Variant A (green button) or B (amber button)?
- [ ] Which contact form: full split layout or simple amber centered?
- [ ] Video section: is there actual video content, or placeholder for now?
- [ ] Nav State 3 (amber bg): when does this appear — hover, active page, or specific pages?

