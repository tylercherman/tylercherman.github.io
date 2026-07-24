/**
 * One-time migration: generate the work collection from the Squarespace site's
 * Vimeo embeds.
 *
 *   node scripts/migrate.mjs
 *
 * Reads _source-material/vimeo-inventory.json (scraped from the live Squarespace
 * site), fetches fresh metadata and a high-resolution poster for each piece, and
 * writes src/content/work/*.md.
 *
 * Display titles and clients are mapped below from Tyler Cherman_Resume.pdf where
 * the two could be matched. Vimeo titles are internal working titles and are not
 * suitable for display ("RETAIL BILLBOARD", "Honda / UPROXX - TS").
 *
 * Safe to re-run: skips any markdown file that already exists, so Tyler's edits
 * are never clobbered. Delete a file to regenerate just that one.
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  fetchVimeoMeta,
  upgradeThumbnailUrl,
  download,
  orientationOf,
} from './lib/vimeo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORK_DIR = join(ROOT, 'src/content/work');
const POSTER_DIR = join(ROOT, 'src/assets/posters');

/**
 * slug -> display metadata.
 * `order` is a starting curatorial guess, spaced by 10: the Oscar-nominated
 * trailer leads, then narrative trailers, then brand, then reels. Tyler will
 * reorder — that's a one-number edit per piece.
 */
const CATALOG = [
  { id: '1024552311', slug: 'the-last-ranger',        title: 'The Last Ranger',            category: 'trailer', role: 'Trailer Editor', order: 10,  featured: true,  note: '2025 Oscar Nominated Short Film' },
  { id: '948933504',  slug: 'buscando-alma',          title: 'Buscando Alma',               category: 'trailer', client: 'Ebb Tide Productions', role: 'Lead Editor', order: 20, featured: true, note: '2025 Oscar Qualified Short Film' },
  { id: '1120252164', slug: 'adidas-we-before-me',    title: 'We Before Me',                category: 'brand',   client: 'Adidas',       order: 30,  featured: true },
  { id: '949621618',  slug: 'adidas-game-time',       title: 'Game Time',                   category: 'brand',   client: 'Adidas',       order: 40 },
  { id: '1000998474', slug: 'tt-official-trailer',    title: 'TT',                          category: 'trailer', order: 50,  reviewTitle: true },
  { id: '1062504720', slug: 'shopping-for-superman',  title: 'Shopping for Superman',       category: 'trailer', order: 60 },
  { id: '1153022767', slug: 'inside-these-walls',     title: 'Inside These Walls',          category: 'trailer', order: 70 },
  { id: '1159738931', slug: 'above-the-sea',          title: 'Above the Sea',               category: 'trailer', order: 80 },
  { id: '856621282',  slug: 'two-funerals-freezer',   title: 'Two Funerals and a Freezer',  category: 'trailer', order: 90 },
  { id: '600364164',  slug: 'good-for-somethings',    title: 'The Good for Somethings',     category: 'trailer', order: 100 },
  { id: '905003704',  slug: 'ryan-garcia',            title: 'The Fight Inside with Ryan Garcia', category: 'trailer', client: 'Snapchat', order: 110 },
  { id: '905003368',  slug: 'honda-troye-sivan',      title: 'Troye Sivan — Behind the Music', category: 'brand', client: 'Uproxx / Honda', order: 120 },
  { id: '905002663',  slug: 'honda-julia-michaels',   title: 'Julia Michaels — Behind the Music', category: 'brand', client: 'Uproxx / Honda', order: 130 },
  { id: '905005161',  slug: 'honey-perfect-man',      title: 'The Perfect Man',             category: 'brand',   client: 'Honey',        order: 140, reviewTitle: true },
  { id: '905002018',  slug: 'retail-billboard',       title: 'Retail Billboard',            category: 'brand',   order: 150, reviewTitle: true },
  { id: '905005281',  slug: 'lorac-reel',             title: 'LORAC Cosmetics',             category: 'reel',    client: 'LORAC Cosmetics', role: 'Editor / Director / Producer', order: 160 },
  { id: '905004965',  slug: 'playboy-reel',           title: 'Playboy — Edit Reel',         category: 'reel',    client: 'Playboy',      order: 170, reviewTitle: true },
];

const exists = (p) => access(p).then(() => true).catch(() => false);

/** Build alt text that's genuinely descriptive — real indexable content. */
function altText({ title, client, category, orientation }) {
  const kind = { trailer: 'trailer', brand: 'commercial', reel: 'edit reel' }[category];
  const shape = orientation === 'vertical' ? 'vertical ' : orientation === 'square' ? 'square ' : '';
  return client
    ? `Still from the ${shape}${kind} for ${client} — ${title}, edited by Tyler Cherman.`
    : `Still from the ${shape}${kind} for ${title}, edited by Tyler Cherman.`;
}

function frontmatter(entry, meta) {
  const orientation = orientationOf(meta.width, meta.height);
  const lines = [
    '---',
    `title: ${JSON.stringify(entry.title)}`,
  ];
  if (entry.client) lines.push(`client: ${JSON.stringify(entry.client)}`);
  lines.push(`category: ${entry.category}`);
  if (entry.role) lines.push(`role: ${JSON.stringify(entry.role)}`);
  lines.push(`order: ${entry.order}`);
  lines.push(`vimeoId: ${JSON.stringify(entry.id)}`);
  if (meta.hash) lines.push(`vimeoHash: ${JSON.stringify(meta.hash)}`);
  lines.push(`width: ${meta.width}`);
  lines.push(`height: ${meta.height}`);
  if (meta.duration) lines.push(`duration: ${meta.duration}`);
  lines.push(`poster: ../../assets/posters/${entry.slug}.jpg`);
  lines.push(`alt: ${JSON.stringify(altText({ ...entry, orientation }))}`);
  if (entry.featured) lines.push('featured: true');
  lines.push('draft: false');

  // Leave a visible marker on the ones whose display title is a guess.
  if (entry.reviewTitle) {
    lines.push(`# TODO Tyler: confirm display title — Vimeo's internal title was ${JSON.stringify(meta.vimeoTitle)}`);
  }
  if (entry.note) lines.push(`# note: ${entry.note}`);

  lines.push('---', '');
  return lines.join('\n');
}

async function main() {
  const inventoryPath = join(ROOT, '_source-material/vimeo-inventory.json');
  const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'));
  const hashById = new Map(inventory.map((v) => [v.vimeoId, v.vimeoHash]));

  await mkdir(WORK_DIR, { recursive: true });
  await mkdir(POSTER_DIR, { recursive: true });

  let created = 0, skipped = 0, failed = 0;

  for (const entry of CATALOG) {
    const mdPath = join(WORK_DIR, `${entry.slug}.md`);
    if (await exists(mdPath)) {
      console.log(`  skip     ${entry.slug} (already exists)`);
      skipped++;
      continue;
    }

    try {
      const hash = hashById.get(entry.id) ?? null;
      const meta = await fetchVimeoMeta(entry.id, hash);

      const posterUrl = upgradeThumbnailUrl(meta.thumbnail, 1920);
      const posterPath = join(POSTER_DIR, `${entry.slug}.jpg`);
      if (!(await exists(posterPath))) await download(posterUrl, posterPath);

      await writeFile(mdPath, frontmatter(entry, { ...meta, hash }), 'utf8');

      const shape = orientationOf(meta.width, meta.height);
      const flag = hash ? ' [unlisted]' : '';
      console.log(`  created  ${entry.slug.padEnd(26)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)} ${shape.padEnd(9)}${flag}`);
      created++;
    } catch (err) {
      console.error(`  FAILED   ${entry.slug}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  ${created} created, ${skipped} skipped, ${failed} failed (${CATALOG.length} in catalog)`);
  if (failed) process.exitCode = 1;
}

await main();
