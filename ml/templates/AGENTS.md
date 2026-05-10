# AGENTS — {{PROJECT_NAME}}

Project-specific instructions for AI agents (Claude, Codex, Cursor) working on {{PROJECT_NAME}}.

## Project context

- **Phase**: {{PHASE}}.
- **Site type**: {{SITE_TYPE}}.
- **Figma file**: `{{FIGMA_FILE_NAME}}` → {{FIGMA_URL}}
- **Local folder**: `/Users/jpielak/Documents/PROJECTS/{{PROJECT_FOLDER}}/`

## Read in this order

1. `../ML_System/AGENTS.md` — global agent instructions.
2. `../ML_System/ARCHITECTURE.md` — workflow + library promotion process.
3. `../ML_System/library/NAMING.md` — module naming convention.
4. `../ML_System/library/REGISTRY.md` — promoted modules available globally.
5. `MODULES.md` — modules in flight in this project.
6. `DESIGN.md` — design context, tokens, content notes.

## Figma write policy

**Never make edits in Figma without explicit user permission per request.** Hard rule. Writes burn tokens. Propose, get greenlight, then write. Every time. See `../ML_System/AGENTS.md` for full policy.

## Phase notes

**Design phase** — visual decisions get made in Figma. New modules go into the project's Figma file as Components, then logged in `MODULES.md`. Reuse from `../ML_System/library/REGISTRY.md` first.

**Build phase** — `HANDOFF.md` will be created mapping Figma frames → Breakdance Global Block names + specs for net-new modules. Custom code modules go in `wp-content/themes/<theme>/modules/<name>/`.

## Project-specific overrides

(none yet)
