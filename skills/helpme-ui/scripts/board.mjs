#!/usr/bin/env node
// board.mjs — an offline page to compare options (cards A, B, C…) or before/after pairs,
// and to hand back a one-line verdict. Exit 0 ok · 2 usage.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync, copyFileSync } from 'node:fs';
import { resolve, join, basename, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const ENTITY = new Map([['&', 'amp'], ['<', 'lt'], ['>', 'gt'], ['"', 'quot'], ["'", '#39']]);
export const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => `&${ENTITY.get(ch)};`);

// Also serialised into the page, so keep it self-contained.
export function verdictLine({ board, keep = [], drop = [], notes = '' }) {
  const q = (s) => '"' + String(s).replace(/\s+/g, ' ').trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  return `helpme-verdict board=${q(board)} keep=${keep.join(',')} drop=${drop.join(',')} notes=${q(notes)}`;
}

const meta = (html, name) => (html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')) || [])[1] || '';
const variant = (file) => { const m = basename(file, extname(file)).match(/^(.*?)@([\w]+)(~.*)?$/); return m ? { screen: m[1] + (m[3] || ''), vp: m[2] } : { screen: basename(file, extname(file)), vp: 'any' }; };
// contact.png is capture's contact sheet, not a screen.
const listDir = (d, re) => readdirSync(d).filter((f) => re.test(f) && f !== 'contact.png').sort().map((f) => join(d, f));

export function parseArgs(argv) {
  const o = { inputs: [], title: 'Board', live: false, out: null, before: null, after: null };
  const rest = [...argv];
  while (rest.length) {
    const a = rest.shift();
    const val = () => { if (!rest.length) throw new Error(`${a} needs a value`); return rest.shift(); };
    if (a === '--title') o.title = val();
    else if (a === '--live') o.live = true;
    else if (a === '--out') o.out = val();
    else if (a === '--before') o.before = val();
    else if (a === '--after') o.after = val();
    else if (a.startsWith('--')) throw new Error(`unknown option ${a}`);
    else o.inputs.push(a);
  }
  if (!!o.before !== !!o.after) throw new Error('--before and --after go together');
  if (o.before && o.inputs.length) throw new Error('give either inputs or --before/--after, not both');
  if (!o.before && !o.inputs.length) throw new Error('nothing to show');
  for (const p of [o.before, o.after, ...o.inputs].filter(Boolean)) if (!existsSync(p)) throw new Error(`not found: ${p}`);
  return o;
}

// Options: one card per HTML file, or per screen name for PNGs (phone/desktop variants).
function optionCards(inputs, outDir, sandbox) {
  const files = inputs.flatMap((p) => (statSync(p).isDirectory() ? listDir(p, /\.(html?|png)$/i) : [resolve(p)]));
  const groups = new Map();
  for (const f of files) {
    const key = /\.png$/i.test(f) ? 'png:' + variant(f).screen : 'html:' + f;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  if (groups.size > 26) throw new Error('at most 26 cards');
  mkdirSync(join(outDir, 'img'), { recursive: true });
  return [...groups.entries()].map(([key, fs], i) => {
    const id = String.fromCharCode(65 + i);
    if (key.startsWith('html:')) {
      const html = readFileSync(fs[0], 'utf8');
      const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || basename(fs[0]);
      const frame = (vp, w, h) => `<div class="frame v-${vp}" style="--w:${w};--h:${h}"><iframe sandbox="${sandbox}" title="${esc(title)} at ${vp}" srcdoc="${esc(html)}"></iframe></div>`;
      return { id, title, bet: meta(html, 'helpme-bet'), gives: meta(html, 'helpme-gives-up'), body: frame('phone', 360, 800) + frame('desktop', 1280, 800) };
    }
    const imgs = fs.map((f) => {
      const name = `${id}-${basename(f)}`;
      copyFileSync(f, join(outDir, 'img', name));
      const v = variant(f).vp;
      return `<img class="v-${v === 'phone' ? 'phone' : v === 'any' ? 'any' : 'desktop'}" src="img/${esc(encodeURIComponent(name))}" alt="${esc(basename(f))}">`;
    });
    return { id, title: key.slice(4), bet: '', gives: '', body: imgs.join('') };
  });
}

// PNG width from the IHDR chunk, or null for anything else.
const pngWidth = (f) => { const b = readFileSync(f); return b.length > 24 && b.toString('latin1', 1, 4) === 'PNG' ? b.readUInt32BE(16) : null; };
// capture.mjs counts per shot, keyed like the PNG name, when audit.json sits beside the shots.
const auditCounts = (dir) => {
  const f = join(dir, 'audit.json');
  if (!existsSync(f)) return {};
  return Object.fromEntries((JSON.parse(readFileSync(f, 'utf8')).shots || []).map((s) => [s.file, s.counts]));
};

// Pairs: same file name in both folders → one slider card. Both shots keep their own
// pixel scale: a page that overflowed the phone is wider than the screen and gets cut at
// the screen's edge, which is what the phone user sees.
function pairCards(beforeDir, afterDir, outDir) {
  const b = new Set(listDir(beforeDir, /\.png$/i).map((f) => basename(f)));
  const a = new Set(listDir(afterDir, /\.png$/i).map((f) => basename(f)));
  const both = [...b].filter((f) => a.has(f)).sort();
  if (!both.length) throw new Error('no PNG file names match between --before and --after');
  for (const d of ['before', 'after']) mkdirSync(join(outDir, d), { recursive: true });
  const [cb, ca] = [auditCounts(beforeDir), auditCounts(afterDir)];
  const cards = both.map((f) => {
    copyFileSync(join(beforeDir, f), join(outDir, 'before', f));
    copyFileSync(join(afterDir, f), join(outDir, 'after', f));
    const [wb, wa] = [pngWidth(join(beforeDir, f)), pngWidth(join(afterDir, f))];
    const base = wb && wa ? Math.min(wb, wa) : null;
    const width = (w) => (base ? ` style="width:${((100 * w) / base).toFixed(3)}%"` : '');
    const { screen, vp } = variant(f);
    const src = esc(encodeURIComponent(f));
    const cls = vp === 'phone' ? 'phone' : vp === 'any' ? 'any' : 'desktop';
    const delta = cb[f] && ca[f] ? ['must', 'should'].map((t) => `${t} ${cb[f][t]} → ${ca[f][t]}`).join(' · ') : `${screen} · ${vp}`;
    return { id: `${screen}@${vp}`, title: delta, bet: '', gives: '', vp: cls,
      body: `<div class="pair"><div class="stack"><div class="layer"><img src="after/${src}" alt="after: ${esc(f)}"${width(wa)}></div><div class="layer before"><img src="before/${src}" alt="before: ${esc(f)}"${width(wb)}></div><span class="seam" aria-hidden="true"></span></div>
<label class="slide"><span>Before</span><input type="range" min="0" max="100" value="50" aria-label="Before/after split for ${esc(f)}"><span>After</span></label></div>` };
  });
  return { cards, unmatched: [...b].filter((f) => !a.has(f)).map((f) => `before only: ${f}`).concat([...a].filter((f) => !b.has(f)).map((f) => `after only: ${f}`)) };
}

export function renderBoard({ title, cards, unmatched = [], mode }) {
  const card = (c) => `<article class="card${c.vp ? ' v-' + c.vp : ''}" data-id="${esc(c.id)}">
<header><b class="tag">${esc(c.id)}</b><h2>${esc(c.title)}</h2></header>
${c.bet ? `<p class="bet"><span>Bet</span> ${esc(c.bet)}</p>` : ''}${c.gives ? `<p class="bet"><span>Gives up</span> ${esc(c.gives)}</p>` : ''}
<div class="view">${c.body}</div>
<fieldset class="pick"><legend>Verdict for ${esc(c.id)}</legend>
<label><input type="radio" name="v-${esc(c.id)}" value="keep"> Keep</label><label><input type="radio" name="v-${esc(c.id)}" value="drop"> Drop</label></fieldset>
</article>`;
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="initial-scale=1, width=device-width">
<style>
:root{--ink:#17181c;--muted:#5b5e66;--line:#d5d7dd;--paper:#ffffff;--wash:#f3f4f6;--accent:#1f5eff;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:var(--wash);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Apple SD Gothic Neo","Pretendard",sans-serif;word-break:keep-all;overflow-wrap:break-word}
.top{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;justify-content:space-between;padding:12px 24px;background:var(--paper);border-bottom:1px solid var(--line)}
.top h1{margin:0;font-size:20px;line-height:1.4}
.top p{margin:0;color:var(--muted);font-size:14px}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;padding:4px;gap:4px;background:var(--wash)}
.seg button{font:inherit;font-size:14px;min-height:44px;min-width:88px;padding:0 16px;border:0;border-radius:4px;background:transparent;color:var(--ink);cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--paper);box-shadow:0 1px 2px rgba(0,0,0,.12);font-weight:600}
:is(button,input,textarea):focus-visible{outline-offset:2px;outline:2px solid var(--accent)}
main{display:grid;gap:24px;padding:24px;grid-template-columns:repeat(auto-fit,minmax(min(100%,${mode === 'pairs' ? '560px' : '360px'}),1fr));max-width:1440px;margin:0 auto}
.card{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0}
.card header{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
.card h2{margin:0;font-size:16px;line-height:1.5}
.tag{flex:none;display:inline-grid;place-items:center;min-width:32px;height:32px;padding:0 8px;border-radius:8px;background:var(--ink);color:var(--paper);font-size:14px}
.bet{margin:0;font-size:14px;color:var(--ink)}
.bet span{color:var(--muted);margin-right:4px}
body[data-vp="phone"] .v-desktop,body[data-vp="desktop"] .v-phone{display:none}
.view{min-width:0}
.view img{display:block;max-width:100%;height:auto;border:1px solid var(--line);border-radius:8px}
.frame{position:relative;width:100%;aspect-ratio:var(--w)/var(--h);overflow:hidden;border:1px solid var(--line);border-radius:8px;container-type:inline-size}
.frame iframe{position:absolute;top:0;left:0;border:0;width:calc(var(--w)*1px);height:calc(var(--h)*1px);transform-origin:0 0;transform:scale(calc(100cqw / (var(--w) * 1px)))}
.v-phone .frame,.frame.v-phone{max-width:360px}
.pair{display:flex;flex-direction:column;gap:12px}
.card.v-phone .pair{max-width:360px}
.stack{display:grid;position:relative;--split:50%;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--paper)}
.layer{grid-area:1/1;overflow:hidden;background:var(--wash)}
.layer img{display:block;width:100%;max-width:none;height:auto;border:0;border-radius:0}
.layer.before{clip-path:inset(0 calc(100% - var(--split)) 0 0)}
.seam{position:absolute;top:0;bottom:0;left:var(--split);width:2px;margin-left:-1px;background:var(--accent)}
.slide{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--muted)}
.slide input{flex:1;min-height:44px;accent-color:var(--accent)}
.pick{display:flex;gap:16px;border:0;margin:0;padding:0}
.pick legend{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.pick label{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;border:1px solid var(--line);border-radius:8px;cursor:pointer}
.pick input{width:20px;height:20px;margin:0;accent-color:var(--accent)}
.verdict{max-width:1440px;margin:0 auto;padding:0 24px 32px}
.verdict section{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:16px;display:grid;gap:12px}
.verdict h2{margin:0;font-size:16px}
.verdict label{font-size:14px;color:var(--muted)}
.verdict textarea{width:100%;font:16px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;padding:12px;border:1px solid var(--line);border-radius:8px;color:var(--ink);background:var(--paper);resize:vertical}
.verdict .row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.verdict button{font:inherit;min-height:44px;padding:0 20px;border:0;border-radius:8px;background:var(--accent);color:#fff;cursor:pointer}
.verdict output{font-size:14px;color:var(--muted)}
.unmatched{color:var(--muted);font-size:14px;margin:0}
</style>
<body data-vp="desktop">
<div class="top"><div><h1>${esc(title)}</h1><p>${mode === 'pairs' ? 'Drag a slider to compare before and after.' : 'Each card is one bet, shown in a sandbox.'} Pick keep or drop, then copy the verdict line back to the agent.</p></div>
<div class="seg" role="group" aria-label="Viewport"><button type="button" data-vp="phone" aria-pressed="false">Phone</button><button type="button" data-vp="desktop" aria-pressed="true">Desktop</button></div></div>
<main>
${cards.map(card).join('\n')}
</main>
<div class="verdict"><section>
<h2>Verdict</h2>
${unmatched.length ? `<p class="unmatched">Not paired: ${unmatched.map(esc).join(' · ')}</p>` : ''}
<label for="notes">Notes</label><textarea id="notes" rows="2" placeholder="What to change next"></textarea>
<label for="line">Line to paste back</label><textarea id="line" rows="4" readonly></textarea>
<div class="row"><button type="button" id="copy">Copy verdict</button><output id="copied" aria-live="polite"></output></div>
</section></div>
<script>
const BOARD = ${JSON.stringify(title).replace(/</g, '\\u003c')};
const verdictLine = ${verdictLine.toString()};
const $ = (s, el = document) => [...el.querySelectorAll(s)];
function setVp(vp) {
  document.body.dataset.vp = vp;
  for (const btn of $('.seg button')) btn.setAttribute('aria-pressed', btn.dataset.vp === vp ? 'true' : 'false');
}
$('.seg button').forEach((b) => b.addEventListener('click', () => setVp(b.dataset.vp)));
setVp(matchMedia('(max-width: 599px)').matches ? 'phone' : 'desktop');
$('.stack').forEach((st) => {
  const input = st.parentElement.querySelector('input[type=range]');
  const apply = () => st.style.setProperty('--split', input.value + '%');
  input.addEventListener('input', apply); apply();
});
function update() {
  const keep = [], drop = [];
  $('.card').forEach((c) => { const v = c.querySelector('.pick input:checked'); if (v) (v.value === 'keep' ? keep : drop).push(c.dataset.id); });
  document.getElementById('line').value = verdictLine({ board: BOARD, keep, drop, notes: document.getElementById('notes').value });
}
document.addEventListener('input', update); document.addEventListener('change', update); update();
document.getElementById('copy').addEventListener('click', async () => {
  const line = document.getElementById('line'), out = document.getElementById('copied');
  try { await navigator.clipboard.writeText(line.value); out.textContent = 'Copied.'; }
  catch { line.focus(); line.select(); out.textContent = 'Select the line and copy it.'; }
});
</script>
</body></html>
`;
}

export function buildBoard(o) {
  const outDir = resolve(o.out || join('.helpme', 'board'));
  mkdirSync(outDir, { recursive: true });
  let cards, unmatched = [], mode;
  if (o.before) ({ cards, unmatched } = pairCards(resolve(o.before), resolve(o.after), outDir)), mode = 'pairs';
  else cards = optionCards(o.inputs, outDir, o.live ? 'allow-scripts' : ''), mode = 'options';
  const file = join(outDir, 'index.html');
  writeFileSync(file, renderBoard({ title: o.title, cards, unmatched, mode }));
  return { file, cards: cards.map((c) => c.id), unmatched };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const r = buildBoard(parseArgs(process.argv.slice(2)));
    console.log(`board: ${r.cards.length} cards (${r.cards.join(', ')})${r.unmatched.length ? `; not paired: ${r.unmatched.join(', ')}` : ''}\nopen ${r.file}`);
  } catch (e) {
    console.error(`board: ${e.message}\nusage: board.mjs <html|png|dir>... [--title T] [--live] [--out DIR]\n       board.mjs --before DIR --after DIR [--title T] [--out DIR]`);
    process.exit(2);
  }
}
