# ML

Mack & Lee monorepo. The active product line is **`agentsites/`** — Track A (Astro + Cloudflare + Claude pipeline) sites for M&L clients.

| Path | Contents |
|------|----------|
| `agentsites/` | Track A product line: portfolio rules + per-client folders under `agentsites/clients/<client>/` |
| `library/` | Module library notes and registry (cross-track) |
| `templates/` | Project templates |

## Start here

For any work in this repo:

1. Read `agentsites/CURSOR_BRIEF.md` (portfolio entry point).
2. If you're working on a specific client, then read `agentsites/clients/<client>/CURSOR_BRIEF.md`.

Cloudflare Pages build roots always point at a specific app: `agentsites/clients/<client>/site/`, never at the whole repo or the `agentsites/` tree.

## Historical / cross-track docs at the repo root

- `AGENTS.md`, `ARCHITECTURE.md` — pre-Track A workflow notes (Breakdance era). Kept for history. Authoritative agent rules for current work live in `agentsites/AGENTS.md` and `agentsites/ARCHITECTURE.md`.
- `OVERVIEW.md` — legacy "ML_System" narrative.
- `BRIEFING.md` — AI session kickoff (if present).
