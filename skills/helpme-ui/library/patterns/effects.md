# Effects

Use when adding texture, glow, pointer or scroll effects, or reviewing a screen that has them.

## Rules

- At most one ambient (decorative, not input-driven) effect per view (house default).
- Pause it offscreen. Static under reduced motion (`REDUCED-MOTION`); long loops meet `AUTO-MOTION`.
- No flashing: never more than three flashes in any one second (WCAG 2.3.1).
- Text over an effect still meets `CONTRAST-TEXT` at its worst pixel.
- Animate `transform` and `opacity`; never `transition: all`. A `filter` loop gets its own small layer.

```js
const io = new IntersectionObserver(([e]) => fx.classList.toggle('paused', !e.isIntersecting));
io.observe(fx);
```
Canvas/WebGL: stop the `requestAnimationFrame` loop.

## Grain (static)

```css
.grain::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .06;
  background-image: var(--noise); }
/* --noise: an SVG data URI of a 128 px square filled through feTurbulence
   (fractal noise, baseFrequency ≈ .85, 2 octaves); or ship a 128 px PNG tile. */
```

## Dot grid

```css
.dots { background: radial-gradient(rgb(0 0 0 / .12) 1px, transparent 1px) 0 0 / 16px 16px;
  mask-image: radial-gradient(closest-side, #000, transparent); }
```

## Spotlight (pointer only)

```css
.spot { background: radial-gradient(400px at var(--x, 50%) var(--y, 30%), rgb(255 255 255 / .08), transparent 70%); }
```
```js
spot.onpointermove = (e) => { const r = spot.getBoundingClientRect();
  spot.style.setProperty('--x', e.clientX - r.left + 'px'); spot.style.setProperty('--y', e.clientY - r.top + 'px'); };
```
Touch never moves it; it rests at the default.

## Hue drift

```css
@keyframes drift { to { filter: hue-rotate(40deg); } }
.aura { animation: drift 24s ease-in-out infinite alternate; }
.aura.paused { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .aura { animation: none; } }
```

## Scroll reveal

```css
@media (prefers-reduced-motion: no-preference) {
  .js .reveal { opacity: 0; translate: 0 16px; transition: opacity .4s, translate .4s; }
  .js .reveal.in { opacity: 1; translate: none; }
}
```
```js
const ro = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
}));
document.querySelectorAll('.reveal').forEach((el) => ro.observe(el));
```
- `.js` on `<html>` is set by script, so content shows if it fails. Reveal once.

## Sources

- WCAG 2.2 (2.2.2, 2.3.1, 2.3.3 / C39): https://www.w3.org/TR/WCAG22/
- Vercel Web Interface Guidelines (transform and opacity; reduced-motion variant): https://vercel.com/design/guidelines
- idea: effects only where the business fits — Leonxlnx/taste-skill
- One-ambient limit, recipes: house default
