// helpme-ui page audit. Runs inside a page: capture.mjs injects it, or paste it into any
// browser tool and call helpmeAudit(). Returns { findings, census, wiring }. Read-only:
// the text-spacing stress style is removed before it returns, so repeated calls agree.
(() => {
  if (globalThis.helpmeAudit) return;
  const IDS = ['OVERFLOW-X', 'VIEWPORT-META', 'ZOOM-LOCK', 'IMG-BROKEN', 'CONSOLE-ERROR', 'REQUEST-FAIL',
    'CONTRAST-TEXT', 'CONTRAST-LARGE', 'CONTRAST-UNKNOWN', 'TARGET-MIN', 'TARGET-TOUCH', 'TEXT-CLIP',
    'TEXT-TRUNCATE', 'TEXT-MIN', 'INPUT-ZOOM', 'LEADING-BODY', 'KO-WRAP', 'KO-TRACKING', 'KO-REGISTER-MIX',
    'SCALE-OFF', 'FONT-COUNT', 'DRIFT', 'TEXT-SPACING'];
  const CAP = 30; // findings kept per id; the rest are counted
  const HANGUL = /[가-힣]/g;
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'META', 'LINK', 'TITLE']);

  // WCAG 2.x maths, kept here so the file works pasted on its own.
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
  const ratio = (fg, bg) => { const a = lum(over(fg, bg)), b = lum(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
  const parse = (s) => {
    const m = String(s).match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
    if (!m) return null;
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return [+m[1], +m[2], +m[3], a];
  };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => (256 + Math.round(v)).toString(16).slice(1)).join('');
  const px = (v) => parseFloat(v) || 0;
  const r2 = (n) => Math.round(n * 100) / 100;

  const sel = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && parts.length < 3; n = n.parentElement) {
      const tag = n.tagName.toLowerCase();
      if (tag === 'html' || tag === 'body') break;
      if (n.id) { parts.unshift(`${tag}#${n.id}`); break; }
      const cls = [...n.classList].slice(0, 2).map((c) => '.' + c).join('');
      parts.unshift(tag + cls);
    }
    return parts.join(' > ') || el.tagName.toLowerCase();
  };
  const shown = (el, cs = getComputedStyle(el)) => {
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
    const box = el.getBoundingClientRect();
    return Math.min(box.width, box.height) > 1;
  };
  const ownText = (el) => { let t = ''; for (const node of el.childNodes) if (node.nodeType === Node.TEXT_NODE) t += ' ' + node.data; return t.replace(/\s+/g, ' ').trim(); };
  const clip = (s) => (s.length > 40 ? s.slice(0, 39) + '…' : s);

  function background(el) {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none') return null;
      const c = parse(cs.backgroundColor);
      if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
    }
    return layers.reverse().reduce((bg, c) => over(c, bg), [255, 255, 255, 1]);
  }
  function opacity(el) { let o = 1; for (let n = el; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; }

  function clippedText(root = document.body) {
    const out = [];
    for (const el of root.querySelectorAll('*')) {
      if (SKIP.has(el.tagName)) continue;
      const cs = getComputedStyle(el);
      const hides = (v) => v === 'hidden' || v === 'clip';
      if (!hides(cs.overflowX) && !hides(cs.overflowY)) continue;
      if (!shown(el, cs) || !el.textContent.trim()) continue;
      const over = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
      if (!over) continue;
      const truncates = cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none');
      out.push({ el, truncates, measured: `content ${el.scrollWidth}×${el.scrollHeight} in box ${el.clientWidth}×${el.clientHeight}` });
    }
    return out;
  }

  function audit(opts = {}) {
    const findings = [];
    const counts = {};
    const add = (id, el, measured, target, extra = {}) => {
      counts[id] = (counts[id] || 0) + 1;
      if (counts[id] <= CAP) findings.push({ id, selector: el ? (typeof el === 'string' ? el : sel(el)) : '*', measured, target, ...extra });
    };
    const de = document.documentElement;
    const vw = de.clientWidth;
    const phone = innerWidth < 600;
    const census = { fontSizes: {}, families: {}, colors: {}, spacings: {}, radii: {} };
    const bump = (k, v) => { census[k][v] = (census[k][v] || 0) + 1; };

    // Page-level checks
    const vm = document.querySelector('meta[name="viewport"]');
    if (!vm || !/width\s*=\s*device-width/i.test(vm.content)) add('VIEWPORT-META', 'head', vm ? `content="${vm.content}"` : 'missing', 'width=device-width');
    if (vm) {
      const c = vm.content.toLowerCase();
      const max = c.match(/maximum-scale\s*=\s*([\d.]+)/);
      if (/user-scalable\s*=\s*(no|0)\b/.test(c) || (max && +max[1] < 2)) add('ZOOM-LOCK', 'meta[name=viewport]', `content="${vm.content}"`, 'zoom allowed; maximum-scale ≥ 2');
    }
    if (de.scrollWidth > vw + 1) {
      const scrolls = (n) => /auto|scroll|hidden|clip/.test(getComputedStyle(n).overflowX);
      const wide = [];
      for (const el of document.body.querySelectorAll('*')) {
        if (SKIP.has(el.tagName) || !shown(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right <= vw + 1 && r.left >= -1) continue;
        let contained = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (scrolls(a)) { contained = true; break; }
        if (!contained) wide.push(el);
      }
      const outer = wide.filter((el) => !wide.includes(el.parentElement));
      (outer.length ? outer.slice(0, 5) : [null]).forEach((el) => add('OVERFLOW-X', el,
        `page ${de.scrollWidth} px wide at ${vw} px` + (el ? `; ends at x=${el.getBoundingClientRect().right | 0}` : ''), `≤ ${vw + 1} px`));
    }
    for (const pic of document.images) {
      const src = pic.getAttribute('src');
      if (src && pic.complete && !pic.naturalWidth) add('IMG-BROKEN', pic, `src="${src}" did not decode`, 'image loads');
    }
    (opts.consoleErrors || []).forEach((m) => add('CONSOLE-ERROR', '*', clip(m), 'no console errors'));
    (opts.failedRequests || []).forEach((m) => add('REQUEST-FAIL', '*', clip(m), 'no failed requests'));

    // Colour tokens for DRIFT: custom properties on :root/html that resolve to colours.
    const tokens = new Set();
    const probe = document.createElement('i');
    document.body.appendChild(probe);
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (const rule of rules) {
        if (!rule.style || !/^(:root|html)$/.test((rule.selectorText || '').trim())) continue;
        for (const name of rule.style) {
          if (!name.startsWith('--')) continue;
          probe.style.color = ''; probe.style.color = `var(${name})`;
          const v = getComputedStyle(probe).color;
          if (probe.style.color && parse(v)) tokens.add(v);
        }
      }
    }
    probe.remove();
    const drift = new Map();

    // Element walk
    const sentences = { haeyo: [], hamnida: [] };
    const families = new Map();
    const offScale = new Map();
    for (const el of document.body.querySelectorAll('*')) {
      if (SKIP.has(el.tagName) || el.closest('svg')) continue;
      const cs = getComputedStyle(el);
      if (!shown(el, cs)) continue;
      // Auto margins resolve to px; Typed OM still says "auto", so skip those (centring, push-apart).
      const typed = el.computedStyleMap ? el.computedStyleMap() : null;
      const isAuto = (p) => (typed ? String(typed.get(p.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()))) === 'auto' : px(cs.marginLeft) === px(cs.marginRight));
      ['marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap']
        .forEach((p) => {
          if (p.startsWith('margin') && isAuto(p)) return;
          const v = r2(px(cs[p]));
          if (v <= 0) return;
          bump('spacings', v);
          if (v > 2 && v % 4 !== 0 && !offScale.has(v)) offScale.set(v, `${sel(el)} ${p}`);
        });
      if (px(cs.borderTopLeftRadius)) bump('radii', r2(px(cs.borderTopLeftRadius)));
      for (const prop of ['color', 'backgroundColor']) {
        const c = parse(cs[prop]);
        if (!c || c[3] === 0) continue;
        if (prop === 'color' && !ownText(el)) continue;
        bump('colors', hex(c));
        if (tokens.size >= 3 && !tokens.has(cs[prop]) && !drift.has(cs[prop])) drift.set(cs[prop], el);
      }
      const text = ownText(el);
      if (!text) continue;
      const fs = px(cs.fontSize);
      const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
      bump('fontSizes', r2(fs));
      bump('families', fam);
      if (!/^(monospace|ui-monospace)$/.test(fam) && !el.closest('code, pre, kbd, samp')) families.set(fam, families.get(fam) || el);
      if (el.closest(':disabled, [aria-disabled="true"], [inert]')) continue;

      // Contrast
      const bg = background(el);
      const fg = parse(cs.color);
      const large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
      if (!bg || !fg) add('CONTRAST-UNKNOWN', el, `text "${clip(text)}" over an image, gradient or unparsed colour`, 'check the worst pixel', { text: clip(text) });
      else {
        const c = [fg[0], fg[1], fg[2], fg[3] * opacity(el)];
        const r = ratio(c, bg);
        const need = large ? 3 : 4.5;
        if (r < need) add(large ? 'CONTRAST-LARGE' : 'CONTRAST-TEXT', el, `${r.toFixed(2)}:1 (${hex(over(c, bg))} on ${hex(bg)}, ${r2(fs)} px)`, `≥ ${need}:1`, { text: clip(text) });
      }
      if (fs < 12) add('TEXT-MIN', el, `${r2(fs)} px`, '≥ 12 px', { text: clip(text) });
      const lh = cs.lineHeight === 'normal' ? fs * 1.2 : px(cs.lineHeight);
      const lines = el.getBoundingClientRect().height / lh;
      if (fs <= 20 && lines >= 1.9 && lh / fs < 1.5 && cs.display !== 'inline') add('LEADING-BODY', el, `line-height ${r2(lh / fs)}`, '≥ 1.5', { text: clip(text) });
      const hangul = (text.match(HANGUL) || []).length;
      if (hangul >= 8 && /\s/.test(text)) {
        if (cs.wordBreak !== 'keep-all') add('KO-WRAP', el, `word-break: ${cs.wordBreak}`, 'word-break: keep-all + overflow-wrap: break-word', { text: clip(text) });
        else if (cs.overflowWrap === 'normal') add('KO-WRAP', el, 'keep-all without overflow-wrap', 'overflow-wrap: break-word', { text: clip(text) });
      }
      if (hangul && px(cs.letterSpacing) > 0) add('KO-TRACKING', el, `letter-spacing ${cs.letterSpacing}`, '≤ 0 on Hangul', { text: clip(text) });
      for (const s of text.split(/(?<=[.!?])\s+/)) {
        const t = s.replace(/[\s.!?…)"'”’]+$/, '');
        if (/(니다|니까|십시오)$/.test(t)) sentences.hamnida.push([el, t]);
        else if (/[가-힣]요$/.test(t) && !/(필요|중요|개요|수요|주요|소요|강요)$/.test(t) || /죠$/.test(t)) sentences.haeyo.push([el, t]);
      }
    }
    if (families.size > 2) add('FONT-COUNT', [...families.values()][2], `${families.size} families: ${[...families.keys()].join(', ')}`, '≤ 2');
    [...offScale].slice(0, 10).forEach(([v, where]) => add('SCALE-OFF', where.split(' ').slice(0, -1).join(' '), `${v} px (${where.split(' ').pop()})`, 'multiple of 4 px'));
    [...drift].slice(0, 8).forEach(([c, el]) => add('DRIFT', el, `${hex(parse(c))} is not a :root colour token`, `one of ${tokens.size} tokens`));
    if (sentences.haeyo.length && sentences.hamnida.length) {
      const [few, many] = sentences.haeyo.length <= sentences.hamnida.length ? ['haeyo', 'hamnida'] : ['hamnida', 'haeyo'];
      const [el, t] = sentences[few][0];
      add('KO-REGISTER-MIX', el, `해요체 ×${sentences.haeyo.length}, 합니다체 ×${sentences.hamnida.length}; e.g. "${clip(t)}"`, `one register (mostly ${many === 'haeyo' ? '해요' : '합니다'})`);
    }

    // Targets
    const TARGETS = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"], [role="menuitem"], [onclick], [tabindex]:not([tabindex="-1"])';
    const targets = [];
    for (const el of document.querySelectorAll(TARGETS)) {
      if (el.closest(':disabled, [aria-disabled="true"], [inert]') || !shown(el)) continue;
      if (targets.some((t) => t.el.contains(el))) continue;
      const cs = getComputedStyle(el);
      let box = el.getBoundingClientRect();
      if (/^(checkbox|radio)$/.test(el.type) && el.labels && el.labels[0]) box = el.labels[0].getBoundingClientRect();
      const inline = el.tagName === 'A' && cs.display === 'inline' && el.parentElement && ownText(el.parentElement).length > 0;
      targets.push({ el, box, inline, small: box.width < 24 || box.height < 24 });
    }
    const center = (b) => [b.left + b.width / 2, b.top + b.height / 2];
    const distToBox = ([x, y], b) => Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom));
    for (const t of targets) {
      if (t.inline) continue;
      const size = `${r2(t.box.width)}×${r2(t.box.height)} px`;
      if (t.small) {
        const c = center(t.box);
        const crowded = targets.some((o) => o !== t && (o.small ? Math.hypot(...center(o.box).map((v, i) => v - c[i])) < 24 : distToBox(c, o.box) < 12));
        if (crowded) { add('TARGET-MIN', t.el, `${size}, neighbour within 24 px`, '≥ 24×24 px or spaced'); continue; }
      }
      if (phone && (t.box.width < 44 || t.box.height < 44)) add('TARGET-TOUCH', t.el, size, '≥ 44×44 px on phones');
    }
    if (phone) for (const el of document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]), select, textarea')) {
      const fs = px(getComputedStyle(el).fontSize);
      if (shown(el) && fs < 16) add('INPUT-ZOOM', el, `${r2(fs)} px`, '≥ 16 px (iOS zooms on focus)');
    }

    // Clipping, then the WCAG 1.4.12 text-spacing stress
    const base = clippedText();
    base.forEach((c) => (c.truncates
      ? (!c.el.closest('[title]') && add('TEXT-TRUNCATE', c.el, c.measured, 'full text reachable (title, expand)'))
      : add('TEXT-CLIP', c.el, c.measured, 'nothing clipped')));
    if (opts.stress === 'text-spacing') {
      const st = document.createElement('style');
      st.textContent = '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}';
      document.head.appendChild(st);
      const seen = new Set(base.map((c) => c.el));
      clippedText().filter((c) => !seen.has(c.el)).forEach((c) => add('TEXT-SPACING', c.el, c.measured + ' under text-spacing stress', 'nothing clipped'));
      st.remove();
    }

    // Wiring: what a redesign must not lose
    const w = new Set();
    const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.value || el.title || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    document.querySelectorAll('a[href]').forEach((a) => w.add('link:' + a.getAttribute('href')));
    document.querySelectorAll('form').forEach((f, i) => w.add('form:' + (f.getAttribute('action') || f.id || f.getAttribute('name') || `#${i + 1}`)));
    document.querySelectorAll('input, select, textarea').forEach((f) => (f.name || f.id) && w.add('field:' + (f.name || f.id)));
    document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]').forEach((b) => name(b) && w.add('button:' + name(b)));
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => name(h) && w.add('heading:' + name(h)));
    document.querySelectorAll('[aria-label]:not(button):not([role="button"])').forEach((e) => w.add('aria:' + e.getAttribute('aria-label')));
    for (const el of document.querySelectorAll('*')) {
      for (const at of el.attributes) if (/^on[a-z]+$/.test(at.name)) w.add(`handler:${at.name}@${el.id || el.getAttribute('name') || name(el) || el.tagName.toLowerCase()}`);
      if (el.dataset && el.dataset.action) w.add('handler:data-action=' + el.dataset.action);
    }

    Object.entries(counts).forEach(([id, n]) => { if (n > CAP) findings.push({ id, selector: '*', measured: `${n - CAP} more not listed`, target: '' }); });
    return { findings, census, wiring: [...w].sort() };
  }

  audit.ids = IDS;
  audit.ratio = ratio;
  globalThis.helpmeAudit = audit;
})();
