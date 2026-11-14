#!/usr/bin/env node
// capture.mjs — screenshot pages at set viewports, audit each shot, write evidence.
// Exit 0 clean · 1 findings at/above --fail-on · 2 usage · 3 environment (no Playwright/browser).
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { serve } from './lib/serve.mjs';
import { loadRules, loadWaivers, findWaiver, tierRank, TIERS } from './lib/rules.mjs';
import { findPlaywright, EnvError, ENV_HELP } from './lib/find-playwright.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const VIEWPORTS = {
  phone: [360, 800], tablet: [768, 1024], desktop: [1280, 800], wide: [1440, 900], reflow: [320, 256],
};
const USAGE = `usage: capture.mjs <url|file|dir>... [options]
  --vp phone,desktop        phone 360x800 · tablet 768x1024 · desktop 1280x800 · wide 1440x900 · reflow 320x256 · WxH
  --scheme light|dark|both  colour scheme (default light)
  --reduced-motion          emulate prefers-reduced-motion: reduce
  --full-page               capture the whole page, not just the viewport
  --hook name=file.mjs      run export default async (page, info) before the shot; adds ~name
  --stress text-spacing     WCAG 1.4.12 spacing stress; new clipping → TEXT-SPACING
  --query k=v               add a query parameter (repeatable), e.g. --query state=empty
  --name N                  shot name (one target only)
  --out DIR                 output folder (default .helpme/shots/r<next>)
  --fail-on must|should|polish|never   exit 1 threshold (default must)
  --doctor                  report Playwright and browser, then exit`;

class UsageError extends Error {}

export function parseArgs(argv) {
  const o = { targets: [], vps: ['phone', 'desktop'], scheme: 'light', reducedMotion: false, fullPage: false,
    hook: null, stress: null, query: [], name: null, out: null, failOn: 'must', doctor: false };
  const need = (at, flag) => { if (at >= argv.length || argv[at].startsWith('--')) throw new UsageError(`${flag} needs a value`); return argv[at]; };
  for (let k = 0; k < argv.length; k += 1) {
    const a = argv[k];
    switch (a) {
      case '--vp': o.vps = need(++k, a).split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--scheme': o.scheme = need(++k, a); break;
      case '--reduced-motion': o.reducedMotion = true; break;
      case '--full-page': o.fullPage = true; break;
      case '--hook': {
        const m = need(++k, a).match(/^([\w-]+)=(.+)$/);
        if (!m) throw new UsageError('--hook expects name=file.mjs');
        o.hook = { name: m[1], file: resolve(m[2]) };
        break;
      }
      case '--stress': o.stress = need(++k, a); break;
      case '--query': {
        const q = need(++k, a);
        if (!q.includes('=')) throw new UsageError('--query expects k=v');
        o.query.push(q);
        break;
      }
      case '--name': o.name = need(++k, a); break;
      case '--out': o.out = need(++k, a); break;
      case '--fail-on': o.failOn = need(++k, a); break;
      case '--doctor': o.doctor = true; break;
      case '-h': case '--help': throw new UsageError('');
      default:
        if (a.startsWith('--')) throw new UsageError(`unknown option ${a}`);
        o.targets.push(a);
    }
  }
  if (!['light', 'dark', 'both'].includes(o.scheme)) throw new UsageError(`--scheme must be light, dark or both`);
  if (!['must', 'should', 'polish', 'never'].includes(o.failOn)) throw new UsageError('--fail-on must be must, should, polish or never');
  if (o.stress && o.stress !== 'text-spacing') throw new UsageError('--stress supports text-spacing only');
  o.viewports = o.vps.map((v) => {
    if (VIEWPORTS[v]) return { name: v, width: VIEWPORTS[v][0], height: VIEWPORTS[v][1] };
    const m = v.match(/^(\d{2,4})x(\d{2,4})$/);
    if (!m) throw new UsageError(`unknown viewport "${v}"`);
    return { name: v, width: +m[1], height: +m[2] };
  });
  if (!o.doctor && o.targets.length === 0) throw new UsageError('give at least one url, file or folder');
  if (o.hook && !existsSync(o.hook.file)) throw new UsageError(`hook file not found: ${o.hook.file}`);
  return o;
}

function expandTargets(list, nameOverride) {
  const out = [];
  for (const t of list) {
    if (/^https?:\/\//.test(t)) {
      const u = new URL(t);
      out.push({ kind: 'url', url: t, name: (u.hostname + u.pathname).replace(/[^\w.-]+/g, '-').replace(/-+$/, '') });
      continue;
    }
    const p = resolve(t);
    if (!existsSync(p)) throw new UsageError(`not found: ${t}`);
    const files = statSync(p).isDirectory()
      ? readdirSync(p).filter((f) => /\.html?$/i.test(f)).sort().map((f) => join(p, f))
      : [p];
    if (files.length === 0) throw new UsageError(`no .html files in ${t}`);
    for (const f of files) out.push({ kind: 'file', file: f, name: basename(f, extname(f)) });
  }
  if (nameOverride) {
    if (out.length !== 1) throw new UsageError('--name needs exactly one target');
    out[0].name = nameOverride;
  }
  return out;
}

function nextRoundDir(cwd) {
  const base = join(cwd, '.helpme', 'shots');
  const n = existsSync(base) ? Math.max(0, ...readdirSync(base).map((d) => +(d.match(/^r(\d+)$/) || [])[1] || 0)) : 0;
  return join(base, `r${n + 1}`);
}

async function contactSheet(browser, outDir, shots) {
  const cells = [];
  for (const s of shots) {
    const b64 = readFileSync(join(outDir, s.file)).toString('base64');
    cells.push(`<figure><figcaption><b>${s.key}</b> must ${s.counts.must} · should ${s.counts.should} · polish ${s.counts.polish}</figcaption><img alt="" src="data:image/png;base64,${b64}"></figure>`);
  }
  const tiles = cells.join('\n');
  const html = `<!doctype html><title>contact sheet</title><meta charset="utf-8"><style>
    body{margin:0;padding:16px;background:#e9e9ec;font:13px/1.4 system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}
    figure{margin:0;background:#fff;padding:8px;border-radius:8px;width:300px}
    img{width:100%;display:block;border:1px solid #ccc;max-height:900px;object-fit:cover;object-position:top}
    figcaption{padding-bottom:8px;color:#333}</style>${tiles}`;
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: join(outDir, 'contact.png'), fullPage: true });
  await page.close();
}

export async function run(argv, { cwd = process.cwd(), log = console.log, err = console.error } = {}) {
  let o, targets, waivers, rules;
  try {
    o = parseArgs(argv);
    rules = loadRules();
    waivers = loadWaivers(join(cwd, '.helpme', 'ledger.md'), rules);
    targets = o.doctor ? [] : expandTargets(o.targets, o.name);
  } catch (e) {
    if (!(e instanceof UsageError) && !/ledger line/.test(e.message)) throw e;
    if (e.message) err(`capture: ${e.message}`);
    err(USAGE);
    return 2;
  }

  let pw;
  try { pw = await findPlaywright({ cwd }); } catch (e) {
    if (!(e instanceof EnvError)) throw e;
    err(`capture: ${e.message}\n${ENV_HELP}`);
    return 3;
  }
  if (o.doctor) {
    log(`node ${process.version}\nplaywright ${pw.from}\nbrowser ${pw.browserName} ${pw.version}\nok`);
    await pw.browser.close();
    return 0;
  }

  const outDir = resolve(cwd, o.out || nextRoundDir(cwd));
  mkdirSync(outDir, { recursive: true });
  const auditSrc = readFileSync(join(HERE, 'lib', 'audit-page.js'), 'utf8');
  const servers = new Map();
  const shots = [];
  const wiring = {};
  const census = {};
  const schemes = o.scheme === 'both' ? ['light', 'dark'] : [o.scheme];

  try {
    for (const t of targets) {
      let url = t.url;
      if (t.kind === 'file') {
        const dir = dirname(t.file);
        if (!servers.has(dir)) servers.set(dir, await serve(dir));
        url = `${servers.get(dir).url}/${encodeURIComponent(basename(t.file))}`;
      }
      if (o.query.length) {
        const u = new URL(url);
        o.query.forEach((q) => { const [k, ...v] = q.split('='); u.searchParams.set(k, v.join('=')); });
        url = u.toString();
      }
      for (const vp of o.viewports) {
        for (const scheme of schemes) {
          const mobile = vp.width < 600;
          const ctx = await pw.browser.newContext({
            viewport: { width: vp.width, height: vp.height }, isMobile: mobile, hasTouch: mobile,
            colorScheme: scheme, reducedMotion: o.reducedMotion ? 'reduce' : 'no-preference',
          });
          const page = await ctx.newPage();
          const consoleErrors = [];
                    // 404s already surface as REQUEST-FAIL; Chrome's matching console line would double-count them.
          page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) consoleErrors.push(m.text()); });
          page.on('pageerror', (e) => consoleErrors.push(String(e.message || e)));
          const failed = new Map();
          page.on('response', (r) => { if (r.status() >= 400 && !failed.has(r.url())) failed.set(r.url(), `${r.url()} (${r.status()})`); });
          page.on('requestfailed', (r) => { if (!failed.has(r.url())) failed.set(r.url(), `${r.url()} (${r.failure()?.errorText || 'failed'})`); });
          await page.goto(url, { waitUntil: 'load', timeout: 30000 });
          await page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
          if (o.hook) {
            const mod = await import(pathToFileURL(o.hook.file).href);
            await mod.default(page, { vp: vp.name, scheme, name: t.name });
          }
          const key = `${t.name}@${vp.name}${scheme === 'dark' ? '~dark' : ''}${o.hook ? `~${o.hook.name}` : ''}`;
          const file = `${key}.png`;
          await page.screenshot({ path: join(outDir, file), fullPage: o.fullPage });
          await page.evaluate(auditSrc);
          const res = await page.evaluate((opts) => globalThis.helpmeAudit(opts), { consoleErrors, failedRequests: [...failed.values()], stress: o.stress });
          await ctx.close();

          const counts = { must: 0, should: 0, polish: 0, info: 0, waived: 0 };
          const findings = res.findings.map((f) => {
            const rule = rules.get(f.id);
            if (!rule) throw new Error(`audit emitted ${f.id}, which is not in checks/rules.md`);
            const w = findWaiver(f, waivers);
            if (w) counts.waived++; else counts[rule.tier]++;
            return { tier: rule.tier, ...f, ...(w ? { waived: w.reason } : {}) };
          });
          findings.sort((a, b) => tierRank(b.tier) - tierRank(a.tier));
          shots.push({ key, file, url, viewport: vp, scheme, counts, findings });
          wiring[key] = res.wiring;
          census[key] = res.census;
        }
      }
    }
    if (shots.length) await contactSheet(pw.browser, outDir, shots);
  } finally {
    await pw.browser.close();
    for (const s of servers.values()) await s.close();
  }

  const total = Object.fromEntries(['must', 'should', 'polish', 'info', 'waived'].map((k) => [k, shots.reduce((n, s) => n + s.counts[k], 0)]));
  const audit = { tool: 'helpme-ui capture', version: '0.1.0', created: new Date().toISOString(), failOn: o.failOn,
    stress: o.stress, reducedMotion: o.reducedMotion, total, shots };
  writeFileSync(join(outDir, 'audit.json'), JSON.stringify(audit, null, 2));
  writeFileSync(join(outDir, 'wiring.json'), JSON.stringify(wiring, null, 2));
  writeFileSync(join(outDir, 'census.json'), JSON.stringify(census, null, 2));

  for (const s of shots) {
    const c = s.counts;
    log(`${s.key.padEnd(28)} must ${c.must} · should ${c.should} · polish ${c.polish} · info ${c.info}${c.waived ? ` · waived ${c.waived}` : ''}`);
    for (const f of s.findings) {
      if (f.waived || tierRank(f.tier) < tierRank('should')) continue;
      log(`  [${f.tier}] ${f.id} · ${s.key} · ${f.selector} · ${f.measured}${f.target ? ` → ${f.target}` : ''}`);
    }
  }
  const shown = relative(cwd, outDir);
  log(`wrote ${shown && !shown.startsWith('..') ? shown : outDir}/ (${shots.length} shots, audit.json, wiring.json, census.json, contact.png)`);

  if (o.failOn === 'never') return 0;
  const bar = tierRank(o.failOn);
  const failing = TIERS.filter((t) => tierRank(t) >= bar).reduce((n, t) => n + total[t], 0);
  return failing > 0 ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  run(process.argv.slice(2)).then((code) => process.exit(code), (e) => { console.error(`capture: ${e.stack || e}`); process.exit(3); });
}
