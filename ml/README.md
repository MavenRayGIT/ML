# ML_System

The global infrastructure folder for Mack & Lee's design + development system.

## Purpose

Centralizes the conventions, architecture, and module library that all M&L projects share. Every active project (Drew, Sustained Outcomes, etc.) lives as a sibling folder under `/Users/jpielak/Documents/PROJECTS/`. This folder is the cross-project layer.

## What lives here

- `BRIEFING.md` — **start here** when kicking off any AI session (ChatGPT, Codex, Cursor, fresh Claude). Contains the canonical briefing prompt to paste.
- `ARCHITECTURE.md` — overall workflow (discovery → wires → mockups → handoff → build), tool integration model, library promotion process.
- `AGENTS.md` — instructions for AI agents (Claude, Codex, Cursor) working on M&L projects.
- `library/` — the global module library.
  - `README.md` — how the library works.
  - `REGISTRY.md` — module inventory with status (project / candidate / promoted).
  - `NAMING.md` — naming convention.
  - `MODULES/` — per-module specs (one `.md` per promoted module).
- `templates/` — starter files for new projects (`AGENTS.md`, `DESIGN.md`, `MODULES.md`, Cursor rules).

## What does NOT live here

- Project source files (in sibling folders: `Drew/`, `Sustained Outcomes/`, `MackAndLee/`, etc.)
- Figma source files (live in Figma; this folder may hold exports/snapshots later)
- WordPress / Breakdance code (lives in project folders)

## Module scope flow

Build inside a project file → tag as candidate when it earns reuse → validate → promote to the global library.

## Workspace inventory

See `../PROJECTS.md` for the generated overview of all active projects.
