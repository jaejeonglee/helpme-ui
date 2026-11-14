import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { loadRules, parseRules, parseWaivers, findWaiver } from '../skills/helpme-ui/scripts/lib/rules.mjs';
import { SKILL, SCRIPTS } from './helpers.mjs';

const rules = loadRules();

test('rules.md parses: ~40 unique ids, each with a tier, method and source', () => {
  assert.ok(rules.size >= 38, `${rules.size} rules`);
  for (const r of rules.values()) assert.ok(r.source, `${r.id} has a source`);
  assert.throws(() => parseRules('| A-B | must | render | x | y | z |\n| A-B | must | render | x | y | z |'), /duplicate/);
  assert.throws(() => parseRules('| A-B | huge | render | x | y | z |'), /tier/);
});

test('every id audit-page.js can emit is a render rule', () => {
  const src = readFileSync(join(SCRIPTS, 'lib', 'audit-page.js'), 'utf8');
  const ctx = {};
  ctx.globalThis = ctx;
  vm.runInNewContext(src, ctx);
  const emitted = new Set([...src.matchAll(/add\('([A-Z][A-Z0-9-]+)'/g)].map((m) => m[1]));
  for (const id of emitted) assert.ok(ctx.helpmeAudit.ids.includes(id), `${id} missing from IDS`);
  for (const id of ctx.helpmeAudit.ids) {
    assert.ok(rules.has(id), `${id} not in rules.md`);
    assert.equal(rules.get(id).method, 'render', `${id} should be method render`);
  }
});

test('every id SKILL.md names exists (wildcards need a match)', () => {
  const text = readFileSync(join(SKILL, 'SKILL.md'), 'utf8');
  const named = new Set([...text.matchAll(/\b[A-Z]{2,}[A-Z0-9]*(?:-(?:[A-Z0-9]+|\*))+/g)].map((m) => m[0]));
  assert.ok(named.size >= 15, `SKILL.md names ${named.size} ids`);
  for (const id of named) {
    if (id.endsWith('*')) assert.ok([...rules.keys()].some((k) => k.startsWith(id.slice(0, -1))), `${id} matches nothing`);
    else assert.ok(rules.has(id), `${id} named in SKILL.md but not in rules.md`);
  }
});

test('waivers need an id, a selector and a reason', () => {
  const w = parseWaivers('notes\nwaive: OVERFLOW-X .wide — vendor table scrolls on purpose\n- waive: TEXT-MIN * -- legal footer', rules);
  assert.equal(w.length, 2);
  assert.ok(findWaiver({ id: 'OVERFLOW-X', selector: 'div.wide' }, w));
  assert.equal(findWaiver({ id: 'OVERFLOW-X', selector: 'div.other' }, w), null);
  assert.ok(findWaiver({ id: 'TEXT-MIN', selector: 'footer p' }, w));
  assert.throws(() => parseWaivers('waive: OVERFLOW-X .wide', rules), /expected/);
  assert.throws(() => parseWaivers('waive: NOPE-ID * — x', rules), /unknown rule/);
});
