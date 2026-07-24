/**
 * Replace a piece's thumbnail with your own frame.
 *
 *   npm run set-poster the-last-ranger ~/Desktop/my-frame.jpg
 *   npm run set-poster ryan-garcia ~/Desktop/frame.png --position "center top"
 *
 * Use this when the automatic crop of a Vimeo thumbnail lands badly — which it
 * will for vertical and square pieces, since cropping 9:16 to 16:9 keeps only
 * about a third of the frame. Export a frame that works horizontally and point
 * this at it.
 *
 * What it does:
 *   - accepts JPEG, PNG, WebP, TIFF, HEIC (converted automatically)
 *   - resizes so the long edge is at most 1920px
 *   - strips ALL metadata, including any GPS coordinates
 *   - writes src/assets/posters/<slug>.jpg
 *   - resets posterPosition to "center" unless you pass --position
 *
 * It does NOT crop to 16:9. The tile does that with object-fit, so the full frame
 * stays available and you can retune the anchor without re-exporting.
 *
 *   npm run list-work        # to see the slugs
 */

import { readFile, writeFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, basename } from 'node:path';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORK_DIR = join(ROOT, 'src/content/work');
const POSTER_DIR = join(ROOT, 'src/assets/posters');

const exists = (p) => access(p).then(() => true).catch(() => false);

function parseArgs(argv) {
  const opts = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[++i];
      if (val === undefined) throw new Error(`--${key} needs a value`);
      opts[key] = val;
    } else {
      rest.push(argv[i]);
    }
  }
  return { opts, slug: rest[0], imagePath: rest[1] };
}

async function main() {
  const { opts, slug, imagePath } = parseArgs(process.argv.slice(2));

  if (!slug || !imagePath) {
    const slugs = (await exists(WORK_DIR))
      ? (await readdir(WORK_DIR)).filter((f) => f.endsWith('.md')).map((f) => f.replace('.md', ''))
      : [];
    console.error(`
  Replace a thumbnail with your own frame.

    npm run set-poster <slug> <image-file> [--position "center top"]

  Available slugs:
${slugs.map((s) => `    ${s}`).join('\n')}
`);
    process.exit(1);
  }

  const mdPath = join(WORK_DIR, `${slug}.md`);
  if (!(await exists(mdPath))) {
    console.error(`  No such piece: ${slug}\n  Run "npm run list-work" to see the slugs.`);
    process.exit(1);
  }

  // Tolerate a path pasted with surrounding quotes or a trailing space.
  const src = imagePath.replace(/^['"]|['"]$/g, '').trim();
  if (!(await exists(src))) {
    console.error(`  Image not found: ${src}`);
    process.exit(1);
  }

  const ext = extname(src).toLowerCase();
  if (ext === '.heic' || ext === '.heif') {
    console.error(`
  ${basename(src)} is HEIC, which sharp can't read.

  Convert it first (macOS has this built in):
    sips -s format jpeg "${src}" --out ~/Desktop/frame.jpg

  Then run this again pointing at the .jpg.
`);
    process.exit(1);
  }

  const destPath = join(POSTER_DIR, `${slug}.jpg`);
  const input = await readFile(src);

  let meta;
  try {
    meta = await sharp(input).metadata();
  } catch {
    console.error(`  Could not read ${basename(src)} as an image.`);
    process.exit(1);
  }

  const long = Math.max(meta.width, meta.height);
  const scale = long > 1920 ? 1920 / long : 1;
  const outW = Math.round(meta.width * scale);
  const outH = Math.round(meta.height * scale);

  const buf = await sharp(input)
    .rotate() // honour EXIF orientation before we discard the metadata
    .resize(outW, outH, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer(); // sharp writes no metadata by default — EXIF and GPS are dropped

  await writeFile(destPath, buf);

  // Update posterPosition in the markdown.
  const position = opts.position ?? 'center';
  let text = await readFile(mdPath, 'utf8');
  if (/^posterPosition:/m.test(text)) {
    text = text.replace(/^posterPosition:.*$/m, `posterPosition: ${JSON.stringify(position)}`);
  } else {
    text = text.replace(/^poster: /m, `posterPosition: ${JSON.stringify(position)}\nposter: `);
  }
  await writeFile(mdPath, text, 'utf8');

  const ratio = (outW / outH).toFixed(2);
  console.log(`
  Replaced the thumbnail for "${slug}"

    from      ${basename(src)}  (${meta.width}x${meta.height})
    written   src/assets/posters/${slug}.jpg  (${outW}x${outH}, ratio ${ratio})
    position  ${position}
    metadata  stripped

  The tile crops this to 16:9 with object-fit, so nothing is discarded on disk.
  If the framing sits wrong, retune without re-exporting:

    npm run set-poster ${slug} ${basename(src)} --position "center 30%"

  Check it with "npm run dev", then commit and push.
`);
}

main().catch((err) => {
  console.error(`\n  ${err.message}\n`);
  process.exit(1);
});
