import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, basename, resolve } from 'node:path';
import { SKILL } from './helpers.mjs';
import { loadRules, parseWaivers } from '../skills/helpme-ui/scripts/lib/rules.mjs';
import { parseAllowLines } from '../skills/helpme-ui/scripts/wiring.mjs';

const KB = 1024;
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(SKILL);
const docs = files.filter((f) => /\.(md|json)$/.test(f));
const rel = (f) => relative(SKILL, f);
const size = (f) => statSync(f).size;

// Per-file caps from the build spec (KB).
const CAPS = {
  'SKILL.md': 11.5,
  'playbooks/create.md': 4, 'playbooks/existing.md': 3.5, 'playbooks/port.md': 2.5,
  'playbooks/system.md': 3.5, 'playbooks/rounds.md': 3, 'playbooks/review.md': 4,
  'library/foundations/type.md': 3, 'library/foundations/color.md': 3,
  'library/foundations/layout.md': 3, 'library/foundations/motion.md': 3,
  'library/patterns/states.md': 3, 'library/patterns/forms-dialogs.md': 3.5,
  'library/patterns/workspaces.md': 3, 'library/patterns/components.md': 4,
  'library/patterns/pages.md': 2.5, 'library/patterns/effects.md': 3, 'library/patterns/game-scenes.md': 2.5,
  'library/korean/hangul-type.md': 3.5, 'library/korean/ux-copy.md': 4,
  'checks/rules.md': 5, 'checks/ai-defaults.md': 4, 'checks/stress-ko.json': 1.2,
};

test('SKILL.md frontmatter: name = folder, short quoted description', () => {
  const text = readFileSync(join(SKILL, 'SKILL.md'), 'utf8');
  assert.ok(size(join(SKILL, 'SKILL.md')) <= 11.5 * KB, `SKILL.md is ${size(join(SKILL, 'SKILL.md'))} B`);
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(fm, 'frontmatter at line 1');
  assert.equal((fm[1].match(/^name: (.+)$/m) || [])[1], basename(SKILL));
  const raw = (fm[1].match(/^description: (.+)$/m) || [])[1];
  assert.ok(raw && raw.startsWith('"') && raw.endsWith('"'), 'description is one quoted line');
  const desc = JSON.parse(raw);
  assert.ok(desc.length <= 640, `description is ${desc.length} chars`);
  assert.ok(!desc.includes(': '), 'no ": " inside the description (breaks some YAML loaders)');
  assert.ok(!/allowed-tools/.test(fm[1]), 'no allowed-tools');
});

test('every spec file exists and fits its cap; docs fit 7 KB each and 84 KB together', () => {
  for (const [f, cap] of Object.entries(CAPS)) {
    assert.ok(existsSync(join(SKILL, f)), `${f} missing`);
    assert.ok(size(join(SKILL, f)) <= cap * KB, `${f} is ${size(join(SKILL, f))} B, cap ${cap * KB}`);
  }
  const templates = docs.filter((f) => rel(f).startsWith('templates/'));
  assert.equal(templates.length, 5);
  assert.ok(templates.reduce((n, f) => n + size(f), 0) <= 5.5 * KB, 'templates ≤ 5.5 KB together');
  for (const f of docs) if (rel(f) !== 'SKILL.md') assert.ok(size(f) <= 7 * KB, `${rel(f)} over 7 KB`);
  const total = docs.reduce((n, f) => n + size(f), 0);
  assert.ok(total <= 84 * KB, `docs total ${total} B`);
});

test('reference files start with "Use when" and end with Sources', () => {
  for (const f of docs.filter((x) => /^(playbooks|library|checks)\/.*\.md$/.test(rel(x)))) {
    const lines = readFileSync(f, 'utf8').split('\n').filter((l) => l.trim());
    assert.match(lines[0], /^# /, `${rel(f)} title`);
    assert.match(lines[1], /^Use when/, `${rel(f)} second line`);
    const h2 = lines.filter((l) => l.startsWith('## '));
    assert.equal(h2[h2.length - 1], '## Sources', `${rel(f)} ends with Sources`);
  }
  for (const f of docs.filter((x) => rel(x).startsWith('templates/'))) {
    assert.match(readFileSync(f, 'utf8'), /<!-- Use when/, `${rel(f)} says when to use it`);
  }
});

test('relative links resolve', () => {
  for (const f of docs.filter((x) => x.endsWith('.md'))) {
    const text = readFileSync(f, 'utf8');
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const p = resolve(dirname(f), target.split('#')[0]);
      assert.ok(existsSync(p), `${rel(f)} → ${target}`);
    }
  }
});

test('stress data is valid JSON; the ledger template parses to zero entries', () => {
  const data = JSON.parse(readFileSync(join(SKILL, 'checks', 'stress-ko.json'), 'utf8'));
  assert.ok(Object.keys(data).length >= 6);
  const ledger = readFileSync(join(SKILL, 'templates', 'ledger.md'), 'utf8');
  assert.deepEqual(parseWaivers(ledger, loadRules()), []);
  assert.deepEqual(parseAllowLines(ledger), []);
});
