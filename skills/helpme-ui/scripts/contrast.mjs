#!/usr/bin/env node
// contrast.mjs <fg> <bg> [--large] — WCAG AA check. Exit 0 pass · 1 fail · 2 usage.
import { parseColor, ratio, passesAA } from './lib/wcag.mjs';

const args = process.argv.slice(2);
const large = args.includes('--large');
const cols = args.filter((a) => a !== '--large');
if (cols.length !== 2 || args.some((a) => a.startsWith('--') && a !== '--large')) {
  console.error('usage: contrast.mjs <fg> <bg> [--large]   colours: #rgb, #rrggbb, #rrggbbaa, rgb(), rgba()');
  process.exit(2);
}
let r;
try {
  const bg = parseColor(cols[1]);
  if (bg[3] < 1) throw new Error('background must be opaque');
  r = ratio(parseColor(cols[0]), bg);
} catch (e) {
  console.error(`contrast: ${e.message}`);
  process.exit(2);
}
const need = large ? 3 : 4.5;
const ok = passesAA(r, large);
// Two decimals for reading; the pass/fail decision uses the unrounded ratio.
console.log(`${cols[0]} on ${cols[1]}: ${r.toFixed(2)}:1 · AA ${large ? 'large ' : ''}needs ${need}:1 · ${ok ? 'pass' : 'FAIL'}`);
process.exit(ok ? 0 : 1);
