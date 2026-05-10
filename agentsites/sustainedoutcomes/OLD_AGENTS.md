# AGENTS — Sustained Outcomes

> **Archived.** WordPress + Breakdance / Design v1 instructions. Do not use for the current build. Canonical build context: [`../CURSOR_BRIEF.md`](../CURSOR_BRIEF.md) (Track A — Astro).

Project-specific instructions for AI agents (Claude, Codex, Cursor) working on Sustained Outcomes.

## Project context

- **Phase**: design (wireframes in progress).
- **Site type**: WordPress + Breakdance (planned).
- **Figma file**: `Sustained Outcomes — Design v1` → https://www.figma.com/design/0CtHfHudOvFhfZKWP93kOL
- **Local folder**: `/Users/jpielak/Documents/PROJECTS/Sustained Outcomes/`

## Read in this order

1. `../../AGENTS.md` — global agent instructions.
2. `../../ARCHITECTURE.md` — workflow + library promotion process.
3. `../../library/NAMING.md` — module naming convention.
4. `../../library/REGISTRY.md` — promoted modules available globally.
5. `MODULES.md` — modules in flight in this project.
6. `DESIGN.md` — design context, tokens, content notes.

## Figma write policy

**Never make edits in Figma without explicit user permission per request.** Hard rule. Writes burn tokens. Propose, get greenlight, then write. Every time. See `../../AGENTS.md` for full policy.

## Phase notes

**Design phase (current)** — visual decisions get made in Figma. New modules go into the project's Figma file as Components, then logged in `MODULES.md`. Reuse from `../../library/REGISTRY.md` first; project-scoped modules from `MODULES.md` second.

**Build phase (later)** — a `HANDOFF.md` will be created mapping Figma frames → Breakdance Global Block names + specs for any net-new modules. Custom code modules go in `wp-content/themes/<theme>/modules/<name>/`.

## Project-specific overrides

(none yet)
