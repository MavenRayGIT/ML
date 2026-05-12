/**
 * Phase -1 client registry. Static for now — Phase 0 moves this to D1
 * (`identity_map` + per-client config tables, see SYSTEM_ADMIN.md §5/§10).
 *
 * Anything that needs a client list (admin home, /upload routing, embed.js
 * site lookup) reads from here.
 *
 * SO lives in the MavenRayGIT/ML monorepo at
 * `agentsites/clients/sustainedoutcomes/site/`. The `repo` + `siteRoot`
 * fields below encode that — the SDK agent uses them to scope edits.
 */

export interface ClientRecord {
  /** URL slug and stable identifier across D1 / R2 / system prompts. */
  slug: string;
  name: string;
  /** Staging URL Cloudflare Pages serves the `staging` branch on. */
  stagingUrl: string;
  /** GitHub `org/repo` the site lives in. */
  repo: string;
  /**
   * Path inside `repo` to the Astro `site/` build root. Used by the
   * SDK agent to scope file edits to this client only — never outside
   * `siteRoot`, never into `agentsites/`, never into `admin/`.
   */
  siteRoot: string;
  /** Plain-English summary of the most recent pending publish request. */
  pendingPublishSummary?: string;
  pendingPublishCount?: number;
  pendingPublishSince?: string;
  newPageRequests?: number;
}

export const CLIENTS: ClientRecord[] = [
  {
    slug: "sustainedoutcomes",
    name: "Sustained Outcomes",
    stagingUrl: "https://sustainedoutcomes.mackandlee.com",
    repo: "MavenRayGIT/ML",
    siteRoot: "agentsites/clients/sustainedoutcomes/site",
    pendingPublishSummary: undefined,
    pendingPublishCount: 0,
    newPageRequests: 0,
  },
];

export function getClient(slug: string): ClientRecord | undefined {
  return CLIENTS.find((c) => c.slug === slug);
}
