# tylercherman.com — project conventions

Portfolio site for **Tyler Cherman, editor** (trailers, brand/commercial, edit reels).
Read `PLAN.md` before any structural work. Migration and DNS details live in `SETUP-GUIDE.md`.

## Stack

Astro 7, static output. GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.
Repo `tylercherman.github.io`; production domain `tylercherman.com`.
Contact form: Formspree, form ID `xykrbgok`.

## The one rule that matters most

**Adding a new project must stay a single new markdown file with a Vimeo ID.**
That is the reason this site exists — the old Squarespace site made updates clunky.
Reject any change that makes publishing work harder, even if it's prettier.

## Hard rules

- All content lives in markdown or JSON. **Never hardcode copy into `.astro` files.**
- New content type = new collection in `src/content.config.ts` with a zod schema.
- Site-wide values (nav, social, contact email) live in `src/data/site.json`.
- Styling via design tokens in `src/styles/tokens.css`. **No magic hex values in components.**
- Every video container **reserves its aspect ratio before load.** Layout shift is the specific
  bug we're fixing; reintroducing it is a regression.
- **Click-to-play only.** Never render more than one Vimeo iframe eagerly. The old site loaded
  14 players on the homepage; that is the problem, not the pattern.
- `vimeoHash` must be passed through to the embed URL when present, or unlisted videos break.
- Run `npm run build` before declaring any change done.
- Mobile layout first. Social/link-in-bio traffic arrives on phones.

## Conventions

- Work ordering: `order` frontmatter, ascending. Manual and curatorial — do not "improve" it
  by switching to date sort.
- `draft: true` hides an entry from production builds without deleting the file.
- Images go in `src/assets/` and use Astro's `<Image />`. Never a raw `<img>` for local assets.
- Vimeo posters are committed to `src/assets/posters/` — no build-time network calls.
- Categories are `trailer` | `brand` | `reel`.

## SEO is a goal (added 2026-07-24)

Target: rank for "Portland film editor" / "Portland movie editor". See PLAN.md §10.
Every page needs a unique title, a real meta description, and correct JSON-LD.
Posters need descriptive alt text naming client and format — on a video-heavy site that
is much of the indexable text there is.
Location signal belongs in metadata, footer and About — **not** the hero. Tyler works for
national clients and shouldn't read as Portland-only.

## Non-goals — don't build these unasked

E-commerce, blog, client logins.

**No credits banner on the homepage.** A client wordmark row and an Oscar callout were
proposed and Tyler declined them — the homepage is visuals only. Major credits live on
`/resume` and nowhere else. Don't reintroduce this.

**The work grid leads with image and motion, not titles.** Metadata is secondary — hover
or lightbox, never shouted. See PLAN.md §6.1.

## Content workflow (built — see PLAN.md §5.7)

```bash
npm run add-work https://vimeo.com/905002018   # add a piece; fetches title, size, poster
npm run list-work                              # show everything in display order
npm run set-poster <slug> <image>              # replace a thumbnail with your own frame
npm run fix-posters --apply                    # strip letterbox bars from posters
npm run dev                                    # preview at http://127.0.0.1:4321
npm run build                                  # must pass before any change is "done"
```

Thumbnails are cropped to a uniform 16:9 by `object-fit`, with the anchor set per
piece via `posterPosition`. Cropping a 9:16 vertical to 16:9 keeps only ~31% of the
frame, so for those, a purpose-exported horizontal frame via `set-poster` beats any
crop. `set-poster` strips metadata (one of Tyler's source photos carried GPS).

Tile labels are TITLE + runtime on every tile, deliberately. An earlier version
showed client-or-category, which read inconsistently — brand work said "ADIDAS"
while indie films said "TRAILER". Client belongs in the lightbox title bar.

Note the dev server binds IPv4 only — use `127.0.0.1:4321`, not `localhost:4321`.

Reorder by editing `order:` (spaced by 10; lower number = higher on the page).
Hide with `draft: true`. Never hand-write a work file — use `add-work`, which captures
the `vimeoHash` that unlisted videos need to play.

## Astro 7 notes

- Dev server supports background mode: `astro dev --background`, then
  `astro dev stop` / `astro dev status` / `astro dev logs`.
- **Whitespace between elements is collapsed per JSX conventions.** A newline before
  an inline `<a>` no longer renders as a space — use `{' '}` explicitly. This has
  already bitten once on the contact page.
- Markdown defaults to the Rust Sätteri pipeline; remark/rehype plugins need an
  explicit `@astrojs/markdown-remark` import.
- HEIC is not a valid input to Astro's image pipeline. Convert source photos to
  JPEG first (and strip EXIF — one of Tyler's photos carried GPS coordinates).
- Docs: https://docs.astro.build — routing, content collections, images, styling.

## Saved versions

Two states are preserved in git. Neither is dead — Tyler may come back to the second.

| Ref | What it is |
|---|---|
| `v1-vertical-grid` (tag) | The grid homepage as first approved. |
| `v2-nle-timeline` (tag) | The editing-suite experiment, working. |
| `experiment/nle-timeline` (branch) | Same, but mutable — check this out to tinker. |

**The NLE timeline experiment** put a viewer at the top of the screen and a horizontal
timeline of clips below it, with clip widths proportional to runtime, clicking a clip
to load it into the viewer. It lived at `/timeline`. Tyler reviewed it and chose to
stay with the vertical grid, but asked that it be kept for later.

```bash
git checkout experiment/nle-timeline      # work on it
git show v2-nle-timeline:src/pages/timeline.astro   # just read it
```

Restoring it needs both `src/pages/timeline.astro` and the `appShell` prop plus
`body.is-app-shell` styles in `src/layouts/Base.astro`, which were removed from main
along with the page. **Do not rebuild it from scratch** — take it from the branch.

## Working style

- Build one page or component at a time and show Tyler before moving on.
- Tyler is not a developer. Explain what changed in plain terms; don't assume familiarity with
  npm, git, or Astro internals.
- Flag anything that contradicts `PLAN.md` rather than quietly working around it.
