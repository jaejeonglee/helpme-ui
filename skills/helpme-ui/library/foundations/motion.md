# Motion

Use when adding or reviewing animation, transitions, loading feedback, or anything that moves on its own.

## Every motion has a job
Feedback (press, toggle: short) · orientation (sheet enters from its trigger: medium) · continuity (row expands into detail: medium-long) · attention (one badge, once: short). No job, no motion. Auto-moving content gets a pause or stop (`AUTO-MOTION`); ambient: [effects](../patterns/effects.md).
Animate `transform` and `opacity`, never `transition: all` (Vercel). Layout changes: View Transitions or FLIP (house default).

## M3 reference values
- Durations (ms): short 50-200, medium 250-400, long 450-600, extra-long 700-1000.
- Pairs: emphasized 500, enter 400 (decelerate), exit 200 (accelerate); standard 300/250/200.
- Curves: standard `cubic-bezier(.2,0,0,1)`, decelerate `(.05,.7,.1,1)`, accelerate `(.3,0,.8,.15)`.
- Exits are shorter than entries. M3 Expressive moved to springs and no longer maintains these; use as reference (`MOTION-DURATION`).

## Latency
NN/g: 0.1 s feels instant, 1 s keeps flow, 10 s holds attention; Doherty: about 400 ms. Pressed state at once; then an optimistic update, a skeleton in the final layout, or determinate progress (`LATENCY`).

## Spinners without flicker (`SPINNER-TIMING`)
Delay the show; once shown, hold a minimum; both inside the rule's window.
```js
async function withSpinner(work, el, delay = 200, min = 400) {
  let at = 0;
  const t = setTimeout(() => { el.hidden = false; at = Date.now(); }, delay);
  try { return await work(); } finally {
    clearTimeout(t);
    if (at) await new Promise(r => setTimeout(r, min - (Date.now() - at)));
    el.hidden = true;
  }
}
```

## Reduced motion (`REDUCED-MOTION`)
Turn travel into fades; keep feedback (Apple HIG, Reduce Motion).
```css
:root { --travel: 1; }
@keyframes rise { from { opacity: 0; transform: translateY(calc(12px * var(--travel))); } }
.toast { animation: rise 400ms cubic-bezier(.05,.7,.1,1); }
@media (prefers-reduced-motion: reduce) {
  :root { --travel: 0; }
  html { scroll-behavior: auto; }
}
```
Scripts check the same query before autoplay. Prove it: capture `--reduced-motion`.

## View Transitions, with a fallback
```js
const swap = (update) => !document.startViewTransition ||
  matchMedia("(prefers-reduced-motion: reduce)").matches ? update() : document.startViewTransition(update);
```
Cross-page (same origin): `@view-transition { navigation: auto; }`. Shared elements get a unique `view-transition-name`. No support: the DOM just updates.

## Sources
- WCAG 2.2, 2.2.2 and 2.3.3 (C39): https://www.w3.org/TR/WCAG22/
- Apple HIG, Motion: https://developer.apple.com/design/human-interface-guidelines/
- Material Design 3: https://m3.material.io
- NN/g, Response Times: https://www.nngroup.com/articles/response-times-3-important-limits/
- Laws of UX, Doherty: https://lawsofux.com
- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
- House default: job list, FLIP, View Transitions, snippets.
