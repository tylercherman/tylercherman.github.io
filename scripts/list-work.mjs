/**
 * Show every piece in display order.
 *
 *   npm run list-work
 *
 * Exists so the current arrangement is visible without opening seventeen files.
 * Reordering means editing an `order:` number — this is how you see what to change.
 */

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORK_DIR = join(ROOT, 'src/content/work');

const field = (text, name) => {
  const m = text.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'));
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, '');
};

const files = (await readdir(WORK_DIR)).filter((f) => f.endsWith('.md'));

const rows = [];
for (const f of files) {
  const text = await readFile(join(WORK_DIR, f), 'utf8');
  rows.push({
    file: f,
    order: Number(field(text, 'order') ?? 0),
    title: field(text, 'title') ?? '(no title)',
    client: field(text, 'client'),
    category: field(text, 'category') ?? '?',
    draft: field(text, 'draft') === 'true',
    unlisted: Boolean(field(text, 'vimeoHash')),
    todo: /^#\s*TODO/m.test(text),
  });
}

rows.sort((a, b) => a.order - b.order);

const live = rows.filter((r) => !r.draft);
const hidden = rows.filter((r) => r.draft);

console.log(`\n  ${'ORD'.padEnd(5)}${'TITLE'.padEnd(34)}${'CLIENT'.padEnd(22)}${'CAT'.padEnd(9)}FLAGS`);
console.log('  ' + '─'.repeat(88));

for (const r of rows) {
  const flags = [
    r.draft ? 'hidden' : '',
    r.unlisted ? 'unlisted' : '',
    r.todo ? 'TODO' : '',
  ].filter(Boolean).join(' ');

  const line =
    '  ' +
    String(r.order).padEnd(5) +
    r.title.slice(0, 33).padEnd(34) +
    (r.client ?? '—').slice(0, 21).padEnd(22) +
    r.category.padEnd(9) +
    flags;

  console.log(r.draft ? `\x1b[2m${line}\x1b[0m` : line);
}

console.log(`\n  ${live.length} live, ${hidden.length} hidden, ${rows.length} total`);

const todos = rows.filter((r) => r.todo);
if (todos.length) {
  console.log(`\n  ${todos.length} file(s) have an unresolved TODO comment:`);
  for (const t of todos) console.log(`    src/content/work/${t.file}`);
}

console.log(`
  To reorder: edit the "order:" number in a file. They're spaced by 10, so use
  a gap (25 sits between 20 and 30), or set a low number to move to the top.
  To hide: set "draft: true".
`);
