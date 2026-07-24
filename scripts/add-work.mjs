/**
 * Add a piece of work from a Vimeo link.
 *
 *   npm run add-work https://vimeo.com/905002018
 *   npm run add-work https://vimeo.com/1024552311/75a27e6025      (unlisted)
 *   npm run add-work https://vimeo.com/1024552311?h=75a27e6025    (unlisted)
 *
 * Optional flags:
 *   --title "Real Title"      display title (default: Vimeo's internal title)
 *   --client "HBO Max"
 *   --category trailer|brand|reel
 *   --role "Lead Editor"
 *   --order 25                explicit position (default: last + 10)
 *   --draft                   create it hidden
 *
 * This exists because the old Squarespace workflow — wrestling embed blocks that
 * broke the page layout — is the reason this site was rebuilt. Adding work has to
 * stay a single command.
 */

import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  parseVimeoUrl,
  fetchVimeoMeta,
  upgradeThumbnailUrl,
  download,
  slugify,
  orientationOf,
} from './lib/vimeo.mjs';
import { stripLetterbox } from './lib/letterbox.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORK_DIR = join(ROOT, 'src/content/work');
const POSTER_DIR = join(ROOT, 'src/assets/posters');
const CATEGORIES = ['trailer', 'brand', 'reel'];

const exists = (p) => access(p).then(() => true).catch(() => false);

function parseArgs(argv) {
  const opts = { draft: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--draft') { opts.draft = true; continue; }
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const value = argv[++i];
      if (value === undefined) throw new Error(`--${key} needs a value`);
      opts[key] = value;
      continue;
    }
    rest.push(a);
  }
  return { opts, url: rest[0] };
}

/** Next order value: highest existing + 10, leaving room to insert. */
async function nextOrder() {
  if (!(await exists(WORK_DIR))) return 10;
  const files = (await readdir(WORK_DIR)).filter((f) => f.endsWith('.md'));
  let max = 0;
  for (const f of files) {
    const text = await readFile(join(WORK_DIR, f), 'utf8');
    const m = text.match(/^order:\s*(\d+)/m);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 10;
}

async function main() {
  const { opts, url } = parseArgs(process.argv.slice(2));

  if (!url) {
    console.error(`
  Add a piece of work from a Vimeo link.

    npm run add-work <vimeo-url> [options]

  Options:
    --title "Real Title"     display title (Vimeo's own title is usually internal)
    --client "HBO Max"
    --category trailer|brand|reel
    --role "Lead Editor"
    --order 25               explicit position (default: last + 10)
    --draft                  create it hidden
`);
    process.exit(1);
  }

  if (opts.category && !CATEGORIES.includes(opts.category)) {
    console.error(`  --category must be one of: ${CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  const { id, hash } = parseVimeoUrl(url);
  console.log(`  fetching ${id}${hash ? ' (unlisted)' : ''}…`);

  const meta = await fetchVimeoMeta(id, hash);
  const title = opts.title ?? meta.vimeoTitle ?? `Vimeo ${id}`;
  const slug = slugify(opts.slug ?? title);

  if (!slug) throw new Error('Could not derive a filename — pass --title.');

  const mdPath = join(WORK_DIR, `${slug}.md`);
  if (await exists(mdPath)) {
    console.error(`  ${slug}.md already exists. Pass --title to use a different name.`);
    process.exit(1);
  }

  // Guard against adding the same video twice under a different name.
  if (await exists(WORK_DIR)) {
    for (const f of (await readdir(WORK_DIR)).filter((f) => f.endsWith('.md'))) {
      const text = await readFile(join(WORK_DIR, f), 'utf8');
      if (new RegExp(`^vimeoId:\\s*"?${id}"?\\s*$`, 'm').test(text)) {
        console.error(`  Vimeo ${id} is already on the site as ${f}`);
        process.exit(1);
      }
    }
  }

  await mkdir(WORK_DIR, { recursive: true });
  await mkdir(POSTER_DIR, { recursive: true });

  const posterPath = join(POSTER_DIR, `${slug}.jpg`);
  await download(upgradeThumbnailUrl(meta.thumbnail, 1920), posterPath);

  // Vimeo bakes letterbox bars into thumbnails for anything wider than its
  // container ratio. Thumbnails are cropped to a uniform 16:9 in the grid, so
  // bars would show as black bands. Strip them now.
  const lb = await stripLetterbox(posterPath);

  const order = opts.order ? Number(opts.order) : await nextOrder();
  const category = opts.category ?? 'trailer';
  const orientation = orientationOf(meta.width, meta.height);

  const kind = { trailer: 'trailer', brand: 'commercial', reel: 'edit reel' }[category];
  const shape = orientation === 'vertical' ? 'vertical ' : orientation === 'square' ? 'square ' : '';
  const alt = opts.client
    ? `Still from the ${shape}${kind} for ${opts.client} — ${title}, edited by Tyler Cherman.`
    : `Still from the ${shape}${kind} for ${title}, edited by Tyler Cherman.`;

  const lines = ['---', `title: ${JSON.stringify(title)}`];
  if (opts.client) lines.push(`client: ${JSON.stringify(opts.client)}`);
  lines.push(`category: ${category}`);
  lines.push(`role: ${JSON.stringify(opts.role ?? 'Editor')}`);
  lines.push(`order: ${order}`);
  lines.push(`vimeoId: ${JSON.stringify(id)}`);
  if (hash) lines.push(`vimeoHash: ${JSON.stringify(hash)}`);
  lines.push(`width: ${meta.width}`);
  lines.push(`height: ${meta.height}`);
  if (meta.duration) lines.push(`duration: ${meta.duration}`);
  lines.push(`poster: ../../assets/posters/${slug}.jpg`);
  lines.push(`alt: ${JSON.stringify(alt)}`);
  lines.push(`draft: ${opts.draft ? 'true' : 'false'}`);
  lines.push('---', '');

  await writeFile(mdPath, lines.join('\n'), 'utf8');

  console.log(`
  Added "${title}"

    file      src/content/work/${slug}.md
    poster    src/assets/posters/${slug}.jpg
    size      ${meta.width}x${meta.height} (${orientation})${lb.cropped ? `\n    poster    letterbox bars cropped (${lb.top}px/${lb.bottom}px)` : ''}
    order     ${order}${opts.order ? '' : '  (last — lower the number to move it up)'}
    category  ${category}${opts.category ? '' : '  (default — change if wrong)'}
    ${hash ? 'unlisted  privacy hash captured\n    ' : ''}
  Next: check it with "npm run dev", then commit and push to publish.
`);
}

main().catch((err) => {
  console.error(`\n  ${err.message}\n`);
  process.exit(1);
});
