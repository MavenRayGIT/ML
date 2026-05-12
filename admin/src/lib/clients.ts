/**
 * Phase -1 client registry. Static for now — Phase 0 moves this to D1
 * (`identity_map` + per-client config tables, see SYSTEM_ADMIN.md §5/§10).
 *
 * Anything that needs a client list (admin home, /edit/[client], future
 * /upload routing) reads from here.
 */

export interface ClientRecord {
  slug: string;
  name: string;
  stagingUrl: string;
  repo: string;
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
    repo: "mackandlee/sustainedoutcomes",
    pendingPublishSummary: undefined,
    pendingPublishCount: 0,
    newPageRequests: 0,
  },
];

export function getClient(slug: string): ClientRecord | undefined {
  return CLIENTS.find((c) => c.slug === slug);
}
