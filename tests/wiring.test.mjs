import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { diffWiring, parseAllowLines } from '../skills/helpme-ui/scripts/wiring.mjs';
import { node, tmp } from './helpers.mjs';

const OLD = { 'settings@phone': ['link:/billing', 'field:email', 'field:phone', 'button:저장', 'heading:알림'] };
const NEW = { 'settings@phone': ['link:/billing', 'field:email', 'field:phone_number', 'button:저장', 'heading:알림 설정'] };

function files() {
  const d = tmp();
  writeFileSync(join(d, 'old.json'), JSON.stringify(OLD));
  writeFileSync(join(d, 'new.json'), JSON.stringify(NEW));
  return d;
}

test('diff lists losses, additions and likely renames', () => {
  const r = diffWiring(OLD, NEW);
  const s = r.screens[0];
  assert.deepEqual(s.lost.map((l) => l.entry), ['field:phone', 'heading:알림']);
  assert.deepEqual(s.added, ['field:phone_number', 'heading:알림 설정']);
  assert.deepEqual(s.renames[0], ['field:phone', 'field:phone_number']);
  assert.equal(r.unallowed, 2);
});

test('a loss exits 1; allowing it exits 0', () => {
  const d = files();
  const one = node('wiring.mjs', ['diff', 'old.json', 'new.json', '--allow', 'heading:*'], { cwd: d });
  assert.equal(one.code, 1, one.out);
  assert.match(one.out, /lost {3}field:phone\b/);
  const zero = node('wiring.mjs', ['diff', 'old.json', 'new.json', '--allow', 'heading:*', '--allow', 'field:phone'], { cwd: d });
  assert.equal(zero.code, 0, zero.out);
});

test('allow-loss lines in the ledger are honoured; bad lines are usage errors', () => {
  const d = files();
  mkdirSync(join(d, '.helpme'));
  writeFileSync(join(d, '.helpme', 'ledger.md'), 'allow-loss: field:phone — renamed with the API in r2\nallow-loss: heading:* — headings rewritten in r2\n');
  assert.equal(node('wiring.mjs', ['diff', 'old.json', 'new.json'], { cwd: d }).code, 0);
  writeFileSync(join(d, '.helpme', 'ledger.md'), 'allow-loss: field:phone\n');
  assert.equal(node('wiring.mjs', ['diff', 'old.json', 'new.json'], { cwd: d }).code, 2);
  assert.throws(() => parseAllowLines('allow-loss: x'), /expected/);
});

test('a screen missing from the new capture counts as a loss; usage exits 2', () => {
  assert.equal(diffWiring(OLD, {}).unallowed, 1);
  assert.equal(node('wiring.mjs', []).code, 2);
  assert.equal(node('wiring.mjs', ['diff', 'nope.json', 'nope.json']).code, 2);
});
