import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildBoard, verdictLine, esc } from '../skills/helpme-ui/scripts/board.mjs';
import { node, tmp } from './helpers.mjs';

function options() {
  const d = tmp();
  writeFileSync(join(d, 'a.html'), '<title>Calm "ledger" <b></title><meta name="helpme-bet" content="Numbers first"><meta name="helpme-gives-up" content="Decoration"><script>alert(1)</script><p>A</p>');
  writeFileSync(join(d, 'b.html'), '<title>Loud</title><p>B</p>');
  return d;
}

test('options board: sandboxed frames, escaped text, one card per file', () => {
  const d = options();
  const r = buildBoard({ inputs: [d], title: 'Settings <v2>', live: false, out: join(d, 'board') });
  const html = readFileSync(r.file, 'utf8');
  assert.deepEqual(r.cards, ['A', 'B']);
  assert.equal((html.match(/<iframe /g) || []).length, 4, 'phone + desktop frame per card');
  assert.equal((html.match(/sandbox=""/g) || []).length, 4);
  assert.ok(!html.includes('allow-same-origin'));
  assert.ok(html.includes('Calm &quot;ledger&quot; &lt;b&gt;'), 'title escaped');
  assert.ok(html.includes('<title>Settings &lt;v2&gt;</title>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'srcdoc escaped');
  assert.ok(!html.includes('<script>alert(1)'), 'option script never runs in the board itself');
  assert.ok(html.includes('Numbers first') && html.includes('Decoration'));
});

test('--live allows scripts but never same-origin', () => {
  const d = options();
  const html = readFileSync(buildBoard({ inputs: [d], title: 'T', live: true, out: join(d, 'live') }).file, 'utf8');
  assert.equal((html.match(/sandbox="allow-scripts"/g) || []).length, 4);
  assert.ok(!html.includes('allow-same-origin'));
});

test('pairs board matches file names and reports the rest', () => {
  const d = tmp();
  for (const side of ['before', 'after']) mkdirSync(join(d, side));
  for (const f of ['s@phone.png', 's@desktop.png', 'old@phone.png']) writeFileSync(join(d, 'before', f), 'png');
  for (const f of ['s@phone.png', 's@desktop.png', 'new@phone.png']) writeFileSync(join(d, 'after', f), 'png');
  const r = buildBoard({ inputs: [], before: join(d, 'before'), after: join(d, 'after'), title: 'R2', out: join(d, 'board') });
  assert.deepEqual(r.cards, ['s@desktop', 's@phone']);
  assert.deepEqual(r.unmatched, ['before only: old@phone.png', 'after only: new@phone.png']);
  const html = readFileSync(r.file, 'utf8');
  assert.equal((html.match(/type="range"/g) || []).length, 2);
  assert.ok(existsSync(join(d, 'board', 'before', 's@phone.png')) && existsSync(join(d, 'board', 'after', 's@phone.png')));
});

test('verdict line quotes safely; the page uses the same function', () => {
  assert.equal(verdictLine({ board: 'Settings "v2"', keep: ['B'], drop: ['A', 'C'], notes: 'tighter\nspacing' }),
    'helpme-verdict board="Settings \\"v2\\"" keep=B drop=A,C notes="tighter spacing"');
  const d = options();
  const html = readFileSync(buildBoard({ inputs: [d], title: 'T', out: join(d, 'v') }).file, 'utf8');
  assert.ok(html.includes('const verdictLine = function verdictLine'));
  assert.equal(esc(`<a href="x">'&`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
});

test('usage errors exit 2', () => {
  assert.equal(node('board.mjs', []).code, 2);
  assert.equal(node('board.mjs', ['--before', '.']).code, 2);
  assert.equal(node('board.mjs', ['missing-dir']).code, 2);
});
