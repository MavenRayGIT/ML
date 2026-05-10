# Library

The Mack & Lee global module library. Two layers:

1. **Figma source** — `Mack & Lee — Library` (Figma file, TBD). Visual components with variants, tokens, design system rules. Components are imported into project files once promoted.
2. **Local registry** — this folder. Source of truth for what has been promoted, naming convention, and code anchors.

## Project vs global tracking

Two scopes, two homes:

- **Project-scoped modules** (in flight, candidates for promotion) → `<project>/MODULES.md` in each project folder.
- **Promoted modules** (validated, cross-project) → `REGISTRY.md` in this folder + `MODULES/<name>.md` per-module specs.

This folder only tracks promoted modules. Look in the project folder for everything else.

## Files

- `REGISTRY.md` — promoted module inventory.
- `NAMING.md` — `type_variant_v[n]` naming convention.
- `MODULES/<name>.md` — per-promoted-module spec.

## How to find a module

1. Check the active project's `MODULES.md` first. Most things live there until they're promoted.
2. If not found, check `REGISTRY.md` for promoted modules.
3. Promoted modules have a `MODULES/<name>.md` spec with screenshot, props, and code anchor.

## How to add a module

Build it inside the active project's Figma file as a Component with Variants. Add a row to that project's `MODULES.md` with status `project`.

## How to promote a module

1. Validate visually + structurally — auto-layout works at edge sizes, variants are clean, no project-specific content baked in.
2. Copy the component to the M&L Library Figma file.
3. Create `MODULES/<module-name>.md` with: description, variants, props, code anchor (Breakdance block name or file path), screenshot.
4. Add a row to `REGISTRY.md`.
5. In the originating project's `MODULES.md`, change status to `promoted`.
6. In the originating project's Figma file, replace the local instance with a library instance.
