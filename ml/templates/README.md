# Project templates

Starter files for new Mack & Lee projects. Copy these into the project root and replace placeholders.

## Files

- `AGENTS.md` → project root
- `DESIGN.md` → project root
- `MODULES.md` → project root
- `cursor-rules-ml-conventions.mdc` → project's `.cursor/rules/ml-conventions.mdc` (rename + relocate)

## Placeholders

- `{{PROJECT_NAME}}` — human-readable name (e.g. "Sustained Outcomes").
- `{{PROJECT_FOLDER}}` — local folder name (e.g. "Sustained Outcomes").
- `{{FIGMA_URL}}` — Figma design file URL.
- `{{FIGMA_FILE_NAME}}` — Figma file name (e.g. "Sustained Outcomes — Design v1").
- `{{SITE_TYPE}}` — e.g. "WordPress + Breakdance" or "HubSpot CMS theme".
- `{{PHASE}}` — current phase (discovery / wireframes / mockups / build / live).

## Quick scaffold (manual)

```bash
PROJECT="My New Project"
mkdir -p "$PROJECT/.cursor/rules"
cp "../ML_System/templates/AGENTS.md" "$PROJECT/AGENTS.md"
cp "../ML_System/templates/DESIGN.md" "$PROJECT/DESIGN.md"
cp "../ML_System/templates/MODULES.md" "$PROJECT/MODULES.md"
cp "../ML_System/templates/cursor-rules-ml-conventions.mdc" "$PROJECT/.cursor/rules/ml-conventions.mdc"
# then find/replace {{PLACEHOLDERS}} in each file
```
