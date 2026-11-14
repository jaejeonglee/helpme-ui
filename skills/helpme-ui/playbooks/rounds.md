# Feedback rounds

Use when the user reacts to a built screen ("좀 답답해요", "버튼이 너무 커요") and the work continues round by round.

## Log first, then edit
Each comment becomes a line in `.helpme/ledger.md` ([template](../templates/ledger.md)) before any code changes:
```
r2 · "카드가 너무 붙어 있어요" → 주문 카드 목록 → gap → 8px → 16px → shots/r2/orders@phone.png
```
Quote verbatim → element → one property → from → to → evidence. A comment touching three properties is three lines. The evidence file is the after shot.
The user edited code themselves → read the diff and log it the same way, quote `(user edit)`; it counts as feedback.

## Locks
What the user approved stays put:
```
lock: 홈 잔액 · font-size = 34px — "이 크기 좋아요" r1
```
Before editing an element, search the ledger for its locks. A request that breaks a lock → ask, quoting the lock.

## Vague feeling → probes
"뭔가 촌스러워요" names no property. Build 2-3 probes, each changing exactly one property, and let the board decide:

| Probe | Property | Change |
|---|---|---|
| A | spacing | section gap 16 → 24 |
| B | type | heading weight 700 → 600 |
| C | colour | card borders → background tint |

- Same data, same viewport, same state in every probe; only the one property moves.
- Add the current screen as one more card when "no change" may win.
- Title each by its change (`<title>B · 제목 굵기 600</title>`), then `node $S/scripts/board.mjs .helpme/options/r3 --title r3`.

The kept probe becomes a round line; the rest are noted as rejected.

## Before/after board
Capture each round with the same `--name` (default out is the next `rN`) and pair it with the last:
```
node $S/scripts/capture.mjs http://localhost:3000/orders --name orders
node $S/scripts/board.mjs --before .helpme/shots/r1 --after .helpme/shots/r2 --title r2
```
Send the board. The user's `helpme-verdict ...` line goes into the ledger as is.

## Limits
- ≤3 rounds unattended, then stop and report.
- Same top finding twice (same rule id or same quote in two rounds) → stop patching and re-plan: the bet is wrong. New bet via [create](create.md).
- Same kind of correction twice → propose a `rule:` line ([system](system.md)).
- Each round still passes the Proof gate; unrun checks are "not verified".

## Sources
- idea: corrections turned into rules — emilkowalski/skills learn-taste
- idea: ledger of past deliveries — alchaincyf/huashu-design
- idea: decision log stamped with the build — Nutlope/hallmark
- Refactoring UI (weight and colour before size) — https://www.refactoringui.com
- house default: round line format, locks, one-property probes, 3-round limit
