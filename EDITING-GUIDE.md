# How to edit your website

Written for doing this yourself, without asking Claude. Nothing here requires knowing
how to code — you're editing text files and running three commands.

**The golden rule:** you can't permanently break anything. Every published version is
saved in git, so any mistake is recoverable. Experiment freely.

---

## Contents

- [Before you start (one time only)](#before-you-start-one-time-only)
- [The three commands](#the-three-commands)
- [Where everything lives](#where-everything-lives)
- [Task: change the About page text](#task-change-the-about-page-text)
- [Task: add a new piece of work](#task-add-a-new-piece-of-work)
- [Task: hide or remove work](#task-hide-or-remove-work)
- [Task: reorder the work](#task-reorder-the-work)
- [Task: replace a thumbnail](#task-replace-a-thumbnail)
- [Task: change other text on the site](#task-change-other-text-on-the-site)
- [Publishing your changes](#publishing-your-changes)
- [If something goes wrong](#if-something-goes-wrong)
- [Cheat sheet](#cheat-sheet)

---

## Before you start (one time only)

### Get a proper text editor

**Do not use TextEdit.** It silently converts straight quotes (`"`) into curly quotes
(`"`), which breaks these files in ways that are annoying to spot.

Install **Visual Studio Code** — free, from <https://code.visualstudio.com>. Open your
whole project once:

1. Open VS Code
2. **File → Open Folder…**
3. Choose `Desktop/WEBSITE`

Now every file is in the sidebar and you never have to hunt for paths again.

### Know how to open a terminal in the project

Two ways:

- **In VS Code:** **Terminal → New Terminal**. It opens already in the right folder. Easiest.
- **In the Terminal app:** type `cd ~/Desktop/WEBSITE` and press Enter.

Every command in this guide is run from there.

---

## The three commands

These are the only ones you need.

### 1. See your changes as you make them

```bash
npm run dev
```

Starts a preview of your site on your own computer. The terminal prints a link — hold
**Cmd** and click it, or open <http://127.0.0.1:4321> in your browser.

**Leave this running while you work.** Every time you save a file, the browser updates
by itself within a second. No need to re-run anything.

To stop it, click the terminal and press **Ctrl + C**.

> If the link doesn't load, try `http://127.0.0.1:4321` instead of `localhost:4321`.

### 2. Check nothing is broken

```bash
npm run build
```

Run this before publishing. If it says **"Complete!"**, you're fine. If it prints an
error, it names the file and the problem — read it, fix it, run it again. This is a
safety net, not a chore: it catches mistakes before visitors see them.

### 3. Publish

```bash
git add -A && git commit -m "Describe what you changed" && git push
```

Your live site updates about two minutes later. Details in
[Publishing your changes](#publishing-your-changes).

---

## Where everything lives

You only ever need these. Everything else is layout and styling — leave it alone.

| What you want to change | File |
|---|---|
| **About page words** | `src/copy/about.md` |
| **Contact page words** | `src/data/copy.json` |
| **404 page words** | `src/data/copy.json` |
| **Your name, email, phone, city** | `src/data/site.json` |
| **Menu items** | `src/data/site.json` |
| **Hero name / "Editor \| Creative"** | `src/data/site.json` |
| **"Selected Work" heading and the line under it** | `src/data/site.json` |
| **Resume — credits, jobs, skills** | `src/data/resume.json` |
| **A piece of work** | `src/content/work/` — one file per piece |
| **Thumbnails** | `src/assets/posters/` |
| **The downloadable resume PDF** | `public/tyler-cherman-resume.pdf` |

**Two file types, two sets of rules:**

- **`.md` (markdown)** — just write. Normal sentences, blank line between paragraphs.
  Surround words with `**two asterisks**` to make them stand out.
- **`.json`** — stricter. Change only what's between the `"quotes"`. Keep every quote,
  comma, and bracket exactly where it is. If you delete a comma, the build will tell you.

---

## Task: change the About page text

This is the one you asked about, so here it is in full.

**1.** Start the preview if it isn't running:

```bash
npm run dev
```

**2.** Open `src/copy/about.md`. It looks like this:

```markdown
---
headline: I'm an editor, a filmmaker, and a collaborator.
---

I cut trailers, commercials, TV series, films, and documentaries — if it has moving
pictures, I put it together. I've worked with clients like HBO Max, Netflix, Nike...

The commercial side runs from sportswear and consumer campaigns to cutdowns...

**Based in Portland. Working everywhere.**
```

**3.** Edit it like a normal document.

- The `headline:` line between the `---` markers is the big text at the top. Change the
  words after `headline:`, keep the word `headline:` itself.
- Everything below the second `---` is the body copy.
- **A blank line between paragraphs makes a new paragraph.** That's the only formatting
  rule that matters.
- `**Bold text**` renders brighter than the rest — that's why the last line stands out.

**4.** Save (**Cmd + S**). Look at your browser — it has already updated.

**5.** When you're happy:

```bash
npm run build
```

then publish:

```bash
git add -A && git commit -m "Update About text" && git push
```

That's it. Adding a whole new paragraph is just typing one, with a blank line above it.

---

## Task: add a new piece of work

You need the Vimeo link. One command:

```bash
npm run add-work https://vimeo.com/905002018
```

If the video is **unlisted**, use the full link including the code after the slash or
`?h=`, e.g. `https://vimeo.com/1024552311/75a27e6025`. That code is what allows the
video to play on the site — without it the video silently won't load.

The command fetches the title, dimensions, runtime and thumbnail from Vimeo, downloads
the thumbnail, and puts the piece at the **end** of your work page.

**You can set details at the same time:**

```bash
npm run add-work https://vimeo.com/905002018 --title "Summer Spot" --client "Nike" --category brand
```

- `--title` — what visitors see. Vimeo titles are usually internal working names, so
  this is worth setting.
- `--client` — shown on hover.
- `--category` — one of `trailer`, `brand`, or `reel`.
- `--order 15` — put it at a specific position instead of last (see next section).

Then check it, and publish:

```bash
npm run dev
```

```bash
git add -A && git commit -m "Add Summer Spot" && git push
```

**To change the title or client afterwards**, open the new file in `src/content/work/`
and edit the line. Keep the quotes:

```
title: "Summer Spot"
client: "Nike"
```

---

## Task: hide or remove work

**To hide something** — open its file in `src/content/work/` and change:

```
draft: false
```

to:

```
draft: true
```

It disappears from the site. The file stays, so putting it back later is changing that
one word again. **This is the recommended way** — nothing is lost.

**To delete it permanently** — drag the file from `src/content/work/` to the Trash. Git
still has it in history, but recovering it means asking Claude.

Either way, publish when done:

```bash
git add -A && git commit -m "Hide the Honda spot" && git push
```

---

## Task: reorder the work

See the current order:

```bash
npm run list-work
```

You'll get something like:

```
  ORD  TITLE                    CLIENT     CAT
  10   The Last Ranger          —          trailer
  20   Buscando Alma            Ebb Tide   trailer
  30   We Before Me             Adidas     brand
```

The `ORD` number controls position. **Lower number = higher on the page.**

They're spaced by 10 on purpose, so you can slot things in without touching anything
else. Open the file in `src/content/work/` and change its `order:` line:

- **Move a piece to the very top** → give it a low number, like `order: 5`
- **Put something between 20 and 30** → use `order: 25`
- **Move a piece to the bottom** → give it a number higher than everything else

You only ever edit the piece you're moving. The others stay as they are.

---

## Task: replace a thumbnail

Useful when the automatic crop picks an unflattering frame — especially on the vertical
and square pieces, where a 16:9 thumbnail can only show about a third of the frame.

**1.** Export a frame that works horizontally. JPEG or PNG, ideally 1920px wide or more.

**2.** Find the piece's short name with `npm run list-work` — it's the filename without
`.md`, e.g. `ryan-garcia`.

**3.** Run:

```bash
npm run set-poster ryan-garcia ~/Desktop/my-frame.jpg
```

It resizes the image, strips hidden data from it (phone photos can carry GPS
coordinates), and installs it.

**If the framing sits wrong**, nudge which part shows without re-exporting:

```bash
npm run set-poster ryan-garcia ~/Desktop/my-frame.jpg --position "center top"
```

Options for `--position`: `"center"`, `"center top"`, `"center bottom"`, or a
percentage like `"center 30%"` (smaller number = shows more of the top).

> **HEIC files won't work.** If it's a photo straight from your iPhone, convert it first:
> ```bash
> sips -s format jpeg ~/Desktop/photo.HEIC --out ~/Desktop/photo.jpg
> ```

---

## Task: change other text on the site

### Your name, email, phone, city, menu

Open `src/data/site.json`. Change what's inside the quotes:

```json
"email": "tycherman@gmail.com",
```

To add a menu item, copy an existing line in the `nav` list and edit it. **Every line
needs a comma at the end except the last one** — that trips people up.

### The hero

Also in `src/data/site.json`:

```json
"hero": {
  "headline": "Tyler Cherman",
  "roles": ["Editor", "Creative"],
```

`roles` is the `EDITOR | CREATIVE` line. Add a third by adding `, "Director"` inside
the brackets.

### The "Selected Work" heading

Same file:

```json
"work": {
  "heading": "Selected Work",
  "subhead": "Trailers, commercials, series, documentary."
}
```

### Contact and 404 pages

Open `src/data/copy.json`. Self-explanatory — change the text inside the quotes.

### Resume

Open `src/data/resume.json`. Credits, jobs, education, skills. Each credit is a block:

```json
{ "project": "The Last Ranger", "type": "Trailer", "client": null, "role": "Trailer Editor" }
```

Copy an existing block to add a new credit. `null` means "leave blank" — no quotes
around it.

**Remember:** the downloadable PDF at `public/tyler-cherman-resume.pdf` is a separate
file. Editing the JSON does not change the PDF. Replace the PDF yourself when the
credits change, keeping the same filename.

---

## Publishing your changes

Three steps, always the same:

**1. Check it builds.**

```bash
npm run build
```

Look for **"Complete!"** at the end.

**2. Publish.**

```bash
git add -A && git commit -m "Update About text" && git push
```

Replace the message with what you actually changed. It's a note to your future self.

**3. Wait about two minutes.** The site rebuilds itself and goes live. To watch it:

```bash
gh run watch
```

If it says the run has completed with `success`, you're live. Reload your site.

> **The first time you push,** git may ask you to sign in. Follow the prompts — it only
> happens once.

---

## If something goes wrong

### The build failed

Read the message. It names the file and the line. Almost always one of:

- **A missing comma** in a `.json` file, or one comma too many after the last item
- **A curly quote** instead of a straight one — the sign you edited in TextEdit
- **A missing required field** in a work file

Fix it and run `npm run build` again.

### I broke something and I don't know what

First, see what you've actually changed:

```bash
git status
```

Files under **"Changes not staged for commit"** are ones you've edited. Files under
**"Untracked files"** are brand new.

To throw away all your edits and go back to the last published version:

```bash
git checkout -- .
```

Your files return to exactly how they were when you last pushed. Anything you changed
since is gone — which is the point.

> **One thing this doesn't do:** it only restores files that have been published before.
> A brand-new file you just created isn't affected, because git has no earlier version
> to restore it to. If you added a file and want it gone, drag it to the Trash. This
> matters least of all for the everyday case — editing existing text — which it handles
> perfectly.

### The site looks wrong but the build passed

Hard-refresh your browser: **Cmd + Shift + R**. Usually an old cached version.

### The preview won't start

Something else may already be using it. Close the other terminal, or:

```bash
pkill -f "astro dev"
```

Then `npm run dev` again.

### I want an old version back

Every publish is saved. To see the history:

```bash
git log --oneline
```

Recovering a specific old version is a job for Claude — but nothing is ever lost.

---

## Cheat sheet

```bash
npm run dev          # preview locally, updates as you save
npm run build        # check for errors before publishing
npm run list-work    # show all work in display order

npm run add-work <vimeo-url>              # add a piece
npm run set-poster <name> <image-file>    # replace a thumbnail

git add -A && git commit -m "message" && git push   # publish
git checkout -- .                                   # undo since last publish
```

**Files you'll edit often**

```
src/copy/about.md          About page words
src/data/site.json         name, email, menu, hero, headings
src/data/copy.json         contact + 404 words
src/data/resume.json       resume
src/content/work/*.md      one file per piece of work
```

**Files to leave alone** — `src/layouts/`, `src/components/`, `src/pages/`,
`src/styles/`, `astro.config.mjs`. These are the layout and design. Changing text in
them isn't necessary; everything you need is in the files above.
