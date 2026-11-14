# Color

Use when building or fixing a palette, adding dark mode, matching a brand, or when contrast or emphasis looks off.

## Roles, not hues
Components use role tokens only.

| Role | Job |
|---|---|
| `surface`, `surface-2`, `surface-3` | page, raised panel, popover |
| `text`, `text-muted` | body, secondary |
| `border`, `border-strong` | dividers; input and control edges |
| `accent`, `on-accent` | main action, selection, links; text on it |
| `danger`, `success`, `warning` | status, always with icon or word |
| `focus` | focus ring |

- One accent per view: main action and selection (Von Restorff, Laws of UX).
- Hierarchy from `text` vs `text-muted`, not more hues. On a colored fill use a tint of its hue, not grey (Refactoring UI).

## Shade ramps
- Ramp each hue before styling screens (Refactoring UI): 50-900, 9-10 steps (house default).
- Build in OKLCH for even lightness; tint greys toward the brand (house default).
- States: a neighbour step, or an M3 state layer (opacity hover .08, focus .12, pressed .12, dragged .16).

## Brand values
From supplied assets (logo SVG, brand guide, DESIGN.md) or the live product's computed styles; never from memory.
```js
getComputedStyle(document.querySelector("header a.cta")).backgroundColor
```
Ledger: `lock: header CTA · background = #2457d6 — computed style`.

## Check pairs
```
node $S/scripts/contrast.mjs '#5f6672' '#f4f5f7'   # ratio; exit 1 on AA fail
```
- Text on each surface it sits on: `CONTRAST-TEXT`, `CONTRAST-LARGE`.
- Input borders, icons, focus rings, chart marks: `NONTEXT-CONTRAST`; decoration is exempt.
- Errors, status, required marks, prose links add an icon, word or underline: `COLOR-ONLY`.

## Dark theme: re-derive, don't invert
```css
:root { color-scheme: light dark;
  --surface:#fff; --surface-2:#f4f5f7; --text:#1b1d22; --text-muted:#5f6672;
  --border-strong:#808894; --accent:#2457d6; --on-accent:#fff; --danger:#c62828; }
@media (prefers-color-scheme: dark) { :root {
  --surface:#121418; --surface-2:#1b1e24; --text:#e8eaed; --text-muted:#a3aab5;
  --border-strong:#6b7380; --accent:#7aa2f7; --on-accent:#0b1020; --danger:#f28b82; } }
```
Example values (house default); every pair passes AA on both surfaces.
- Raised surfaces get lighter, not shadowed; no pure black page or pure white text.
- Accents lose chroma, gain lightness; text on them flips dark.
- `color-scheme` restyles form controls and scrollbars.
- Re-check pairs: capture `--scheme both`. Add a stronger set under `prefers-contrast: more` (Apple: Increase Contrast).

## Sources
- WCAG 2.2, 1.4.1, 1.4.3, 1.4.11: https://www.w3.org/TR/WCAG22/
- Apple HIG, Color: https://developer.apple.com/design/human-interface-guidelines/
- Material Design 3, state layers: https://m3.material.io
- Refactoring UI: https://www.refactoringui.com
- Laws of UX: https://lawsofux.com
- idea: brand values from assets, never memory — alchaincyf/huashu-design; Nutlope/hallmark
- House default: ramp size, OKLCH, tinted greys, dark-theme details.
