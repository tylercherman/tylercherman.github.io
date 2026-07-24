# Building Your Website With Claude Code: Step-by-Step Guide

**Stack:** Astro 7 (markdown + JSON → static HTML) · GitHub Pages (free hosting) · Formspree (contact form)

This is the same approach your friend described. The single most important idea in his message:

> *"It's good to outline and work through a plan before it implements one, otherwise it'll take the easiest route to a minimum viable product, but that might not support future expansion you have in mind."*

He's right, and that's why **Phase 1 and Phase 2 below are the phases that actually matter.** Phases 3–7 are mechanical once the plan is solid. Do not skip ahead to "make me a website" — that is exactly the prompt that produces a nice-looking dead end.

**Time estimate:** ~1 hour of setup, 1–2 hours of planning conversation, then a few hours of building. Budget an evening and a morning.

---

## Table of contents

- [Phase 0 — One-time machine setup](#phase-0--one-time-machine-setup)
- [Phase 1 — The planning conversation](#phase-1--the-planning-conversation-the-important-part)
- [Phase 2 — Lock down the content architecture](#phase-2--lock-down-the-content-architecture)
- [Phase 3 — Scaffold the project](#phase-3--scaffold-the-project)
- [Phase 4 — Build in reviewable slices](#phase-4--build-in-reviewable-slices)
- [Phase 5 — The contact form (Formspree)](#phase-5--the-contact-form-formspree)
- [Phase 6 — Deploy to GitHub Pages](#phase-6--deploy-to-github-pages)
- [Phase 7 — Custom domain (optional)](#phase-7--custom-domain-optional)
- [Phase 8 — Day-2: making little changes later](#phase-8--day-2-making-little-changes-later)
- [Appendix: what to do when something breaks](#appendix-what-to-do-when-something-breaks)

---

## Phase 0 — One-time machine setup

Your machine currently has **git only**. You need three more things. Do these once.

### 0.1 Install Node.js 22 LTS or newer

Astro 7 requires **Node 22.12.0 or higher**. You don't have Node at all right now, and you don't have Homebrew, so use the official installer — it's the least fuss.

1. Go to <https://nodejs.org>
2. Download the **macOS Apple Silicon (arm64)** `.pkg` installer for the **LTS** version
3. Run it, click through, then **quit and reopen your terminal** (important — the `PATH` won't update in an existing window)
4. Verify:

```bash
node --version && npm --version
```

You want `v22.12.0` or higher. If you get "command not found" after reopening the terminal, tell me and I'll sort out the `PATH`.

### 0.2 Set your git identity

Git needs to know who you are before it will let you commit. Nothing is set right now.

```bash
git config --global user.name "Tyler Cherman"
```

```bash
git config --global user.email "tycherman@gmail.com"
```

### 0.3 Install the GitHub CLI

This is what lets me create the repo and push for you instead of you clicking through the GitHub website. Without Homebrew, grab the installer:

1. Go to <https://github.com/cli/cli/releases/latest>
2. Download the `macOS arm64` `.pkg` file
3. Run it, reopen your terminal, then authenticate:

```bash
gh auth login
```

Choose: **GitHub.com** → **HTTPS** → **Login with a web browser**. Copy the one-time code it shows you, press Enter, and paste it into the browser page that opens.

> **Alternative:** if you'd rather install Homebrew first (useful long-term for other tools), run the command at <https://brew.sh> and then `brew install node gh`. Either path is fine.

### 0.4 Create the two accounts you'll need

| Account | Why | Cost |
|---|---|---|
| [GitHub](https://github.com/signup) | Stores the code, hosts the live site | Free |
| [Formspree](https://formspree.io/register) | Receives contact form submissions and emails them to you | Free tier: 50 submissions/month |

> **Status:** ✅ Both done. GitHub username `tylercherman`; repo will be `tylercherman.github.io`. Formspree form ID `xykrbgok`.

**Do these yourself** — I can't create accounts or enter passwords on your behalf. Once you're signed into Formspree, create a new form, name it something like "Website Contact", and **copy the form ID** it gives you. It looks like `xayzqwer` and produces an endpoint like `https://formspree.io/f/xayzqwer`. Paste that ID into our chat when we get to Phase 5.

### 0.5 Checkpoint

Run this and paste the output to me:

```bash
node --version; npm --version; git --version; gh --version; gh auth status
```

If all five report cleanly, Phase 0 is done.

---

## Phase 1 — The planning conversation (the important part)

**Goal:** produce two files — `PLAN.md` (what we're building) and `CLAUDE.md` (rules I follow every session) — *before* a single line of site code exists.

### 1.1 Why this phase exists

If you say "build me a portfolio site," I will make defensible-but-narrow choices in about ninety seconds: hardcode your projects into a single `index.astro`, inline the styling, ship something that looks finished. It'll work. Then in month two you'll ask for category filtering, or a second content type, or drafts, and the honest answer becomes "we need to restructure the whole content layer first."

The planning phase front-loads those decisions while they're still cheap. It's the difference between a site you can grow and a site you'll rebuild.

### 1.2 Gather your raw material first

Before we talk, put your actual content somewhere I can see it. Make a folder and drop things in:

```bash
mkdir -p /Users/tylercherman/Desktop/WEBSITE/_source-material
```

Put in there whatever you have: images, project photos, your bio, a résumé, copy you've already written, screenshots of sites whose look you like, a text file of half-formed ideas. Rough is fine — I'd rather see messy real content than a tidy hypothetical. Real content is what exposes the structural questions early ("ah, three of these projects have video, so the schema needs an optional video field").

### 1.3 The kickoff prompt

Start a fresh Claude Code session in the WEBSITE folder and paste this:

```
I want to build a website using Astro, hosted on GitHub Pages, with a Formspree
contact form. Everything content-related should be markdown or JSON files so I can
make small edits later without touching layout code.

Do NOT write any code yet. I want to plan first.

Interview me one topic at a time — ask me a few questions, wait for my answers, then
move to the next topic. Cover:

1. Purpose and audience: what this site is for, who visits it, what I want them to do
2. Every page I need now, and pages I might plausibly want within a year
3. My content types (e.g. projects, posts, services) and what fields each one needs
4. How things are ordered and grouped, and whether that needs to change per-page
5. Visual direction: look and feel, typography, color, density, reference sites
6. Images: how many, roughly what sizes, whether galleries or single hero shots
7. Anything dynamic: search, filtering, tags, pagination, RSS
8. Domain: whether I have one or will use a github.io URL

Push back where my answers create future problems. When we're done, write PLAN.md
with the full spec and CLAUDE.md with the conventions you'll follow, and let me read
both before we build anything.

My raw content is in _source-material/. Look through it before you start asking.
```

### 1.4 How to be a good interviewee

- **"I don't know yet" is a real answer.** Say it. The useful follow-up is "what would you need to know to decide?" — sometimes the answer is "let's build the simple version and keep the door open," and that's a legitimate architectural choice as long as it's deliberate.
- **Answer with specifics, not categories.** "Six projects, each with 3–8 photos, two have video" beats "a portfolio section."
- **Name your worry about the future.** "I might add a blog," "I want to sell prints eventually," "a client might need a private page." Every one of those changes the content model.
- **Show, don't describe, for visuals.** Three URLs of sites you like tells me more than five paragraphs of adjectives.

### 1.5 Read PLAN.md properly

When I hand you `PLAN.md`, actually read it. This is your last cheap chance to catch a wrong assumption. Specifically check:

- Is every page you care about listed?
- For each content type, is any field missing that you'd have to add later?
- Does the described ordering mechanism match how you actually think about ordering?
- Is anything in there that you didn't ask for and don't want?

Push back freely. Rewriting a paragraph of `PLAN.md` costs nothing; rewriting the content layer costs an afternoon.

### 1.6 What CLAUDE.md is for

`CLAUDE.md` gets loaded automatically at the start of every future session, so it's how you avoid re-explaining your project every time. It should end up holding things like:

```markdown
# Project: Tyler Cherman — personal site

## Stack
Astro 7, static output, zero client JS unless explicitly needed.
Deployed to GitHub Pages via .github/workflows/deploy.yml on push to main.

## Hard rules
- All content lives in markdown/JSON. Never hardcode copy into .astro files.
- New content type = new collection in src/content.config.ts with a zod schema.
- Site-wide values (nav, social links, contact email) live in src/data/site.json.
- Styling: design tokens in src/styles/tokens.css. No magic hex values in components.
- Run `npm run build` before declaring any change done.

## Conventions
- Ordering is driven by an `order` frontmatter field, ascending.
- Any entry with `draft: true` is excluded from production builds.
- Images go in src/assets/ and use Astro's <Image /> component, never raw <img>.
```

---

## Phase 2 — Lock down the content architecture

These are the decisions that are expensive to reverse. Settle them explicitly in `PLAN.md`. This phase is still conversation, not code.

### 2.1 The repo name decision — do this one carefully

This is the single most common way Astro + GitHub Pages goes wrong, so decide it now.

| Repo name | Live URL | Needs `base` config? |
|---|---|---|
| `tylercherman.github.io` | `https://tylercherman.github.io` | **No** ✅ |
| `my-website` | `https://tylercherman.github.io/my-website` | **Yes** — `base: '/my-website'` |

**Strong recommendation: name the repo `<your-github-username>.github.io`.** A project-site `base` path has to be prefixed onto every internal link and asset reference, and getting one wrong produces links that work locally and 404 in production — a genuinely annoying bug class. The user-site route sidesteps it entirely. You get one user site per GitHub account, and this is the best use of it.

If you're planning a custom domain (Phase 7), this matters less, but the user-site name is still the safer default.

### 2.2 Pages vs. collections

Two different mechanisms. Know which is which:

**Standalone pages** — one-offs like About or Contact. A single markdown file in `src/pages/` becomes a route automatically:

```
src/pages/about.md  →  yoursite.com/about
```

```markdown
---
layout: ../layouts/PageLayout.astro
title: About
description: A bit about me and how I work.
---

# About

Write your actual page content here, in plain markdown.
```

**Content collections** — repeatable things: projects, posts, services. These get a validated schema and a shared layout, and they're what makes ordering-driven-by-frontmatter possible.

Rule of thumb: **if you'll ever have more than three of it, make it a collection.** Converting a page to a collection later is real work; starting as a collection costs nothing extra.

### 2.3 How collections actually work

One config file declares your collections and validates their frontmatter. In Astro 5+ (including 7) it lives at **`src/content.config.ts`**:

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number(),
    order: z.number(),            // controls display order
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
  }),
});

export const collections = { projects };
```

That `schema` block is doing more than it looks like. It's a build-time contract: if you later add a project and forget `order`, or typo `yaer: 2026`, **the build fails with a clear message** instead of silently rendering a broken page. That safety net is most of the reason this setup stays easy to edit months later.

Each project is then just a file — `src/content/projects/harbor-house.md`:

```markdown
---
title: Harbor House
summary: A twelve-week renovation of a 1920s boathouse.
year: 2025
order: 1
tags: [renovation, residential]
featured: true
heroImage: './harbor-house/hero.jpg'
---

The long-form description goes here, in markdown. Headings, **bold**, lists,
links — all of it works.
```

**Reordering your portfolio is editing the `order:` numbers.** No layout code involved. That's exactly what your friend meant by the order being driven by the markdown.

### 2.4 Reading collections in a template

```astro
---
import { getCollection } from 'astro:content';

const projects = (await getCollection('projects'))
  .filter((p) => !p.data.draft)
  .sort((a, b) => a.data.order - b.data.order);
---

<ul>
  {projects.map((project) => (
    <li>
      <a href={`/projects/${project.id}`}>{project.data.title}</a>
      <p>{project.data.summary}</p>
    </li>
  ))}
</ul>
```

And one dynamic route file generates a page for every project — `src/pages/projects/[id].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import ProjectLayout from '../../layouts/ProjectLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { id: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---

<ProjectLayout title={project.data.title}>
  <Content />
</ProjectLayout>
```

Twelve projects, one route file. Add a thirteenth markdown file and its page exists on the next build.

### 2.5 JSON for site-wide values

Things that aren't page content but that you'll want to edit without touching components. `src/data/site.json`:

```json
{
  "siteName": "Tyler Cherman",
  "tagline": "Design and fabrication",
  "contactEmail": "tycherman@gmail.com",
  "nav": [
    { "label": "Work", "href": "/work" },
    { "label": "About", "href": "/about" },
    { "label": "Contact", "href": "/contact" }
  ],
  "social": [
    { "label": "Instagram", "href": "https://instagram.com/..." }
  ]
}
```

Imported directly in any component: `import site from '../data/site.json'`. Adding a nav item is a two-line JSON edit.

### 2.6 Architecture checklist

Before any code gets written, `PLAN.md` should answer all of these:

- [ ] Repo name, and therefore whether a `base` path is needed
- [ ] Complete list of collections, with every field and its type
- [ ] Which fields are required vs. optional — optional is easier to add to later
- [ ] The ordering mechanism, and whether any page needs a different order
- [ ] Draft/unpublished handling
- [ ] Where images live and how they're referenced
- [ ] Full page list with URL paths
- [ ] Where design tokens (color, type, spacing) are defined
- [ ] Whether any page needs client-side JavaScript, and which

---

## Phase 3 — Scaffold the project

Now code. From here on, hand me one phase at a time.

### 3.1 Create the Astro project

```bash
cd /Users/tylercherman/Desktop/WEBSITE && npm create astro@latest .
```

When prompted, choose: **empty/minimal template**, **yes** to TypeScript (strict), **yes** to installing dependencies, **yes** to initializing a git repo. Starting empty rather than from a portfolio template is deliberate — templates come with structural opinions that fight your plan.

Then confirm it runs:

```bash
npm run dev
```

Open <http://localhost:4321>. You'll see a nearly blank page. Correct. `Ctrl+C` to stop.

### 3.2 Have me lay the foundation

```
Following PLAN.md, set up the project skeleton only — no page content yet:

1. src/content.config.ts with all collections and zod schemas from the plan
2. Base layout with <head> metadata, skip link, header, footer
3. src/data/site.json with nav and site metadata
4. src/styles/tokens.css with design tokens (color, type scale, spacing)
5. One example entry per collection so I can see the shape
6. astro.config.mjs with the correct `site` value

Then run `npm run build` and confirm it passes. Don't build out real pages yet.
```

Reviewing the skeleton before there's content on top of it means structural problems are still one-file fixes.

---

## Phase 4 — Build in reviewable slices

Ask for **one page or component at a time**, and look at each before moving on. This is not busywork — it's how you avoid the situation where forty files exist, something's subtly wrong throughout, and neither of us can tell where it started.

A sensible order:

1. Base layout + header/footer + nav (every page inherits these)
2. Homepage
3. The collection index page (e.g. `/work`)
4. The collection detail template (`/work/[id]`)
5. Remaining standalone pages (About, etc.)
6. Contact page + form (Phase 5)
7. Polish: 404 page, favicon, Open Graph tags, sitemap, RSS if you want it

For each slice:

```
Build [thing] per PLAN.md. When it's done, run `npm run build`, then show me
the dev server so I can look at it. Note anything in PLAN.md this made you
want to reconsider.
```

Keep `npm run dev` running in a second terminal tab while we work — it hot-reloads, so you see changes immediately.

### 4.1 Commit at every working state

```bash
git add -A && git commit -m "Add work index page"
```

Ask me to commit whenever a slice is done and looks right. Cheap insurance: any later mistake is one `git revert` from gone.

### 4.2 Giving useful visual feedback

Vague feedback produces vague fixes. Instead of "the spacing looks off":

- *"Gap between the hero and the first project row is too big — cut it roughly in half."*
- *"Project titles should be the same size as the nav links, not larger."*
- *"On my phone the images are edge-to-edge; I want a small margin."*

I can also open the site in a browser and screenshot it myself to check responsive behavior at different widths — just ask.

---

## Phase 5 — The contact form (Formspree)

Your site is static HTML with no server, so it can't process a form submission itself. Formspree is the server: the form POSTs to their endpoint, they email you the contents.

### 5.1 Your endpoint

**Form ID: `xykrbgok`** → endpoint `https://formspree.io/f/xykrbgok`

(Formspree form IDs are public by design — they appear in the HTML of every site that uses one — so there's no problem committing this to the repo.)

### 5.2 The markup

```html
<form action="https://formspree.io/f/xykrbgok" method="POST">
  <label for="name">Name</label>
  <input id="name" type="text" name="name" required />

  <label for="email">Email</label>
  <input id="email" type="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" rows="6" required></textarea>

  <!-- Honeypot: hidden from people, filled in by bots.
       Formspree silently discards any submission where this has a value. -->
  <input type="text" name="_gotcha" class="visually-hidden" tabindex="-1" aria-hidden="true" />

  <button type="submit">Send</button>
</form>
```

Points worth knowing:

- The `name` attributes become the labels in the email you receive, so name them sensibly.
- A field named `email` is used as the notification's **Reply-To** — so you can just hit reply. (The older explicit `_replyto` field name also works.)
- `_gotcha` is Formspree's [honeypot](https://help.formspree.io/hc/en-us/articles/360017735154-How-to-prevent-spam). It must be hidden with CSS, **not** `type="hidden"` — bots skip genuinely hidden inputs but happily fill visible-to-them ones.
- Default behavior redirects to a Formspree thank-you page. To keep visitors on your site, either set a redirect URL in the Formspree dashboard, or submit via `fetch` with an `Accept: application/json` header and show your own success message. Ask me for the JS version if you want it — it's about fifteen lines.

### 5.3 Confirm your email first

Formspree won't deliver anything until you've clicked the confirmation link in the email they send on first submission. **Submit the form yourself once** after deploying, then check your inbox — including spam.

### 5.4 Prompt

```
Build the contact page per PLAN.md with a Formspree form posting to
https://formspree.io/f/xykrbgok. Include a CSS-hidden _gotcha honeypot,
proper labels tied to inputs, and client-side required validation. Style it
with the design tokens.
```

---

## Phase 6 — Deploy to GitHub Pages

### 6.1 Create the repo

Named per your Phase 2.1 decision:

```bash
gh repo create tylercherman.github.io --public --source=. --remote=origin
```

### 6.2 Configure `astro.config.mjs`

For a user site (`username.github.io`):

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tylercherman.github.io',
});
```

For a project site, add `base: '/repo-name'` as well — and remember every internal link needs that prefix.

The `site` value isn't optional busywork: sitemap generation, RSS, and canonical URLs all derive from it.

### 6.3 The deploy workflow

`.github/workflows/deploy.yml` — this rebuilds and publishes on every push to `main`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Install, build, and upload site
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

**Commit `package-lock.json`.** The build uses it to install exact dependency versions; without it, CI can pull different versions than your machine and fail confusingly.

### 6.4 Turn on Pages

One manual step in the browser — GitHub requires it:

1. Go to your repo on github.com → **Settings** → **Pages**
2. Under **Build and deployment** → **Source**, select **GitHub Actions**

Not "Deploy from a branch." The workflow above uses the Actions source.

### 6.5 Push

```bash
git add -A && git commit -m "Add GitHub Pages deploy workflow" && git push -u origin main
```

Watch it build:

```bash
gh run watch
```

Two or three minutes later your site is live at `https://tylercherman.github.io`. From now on, **every push to `main` republishes automatically.**

### 6.6 Verify on the real thing

Local success doesn't guarantee production success. Check the live URL, not just localhost:

- [ ] Every nav link works
- [ ] Images load (broken images here usually means a `base` path problem)
- [ ] CSS is applied (unstyled page = asset paths are wrong)
- [ ] Submit the contact form for real and confirm the email arrives
- [ ] Open it on your phone

---

## Phase 7 — Custom domain: migrating tylercherman.com off Squarespace

### 7.0 The actual situation (verified 2026-07-24)

This is a **migration of a live site**, not a fresh domain setup. Facts on the ground:

| Thing | Reality |
|---|---|
| Registrar (who you pay) | **GoDaddy** — registered 2021-10-24 |
| Nameservers (who answers DNS) | **`connect1/connect2.squarespacedns.com`** — Squarespace |
| Currently live at the domain | A **working Squarespace portfolio site** |
| Primary hostname | **`www`** — the apex 301-redirects to `www.tylercherman.com` |
| Store/cart | Vestigial Squarespace cart, selling nothing — no e-commerce to replace ✅ |

**⚠️ The single most important gotcha:** your domain is registered at GoDaddy but its **DNS is served by Squarespace**. Editing A records in GoDaddy's DNS panel will change *nothing*, because GoDaddy isn't authoritative for this domain — the nameservers delegate that to Squarespace. This wastes an afternoon for a lot of people. Read 7.2 before touching either dashboard.

### 7.1 Cutover order — do not skip this sequencing

Your current site is live and client-facing, with Nike, Adidas, Honda and HBO Max work on it. Do **not** point DNS at GitHub before the new site is finished — you'd replace a working portfolio with a half-built one at the exact moment a client might look.

Correct order:

1. **Build and deploy to `https://tylercherman.github.io` first.** Free, live, and touches no DNS. The Squarespace site stays up and untouched the whole time.
2. **Review the new site properly** at that URL — every page, on desktop and phone.
3. **Only then** change DNS (7.2) and set the custom domain in GitHub.
4. **Verify the new site loads on the real domain**, over HTTPS, with the form actually delivering email.
5. **Only after all of that**, cancel Squarespace — see 7.4, there's a trap in the ordering.

### 7.2 Two ways to move DNS — pick one

**Option A — Move DNS back to GoDaddy (recommended if you're cancelling Squarespace).**

At **GoDaddy** → your domain → Nameservers → change from the Squarespace ones to GoDaddy's defaults. Then add the records from 7.3 in GoDaddy's DNS panel.

Why this is the recommendation: if you cancel Squarespace while the nameservers still point at `squarespacedns.com`, you risk Squarespace stopping DNS service for the domain — which takes your site *and* any email down, and is a genuinely stressful thing to debug. Moving DNS to the registrar first removes Squarespace from the critical path entirely.

**Option B — Leave nameservers alone, edit records at Squarespace.**

Log into **Squarespace** → Settings → Domains → DNS Settings, and change the records there. Fewer moving parts short-term, and fine if you're keeping a Squarespace subscription for other reasons. But you must then never let that subscription lapse.

### 7.3 The DNS records

Delete the existing Squarespace A records (`198.185.159.x` / `198.49.23.x`) and the `www` CNAME pointing to `ext-sq.squarespace.com`, then add:

**Four A records** for the apex, host `@`:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Four AAAA records** (IPv6) for the apex, host `@` — optional but recommended:
```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**One CNAME**, host `www`, pointing to:
```
tylercherman.github.io
```

Set up **both** apex and `www`. GitHub then auto-redirects one to the other based on which you set as the custom domain, so no visitor hits a dead hostname.

### 7.4 Decide: apex or www as primary?

Your Squarespace site currently uses **`www` as primary**. Two considerations pull in opposite directions:

- **Keep `www.tylercherman.com`** — any existing links, business cards, or email signatures keep resolving to the canonical URL rather than through a redirect.
- **Switch to `tylercherman.com`** — cleaner, and how most portfolios read now.

Either works and GitHub redirects the other, so this is aesthetics rather than engineering. Whichever you choose goes in **both** `public/CNAME` and GitHub's custom-domain field, and they must match.

### 7.5 In the repo

`public/CNAME` — one line, no protocol, no trailing slash:
```
tylercherman.com
```

`astro.config.mjs` — set this from the start, even while previewing on `github.io`, so canonical URLs, sitemap and social-preview tags are all correct on launch day:
```javascript
export default defineConfig({
  site: 'https://tylercherman.com',
});
```

### 7.6 In GitHub

1. **Verify the domain first** — Profile **Settings → Pages → Add a domain**. GitHub asks for a `TXT` record; this prevents anyone else from claiming your domain on their Pages site later. Do this before step 2.
2. Repo **Settings → Pages → Custom domain** → enter the domain → Save.
3. Wait for the certificate, then tick **Enforce HTTPS**.

The HTTPS checkbox is greyed out until GitHub finishes issuing the certificate. That can take minutes or up to 24 hours. It is not broken; leave it and come back. Don't panic-toggle settings in the meantime — that restarts the process.

### 7.7 Don't cancel Squarespace until

- [ ] Nameservers moved (Option A) or records changed (Option B)
- [ ] `https://tylercherman.com` and `https://www.tylercherman.com` both serve the new site
- [ ] Enforce HTTPS is on and the padlock is clean
- [ ] Contact form submitted for real and the email arrived
- [ ] Any email on the domain still works (check `MX` records survived — there are none today, so likely nothing to lose, but confirm)

Keep the Squarespace site around for a week after cutover. It costs one more billing cycle and it's your rollback plan.

---

## Phase 8 — Day-2: making little changes later

This is the payoff your friend was describing. Common edits, and what they actually involve:

| What you want | What you do |
|---|---|
| Reorder the portfolio | Edit `order:` numbers in the markdown frontmatter |
| Add a project | Copy an existing `.md` file, change the frontmatter and text |
| Hide a project temporarily | Set `draft: true` |
| Fix a typo | Edit the markdown |
| Add a nav item | Add an object to `nav` in `src/data/site.json` |
| Change a color | Edit `src/styles/tokens.css` |

The workflow for any of them:

```bash
npm run dev
```

Make the edit, look at it in the browser, then:

```bash
git add -A && git commit -m "Add Riverside project" && git push
```

Pushing triggers the deploy. Live in a couple of minutes.

**You can do all of this without me.** The markdown edits are genuinely just typing. Come back to me for anything structural — a new content type, a layout change, a new page template — and start with: *"Read CLAUDE.md and PLAN.md first."* That's what those files are for.

### A note on adding a whole new content type later

Say in six months you want a blog. Because the architecture is already collection-based, that's: add a `blog` collection to `src/content.config.ts`, add `src/pages/blog/[id].astro`, add an index page. Maybe an hour. It slots into the existing pattern instead of fighting it — which is precisely what the planning phase bought you.

---

## Appendix: what to do when something breaks

**Build fails with a schema error.** Read the message — it names the file and field. Usually a missing required frontmatter field or a typo'd key. This is the safety net working as designed.

**Site works locally, breaks live.** Almost always the `base` path. Check `astro.config.mjs` against your repo name. This is the failure mode that recommending a user-site repo name avoids.

**Page is live but completely unstyled.** Asset paths. Same root cause as above.

**Contact form submits but no email.** Did you click Formspree's confirmation link? Check spam. Verify the form ID in the `action` URL matches your dashboard.

**Deploy workflow fails.** Look at the log:
```bash
gh run view --log-failed
```
Most common causes: `package-lock.json` not committed, or Pages source not set to "GitHub Actions."

**Anything else.** Paste the full error to me. Don't paraphrase it — the exact text usually contains the answer.

---

## Quick reference

```bash
npm run dev      # local dev server at localhost:4321, hot-reloads
npm run build    # production build into dist/ — run before every push
npm run preview  # serve the built dist/ locally, closer to production
git push         # triggers deploy
gh run watch     # watch the deploy happen
```

**Files you'll edit often:** `src/content/**/*.md` · `src/data/site.json` · `src/styles/tokens.css`
**Files you'll rarely touch:** `src/layouts/` · `src/pages/**/[id].astro` · `astro.config.mjs`

---

## Sources

- [Deploy an Astro Site to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) — workflow YAML and `site`/`base` config
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) — loaders, schemas, `render()`
- [Astro 7 release notes](https://astro.build/blog/astro-7/)
- [Upgrade to Astro v7](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [Formspree: how to prevent spam](https://help.formspree.io/hc/en-us/articles/360017735154-How-to-prevent-spam) — `_gotcha` honeypot
- [Node.js downloads](https://nodejs.org) · [GitHub CLI releases](https://github.com/cli/cli/releases/latest)
