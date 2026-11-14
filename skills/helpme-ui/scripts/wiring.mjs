#!/usr/bin/env node
// wiring.mjs diff <old> <new> [--allow kind:value ...] — what a redesign lost or added.
// <old>/<new> are wiring.json files from capture.mjs (or the folders holding them).
// Losses are allowed by --allow or by `allow-loss: kind:value — reason` in .helpme/ledger.md.
// Exit 0 no unallowed loss · 1 unallowed loss · 2 usage.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stripComments } from './lib/rules.mjs';

function load(p) {
  const f = existsSync(p) && statSync(p).isDirectory() ? join(p, 'wiring.json') : p;
  if (!existsSync(f)) throw new Error(`not found: ${f}`);
  const data = JSON.parse(readFileSync(f, 'utf8'));
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${f}: expected { "screen@vp": [entries] }`);
  return data;
}

export function parseAllowLines(text) {
  const out = [];
  stripComments(text).split('\n').forEach((raw, i) => {
    const line = raw.trim().replace(/^[-*]\s+/, '');
    if (!/^allow-loss:/i.test(line)) return;
    const m = line.match(/^allow-loss:\s*(\S+)\s+(?:—|--)\s*(\S.*)$/i);
    if (!m) throw new Error(`ledger line ${i + 1}: expected "allow-loss: kind:value — reason"`);
    out.push({ pattern: m[1], reason: m[2] });
  });
  return out;
}

const matches = (pattern, entry) => (pattern.endsWith('*') ? entry.startsWith(pattern.slice(0, -1)) : entry === pattern);

function similarity(a, b) {
  if (a === b) return 1;
  if (a && b && (a.includes(b) || b.includes(a))) return 0.8; // phone → phone_number
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return 1 - d[a.length][b.length] / Math.max(a.length, b.length, 1);
}

export function diffWiring(before, after, allows = []) {
  const screens = [];
  let unallowed = 0;
  for (const key of Object.keys(before)) {
    if (!after[key]) {
      screens.push({ key, missing: true, lost: [], added: [], renames: [] });
      unallowed++;
      continue;
    }
    const a = new Set(after[key]);
    const b = new Set(before[key]);
    const added = [...a].filter((e) => !b.has(e));
    const lost = [...b].filter((e) => !a.has(e)).map((entry) => {
      const allow = allows.find((x) => matches(x.pattern, entry));
      if (!allow) unallowed++;
      return { entry, allowed: allow ? allow.reason : null };
    });
    const renames = [];
    for (const { entry } of lost) {
      const kind = entry.split(':')[0];
      const best = added.filter((e) => e.split(':')[0] === kind)
        .map((e) => [e, similarity(entry.slice(kind.length + 1), e.slice(kind.length + 1))])
        .sort((x, y) => y[1] - x[1])[0];
      if (best && best[1] >= 0.5) renames.push([entry, best[0]]);
    }
    screens.push({ key, missing: false, lost, added, renames });
  }
  return { screens, unallowed };
}

export function main(argv, { cwd = process.cwd(), log = console.log, err = console.error } = {}) {
  const allows = [];
  const pos = [];
  try {
    const rest = [...argv];
    while (rest.length) {
      const a = rest.shift();
      if (a === '--allow') {
        if (!rest.length) throw new Error('--allow needs kind:value');
        allows.push({ pattern: rest.shift(), reason: 'allowed on the command line' });
      } else if (a.startsWith('--')) throw new Error(`unknown option ${a}`);
      else pos.push(a);
    }
    if (pos[0] !== 'diff' || pos.length !== 3) throw new Error('expected: diff <old> <new>');
    const ledger = join(cwd, '.helpme', 'ledger.md');
    if (existsSync(ledger)) allows.push(...parseAllowLines(readFileSync(ledger, 'utf8')));
    var before = load(resolve(cwd, pos[1]));
    var after = load(resolve(cwd, pos[2]));
  } catch (e) {
    err(`wiring: ${e.message}\nusage: wiring.mjs diff <old wiring.json|dir> <new wiring.json|dir> [--allow kind:value ...]`);
    return 2;
  }
  const { screens, unallowed } = diffWiring(before, after, allows);
  for (const s of screens) {
    if (s.missing) { log(`${s.key}: no matching shot in the new capture`); continue; }
    log(`${s.key}: lost ${s.lost.length} · added ${s.added.length}`);
    s.lost.forEach((l) => log(`  lost   ${l.entry}${l.allowed ? `  (allowed: ${l.allowed})` : ''}`));
    s.added.forEach((a) => log(`  added  ${a}`));
    s.renames.forEach(([x, y]) => log(`  likely rename: ${x} → ${y}`));
  }
  log(unallowed ? `${unallowed} unallowed loss${unallowed > 1 ? 'es' : ''} — restore, or add "allow-loss: kind:value — reason" to .helpme/ledger.md` : 'no unallowed losses');
  return unallowed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exit(main(process.argv.slice(2)));
