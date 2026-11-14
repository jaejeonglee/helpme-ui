import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { FIXTURES, ROOT, node, tmp, playwrightSkip } from './helpers.mjs';

const skip = playwrightSkip();
const NOT_A_RENDER_FIXTURE = new Set(['clean', 'text-spacing']);
const fixture = (n) => join(FIXTURES, `${n}.html`);
const audit = (dir) => JSON.parse(readFileSync(join(dir, 'audit.json'), 'utf8'));
const ids = (shot) => shot.findings.map((f) => f.id);

test('usage errors exit 2', () => {
  assert.equal(node('capture.mjs', []).code, 2);
  assert.equal(node('capture.mjs', [fixture('clean'), '--vp', 'nope']).code, 2);
  assert.equal(node('capture.mjs', [fixture('clean'), '--fail-on', 'sometimes']).code, 2);
  assert.equal(node('capture.mjs', ['does-not-exist.html']).code, 2);
  assert.equal(node('capture.mjs', [FIXTURES, '--name', 'x']).code, 2, '--name with many targets');
});

test('no Playwright exits 3 with fallbacks', () => {
  const cwd = tmp();
  const r = node('capture.mjs', [fixture('clean')], { cwd, env: { HELPME_PLAYWRIGHT: '' } });
  if (r.code === 0) return; // a global Playwright is importable on this machine; nothing to assert
  assert.equal(r.code, 3, r.err);
  assert.match(r.err, /helpmeAudit\(\)/);
});

test('each render id fires on its own fixture', { skip }, () => {
  const out = join(tmp(), 'r1');
  const r = node('capture.mjs', [FIXTURES, '--vp', 'phone', '--out', out, '--fail-on', 'never']);
  assert.equal(r.code, 0, r.err);
  const a = audit(out);
  const byKey = Object.fromEntries(a.shots.map((s) => [s.key, s]));
  const names = readdirSync(FIXTURES).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5));
  for (const n of names.filter((x) => !NOT_A_RENDER_FIXTURE.has(x))) {
    assert.ok(ids(byKey[`${n}@phone`]).includes(n.toUpperCase()), `${n}.html should raise ${n.toUpperCase()}; got ${ids(byKey[`${n}@phone`])}`);
  }
  assert.deepEqual(ids(byKey['clean@phone']), [], 'clean fixture has no findings');
  assert.ok(!ids(byKey['text-spacing@phone']).includes('TEXT-CLIP'), 'text-spacing fixture fits without stress');
  const wide = byKey['overflow-x@phone'].findings.find((f) => f.id === 'OVERFLOW-X');
  assert.match(wide.selector, /\.wide/, 'names the culprit');
  for (const f of ['audit.json', 'wiring.json', 'census.json', 'contact.png', 'clean@phone.png']) assert.ok(existsSync(join(out, f)), f);
  assert.ok(a.shots.every((s) => s.findings.every((f) => ['must', 'should', 'polish', 'info'].includes(f.tier))));
});

test('text-spacing stress raises TEXT-SPACING', { skip }, () => {
  const out = join(tmp(), 'r1');
  const r = node('capture.mjs', [fixture('text-spacing'), '--vp', 'phone', '--stress', 'text-spacing', '--out', out, '--fail-on', 'never']);
  assert.equal(r.code, 0, r.err);
  assert.ok(ids(audit(out).shots[0]).includes('TEXT-SPACING'));
});

test('exit codes follow --fail-on, waivers and dark/naming options', { skip }, () => {
  const cwd = tmp();
  assert.equal(node('capture.mjs', [fixture('clean'), '--vp', 'phone', '--out', 'a'], { cwd }).code, 0);
  assert.equal(node('capture.mjs', [fixture('overflow-x'), '--vp', 'phone', '--out', 'b'], { cwd }).code, 1);
  assert.equal(node('capture.mjs', [fixture('target-touch'), '--vp', 'phone', '--out', 'c'], { cwd }).code, 0, 'should < must');
  assert.equal(node('capture.mjs', [fixture('target-touch'), '--vp', 'phone', '--out', 'd', '--fail-on', 'should'], { cwd }).code, 1);

  mkdirSync(join(cwd, '.helpme'));
  writeFileSync(join(cwd, '.helpme', 'ledger.md'), '# Ledger\nwaive: OVERFLOW-X .wide — demo table scrolls by design\n');
  const w = node('capture.mjs', [fixture('overflow-x'), '--vp', 'phone', '--out', 'e'], { cwd });
  assert.equal(w.code, 0, w.out + w.err);
  assert.equal(audit(join(cwd, 'e')).shots[0].findings[0].waived, 'demo table scrolls by design');

  writeFileSync(join(cwd, '.helpme', 'ledger.md'), 'waive: OVERFLOW-X .wide\n');
  assert.equal(node('capture.mjs', [fixture('overflow-x'), '--vp', 'phone', '--out', 'f'], { cwd }).code, 2, 'waiver without reason');
  writeFileSync(join(cwd, '.helpme', 'ledger.md'), '');

  const g = node('capture.mjs', [fixture('clean'), '--vp', 'phone,800x600', '--scheme', 'both', '--name', 'home'], { cwd });
  assert.equal(g.code, 0, g.err);
  const files = readdirSync(join(cwd, '.helpme', 'shots', 'r1')).sort();
  for (const f of ['home@phone.png', 'home@phone~dark.png', 'home@800x600.png', 'home@800x600~dark.png']) assert.ok(files.includes(f), `${f} in ${files}`);
  node('capture.mjs', [fixture('clean'), '--vp', 'phone'], { cwd });
  assert.ok(existsSync(join(cwd, '.helpme', 'shots', 'r2')), 'next round folder');
});

test('hooks run before the shot and tag the file name', { skip }, () => {
  const cwd = tmp();
  writeFileSync(join(cwd, 'open.mjs'), 'export default async (page) => { await page.evaluate(() => { document.body.dataset.hooked = "1"; }); };');
  const r = node('capture.mjs', [fixture('clean'), '--vp', 'phone', '--hook', 'open=open.mjs', '--out', 'h'], { cwd });
  assert.equal(r.code, 0, r.err);
  assert.ok(existsSync(join(cwd, 'h', 'clean@phone~open.png')));
});

test('doctor reports the browser', { skip }, () => {
  const r = node('capture.mjs', ['--doctor'], { cwd: ROOT });
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /browser /);
});
