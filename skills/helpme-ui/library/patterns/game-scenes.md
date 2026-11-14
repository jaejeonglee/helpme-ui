# Game scenes

Use when building or reviewing a game screen, mini-game or playful scene (canvas, WebGL or DOM).

## Portrait phone layout

```
+-----------------------+
| ||   12,340    <3<3<3 |  HUD: top band, inside safe area
|                       |
|        FIELD          |  play area: no UI over the action
|                       |
|-----------------------|
|  [<]  [>]      (A)    |  thumb zone: bottom third
+-----------------------+
```
- HUD: `padding: env(safe-area-inset-top)`; score in `tabular-nums` so it doesn't jitter; text on a plate or shadow to meet `CONTRAST-TEXT` over moving art.
- Pause: always visible, away from the main control; meets `TARGET-TOUCH`.
- Thumb zone: controls above the home-indicator gesture strip, both thumbs reachable.
- Swipe or drag input gets a tap path where the game allows (`DRAG-ALT`).

## Scenes and states

| scene | shows | way forward |
|---|---|---|
| title | name, best score, sound, settings | 시작하기 |
| playing | field + HUD only | pause |
| paused | dimmed field, resume, restart, sound, quit | 계속하기 |
| result | score, best, what improved | 다시 하기 |
| error | what failed (asset, save) | 다시 시도 |
| offline | playable? play and queue the score; else say so | auto-retry |

- Auto-pause on `visibilitychange` and window blur.
- Reduced motion: no screen shake or zoom punch (`REDUCED-MOTION`). No flashing: [effects](effects.md).

## Deterministic scene hook

Dev builds expose a seed and a jump, so captures repeat exactly:

```js
if (import.meta.env.DEV) window.__helpme = {
  seed: 42,
  async goto(scene) {           // 'title' | 'playing' | 'paused' | 'result' | 'error' | 'offline'
    rng.reset(this.seed);       // same enemies, same layout every run
    await game.load(scene);     // first frame drawn, loop stopped
  },
};
```

A capture hook calls it, one per scene:

```js
// hooks/result.mjs  (page = the Playwright page)
export default async (page) => page.evaluate(() => window.__helpme.goto('result'));
```
```
node $S/scripts/capture.mjs http://localhost:5173 --vp phone --hook result=hooks/result.mjs
```

## Sources

- Apple HIG, control size: https://developer.apple.com/design/human-interface-guidelines/
- WCAG 2.2 (2.5.7 dragging, 2.3.1 flashes, 2.3.3 / C39): https://www.w3.org/TR/WCAG22/
- Layout zones, scene list, `__helpme` hook: house default
