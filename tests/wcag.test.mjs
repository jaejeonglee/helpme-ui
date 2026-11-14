import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { ratio, passesAA, parseColor } from '../skills/helpme-ui/scripts/lib/wcag.mjs';
import { SCRIPTS, node } from './helpers.mjs';

const near = (a, b) => assert.ok(Math.abs(a - b) < 0.005, `${a} ≈ ${b}`);

test('WCAG vectors', () => {
  near(ratio('#767676', '#fff'), 4.54);
  assert.equal(passesAA(ratio('#767676', '#fff')), true);
  near(ratio('#777', '#fff'), 4.48);
  assert.equal(passesAA(ratio('#777', '#fff')), false);
  near(ratio('#949494', '#fff'), 3.03);
  assert.equal(passesAA(ratio('#949494', '#fff')), false);
  assert.equal(passesAA(ratio('#949494', '#fff'), true), true);
  assert.equal(passesAA(4.499), false, 'no rounding up');
  near(ratio('#000', '#fff'), 21);
});

test('alpha is composited before measuring', () => {
  near(ratio(parseColor('rgba(0,0,0,0.5)'), '#fff'), ratio('rgb(127.5,127.5,127.5)', '#fff'));
});

test('audit-page.js uses the same maths', () => {
  const ctx = {};
  ctx.globalThis = ctx;
  vm.runInNewContext(readFileSync(join(SCRIPTS, 'lib', 'audit-page.js'), 'utf8'), ctx);
  near(ctx.helpmeAudit.ratio([0x76, 0x76, 0x76, 1], [255, 255, 255, 1]), ratio('#767676', '#fff'));
});

test('contrast.mjs exit codes', () => {
  assert.equal(node('contrast.mjs', ['#767676', '#fff']).code, 0);
  assert.equal(node('contrast.mjs', ['#777', '#fff']).code, 1);
  assert.equal(node('contrast.mjs', ['#949494', '#fff', '--large']).code, 0);
  assert.equal(node('contrast.mjs', ['#949494', '#fff']).code, 1);
  assert.equal(node('contrast.mjs', ['#fff']).code, 2);
  assert.equal(node('contrast.mjs', ['nope', '#fff']).code, 2);
});
