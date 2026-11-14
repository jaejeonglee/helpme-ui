#!/usr/bin/env node
// dev/overlap.mjs --against <dir> [--words 8] [--code 40] <path>...
// Clean-room check for maintainers. Reads the reference folder mechanically and reports
// where OUR files share a run of N words or a long code line with it. Output names only
// our file and line plus the kind of match, never any text, so the reference never shows up.
// Exit 0 no overlap · 1 overlap found · 2 usage · 3 reference folder missing.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative, resolve } from 'node:path';

const TEXT = new Set(['.md', '.mjs', '.js', '.cjs', '.ts', '.json', '.html', '.css', '.yml', '.yaml', '.txt', '.py', '.sh']);
const SKIP = new Set(['.git', 'node_modules']);

function walk(p, out = []) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (!SKIP.has(f)) walk(join(p, f), out);
  } else if (TEXT.has(extname(p).toLowerCase()) && st.size < 2 * 1024 * 1024) out.push(p);
  return out;
}

const words = (line) => line.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
const codeKey = (line) => line.trim().replace(/\s+/g, ' ');

function tokens(text) {
  const out = [];
  text.split('\n').forEach((line, i) => words(line).forEach((w) => out.push([w, i + 1])));
  return out;
}

const args = process.argv.slice(2);
let against = null, n = 8, codeMin = 40;
const paths = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--against') against = args[++i];
  else if (args[i] === '--words') n = +args[++i];
  else if (args[i] === '--code') codeMin = +args[++i];
  else if (args[i].startsWith('--')) { console.error(`unknown option ${args[i]}`); process.exit(2); }
  else paths.push(args[i]);
}
if (!against || !paths.length || !(n > 1) || !(codeMin > 0)) {
  console.error('usage: overlap.mjs --against <dir> [--words 8] [--code 40] <path>...');
  process.exit(2);
}
if (!existsSync(against)) { console.error('reference folder not found'); process.exit(3); }

const runs = new Set();
const lines = new Set();
for (const f of walk(resolve(against))) {
  const text = readFileSync(f, 'utf8');
  const t = tokens(text).map(([w]) => w);
  for (let i = 0; i + n <= t.length; i++) runs.add(t.slice(i, i + n).join(' '));
  for (const line of text.split('\n')) { const k = codeKey(line); if (k.length >= codeMin) lines.add(k); }
}

let hits = 0;
for (const f of paths.filter(existsSync).flatMap((p) => walk(resolve(p)))) {
  const text = readFileSync(f, 'utf8');
  const name = relative(process.cwd(), f);
  const t = tokens(text);
  const flagged = new Set();
  for (let i = 0; i + n <= t.length; i++) {
    if (runs.has(t.slice(i, i + n).map(([w]) => w).join(' ')) && !flagged.has(t[i][1])) {
      flagged.add(t[i][1]);
      console.log(`${name}:${t[i][1]}  shared ${n}-word run`);
      hits++;
    }
  }
  text.split('\n').forEach((line, i) => {
    const k = codeKey(line);
    if (k.length >= codeMin && lines.has(k)) { console.log(`${name}:${i + 1}  shared ${codeMin}+ char line`); hits++; }
  });
}
process.exit(hits ? 1 : 0);
