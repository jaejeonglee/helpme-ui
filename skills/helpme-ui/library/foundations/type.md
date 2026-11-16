# Type

Use when choosing fonts, sizes, weights or number styles, or when text looks flat, crowded, or jumps as fonts load.

## Families
- One family; add a second only for a separate job (code, IDs). `FONT-COUNT` flags more than two (house default).
- Korean UI: a Hangul-capable family first, see [Hangul type](../korean/hangul-type.md).
- UI weights 400, 500/600, 700. Skip Ultralight, Thin and Light for UI text (Apple HIG).
- Restyle: headings keep the product's shipped display face; adjust size, weight and spacing only. Changing the face is the user's decision, kept as a `lock:` ([existing](../../playbooks/existing.md#identity-first)) (house default).

## Weight and color before size
- Quiet secondary text (muted color, 400) before enlarging the heading (Refactoring UI).
- Fix the scale up front; pick sizes from it, never by eye (Refactoring UI). 3-4 sizes per screen (house default).
- Line height shrinks as size grows (Refactoring UI): headings 1.2-1.3 (house default), body per `LEADING-BODY`.
- Floors live in [rules](../../checks/rules.md): `TEXT-MIN`, `INPUT-ZOOM`, `LEADING-BODY`, `LINE-LENGTH`.

## Reference scales (size/line height)
| M3 role, px | large | medium | small |
|---|---|---|---|
| Display | 57/64 | 45/52 | 36/44 |
| Headline | 32/40 | 28/36 | 24/32 |
| Title | 22/28 | 16/24 | 14/20 |
| Body | 16/24 | 14/20 | 12/16 |
| Label | 14/20 | 12/16 | 11/16 |

Buttons use Label large. Apple Dynamic Type at Large, pt: Large Title 34/41 · Title 1 28/34 · Title 2 22/28 · Title 3 20/25 · Headline 17/22 semibold · Body 17/22 · Callout 16/21 · Subheadline 15/20 · Footnote 13/18 · Caption 1 12/16 · Caption 2 11/13.

## Numbers
```css
td.num, .price, .kpi, .timer { font-variant-numeric: tabular-nums; }
```
- No-break space before units: `12&nbsp;GB` (Vercel). Korean units attach: `27,900원`.

## Font loading
```html
<link rel="preload" href="/fonts/ui-var.woff2" as="font" type="font/woff2" crossorigin>
```
```css
@font-face { font-family: "UI"; src: url(/fonts/ui-var.woff2) format("woff2");
  font-weight: 100 900; font-display: swap; }
@font-face { font-family: "UI Fallback"; src: local("Arial");
  size-adjust: 104%; ascent-override: 92%; descent-override: 24%; } /* measure yours */
body { font-family: "UI", "UI Fallback", system-ui, sans-serif; }
```
- Preload only what the first screen needs; `crossorigin` is required even same-origin.
- `swap` for brand text; `optional` where a late swap would move layout.
- Metric overrides give the fallback the same box, so the swap doesn't shift content.
- Capture waits for `document.fonts.ready`; a hand-made shot without it shows the fallback.

## Sources
- Material Design 3, type scale: https://m3.material.io
- Apple HIG, Typography: https://developer.apple.com/design/human-interface-guidelines/
- Refactoring UI: https://www.refactoringui.com
- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
- WCAG 2.2, 1.4.8 Visual Presentation: https://www.w3.org/TR/WCAG22/
- House default: family count, sizes per screen, heading line height, font loading.
- House default, restyle heading face: it is the type users recognise the product by.
