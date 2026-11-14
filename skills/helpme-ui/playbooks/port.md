# Port a prototype or screenshot

Use when a prototype (generated HTML, a design-tool export, an AI demo) or a screenshot must become real screens in this project.

## Recreate or port
| Input | Mode | Take | Never take |
|---|---|---|---|
| screenshot, image | recreate | layout, hierarchy, copy, measured colours and sizes | colours guessed by eye |
| prototype code | port | structure, states, copy, behaviour | its CSS, inline styles, libraries, markup |

Measure, don't guess. Live prototype: `getComputedStyle(el).color` in a browser tool. Image: read pixels through a canvas in a browser tool. Then test each text pair: `node $S/scripts/contrast.mjs '#8b95a1' '#ffffff'` (exit 1 = fails `CONTRAST-TEXT`).

## Map before writing
Truth gate first: the project's sources outrank the prototype. One row per visible part in plan.md:

| Part | Component or token | Gap | Decision |
|---|---|---|---|
| 상단 잔액 카드 | `Card` + `type.display` | none | use |
| 필터 칩 | none | no chip in repo | build from `Button` tokens; ask if shared |
| `#2f6fed` 버튼 | `color.primary` `#2457d6` | hue off | snap to token |
| 14.5px 본문 | `type.body` 15px | off scale | snap (`SCALE-OFF`) |

- Snap near values to tokens; list every snap.
- A real gap gets a new token only through DESIGN.md ([system](system.md)).
- States the prototype skips (empty, error, loading) come from the state sheet, not from imagination.

## Write it fresh
No pasted prototype code. Rebuild each part with project components and tokens; the prototype is a spec, not source. Copy text strings only, then fix register (`KO-REGISTER-MIX`).

## Prove side by side
Capture both under the same `--name`, then pair them:
```
node $S/scripts/capture.mjs proto/index.html --name home --out .helpme/shots/proto
node $S/scripts/capture.mjs http://localhost:3000/ --name home
node $S/scripts/board.mjs --before .helpme/shots/proto --after .helpme/shots/r1 --title port
```
Replacing a shipped screen → Wiring gate too ([existing](existing.md)). Proof gate as usual.

## Sources
- WCAG 2.2, 1.4.3 Contrast — https://www.w3.org/TR/WCAG22/
- idea: brand values from assets, never memory — alchaincyf/huashu-design, Nutlope/hallmark
- house default: recreate/port split, part map, no-paste rule
