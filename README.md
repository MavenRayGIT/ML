# ML

Mack & Lee monorepo. **Agent-site** (Track A) docs and apps, the shared **library** notes, and **templates** live at the **repository root** (no extra `ml/` wrapper folder).

| Path | Contents |
|------|----------|
| `agentsites/` | Track A documentation, handoffs, per-client folders (e.g. Astro apps) |
| `library/` | Module library notes and registry |
| `templates/` | Project templates |

Cloudflare Pages build roots should point at the specific app under `agentsites/<client>/site/`, not at the whole repo.

See also **`OVERVIEW.md`** (legacy “ML_System” narrative) and **`BRIEFING.md`** for AI session kickoff.
