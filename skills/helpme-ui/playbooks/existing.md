# Change a shipped product

Use when restyling, repairing or extending a screen that already ships. No predecessor → [create](create.md); prototype → [port](port.md).

## Pick the job
| Job | May change | Must keep |
|---|---|---|
| restyle | tokens, spacing, type, colour roles, layout inside a screen, copy register | routes, links, form and field names, handlers, heading outline, aria labels, analytics hooks |
| repair | the broken flow or state and its copy | everything off the repro path |
| extend | the new feature's screens | existing tokens, components, nav order, neighbours' look |

Two fit → the smaller job, said aloud ("이건 restyle이 아니라 repair예요").

## Truth first
Name the source of truth in plan.md before the first visual edit: host design system > DESIGN.md > tokens > components > this skill. Read the tokens file and two shipped screens first.

## Before set
Capture what ships now, before touching code:
```
node $S/scripts/capture.mjs http://localhost:5173/settings --name settings --out .helpme/shots/r0
```
r0 keeps PNGs, audit.json and wiring.json (links, forms, fields, buttons, headings, aria, handlers). Every later round compares with it.

## Conflict rows
Sources disagree → a row in plan.md, never a silent pick:
```
conflict · where · A says · B says · decision · by
conflict · 저장 버튼 · TDS: 하단 고정 버튼 · 코드: 우상단 텍스트 · TDS · user 11/14
```
The higher source wins unless the user decides otherwise.

## Restyle
Plan gate applies ([create](create.md) §5). Tokens first, then components, then screens. No one-off values on a single screen (`SCALE-OFF`, `DRIFT`).

## Repair = hook repro → fix → replay
1. A hook drives the page into the broken state; its default export gets `(page, info)` and runs before the shot:
   ```js
   // .helpme/hooks/save.mjs
   export default async (page) => {
     await page.fill('#nickname', '가'.repeat(40));
     await page.click('text=저장');
   };
   ```
2. `capture.mjs <url> --hook save=.helpme/hooks/save.mjs --name settings` — the PNG must show the bug. No repro → no fix; say so.
3. Fix the smallest cause.
4. Replay the same command. Same file name (`settings@phone~save.png`), so `board.mjs --before .helpme/shots/r1 --after .helpme/shots/r2` pairs them.

## Extend = two in-repo exemplars
Find two shipped screens solving a similar job (filtered list, validated form). Reuse their structure, tokens and components; write both paths in plan.md. A pattern with no exemplar gets a plan and options ([create](create.md) §6).

## Wiring gate
```
node $S/scripts/wiring.mjs diff .helpme/shots/r0/wiring.json .helpme/shots/r2/wiring.json
```
Unallowed loss exits 1 (`WIRING-LOSS`). A planned loss needs a ledger line first: `allow-loss: field:fax — 팩스 입력 폐지, 11/14 확정`. Read the likely renames; don't wave them through.

## Proof
Proof gate as in [create](create.md): phone + desktop (+ dark), 0 must, shoulds fixed or waived, `seen:` per viewport, Korean stress pass. Show the user the before/after board, not a description.

## Sources
- WCAG 2.2 — https://www.w3.org/TR/WCAG22/
- idea: redesign records links, fields, handlers, headings and fails on loss — Nutlope/hallmark
- idea: worst-case data to break a screen — emilkowalski/skills break-ui
- house default: may-change/must-keep table, conflict rows, hook repro, two exemplars
