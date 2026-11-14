# Create a new screen or app

Use when building a page, flow or app that does not exist yet. Shipped screens → [existing](existing.md); prototypes → [port](port.md).

## 1. Brief
Top of `.helpme/plan.md` ([template](../templates/plan.md)). Ask once (≤3 questions, defaults); unattended → log assumptions.
- Who, on what device, doing which job. One main action per screen (`ONE-JOB`).
- Truth gate: name the source of truth before the first visual edit. Host design system > DESIGN.md > tokens > components > this skill. Apps in Toss non-game mini-app → TDS.
- Real content (longest name, empty case); register 해요 or 합니다 (DESIGN.md `x-helpme`).

## 2. Keep conventions (Jakob), differ on purpose
| Keep | Room to differ |
|---|---|
| nav and back placement, tab bar, form order, platform controls, dialog 닫기 | signature, type pairing, density, empty and success moments, motion character |

## 3. Ideas come from the product's nouns
List 5-10 nouns it handles: 영수증, 좌석, 송장, 계좌. One shapes the signature, a bold element no rival's screen has (`SIGNATURE`): 가계부 → today's total as a receipt strip. A gradient is not a signature.

## 4. Stances by product kind
Starting points; colours come from brand assets or DESIGN.md, never the kind.

| Kind | Density | Type leads with | Motion |
|---|---|---|---|
| Ops / admin | high, tables | numbers, `tabular-nums` | near none |
| Money | one figure per screen | the amount (₩, 만/억) | confirm only |
| Commerce / booking | medium | price, option, stock | add feedback |
| Content / community | reading measure | body text | none in reading |
| Landing / brand | low | headline | ≤1 ambient |
| Game | HUD over field | short labels, scores | rich, skippable |

## 5. Plan (Plan gate, in plan.md)
1. Bet: "optimizes X, gives up Y" (optimizes 주문 200건 훑기, gives up 첫 방문 친절함).
2. Signature: one element, from a noun.
3. Tokens: type, spacing, colour roles, radius.
4. Screens, each with job and main action.
5. State sheet `state · trigger · shows · way forward · how to force` ([states](../library/patterns/states.md)).
6. ASCII at phone and desktop.
7. Two rejected bets, one line each with why.

Twin-brief test: write the nearest rival's brief in one line; rework any item that would fit it unchanged. User present → wait for OK; absent → proceed, log it.

## 6. Options (direction open)
Rank the screen's jobs. For the top job build 2-3 bets as standalone HTML, each in its main state and its hardest state (longest data, empty or error):
```html
<title>B · 영수증 띠</title>
<meta name="helpme-bet" content="optimizes 오늘 쓴 돈 한눈에">
<meta name="helpme-gives-up" content="카테고리 탐색">
```
`node $S/scripts/board.mjs .helpme/options/ --title home` → user returns `helpme-verdict board="home" keep=B drop=A,C notes="..."`. Fold notes into the plan.

## 7. Make, then prove
Tokens → project components → real and worst-case data ([stress-ko](../checks/stress-ko.json)).
```
node $S/scripts/capture.mjs http://localhost:3000/ --scheme both --name home
node $S/scripts/capture.mjs http://localhost:3000/ --query state=empty --name home-empty
```
Proof gate: phone + desktop (+ dark), 0 must, shoulds fixed or `waive:`d, a `seen:` line per viewport after opening the PNG, Korean stress pass (`--stress text-spacing` + stress data). Unrun = "not verified".

## Sources
- Laws of UX (Jakob, Von Restorff) — https://lawsofux.com
- Apps in Toss UI/UX guide — https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md
- idea: product nouns, plan checked against the brief — anthropics/skills frontend-design
- idea: product kind sets the start — nextlevelbuilder/ui-ux-pro-max-skill, Leonxlnx/taste-skill
- house default: stances, state sheet columns, twin-brief test, options board
