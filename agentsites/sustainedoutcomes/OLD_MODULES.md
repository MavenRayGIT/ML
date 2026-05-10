# Sustained Outcomes — Modules

> **Archived.** Module tracker for Design v1 / Breakdance Global Block naming. Current Astro section map: [`../HANDOFF_v2.md`](../HANDOFF_v2.md) and [`MODULES.md`](MODULES.md) (this folder, current).

Tracks every module built or used in this project's design files. Status indicates the promotion path toward the M&L global library.

- **Figma source**: `Sustained Outcomes — Design v1`
- **Naming convention**: `../../library/NAMING.md`
- **Global library registry** (promoted only): `../../library/REGISTRY.md`

## Status values

- `project` — built inside this project's Figma file, not yet a candidate for promotion.
- `candidate` (★) — used 2+ times in this project, OR clearly reusable across projects; promotion candidate.
- `promoted` — already lives in the M&L global library; this project uses a library instance.

## Built so far

| Name | Status | Variants | Figma location | Notes |
| --- | --- | --- | --- | --- |
| `button` | project | Filled, Wash, Outline | 02 Primitives | Three-style CTA. |
| `nav-arrow` | project | (single) | 02 Primitives | Aqua arrow primitive. |
| `pill` | project | (single) | 02 Primitives | Inline pill / badge / category label. |

## Planned (in build order)

| Name | Type | Notes |
| --- | --- | --- |
| `header_top-right-nav_v1` | global block | Logo left, links right, search/account icons far right. Active state bolds parent link. |
| `footer_stacked-bands_v1` | global block | Three bands: mid-gray with tagline + CTA, lighter gray with social, near-black with copyright. |
| `hero_image-top_v1` | hero | Full-width gray image, then headline + sub + dual CTAs. |
| `hero_page-title_v1` | hero | Title + supporting paragraph + single right-aligned CTA. No image. |
| `feature-split_image-left_v1` | content | Image left, headline + body + CTA right. |
| `feature-split_video-right_v1` | content | Headline + body + CTA left, video placeholder right. |
| `cards_3col_v1` | content | 3-column card grid. |
| `cards_4col-arrow_v1` | content | 4-column card grid with aqua nav-arrow per card. |
| `cards_4x2-titles-above_v1` | content | 4×2 grid; category labels above placeholders, body text below. |
| `accordion_plus_v1` | content | List rows with aqua `+` toggle. |
| `featured-card_carousel_v1` | content | Single large card with title, body, nav-arrow, dot pagination. |
| `testimonial_centered-quote_v1` | social proof | Gray band, centered quote, attribution, dot pagination. |
| `blog_4col-cards_v1` | content | 4 blog cards with image, title, excerpt, outline CTA. |
| `cta-band_dark_v1` | cta | Dark band with light tagline left + filled CTA right. |

## Project pages (target wireframes)

Home, Small Business Consulting, Initiatives, About, Support Us, Partners, Blog Landing, Blog Post Template, Contact.

Composed in Figma `09 Page Templates` from the modules above.
