# Architecture

> **Note:** This file describes the historical M&L Breakdance-era workflow.
> The current product line is Track A (Astro + Cloudflare + Claude pipeline) under
> `agentsites/`. The authoritative architecture doc for Track A is
> [`agentsites/ARCHITECTURE.md`](agentsites/ARCHITECTURE.md).
> Read this file only for context on the older workflow.

---

## Workflow

1. **Discovery** — collect business requirements (emails, references, content). Output: project brief.
2. **Wireframes (desktop)** — low-fi layouts in Figma. Iterate via thumbnails (HTML/SVG inline) before committing to full Figma frames. Client adds notes via Figma comments. Revise.
3. **Mockups** — high-fi designs in Figma. Mobile design begins here. Compose from existing library modules; design net-new modules from scratch.
4. **Handoff** — build doc that maps Figma frames → existing Breakdance Global Blocks + specs for net-new modules.
5. **Build** — in WordPress + Breakdance. Use existing Global Blocks; Cursor codes only the net-new modules.

## Tools

- **Claude (Cowork)** — design partner, wireframe + mockup generation, library curation, registry maintenance, Figma writes via MCP.
- **Cursor + Figma MCP** — primary development environment, Figma → code translation.
- **Figma** — canvas for wires/mockups, client collaboration via comments, components/variables as the token system.
- **Breakdance** — WordPress builder for production sites. Modules saved as Global Blocks for reuse.

## Library promotion process

Modules start project-scoped. They graduate to the global library after validation.

| Status | Where it lives | When applied |
| --- | --- | --- |
| `project` | Inside a project Figma file (e.g. `Sustained Outcomes — Design v1`) | First time built. |
| `candidate` (★) | Same project file; tagged ★ in `library/REGISTRY.md` | Used 2+ times in the project, OR clearly reusable across projects. |
| `promoted` | M&L Library Figma file (TBD) + `library/MODULES/<name>.md` exists | Validated visually + structurally; ready for cross-project use. |

## Code Connect bridge

Each promoted module's Figma component description includes the corresponding code anchor:

- Breakdance Global Block name (e.g. `gb_hero_image-top_v1`)
- Or, for code-built modules, the file path (e.g. `wp-content/themes/ml-base/modules/hero/image-top.php`)

This is what makes a Figma component findable from code and vice versa.

## Visual standard (M&L wireframes)

Visual reference: TM Group wireframe set (visual style only, not structural).

- **Color**: black (`#000000`) for type, aqua (`#19ECDF`) for CTAs and links. Wash variant `#19ECDF @ 29%` for low-emphasis CTAs. Single accent — no other brand colors at the wireframe stage.
- **Type**: Inter (Regular / Semi Bold). Type ramp: 14 / 16 / 18 / 20 / 24 / 32 / 36 / 40 / 60.
- **Spacing**: 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 160 px scale. Sections breathe — 96/128/160 vertical padding by default.
- **Grid**: 12-column, 1280 max content width, 24 px gutters. Named layouts: `2x`, `3x`, `4x`.
- **Imagery**: gray placeholders (`#D9D9D9`) at wireframe stage; real imagery at mockup stage.

## Per-project files

Each M&L project folder contains a standard set of files that give Cursor and other AI agents the context they need:

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Project-scoped agent instructions. Points to global ML_System docs and to project siblings. |
| `DESIGN.md` | Figma URL, tokens snapshot, page targets, content notes. |
| `MODULES.md` | Project-scoped module tracker (status: project / candidate / promoted). |
| `.cursor/rules/ml-conventions.mdc` | Cursor-native rules. Cursor reads these automatically on file edits. |
| `HANDOFF.md` (build phase) | Maps Figma frames → Breakdance Global Block names + specs for net-new modules. |

Templates for these files live in `templates/`. Copy on project init and replace `{{PLACEHOLDERS}}`.

## File naming

- Figma project file: `<Project> — Design v<n>` (e.g. `Sustained Outcomes — Design v1`).
- Figma library file (when split): `Mack & Lee — Library v<n>`.
- Project folders on local: `<ProjectName>/` (matches PROJECTS.md).
- Module names: see `library/NAMING.md`.
