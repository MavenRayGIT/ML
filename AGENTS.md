# AGENTS

Instructions for AI agents (Claude, Codex, Cursor) working on Mack & Lee projects.

## Read first, in order

1. `../PROJECTS.md` — current workspace inventory and project status.
2. `ARCHITECTURE.md` — workflow, tool integration, promotion process.
3. `library/README.md` — how the module library works.
4. `library/NAMING.md` — naming convention.
5. `library/REGISTRY.md` — modules already promoted to the global library.
6. `../<active-project>/MODULES.md` — modules in flight in the active project (e.g. `../Sustained Outcomes/MODULES.md`).

## Figma write policy

**Never make edits in Figma without explicit user permission per request.** This is a hard rule. Figma write tools (`use_figma`, `create_new_file`, `upload_assets`, `add_code_connect_map`, `send_code_connect_mappings`, `create_design_system_rules`) burn significant tokens — both running the script and serializing the response. Propose the change in chat, get an explicit greenlight, then write. Repeat for every write call; do not assume prior approval covers subsequent writes.

Reads (`get_design_context`, `get_screenshot`, `get_metadata`) are allowed but be judicious: scope to a specific node, prefer screenshots over metadata when structural data isn't needed, never call metadata on the document root.

## Project vs global scope

Default to **project scope** for any new design work. Tokens, modules, and page layouts go inside the active project's Figma file. Promote to global only after validation (see `ARCHITECTURE.md` → Library promotion process).

Never silently create cross-project artifacts. Promotion is an explicit step.

## When designing (Claude)

- Wireframes are desktop-only by default. Mobile design begins in the mockup phase.
- Use thumbnail-first iteration (HTML/SVG sketches inline) before committing to full Figma frames. Saves tokens and time.
- Style follows the M&L wireframe standard (see `ARCHITECTURE.md` → Visual standard).
- Before building a net-new module, search `library/REGISTRY.md` for an existing one that fits.

## When writing modules

- Apply the naming convention (`type_variant_v[n]`).
- Build modules as Figma Components with Variants — never plain frames.
- Auto-layout always; tokens (Figma Variables) always.
- Add a description to the Component for Code Connect — populate the code anchor (Breakdance block name or file path).
- Update the **active project's** `MODULES.md` when a module is created or its status changes within the project. Only update `library/REGISTRY.md` when a module is **promoted** to the global library.

## When building (Cursor / dev)

- For Breakdance projects: build modules once as Global Blocks, save to library, export/import across sites.
- For net-new modules requiring code, use the project's `wp-content/themes/<theme>/modules/<name>/` convention.
- Keep file names matching the registry entry.

## Per-project files

Every M&L project folder should contain (templates in `templates/`):

- `AGENTS.md` — project-scoped agent instructions, points to this folder.
- `DESIGN.md` — Figma URL, tokens snapshot, page targets, content notes.
- `MODULES.md` — project-scoped module tracker.
- `.cursor/rules/ml-conventions.mdc` — Cursor-native rules referencing all of the above.

When starting a new project, copy from `templates/` and replace `{{PLACEHOLDERS}}`.

## Communication

- When making decisions that affect global scope (architecture, naming, promotion), surface them and confirm with the human before committing.
- When uncertain whether something is project-scope or global-scope, default to project and flag it.
