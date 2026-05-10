# Sustained Outcomes — site workspace

- **Docs & handoff** (Markdown): this folder — `AGENTS.md`, `DESIGN.md`, `MODULES.md`, etc.
- **Astro app** (code): **`site/`** — that is the only folder Cloudflare Pages should build.

## Run the site on your Mac (first time)

1. Open **Terminal**.
2. Go to the app folder (copy-paste, then Enter):

   ```bash
   cd /Users/jpielak/Documents/PROJECTS/ML_System/ML/agentsites/sustainedoutcomes/site
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Terminal will show a **local URL** (often `http://localhost:4321`). Open it in your browser.
5. Stop the server: in Terminal press **Ctrl+C**.

## Build (same as Cloudflare will run)

```bash
cd /Users/jpielak/Documents/PROJECTS/ML_System/ML/agentsites/sustainedoutcomes/site
npm run build
```

Output goes to `site/dist/` (ignored by git).

## Cloudflare Pages (when you connect the repo)

- **Root directory:** `agentsites/sustainedoutcomes/site`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** **22** (Pages env var `NODE_VERSION=22`). Astro 6 requires Node `>=22.12.0`; Node 18 builds will fail.

## Stack (already added)

Astro, Tailwind CSS v4, MDX, Partytown (for GTM later per `HANDOFF_v2`).
