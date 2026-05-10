# AI BRIEFING — Mack & Lee

Kickoff briefing for any AI (ChatGPT, Codex, Cursor, Claude in a fresh session) starting M&L design or development work. Without this, every new session starts from zero — modules get duplicated, naming drifts, and the visual standard gets ignored.

## How to use

1. Open the AI you're working with (ChatGPT, Codex, Cursor chat, etc.).
2. Paste the **kickoff prompt** below into the first message.
3. Fill in the placeholders at the bottom (project, phase, task).
4. Continue the conversation normally.

## Kickoff prompt (copy from here)

```
You are working on a Mack & Lee project. M&L is a design + development agency building WordPress sites with Breakdance. We work modularly — every reusable element is a tracked module with a name, variants, and a status. Follow the rules below.

Read these files in order if you have file access:
1. /Users/jpielak/Documents/PROJECTS/ML_System/AGENTS.md
2. /Users/jpielak/Documents/PROJECTS/ML_System/ARCHITECTURE.md
3. /Users/jpielak/Documents/PROJECTS/ML_System/library/NAMING.md
4. /Users/jpielak/Documents/PROJECTS/ML_System/library/REGISTRY.md
5. /Users/jpielak/Documents/PROJECTS/<PROJECT_FOLDER>/AGENTS.md
6. /Users/jpielak/Documents/PROJECTS/<PROJECT_FOLDER>/MODULES.md
7. /Users/jpielak/Documents/PROJECTS/<PROJECT_FOLDER>/DESIGN.md

Critical rules — apply whether or not you can read the files above:

- DEFAULT TO PROJECT SCOPE. New tokens, modules, layouts go inside the active project's Figma file. Promote to the global library only after validation.
- NAMING: type_variant_v[n] (e.g., hero_image-top_v1, cards_4col-arrow_v1). Variants of the same module use Figma Component Properties, not separate components.
- VISUAL STANDARD: aqua #19ECDF for CTAs and links, black for type, white background, Inter (Regular / Semi Bold). Generous spacing (96 / 128 / 160 px vertical section padding). 12-column grid at 1280 max width, 24 px gutters. Single accent color only at wireframe stage; gray placeholders #D9D9D9 for imagery.
- REUSE FIRST. Before building anything new, search the project's MODULES.md and the global REGISTRY.md. If a match exists, use it. Never duplicate.
- BUILD AS COMPONENTS. Modules in Figma are Components with Variants — never plain frames. Auto-layout always. Tokens (Figma Variables) always.
- WIREFRAMES ARE DESKTOP-ONLY. Mobile begins at the mockup phase.
- FIGMA WRITE POLICY: do not make edits in Figma without explicit user permission per request. Propose the change, wait for greenlight, then write. Every time. Reads (screenshots, design context on a specific node) are fine; never call metadata on the document root.

Project context:
- Project: <PROJECT_NAME>
- Phase: <wireframes | mockups | build>
- Figma file: <FIGMA_URL>
- Current task: <WHAT_YOU_ARE_DOING>

Acknowledge you've read this and understand the constraints before producing any design work.
```

## Quick reference (for sessions where the kickoff above is too much)

If you need a shorter version to fit a smaller context window:

```
M&L design rules: visual style aqua #19ECDF + black type + Inter + generous spacing + 12-col 1280 grid. Modules are named type_variant_v[n] and built as Figma Components with Variants. Reuse from <PROJECT>/MODULES.md and ML_System/library/REGISTRY.md before building anything new. Default project scope; promote to global library only when validated. NEVER edit Figma without explicit per-request permission. Wireframes are desktop only.
```

## When the AI is Claude.ai (web chat)

Claude.ai doesn't read your local files. Best option: use **Projects**.

1. In claude.ai, create a Project called `Mack & Lee`.
2. Attach these files to the Project:
   - `ML_System/AGENTS.md`
   - `ML_System/ARCHITECTURE.md`
   - `ML_System/library/NAMING.md`
   - `ML_System/library/REGISTRY.md`
   - The active project's `AGENTS.md`, `MODULES.md`, `DESIGN.md`
3. Set the Project's **custom instructions** to the **Quick reference** block below.
4. Start every M&L chat under that Project — the files persist as context.

Re-attach files when they meaningfully change (e.g., new modules added to `MODULES.md`).

If you don't want to use Projects, paste the full kickoff prompt above into the first message of each chat — the rules are self-contained.

## When the AI is ChatGPT (web)

Same options as Claude.ai: use a **Custom GPT** with the files attached, or paste the kickoff prompt at the start of each chat.

## When the AI is Codex / Cursor / Cowork (file access)

These can read your local files directly. Paste the kickoff prompt; the AI will read the referenced files itself.

## When you're starting a brand-new project

Before kicking off any AI:
1. Copy templates from `ML_System/templates/` into the new project folder.
2. Replace `{{PLACEHOLDERS}}` in each file.
3. Then use this briefing.
