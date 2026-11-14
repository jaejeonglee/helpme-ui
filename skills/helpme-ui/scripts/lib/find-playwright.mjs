// Finds an optional Playwright install and a Chromium to drive. Never installs anything.
// Order: HELPME_PLAYWRIGHT (package dir) → the project's own node_modules → a bare import.
// Browsers: Playwright's bundled Chromium → installed Chrome → installed Edge.
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export class EnvError extends Error {}

async function loadModule(cwd = process.cwd()) {
  const tried = [];
  const dir = process.env.HELPME_PLAYWRIGHT;
  if (dir) {
    tried.push(`HELPME_PLAYWRIGHT=${dir}`);
    if (existsSync(join(dir, 'package.json'))) {
      return { mod: createRequire(join(dir, 'package.json'))(dir), from: dir };
    }
  }
  try {
    tried.push(`${cwd}/node_modules`);
    const req = createRequire(join(cwd, 'package.json'));
    const p = req.resolve('playwright');
    return { mod: req(p), from: p };
  } catch { /* next */ }
  try {
    tried.push('import("playwright")');
    return { mod: await import('playwright'), from: 'import("playwright")' };
  } catch { /* fall through */ }
  throw new EnvError(`Playwright not found (tried ${tried.join(', ')}).`);
}

export async function findPlaywright({ cwd } = {}) {
  const { mod, from } = await loadModule(cwd);
  const chromium = mod.chromium ?? mod.default?.chromium;
  if (!chromium) throw new EnvError(`Playwright at ${from} has no chromium export.`);
  const errors = [];
  for (const channel of [undefined, 'chrome', 'msedge']) {
    try {
      const browser = await chromium.launch(channel ? { channel } : {});
      return { browser, from, browserName: channel || 'bundled chromium', version: browser.version() };
    } catch (e) {
      errors.push(`${channel || 'bundled'}: ${String(e.message).split('\n')[0]}`);
    }
  }
  throw new EnvError(`No Chromium could start (${errors.join(' | ')}).`);
}

export const ENV_HELP = [
  'Screenshots need Playwright, which helpme-ui does not install for you. Options:',
  '  1. In the project: npm i -D playwright && npx playwright install chromium',
  '  2. Or point at an existing install: HELPME_PLAYWRIGHT=/path/to/node_modules/playwright',
  '  3. No Node browser at all: paste scripts/lib/audit-page.js into any browser tool and call helpmeAudit()',
  '  4. Last resort: ask for labelled screenshots (screen@phone.png, screen@desktop.png).',
].join('\n');
