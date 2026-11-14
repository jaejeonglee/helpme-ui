// Parses checks/rules.md at runtime so tiers live in one place, and reads waivers from the ledger.
import { readFileSync, existsSync } from 'node:fs';
import * as url from 'node:url';

export const TIERS = ['info', 'polish', 'should', 'must']; // ascending severity
const METHODS = new Set(['render', 'static', 'review']);
export const RULES_PATH = url.fileURLToPath(new URL('../../checks/rules.md', import.meta.url));

export function parseRules(md) {
  const rules = new Map();
  for (const line of md.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== 6 || !/^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*$/.test(cells[0])) continue;
    const [id, tier, method, check, pass, source] = cells;
    if (!TIERS.includes(tier)) throw new Error(`rules.md: ${id} has unknown tier "${tier}"`);
    if (!METHODS.has(method)) throw new Error(`rules.md: ${id} has unknown method "${method}"`);
    if (rules.has(id)) throw new Error(`rules.md: duplicate id ${id}`);
    rules.set(id, { id, tier, method, check, pass, source });
  }
  if (rules.size === 0) throw new Error('rules.md: no rule rows found');
  return rules;
}

export function loadRules(path = RULES_PATH) {
  return parseRules(readFileSync(path, 'utf8'));
}

export const tierRank = (tier) => TIERS.indexOf(tier);

// Blank out <!-- comments --> (the ledger template keeps its format examples there) but keep line numbers.
export const stripComments = (text) => text.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ''));

// `waive: ID <selector|*> — reason` (an em dash or `--` before the reason). Bad lines throw.
export function parseWaivers(text, rules) {
  const out = [];
  stripComments(text).split('\n').forEach((raw, i) => {
    const line = raw.trim().replace(/^[-*]\s+/, '');
    if (!/^waive:/i.test(line)) return;
    const m = line.match(/^waive:\s*([A-Z][A-Z0-9-]+)\s+(.+?)\s+(?:—|--)\s*(\S.*)$/i);
    if (!m) throw new Error(`ledger line ${i + 1}: expected "waive: ID <selector|*> — reason"`);
    const [, id, selector, reason] = m;
    if (rules && !rules.has(id)) throw new Error(`ledger line ${i + 1}: unknown rule id ${id}`);
    out.push({ id, selector, reason });
  });
  return out;
}

export function loadWaivers(ledgerPath, rules) {
  return existsSync(ledgerPath) ? parseWaivers(readFileSync(ledgerPath, 'utf8'), rules) : [];
}

export function findWaiver(finding, waivers) {
  return waivers.find((w) => w.id === finding.id &&
    (w.selector === '*' || (finding.selector || '').includes(w.selector))) || null;
}
