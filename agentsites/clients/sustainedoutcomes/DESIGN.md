# DESIGN — Sustained Outcomes

Track A build — design reference for **Sustained Outcomes** (Ken Jacobsen).

> Token values, type scale, and component specs are duplicated in [`HANDOFF.md`](HANDOFF.md). If Figma and the handoff disagree, stop and confirm with the client / M&L before building.

---

## Status

- Phase: **build** (mockup complete, handoff ready)
- Visual style: custom brand (not M&L wireframe standard)
- Mockup: complete — see Figma node `141:536`

---

## URLs

| Environment | URL | Branch |
|-------------|-----|--------|
| Production | `sustainedoutcomes.com` (not yet pointed) | `main` |
| Staging | `sustained-outcomes.mackandlee.com` | `staging` |

---

## Figma (authoritative for visuals)

- **File:** [Wireframes](https://www.figma.com/design/5UU5GrdYf669t3wpLgJkix/Wireframes)
- **Master homepage:** node `141:536` — Homepage – Desktop (final)
- **Brand / tokens:** node `141:898` — Brand style tile (authoritative)
- **Wireframes:** node `4:2`

### Figma annotation method

Teal note boxes (`bg-[#62ffe2]`, `rounded-[10px]`) placed directly on canvas. Readable via `get_design_context`. Format: `NOTE: [instruction]`.

---

## Brand Tokens (summary — full spec in HANDOFF.md)

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `green-dark` | `#083928` | Nav, dark sections, footer, buttons |
| `black` | `#020302` | ALL copy — no exceptions |
| `amber` | `#FFC560` | Primary CTA, main links, highlights |
| `amber-pale` | `#FCE695` | Pale amber variant |
| `amber-light` | `rgba(255,197,96,0.5)` | Amber 50% overlay |
| `teal` | `rgba(13,179,121,0.5)` | Accent |
| `gray-mid` | `#939B98` | Supporting gray |
| `gray-light` | `#E2E2E2` | Light gray |
| `gray-bg` | `#F7F7F5` | Light section background |
| `gray-ph` | `#D9D9D6` | Image placeholders |
| `muted` | `#9A9A9A` | Form placeholder text only |

### Typography

| Role | Font | Weight | Tracking |
|------|------|--------|----------|
| Headlines | Mona Sans | Bold | -3% (negative) |
| Eyebrows | Mona Sans | SemiBold | +3% ALL CAPS |
| Body | Libre Franklin | Regular | normal |
| Buttons / nav | Libre Franklin | SemiBold | +1.5% |
| UI labels | Inter | Regular / Bold | normal |

All copy: `#020302` black. No exceptions.

---

## Image assets

Project images are stored at:

```
src/assets/
```

Local path:

```
/Users/jpielak/Documents/PROJECTS/ML_System/ML/agentsites/clients/sustainedoutcomes/site/src/assets
```

Use Astro's `<Image />` from `astro:assets` for all images so the build pipeline can optimize and convert to WebP. Do **not** put project images in `/public/` — that bypasses optimization.

---

## Page targets

| Page | Route | Status |
|------|-------|--------|
| Homepage | `/` | Mockup complete |
| Small Business Consulting | `/consulting` | Module map defined |
| Initiatives | `/initiatives` | Module map defined |
| About | `/about` | Module map defined |
| Support Us | `/support` | Module map defined |
| Partners | `/partners` | Module map defined |
| Blog Landing | `/blog` | Cursor-designed (see CURSOR_BRIEF) |
| Blog Post | `/blog/[slug]` | Cursor-designed (see CURSOR_BRIEF) |
| Contact | `/contact` | Module map defined |

---

## Module reference

Module registry and page map: [`MODULES.md`](MODULES.md). Full build spec: [`HANDOFF.md`](HANDOFF.md).

---

## Archived design snapshot

Pre–Track A wireframe file and aqua token snapshot: [`OLD_DESIGN.md`](OLD_DESIGN.md).
