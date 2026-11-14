import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import { createRequire } from 'node:module';

const { join, dirname } = path;
export const ROOT = join(dirname(url.fileURLToPath(import.meta.url)), '..');
export const SKILL = join(ROOT, 'skills', 'helpme-ui');
export const SCRIPTS = join(SKILL, 'scripts');
export const FIXTURES = join(ROOT, 'tests', 'fixtures');
export const tmp = (p = 'helpme-') => mkdtempSync(join(tmpdir(), p));

export function node(script, args, { cwd = ROOT, env = {} } = {}) {
  const r = spawnSync(process.execPath, [join(SCRIPTS, script), ...args], { cwd, env: { ...process.env, ...env }, encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

// Browser tests run when Playwright is reachable the same way capture.mjs looks for it.
export function playwrightSkip() {
  if (process.env.HELPME_PLAYWRIGHT) return false;
  try { createRequire(join(ROOT, 'package.json')).resolve('playwright'); return false; } catch { /* none */ }
  return 'Playwright not found: set HELPME_PLAYWRIGHT=/path/to/node_modules/playwright to run browser tests';
}
