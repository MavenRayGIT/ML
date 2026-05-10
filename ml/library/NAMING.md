# Naming convention

`type_variant_v[n]`

- **type** — what category the module belongs to (see "Type prefixes" below).
- **variant** — distinguishes layout / composition (e.g. `image-top`, `centered`, `4col-arrow`).
- **v[n]** — version. Increment on breaking layout changes; older sites continue referencing the prior version until manually upgraded.

## Type prefixes

`hero`, `cards`, `cta`, `feature-split`, `accordion`, `testimonial`, `logos`, `stats`, `form`, `nav`, `header`, `footer`, `blog`, `featured-card`.

Primitives use a flatter naming (no prefix needed): `button`, `pill`, `nav-arrow`, `link`, `input`, `label`, `badge`.

## Examples

- `hero_image-top_v1`
- `hero_page-title_v1`
- `cards_3col-image-top_v1`
- `cards_4col-arrow_v1`
- `cards_4x2-titles-above_v1`
- `feature-split_image-left_v1`
- `feature-split_video-right_v1`
- `cta_band-dark_v1`
- `accordion_plus_v1`
- `testimonial_centered-quote_v1`
- `featured-card_carousel_v1`

## Variants vs separate modules

If the layout reuses but content composition differs slightly (e.g. card titles above vs. below), prefer a **variant** of the same module. Keep the registry tight.

If the layout itself differs structurally (different grid count, different anchor points, different number of repeating units), it's a **separate module**.

## Figma Component Properties

Within a single component, distinct visual treatments live as Variants — surfaced in Figma's right-hand panel as Component Properties.

Example: `button` has property `Style` with values `Filled` / `Wash` / `Outline`. The component name in Figma is `Style=Filled` etc., combined into a ComponentSet named `button`.
