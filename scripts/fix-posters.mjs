/**
 * Strip baked-in letterbox bars from every poster.
 *
 *   node scripts/fix-posters.mjs           # report only
 *   node scripts/fix-posters.mjs --apply   # crop in place
 *
 * Safe to re-run: an already-cropped poster reports no bars and is left alone.
 */

import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { detectBars, stripLetterbox } from './lib/letterbox.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'src/assets/posters');

/*
 * Posters whose frames are genuinely dark at the edges, not letterboxed.
 *
 * The detector works on row brightness, so a shot that simply ends in shadow looks
 * identical to a black bar. honda-julia-michaels is a concert frame whose lower third
 * is an unlit crowd — mean brightness around 5/255, but real picture. Cropping it
 * would remove image and shift the composition.
 *
 * Verified by eye before adding here. Add to this list only after actually looking at
 * the frame, never just because a crop "seems safe".
 */
const KEEP_AS_IS = new Set([
  'honda-julia-michaels.jpg',
]);

const apply = process.argv.includes('--apply');
const files = (await readdir(DIR)).filter((f) => f.endsWith('.jpg')).sort();

console.log(`\n  ${apply ? 'CROPPING' : 'Scanning (dry run — pass --apply to crop)'}\n`);
console.log('  POSTER                        BEFORE       BARS t/b    AFTER        RATIO');
console.log('  ' + '─'.repeat(76));

let changed = 0;

for (const f of files) {
  const path = join(DIR, f);

  if (KEEP_AS_IS.has(f)) {
    console.log(
      '  ' + f.replace('.jpg', '').padEnd(30) +
      'skipped — dark frame, not letterboxed (see KEEP_AS_IS)'
    );
    continue;
  }

  const before = await detectBars(path);

  if (!before.letterboxed) {
    console.log(
      '  ' + f.replace('.jpg', '').padEnd(30) +
      `${before.width}x${before.height}`.padEnd(13) +
      '—'.padEnd(12) +
      'unchanged'.padEnd(13) +
      before.contentRatio.toFixed(2)
    );
    continue;
  }

  if (apply) {
    const r = await stripLetterbox(path);
    if (r.cropped) changed++;
    console.log(
      '  ' + f.replace('.jpg', '').padEnd(30) +
      `${before.width}x${before.height}`.padEnd(13) +
      `${before.top}/${before.bottom}`.padEnd(12) +
      `${r.width}x${r.contentHeight}`.padEnd(13) +
      r.contentRatio.toFixed(2) + '  cropped'
    );
  } else {
    changed++;
    console.log(
      '  ' + f.replace('.jpg', '').padEnd(30) +
      `${before.width}x${before.height}`.padEnd(13) +
      `${before.top}/${before.bottom}`.padEnd(12) +
      `${before.width}x${before.contentHeight}`.padEnd(13) +
      before.contentRatio.toFixed(2) +
      `  would crop (${before.wastedPercent.toFixed(0)}% bars)`
    );
  }
}

console.log(
  `\n  ${changed} poster(s) ${apply ? 'cropped' : 'would be cropped'} of ${files.length}\n`
);
