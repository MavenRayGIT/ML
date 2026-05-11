# AGENTS — Mack & Lee (Global)
> Global agent instructions for Claude, Cursor, and any AI
> working on M&L projects. Read this first, every time.
> Version: 2.0

---

## Read in this order

1. `AGENTS.md` — this file (portfolio agent rules)
2. `ARCHITECTURE.md` — workflow, stack, delivery process
3. `ANALYTICS.md` — analytics, tracking, reporting standard
4. `ML_ADMIN.md` — internal M&L management guide
5. `../library/NAMING.md` — module naming convention
6. `../library/REGISTRY.md` — promoted modules available globally
7. `clients/<client>/CURSOR_BRIEF.md` — client-specific entry point
8. `clients/<client>/AGENTS.md` — client-specific overrides
9. `clients/<client>/HANDOFF.md` — client build spec
10. `clients/<client>/DESIGN.md` — client design context
11. `clients/<client>/MODULES.md` — client module tracker

---

## Core Behavior Rules

### Ask before assuming
If information is missing, flag it and ask.
Never fill gaps with assumptions.
Missing = stop, ask, then proceed.

### Flag gaps explicitly
Before starting any task, list what is missing or unresolvable.
Do not begin work with unresolved dependencies.

### One thing at a time
Complete and get approval on each step before moving to the next.
Do not build ahead of approval.

### Reuse first
Check MODULES.md and REGISTRY.md before building anything new.
If a module exists, use it. If it almost fits, flag the gap and ask.

### Surface decisions that affect global scope
Naming, architecture, promotion — confirm before committing.
Never silently create cross-project artifacts.

---

## Figma Rules

**Never edit Figma without explicit per-request permission.**
Propose → get greenlight → write. Every time.
Prior approval does not carry over to the next request.

### Reads
Always allowed. Scope to specific node IDs.
Never call metadata on the document root.

### Writes
Require explicit permission per request.
After every write: take a screenshot to verify output.
If screenshot tool fails to render correctly: note it, ask client to verify in Figma.

### Page safety
Before touching any Figma page:
1. Read and list all existing children
2. Only remove what is explicitly confirmed
3. Never blanket-clear a page
4. Never touch layers not created by Claude in the current session:
   - Reference screenshots
   - User-placed image assets
   - Annotations
   - Any layer the user placed manually

### Brand tokens
Cannot be extracted from Figma via MCP tools.
get_metadata returns structure only — no styles, no fonts, no colors.
Always request tokens explicitly from the client or PM.

---

## Mockup Rules

### Reference sites
- Must be accessible before design begins
- If URL returns 403 or bot block — STOP, request screenshot
- Reference site informs: fonts, spacing, layout, color application, section rhythm
- Cannot proceed without seeing the reference

### Wireframe fidelity
Wireframes = content hierarchy and section intent only.
Not rigid layout specs at mockup phase.
If reference site conflicts with wireframe layout:
- Flag the gap
- Explain why
- Ask how to resolve
- Adapt per direction given

### Thumbnail first
Always sketch inline before touching Figma.
Get layout approval before building.

### Images
If image URLs are provided, note that Claude cannot
fetch raw image binaries directly.
Images must be uploaded to chat or provided as Figma node IDs.
If any required image is missing — STOP.

### Copy
Wireframe-to-mockup pass: lorem ipsum throughout.
Copy refinement is a separate pass after layout approval.

### Section intent
Ask one clarifying question per section about who it
targets and what action it drives.
Do not assume purpose from wireframe structure alone.

---

## Cursor Rules

Read HANDOFF.md before writing any code.
Build in this order: primitives → layout → sections → pages.
Never hardcode brand colors — Tailwind tokens only.
Never hardcode copy — props or content collections only.
Test each component in isolation before composing pages.
Responsive verified at 375px, 768px, 1440px before handoff.
Lighthouse score > 90 on mobile before launch.

---

## Content Pipeline Rules

Claude manages client content via the pipeline defined in `ML_ADMIN.md`.
Claude can create/edit:
- `/src/content/blog/*.mdx`
- `/src/pages/[lander].astro` (from schema)
- Simple prop/copy changes

Claude cannot:
- Create new component types
- Modify Tailwind config
- Change site structure
- Fix pipeline failures

When a client request is outside pipeline scope:
Tell the client clearly and recommend contacting M&L.

---

## Analytics Rules

Every site ships with analytics per ANALYTICS.md v1 minimum.
Every landing page must define ga4EventName in frontmatter.
Claude validates landing page schema before creating the page.
Missing required fields → ask before proceeding.

---

## Document Naming Conventions

| Document | Location | Audience |
|----------|----------|---------|
| `AGENTS.md` | `agentsites/` | All agents (portfolio rules) |
| `ARCHITECTURE.md` | `agentsites/` | All agents + M&L team |
| `ANALYTICS.md` | `agentsites/` | All agents + M&L team |
| `ML_ADMIN.md` | `agentsites/` | M&L team |
| `CHANGE_REQUEST.md` | `agentsites/` | M&L + pipeline |
| `DEVHANDOFF.md` | `agentsites/` | Departing clients / their devs |
| `CLIENT_ADMIN.md` | `agentsites/` | Template for client folders |
| `AGENTS.md` | `agentsites/clients/<client>/` | Client-specific overrides |
| `CURSOR_BRIEF.md` | `agentsites/clients/<client>/` | Client build entry point |
| `HANDOFF.md` | `agentsites/clients/<client>/` | Cursor (client build spec) |
| `DESIGN.md` | `agentsites/clients/<client>/` | Client design context |
| `MODULES.md` | `agentsites/clients/<client>/` | Client module tracker |
| `Welcome-and-Onboarding.md` | `agentsites/clients/<client>/` | Client onboarding |
| `Client-AI-Instructions.md` | `agentsites/clients/<client>/` | Client's Claude prompt |

---

## Stack Decision Rule

Before starting any new project, confirm Track A or Track B:

**Track A** (default): Astro + Tailwind + Cloudflare + Claude API
- Client comfortable with AI interface
- Blog-driven content
- Low structural change frequency

**Track B**: WordPress + Breakdance
- Client requires visual editor
- Complex dynamic content
- Plugin ecosystem needed

Document the decision in project AGENTS.md.

---

## Tone & Communication

- Be direct about limitations — do not work around them silently
- Flag every gap before starting, not during or after
- Never oversell what AI can do reliably
- Propose → confirm → execute — always in that order
- When something fails, say so clearly and explain why

---

## Version History

| Version | Date | What changed |
|---------|------|--------------|
| 1.0 | Original | Initial M&L agent standards |
| 2.0 | May 2026 | Added Track A stack, Astro/Cloudflare, Claude API pipeline, mockup input requirements, wireframe fidelity rules, analytics standard, client AI interface, landing page schema, responsive scope, Figma page safety rule, document naming |

