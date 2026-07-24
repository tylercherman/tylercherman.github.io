# tylercherman.com — Site Plan

**Status:** 🟡 DRAFT for review — sections marked **⬜ OPEN** still need Tyler's input
**Last updated:** 2026-07-24
**Replaces:** existing Squarespace site at tylercherman.com

---

## 1. Purpose

A portfolio for **Tyler Cherman, editor** — trailers, brand and commercial work, edit reels.

**The job the site does:** someone who has already heard Tyler's name — usually by word of mouth — is handed the URL, arrives, watches work, and is motivated to hire him.

**Primary audience:** production companies, agencies, brands. Decision-makers, arriving warm.

**What a visitor should do before leaving:** watch work on the Work page, and read the Resume.

**Secondary goal (added 2026-07-24):** rank on Google for local hiring searches — *"Portland film editor"*, *"Portland movie editor"* and similar. This is a new goal, not an afterthought; see §10 for what's achievable and what it requires from Tyler.

### Explicit non-goals

Naming these keeps us from paying for things Tyler doesn't need:

- **E-commerce.** The current Squarespace cart is a vestigial default selling nothing. Static hosting can't process payments, and there's nothing to process.
- **Blog / news / CMS.** Not now. Architecture leaves the door open (adding a collection is ~1 hour).
- **Client logins or gated pages.** Private work is handled via Vimeo unlisted links (see §5.3).

### Why replace Squarespace

In Tyler's words, ranked:

1. **Updating is clunky.** Adding work means wrestling embed blocks, which breaks the page format.
2. **He updates often** — adding fresh work and retiring old work is a constant activity, not occasional.
3. **Boxed in by templates.**
4. **Cost.** Stops the subscription.

He broadly likes the current look and is open to style improvements.

> **The design target follows directly from #1 and #2: adding a project must be one new markdown file with a Vimeo ID, and nothing else.** Every architectural decision below is measured against that.

---

## 2. Diagnosis of the current site

Verified 2026-07-24 by inspecting the live site.

| Finding | Consequence |
|---|---|
| **14 Vimeo iframes on the homepage**, 15 loads of `player.js` | This is the root cause of "clunky." Fourteen independent video players boot before the page settles. |
| Layout shifts as players initialize | Explains "affects the format" — iframes resize as they load. |
| Mixed aspect ratios, unhandled | See §2.1. Squarespace forces them into one grid shape. |
| 4 videos are Vimeo **unlisted** (privacy hash) | Tyler already solved private work; the new schema must preserve it. |
| No resume page exists | New requirement (§4.3). |

**The single biggest improvement available:** replace eager iframes with **click-to-play poster thumbnails**. One player loads, on click, instead of fourteen on arrival. Faster page, no layout shift, and it matters most for the mobile social traffic Tyler wants to grow.

### 2.1 Aspect ratios — a real design constraint

The 17 videos are **not** uniformly 16:9:

| Count | Ratio | Examples |
|---|---|---|
| 11 | 16:9 | Most trailers, Adidas |
| 2 | **9:16 vertical** | Ryan Garcia, RETAIL BILLBOARD |
| 2 | **1:1 square** | Honda / UPROXX (×2) |
| 1 | 2.35:1 scope | Playboy Edit Reel |
| 1 | 2:1 | The Good For Somethings |

Five different shapes. The grid must **reserve correct space per item before the poster loads** — otherwise we reproduce the exact layout-shift problem we're fixing. This is why `width`/`height` are required schema fields, not optional niceties.

**✅ RESOLVED (Q1):** One unified grid, no separate section. Tyler wants all work in a single grid or scroll with no category divisions. The five ratios become a **deliberate visual feature** — a varied-tile layout where a vertical piece next to a scope piece creates rhythm, rather than being forced into uniform boxes as Squarespace does now.

---

## 3. Stack

| Layer | Choice |
|---|---|
| Framework | **Astro 7** (static output) |
| Content | Markdown + JSON, validated by zod schemas |
| Video | **Vimeo** embeds, click-to-play |
| Hosting | **GitHub Pages**, repo `tylercherman.github.io` |
| Deploy | GitHub Actions on push to `main` |
| Forms | **Formspree**, form ID `xykrbgok` |
| Domain | **tylercherman.com** — migration detailed in SETUP-GUIDE.md §7 |
| Client JS | Only for click-to-play and mobile nav. No framework. |

**Staging benefit:** the site is live at `tylercherman.github.io` throughout the build, so the Squarespace site stays up until Tyler has reviewed the real thing. No downtime, and a rollback that costs one billing cycle.

---

## 4. Pages

Four pages. Deliberately minimal — Tyler's word for what he likes about the current site is "simplicity," and the goal is to elevate it, not expand it.

| Route | Source | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | **Work is the homepage.** Hero montage + full grid, all 17 pieces. |
| `/about` | `src/pages/about.md` | Very simple. Markdown. |
| `/resume` | `src/pages/resume.astro` + `src/data/resume.json` | HTML page **and** PDF download |
| `/contact` | `src/pages/contact.astro` | Simple email form, Formspree |
| `/404` | `src/pages/404.astro` | Real page — see below |
| `/work`, `/work-1` | static redirects → `/` | Preserves old Squarespace URLs (§7.1) |

**What the 404 page is:** a real page on your site, and yes it's genuinely yours to design. "404" is the web's error code for "that address doesn't exist." If someone mistypes `tylercherman.com/wrok`, or clicks an old dead link, the server has nothing to show them — so it serves the 404 page instead.

GitHub Pages automatically uses a file called `404.html` for this. If we don't make one, visitors get GitHub's stark default with GitHub's branding on your domain. Ours will be a styled page in your site's design saying something brief with a link back to the work. It's maybe twenty minutes of work and it means a wrong turn still looks like your site.

**Year removed from the schema (Tyler's call).** Nothing on a work tile displays a date, and ordering is manual, so the field earned nothing. Note it's cheap to reintroduce later as an optional field if you ever want dates shown — that's the benefit of the schema being explicit.

**✅ RESOLVED (Q2): No individual project pages.** Clicking a tile opens the full video in a **lightbox overlay** instead. Keeps the visitor in one continuous experience, which suits "grid or scroll," and avoids 17 thin pages that each say little.

**✅ RESOLVED (Q3): No category filtering.** Tyler's reasoning is the important part and it's recorded in §6.1 — filters would draw attention to the fact that some pieces are less famous than others. Less is more; the visuals carry it.

---

## 5. Content architecture

### 5.1 The `work` collection

`src/content/work/*.md` — one file per project. **Adding work = copying a file and changing the frontmatter.**

```typescript
// src/content.config.ts
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: ({ image }) => z.object({
    title:       z.string(),                    // display title
    client:      z.string().optional(),         // "Adidas", "HBO Max"
    category:    z.enum(['trailer', 'brand', 'reel']),  // metadata only — no filter UI
    role:        z.string().default('Editor'),
    order:       z.number(),                    // manual sequence, spaced by 10 — see §5.7
    vimeoId:     z.string(),
    vimeoHash:   z.string().optional(),         // REQUIRED for unlisted videos
    width:       z.number(),                    // for aspect-ratio reservation
    height:      z.number(),
    duration:    z.number().optional(),         // seconds
    poster:      image().optional(),            // local override; else Vimeo thumb
    previewLoop: z.string().optional(),         // short muted loop, see §6.2
    featured:    z.boolean().default(false),
    draft:       z.boolean().default(false),    // hide without deleting
  }),
});
```

Example — `src/content/work/the-last-ranger.md`:

```markdown
---
title: The Last Ranger
category: trailer
role: Editor
order: 10
vimeoId: "1024552311"
vimeoHash: "75a27e6025"
width: 426
height: 240
duration: 74
featured: true
---

Optional longer description in markdown, shown on the project page.
```

### 5.2 Ordering and retirement — as chosen

- **Order:** manual `order:` number, ascending. Full curatorial control — strongest work first regardless of date.
- **Retiring work:** set `draft: true`. Disappears from the live site, file stays in the repo, restoring it is a one-word edit.

### 5.3 Private / unreleased work

Four current videos are Vimeo unlisted. The `vimeoHash` field carries the privacy token — **without it an unlisted video will not play.** The current site's "request additional samples" note stays as a call to action; no gated pages needed.

### 5.4 Poster images

Vimeo's oEmbed API returns thumbnails, but at low resolution by default. Plan: **fetch high-resolution posters once during migration and commit them to `src/assets/posters/`.** Astro's `<Image>` then optimizes them at build.

Rationale: no build-time network dependency (a Vimeo outage can't break a deploy), faster builds, and Tyler can override any poster with a better frame by dropping in a file and setting `poster:`.

### 5.5 Resume — `src/data/resume.json` + PDF

Credits live in JSON so the HTML page always matches; the PDF is a committed file in `public/`.

```json
{
  "name": "Tyler Cherman",
  "title": "Editor",
  "pdf": "/tyler-cherman-resume.pdf",
  "credits": [
    { "year": 2025, "project": "The Last Ranger", "type": "Trailer", "role": "Editor" }
  ],
  "skills": ["Adobe Premiere Pro", "DaVinci Resolve", "After Effects"]
}
```

**✅ RESOLVED (Q4):** `Tyler Cherman_Resume.pdf` supplied and fully extracted to `_source-material/resume-extracted.json` — 22 credits, 4 roles, education, 5 skill groups, contact details, and the Ridley Scott epigraph. Tyler doesn't like the current PDF's look, so the `/resume` page gets **restyled to match the site**, with the same content.

Note: the existing PDF stays downloadable for now. Regenerating a restyled PDF from the site's own design is a nice-to-have, not a launch blocker.

### 5.7 The add / remove / reorder workflow — Tyler's core requirement

This is the whole reason for the rebuild, so it gets designed explicitly rather than left to emerge.

#### Adding work — one command

```bash
npm run add-work https://vimeo.com/905002018
```

A script (`scripts/add-work.mjs`) does the rest:

1. Accepts a Vimeo URL — public, or unlisted in either `vimeo.com/ID/HASH` or `vimeo.com/ID?h=HASH` form
2. Calls Vimeo's oEmbed API for title, width, height, duration, thumbnail
3. Downloads the poster frame to `src/assets/posters/`
4. Writes `src/content/work/<slug>.md` with every field filled in
5. Sets `order` to the current maximum + 10, so it lands at the bottom
6. Prints the file path so Tyler can tweak the title or client if he wants

**Paste a Vimeo link, run one command, the work page updates.** That's the requirement met. No embed blocks, no layout wrestling, no touching any component.

For unlisted videos the `vimeoHash` is extracted from the URL automatically — the thing that would otherwise silently break playback.

#### Removing work — one word

```markdown
draft: true
```

Gone from the live site, file stays in the repo, restoring it is deleting one word.

#### Reordering — one number

`order` values are **spaced by 10** (10, 20, 30…), which makes reordering cheap:

- **Promote something to the top:** give it a number lower than everything else. Set `order: 5` and it leads the page. One edit, one file.
- **Insert between two pieces:** 20 and 30 have a gap, so use 25.
- **Full reshuffle:** renumber, or ask me to.

Spacing exists specifically so that moving one piece never means renumbering the other sixteen. Tyler said reordering matters, particularly near the top, and this is the case it optimizes for.

#### Seeing current state

```bash
npm run list-work
```

Prints every piece in display order with its `order` number and draft status — so the current arrangement is visible without opening 17 files.

#### Publishing

```bash
git add -A && git commit -m "Add Nike spot" && git push
```

Live in two or three minutes. This is the only git anyone needs for routine content work.

### 5.6 Site-wide config — `src/data/site.json`

Nav, social links, contact email, SEO defaults. Adding an Instagram or TikTok link is a two-line JSON edit — relevant given the social growth goal.

---

## 6. Design direction

**Dark.** Confirmed. Video reads better against it and all three references are dark.

**Target feel:** "simple, but elevated, with a lot of style." Keep the restraint of the current site; raise the execution.

### 6.0 References

| Site | What it's built with | What to take from it |
|---|---|---|
| [tashitrieu.com](https://tashitrieu.com/) | **Astro** | Editor portfolio on our exact stack. Restraint, typography-led. |
| [jointpost.tv](https://www.jointpost.tv/) | Squarespace + raw `<video>` | **The autoplay montage feel** Tyler specifically wants. See §6.2. |
| [xav.la](https://xav.la/) | **Astro v4** + Contentful | Also uses `<video muted loop autoplay>`. Confident minimal layout. |

Two of the three are Astro sites. The look Tyler is drawn to is native to what we're building, not something we're fighting the stack to imitate.

### 6.1 The visual-first principle — Tyler's reasoning, recorded

Tyler on skipping filters and project pages:

> *"I'm trying to hide that some of the content is not the most public facing or famous content. I more want to wow them with the visuals."*

This is the governing design principle, and it has a direct consequence: **the grid leads with motion and image, not with titles and client names.** Metadata is secondary — revealed on hover or in the lightbox, never shouted. A grid of labelled tiles invites comparison between credits; a grid of moving images invites watching.

### 6.2 The autoplay montage — how Joint actually does it

Investigated 2026-07-24. Joint uses **raw `<video muted autoplay loop playsinline>` tags**, not Vimeo players, pulling MP4s from `player.vimeo.com/progressive_redirect/...`.

**That specific technique is not available to us.** Those URLs return **403** — for Joint's own videos as well as Tyler's. They're signed and expiring. Tyler's account is Vimeo **Pro**, which does permit direct file access through the Vimeo API, but using it would mean a build-time API token in GitHub secrets, and a deploy that breaks whenever the token rotates. Not worth the fragility.

**So: yes, this needs separate video files — and that's the better answer anyway.** A loop and a watchable video are different things. The loop is silent, 5–8 seconds, no controls, sized for a tile. The full piece stays on Vimeo with its audio, its player, and its privacy settings.

**Three-layer video strategy:**

| Layer | What | Where it lives |
|---|---|---|
| **Hero montage** | One 20–30s silent cut of clips from various projects. Muted, autoplay, loop. The "Joint feel." | Self-hosted MP4 in `public/video/` |
| **Grid tiles** | Poster image by default. Swaps to a short silent loop when scrolled into view. | Self-hosted MP4s, lazy-loaded |
| **Full video** | Click a tile → lightbox with the real Vimeo player, audio, controls. One iframe, on demand. | Vimeo (unchanged) |

Why self-host the loops rather than stream them:

- **Bandwidth stays sane.** 17 loops at ~1.5 MB compressed is ~25 MB in the repo — trivially under GitHub's 1 GB guidance. Lazy-loading via `IntersectionObserver` means a visitor only downloads what they actually scroll past.
- **No API token, no expiring URLs, no build-time network dependency.** A Vimeo outage cannot break a deploy.
- **Tyler controls the compression** — he's an editor with DaVinci and Premiere. Exporting silent loops is a normal afternoon's work, not a new skill.
- **Unlisted work stays protected.** The loop is a few seconds of silent visual; the full piece remains behind Vimeo's privacy hash.

Guardrails: `prefers-reduced-motion` and `Save-Data` fall back to static posters. Mobile gets posters and tap-to-play rather than autoplaying loops — no autoplaying 17 videos on a phone.

### 6.3 A recommendation about your credits — worth reading

Having read the resume: **the work page is underselling you badly.**

The site shows 17 Vimeo pieces. The resume lists 22 credits including **"The Last Ranger" — 2025 Oscar Nominated**, **"Buscando Alma" — 2025 Oscar Qualified**, plus HBO Max (×2), Netflix (×2), Nike/Jordan, Amazon Studios, Showtime, A&E (×2), Quibi, Snapchat, Adidas, Logitech.

Several of the strongest credits — *Taken Together*, *Le Bal*, *Glow Up*, *Anna Nicole Smith*, *Yarn Bomb*, *SNCTM Moscow*, the Nike/Jordan campaign — **have no video on the site at all**, presumably because they can't be posted publicly. That is the real shape of the problem Tyler described as "hiding" weaker content: it isn't that the visible work is weak, it's that the best work isn't visible.

A client wordmark row and an Oscar callout were proposed as a way to let credits carry the credibility so the grid could stay purely visual.

**✅ DECIDED (Q6): Neither. Visuals only.** Tyler's call — the homepage goes straight into the work with no credit banner and no award line. This is the purest reading of "wow them with the visuals" and closest to the current site's restraint.

Consequences, recorded so they're not a surprise later:

- The `/resume` page is now the **only** place major credits appear — HBO Max, Netflix, Nike/Jordan, Amazon Studios, Showtime, A&E, Quibi, and the two Oscar credits. That makes the Resume link's prominence in the nav matter more, since it's carrying the whole credentials load.
- Because there's no filtering and no titles competing for attention, `order` is doing real work. The first three or four tiles are effectively the entire first impression.

Do not re-add a credits banner without Tyler asking for it.

### 6.4 Committed regardless

- **Mobile-first.** Social traffic arrives on phones; that's the primary layout, not an afterthought.
- **Design tokens in `src/styles/tokens.css`.** No hardcoded hex values in components — restyling later means editing one file.
- **Aspect-ratio boxes reserved before load.** No layout shift, ever.
- **Accessible:** real focus states, keyboard-operable play buttons and lightbox, alt text, sensible heading order, `Esc` closes the lightbox.

---

## 10. SEO — ranking for "Portland film editor"

Added as a goal 2026-07-24 at Tyler's request. This supersedes the earlier non-goal.

### 10.1 An honest assessment first

**Achievable:** ranking well for *"Portland film editor"*, *"Portland video editor"*, *"Portland trailer editor"*. These are geographically narrow, moderately competitive terms. Tyler has real credentials, a genuine Portland address, and a domain with history since 2021.

**Not promisable:** a guaranteed #1 position. Anyone who promises that is selling something. Ranking depends substantially on **off-site signals I cannot build** — see 10.4 — and it takes months, not days.

**Two structural handicaps worth naming plainly:**

1. **A video portfolio is text-thin.** Google reads words. A site that is mostly silent video tiles gives it very little to work with. This is the single biggest obstacle.
2. **It pulls against "very simple."** Tyler wants a minimal About page; the About page is also the main place substantive indexable text can live. These are in genuine tension. Resolution in 10.3.

**One real advantage:** Astro produces fast static HTML, and our click-to-play design avoids the 14 eager iframes currently on the Squarespace homepage. Page speed is a ranking factor, and the current site almost certainly fails Core Web Vitals on mobile. **The rebuild is likely to improve rankings on speed alone.**

### 10.2 What gets built in (my side)

- **Unique `<title>` per page** with natural location signal — e.g. `Tyler Cherman — Film & Video Editor | Portland, OR`
- **Real meta descriptions.** The current site's is **empty** — a straightforward miss we fix by default.
- **JSON-LD structured data:** `Person` plus `ProfessionalService`, carrying `address` (Portland, OR), `jobTitle`, `knowsAbout` (trailer editing, commercial editing, documentary), and `sameAs` links to Vimeo, IMDb, Instagram, LinkedIn. This is how Google connects "editor" + "Portland" + "Tyler Cherman" into one entity.
- **`sitemap.xml`** via `@astrojs/sitemap`, and a `robots.txt` that actually allows search crawlers
- **Semantic HTML** — one `<h1>` per page, correct heading order, real `<nav>`/`<main>`
- **Descriptive `alt` text** on every poster, naming client and format. Free indexable text on an otherwise text-thin page.
- **Canonical URLs** and correct Open Graph / Twitter cards
- **Old URLs preserved** (§7.1) so no accumulated authority is thrown away
- **Fast Core Web Vitals** — the click-to-play architecture is doing double duty here

### 10.3 Resolving the "simple vs. indexable" tension

The recommendation is **visually simple, textually substantive**. A page can look spare and still contain 200 well-written words. What that means concretely:

- **About page:** 150–250 words of real prose — who Tyler is, what he cuts, that he's based in Portland and works with national clients. Not keyword stuffing; genuine copy that happens to contain the terms people search. This is the primary SEO surface.
- **Footer:** `Portland, OR` sitewide. Small, quiet, consistent.
- **Resume page:** already dense with indexable text — client names, formats, roles. It's an SEO asset as well as a credentials page, which is a nice side effect of Q6 going the way it did.

**⬜ OPEN Q8:** Do you want to write the About copy, or should I draft 200 words from your resume for you to correct? Drafting from your own credits tends to work better than starting from a blank page.

**A tradeoff worth your judgement:** local SEO wants "Portland" prominent, but you work for Netflix, HBO Max and Nike — national clients. Leading the homepage with "Portland" could read as narrower than you are. My recommendation is location lives in the **metadata, footer, and About page** — where Google reads it — and stays off the hero, where humans judge your scope. You get the local ranking signal without capping how big you look.

### 10.4 What only Tyler can do — and it matters more than the code

For local search, off-site signals typically outweigh on-page work:

1. **Google Business Profile** — free, and often the single biggest lever for "[city] [profession]" queries. A service-area business in Portland, category "Video Editing Service." **Do this one first.**
2. **Consistent name/location/contact** across Vimeo, IMDb, LinkedIn, Instagram — matching what the site says
3. **Links from production companies** whose projects you cut. A credit link from a real production site is worth a great deal.
4. **IMDb page** kept current and linked from the site (`sameAs`)

Without at least #1 and #2, the on-page work underperforms regardless of quality.

### 10.5 Timeline

Realistically **3–6 months** for meaningful movement on local terms after launch, assuming the off-site items get done. Indexing takes days; earning position takes longer. Worth setting expectations now so it doesn't feel like something broke.

**Post-launch:** submit the sitemap to Google Search Console (free) and check what queries actually surface the site. That data beats guessing.

---

## 7. Migration — automated

All 17 videos are inventoried in `_source-material/vimeo-inventory.json` with IDs, privacy hashes, titles, dimensions, durations and thumbnail URLs.

**✅ DECIDED: carry over all 17 pieces.** No pruning during migration — anything Tyler wants gone later is a `draft: true` edit.

**Tyler will not retype his portfolio.** The 17 markdown files get generated from that inventory. Manual work afterward is limited to:

- Confirming display titles (Vimeo titles are internal — `RETAIL BILLBOARD` needs a real name)
- Assigning `client` and `category`
- Setting `order` — the curatorial pass, which is Tyler's call

### 7.1 Preserving existing URLs

The current Squarespace site has four indexed paths: **`/work`, `/about`, `/contact`, `/work-1`**.

`/about` and `/contact` carry over unchanged. But our plan puts the work grid at `/`, which would leave `/work` and `/work-1` dead — throwing away whatever search authority they've accumulated and breaking any link anyone has shared.

**Fix:** Astro's `redirects` config generates static redirect pages for `/work` and `/work-1` pointing at `/`. Costs nothing, and matters now that SEO is a goal (§10).

---

## 8. Build sequence

1. Scaffold + `content.config.ts` + tokens + base layout
2. Generate the 17 work files from the inventory; download posters
3. Work grid with click-to-play — **the core of the site**
4. Project pages (pending Q2)
5. About, Resume, Contact + Formspree
6. 404, favicon, social cards, sitemap
7. Deploy to `tylercherman.github.io` and review
8. DNS cutover per SETUP-GUIDE.md §7
9. Cancel Squarespace only after §7.7 checklist passes

---

## 9. Open questions summary

| # | Question | Status |
|---|---|---|
| Q1 | Vertical/square placement | ✅ One unified grid, ratios as a feature |
| Q2 | Individual project pages | ✅ No — lightbox instead |
| Q3 | Category filtering | ✅ No — visual-first (§6.1) |
| Q4 | Resume content | ✅ Supplied and extracted; restyle to match site |
| Q5 | Design direction | ✅ Dark; refs in §6.0; "simple but elevated" |
| Q6 | Client row + Oscar line | ✅ **No** — visuals only (§6.3) |
| Q7 | Hero montage / tile loops | ✅ Tyler exports; phased A→B→C so nothing blocks |
| Q8 | 404 page | ✅ Explained in §4 — real page, we style it |
| Q9 | `year` field | ✅ Removed from schema |
| Q10 | Migration scope | ✅ Carry over all 17 |
| Q11 | Add/remove/reorder workflow | ✅ Designed in §5.7 — `npm run add-work <url>` |
| Q12 | Local SEO | ✅ Now a goal — §10. Off-site work in §10.4 is Tyler's |
| **Q13** | **Who writes the ~200-word About copy?** | ⬜ **Open — see §10.3** |

**Build status: not started — awaiting go-ahead.**

### Q7 — the only thing that actually gates the montage

The hero montage and the tile loops are **video files Tyler needs to export.** Nobody else can cut them; they're editorial decisions about which frames sell the work.

- **Hero montage:** one 20–30s silent cut, 1080p, no audio track, H.264 MP4, target under 10 MB. Tyler cuts sizzles professionally — this is a familiar task.
- **Tile loops (optional, phase two):** 5–8s silent loops per piece, 720p, ~1–1.5 MB each.

**Recommended phasing so the build isn't blocked:**

1. **Phase A — build now.** Full grid with Vimeo poster frames, lightbox playback, all pages, deployed and reviewable. No new video exports needed. This is a complete, launchable site.
2. **Phase B — add the hero montage** when Tyler has cut it. Drops into `public/video/`, one config line.
3. **Phase C — add tile loops** incrementally. The `previewLoop` field is optional, so a tile with a loop animates and one without shows its poster. **They can be added one at a time, forever, with no code changes.**

This means Tyler is never blocked on video exports, and the site is live and good before any of them exist.
