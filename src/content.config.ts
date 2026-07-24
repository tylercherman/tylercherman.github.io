import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The work collection — one markdown file per piece.
 *
 * This schema is a build-time contract. Add a piece with a missing or misspelled
 * field and the build fails with a clear message naming the file, rather than
 * silently rendering something broken. That safety net is most of why this setup
 * stays easy to edit months from now.
 *
 * See PLAN.md §5.1. Deliberately NO `year` field — nothing displays a date and
 * ordering is manual, so it earned nothing.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      /** Display title. Vimeo titles are internal working titles — these are edited. */
      title: z.string(),

      /** "Adidas", "HBO Max". Optional: some pieces aren't client work. */
      client: z.string().optional(),

      /** Metadata only — there is deliberately no category filter UI. PLAN.md §6.1. */
      category: z.enum(['trailer', 'brand', 'reel']),

      role: z.string().default('Editor'),

      /**
       * Display order, ascending. Spaced by 10 so inserting never means
       * renumbering everything else — set a lower number to promote a piece.
       */
      order: z.number(),

      vimeoId: z.string(),

      /**
       * Privacy hash for unlisted videos. REQUIRED for those to play —
       * omitting it is a silent failure, which is why add-work extracts it
       * from the URL automatically.
       */
      vimeoHash: z.string().optional(),

      /**
       * Intrinsic video dimensions. Required, not optional: the grid uses these
       * to reserve the correct aspect ratio *before* the poster loads. Layout
       * shift is the specific bug this rebuild exists to fix.
       */
      width: z.number().int().positive(),
      height: z.number().int().positive(),

      /** Runtime in seconds, from Vimeo. */
      duration: z.number().optional(),

      /** Poster frame. Optimized by Astro at build time. */
      poster: image(),

      /**
       * Where to anchor the crop inside the uniform 16:9 thumbnail.
       * Any CSS object-position value ("center", "top", "center 30%").
       *
       * Matters most for the vertical and square pieces: cropping a 9:16 frame to
       * 16:9 discards most of it, and a centre crop can cut a face in half. Set
       * this per piece when the default crop lands badly.
       */
      posterPosition: z.string().default('center'),

      /**
       * Optional short silent loop for the tile (Phase C). Path under /public.
       * A piece with a loop animates; one without shows its poster. Loops can be
       * added one at a time forever, with no code changes.
       */
      previewLoop: z.string().optional(),

      /** Alt text for the poster. Real indexable content on a video-heavy page. */
      alt: z.string().optional(),

      featured: z.boolean().default(false),

      /** Hide from the live site without deleting the file. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { work };
