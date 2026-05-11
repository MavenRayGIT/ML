/**
 * Astro Content Layer config — Sustained Outcomes.
 *
 * Schema mirrors `HANDOFF.md → Blog Content Schema` (node 141:898).
 * Uses the Astro 6 Content Layer API (`glob` loader + zod schema).
 *
 * Authoring contract:
 *   - One MDX file per post in `src/content/blog/`.
 *   - The MDX **frontmatter** must conform to `BlogPostSchema` below;
 *     the body is rendered with the prose styles in `global.css` and
 *     the components allowlist in `src/components/blog/mdx/*` (Step 7).
 *   - `image` is resolved at build time via Astro's `image()` helper,
 *     so frontmatter writes relative paths like
 *     `./_assets/cover.jpg` (assets co-located with posts) and the
 *     compiled type is `ImageMetadata`.
 *
 * Filtering for drafts is the caller's responsibility — both
 * `getCollection('blog')` consumers (the /blog landing and the
 * homepage BlogPreview) explicitly filter `data.draft !== true`.
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const BLOG_CATEGORIES = [
  'Access to Nature',
  'Connecting with Nature',
  'Business Sustainability',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: ({ image }) =>
    z.object({
      title:    z.string(),
      date:     z.coerce.date(),
      category: z.enum(BLOG_CATEGORIES),
      excerpt:  z.string().optional(),
      /** Cover image — relative path from the post file. Resolved at build. */
      image:    image().optional(),
      /** Alt text for the cover image. */
      imageAlt: z.string().optional(),
      /** Reading time (e.g. "6 min read"). Optional — UI shows only if present. */
      duration: z.string().optional(),
      author:   z.string().default('Ken Jacobsen'),
      draft:    z.boolean().default(false),
    }),
});

export const collections = { blog };
