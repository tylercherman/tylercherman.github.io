/**
 * Export the homepage title lockup as transparent PNGs, for layering over video.
 *
 *   npm run export-title
 *
 * Writes to _source-material/exports/ (gitignored — these are deliverables for Tyler's
 * edit suite, not site assets).
 *
 * Typography is matched to the live hero at its 1920px-wide appearance, then scaled up.
 * At 1920 the site renders the name at 144px (the 9rem cap in its clamp), so the 4K
 * versions use 288px — the same lockup, twice the size, so it can be scaled down in an
 * NLE without softening.
 *
 * Two shapes are produced:
 *   *-4K-frame.png  3840x2160, lockup positioned as on the site — drop straight onto a
 *                   16:9 timeline and it lands where the website has it
 *   *-tight.png     cropped to the artwork with a small margin, for free positioning
 *
 * Rendered from SVG rather than screenshotted, so edges are clean at any scale and
 * the background is genuinely transparent rather than matted to a colour.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, '_source-material/exports');

const W = 3840, H = 2160;
const SCALE = 2;                       // 1920 reference -> 4K

const NAME = 'TYLER CHERMAN';
const ROLES = ['EDITOR', 'CREATIVE'];

const NAME_SIZE = 144 * SCALE;         // the 9rem cap from the site's clamp
const NAME_TRACK = -0.045 * NAME_SIZE; // -0.045em, in px
const ROLE_SIZE = 17 * SCALE;
const ROLE_TRACK = 0.16 * ROLE_SIZE;   // 0.16em
const GAP = 24 * SCALE;                // gap between roles and divider
const ROLE_OFFSET = 24 * SCALE;        // margin-top on the roles line

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** One SVG, used for both outputs; the tight version is just cropped from it. */
function buildSvg({ white = '#f2f2f0' } = {}) {
  const cx = W / 2;

  /*
   * Vertical placement works from explicit baselines rather than
   * dominant-baseline="middle". With middle alignment the name's glyphs extend roughly
   * half its font size below the anchor, so a roles line offset from that anchor lands
   * inside the name — which is exactly what happened first time round.
   *
   * Cap height for this face is about 0.72 of the font size, and "TYLER CHERMAN" is
   * all caps with no descenders, so the visible block is that tall.
   */
  const nameCap = NAME_SIZE * 0.72;
  const roleCap = ROLE_SIZE * 0.72;
  const blockH = nameCap + ROLE_OFFSET + roleCap;

  const nameBaseline = (H - blockH) / 2 + nameCap;
  const roleBaseline = nameBaseline + ROLE_OFFSET + roleCap;

  /*
   * Horizontal placement anchors the words to the divider instead of estimating their
   * widths: the left word ends a gap before centre, the right word starts a gap after.
   * Exact by construction, and it can't drift if the font metrics differ.
   */
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="${cx}" y="${nameBaseline}" text-anchor="middle"
        font-family="${FONT}" font-weight="800" font-size="${NAME_SIZE}"
        letter-spacing="${NAME_TRACK}" fill="${white}">${NAME}</text>

  <text x="${cx - GAP}" y="${roleBaseline}" text-anchor="end"
        font-family="${FONT}" font-weight="500" font-size="${ROLE_SIZE}"
        letter-spacing="${ROLE_TRACK}" fill="${white}">${ROLES[0]}</text>

  <rect x="${cx - 1}" y="${roleBaseline - roleCap}" width="2" height="${roleCap * 1.25}"
        fill="${white}" opacity="0.55"/>

  <text x="${cx + GAP}" y="${roleBaseline}" text-anchor="start"
        font-family="${FONT}" font-weight="500" font-size="${ROLE_SIZE}"
        letter-spacing="${ROLE_TRACK}" fill="${white}">${ROLES[1]}</text>
</svg>`);
}

await mkdir(OUT_DIR, { recursive: true });

for (const [suffix, white] of [['white', '#f2f2f0'], ['pure-white', '#ffffff']]) {
  const svg = buildSvg({ white });

  // density 72 rasterises the SVG 1:1 with its declared width/height. Anything higher
  // silently scales the output up (96 gave 5120x2880 instead of 3840x2160).
  const framePath = join(OUT_DIR, `tyler-cherman-title-4K-frame-${suffix}.png`);
  await sharp(svg, { density: 72 }).png({ compressionLevel: 9 }).toFile(framePath);

  // Tight crop: trim the transparent margin, then pad a little breathing room back.
  const tightPath = join(OUT_DIR, `tyler-cherman-title-tight-${suffix}.png`);
  await sharp(svg, { density: 72 })
    .trim({ threshold: 1 })
    .extend({ top: 40, bottom: 40, left: 40, right: 40,
              background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(tightPath);
}

// Report what was produced.
const { readdir, stat } = await import('node:fs/promises');
for (const f of (await readdir(OUT_DIR)).sort()) {
  const p = join(OUT_DIR, f);
  const m = await sharp(p).metadata();
  const s = await stat(p);
  console.log(`  ${f.padEnd(46)} ${m.width}x${m.height}  ${(s.size / 1024).toFixed(0)}KB  alpha=${m.hasAlpha}`);
}
