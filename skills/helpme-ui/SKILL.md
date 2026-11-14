---
name: helpme-ui
description: "Designs, fixes and reviews user interfaces, then proves the result with screenshots and measured checks. Covers web and app screens, dashboards, forms and dialogs, components, landing pages and game scenes. Use it to create a UI; restyle, repair or extend an existing product without losing its links and fields; port a prototype into project components; write a DESIGN.md; run feedback rounds with before/after; or audit UX and accessibility. Korean-ready (Hangul type, UX copy). Triggers include 화면 디자인, 시안, UI 개선, 리디자인, 디자인 검수. Not for logic-only work or edits whose exact change is already given."
license: MIT
compatibility: "Node.js 20+ for scripts; Playwright optional for screenshots. No network calls besides captured pages."
metadata:
  version: "0.1.0"
---

# helpme-ui

Design judgment plus proof. Decide what the screen is for, build it from the project's own parts, then capture it at phone and desktop size and measure it against sourced rules before calling it done.
Built for products that already exist: keep their links, fields and handlers; change only what the job needs.
`$S` below is this skill's folder. Read only the files the job needs.

## Jobs

Pick by the signal. Two fit → take the smaller one and say so.

| Job | Signal | Pause for | Then read |
|---|---|---|---|
| fix | the exact change is named ("make the button blue") | nothing | do it; one capture if pixels change |
| review | 검수, audit, "what's wrong", no edits wanted | nothing | [review](playbooks/review.md) |
| create | new page, flow or app | plan OK | [create](playbooks/create.md) |
| restyle | new look for a shipped screen | plan OK | [existing](playbooks/existing.md) |
| repair | broken flow, layout or state | repro | [existing](playbooks/existing.md) |
| extend | new feature inside a shipped UI | new pattern → plan | [existing](playbooks/existing.md) |
| port | prototype, export or screenshot → real code | part map | [port](playbooks/port.md) |
| system | DESIGN.md, tokens, a set of pages | tokens OK | [system](playbooks/system.md) |
| round | user reacts to built work ("좀 답답해요") | nothing | [rounds](playbooks/rounds.md) |
| component | one control, card or row | nothing | [components](library/patterns/components.md) |

## Loop

1. **Look.** Read the code, the source of truth, the real content, and capture the current screen before touching it.
2. **Plan.** Write `.helpme/plan.md` ([template](templates/plan.md)): bet, signature, tokens, screens, state sheet, ASCII.
3. **Make.** Tokens first, then the project's own components, then real and worst-case data ([stress-ko](checks/stress-ko.json)).
4. **Prove.** Capture, open the contact sheet, fix, capture again. At most 3 rounds unattended, then report.

## Gates

Log each gate in `.helpme/plan.md` as it passes.

- **Truth** (all jobs but fix). Name the source of truth before the first visual edit. Order: host design system > DESIGN.md > tokens > components > this skill. Apps in Toss non-game mini-apps use TDS.
- **Plan** (create, restyle, system). The bet reads "optimizes X, gives up Y". Twin-brief test: write the nearest rival's brief; rework anything that would fit it unchanged. State sheet, ASCII at phone and desktop. Wait for the user's OK when one is present.
- **Wiring** (restyle, repair, extend, port). Capture before and after, then `wiring.mjs diff`. No lost link, field, form, handler, heading or label unless the ledger has `allow-loss:` with a reason (`WIRING-LOSS`).
- **Proof** (any pixel change). Phone + desktop (+ dark if the product has it). 0 must; every should fixed or waived; one `seen:` line per viewport written after opening the PNG; Korean stress pass (stress data + `--stress text-spacing`).
- **Honest report.** Anything not run is "not verified". Never say "looks fine" about a screenshot you did not open.

## Floor

Every screen meets these; ids and thresholds live in [rules](checks/rules.md).
`ONE-JOB` · `STATES` · `CONTRAST-*` · `NONTEXT-CONTRAST` · `COLOR-ONLY` · `TARGET-*` · `SCALE-OFF` · `FONT-COUNT` · `TEXT-MIN` · `LEADING-BODY` · `INPUT-ZOOM` · `FOCUS-*` · `REDUCED-MOTION` · `AUTO-MOTION` · `OVERFLOW-X` · `ZOOM-LOCK` · `KO-*` · `SIGNATURE` (one bold element drawn from the product's own nouns).
Use real content with its worst cases: the longest name, zero items, the 1.2조 amount, the error.

## Where to look

| Problem | File |
|---|---|
| new screen, bets, options board | [create](playbooks/create.md) |
| change a shipped screen safely | [existing](playbooks/existing.md) |
| prototype → project components | [port](playbooks/port.md) |
| DESIGN.md, page sets, drift, agent split | [system](playbooks/system.md) |
| feedback rounds, locks, vague feelings | [rounds](playbooks/rounds.md) |
| audit, verdict, fix plans | [review](playbooks/review.md) |
| fonts, sizes, weights, numbers | [type](library/foundations/type.md) |
| palette, dark mode, brand colour | [color](library/foundations/color.md) |
| spacing, breakpoints, safe areas | [layout](library/foundations/layout.md) |
| animation, loading, latency | [motion](library/foundations/motion.md) |
| empty, error, offline, stale | [states](library/patterns/states.md) |
| inputs, validation, IME, dialogs | [forms-dialogs](library/patterns/forms-dialogs.md) |
| dashboards, tables, admin | [workspaces](library/patterns/workspaces.md) |
| one component, cards, containers | [components](library/patterns/components.md) |
| landing, pricing, sign-up | [pages](library/patterns/pages.md) |
| texture, glow, scroll effects | [effects](library/patterns/effects.md) |
| games and playful scenes | [game-scenes](library/patterns/game-scenes.md) |
| Korean fonts, wrapping, ₩, 억 | [hangul-type](library/korean/hangul-type.md) |
| Korean labels, buttons, errors | [ux-copy](library/korean/ux-copy.md) |
| generated look, cleanup order | [ai-defaults](checks/ai-defaults.md) |
| ids, tiers, thresholds, waivers | [rules](checks/rules.md) |
| worst-case Korean data | [stress-ko](checks/stress-ko.json) |
| plan, ledger, DESIGN.md, review brief, fix plan | [plan](templates/plan.md) · [ledger](templates/ledger.md) · [DESIGN](templates/DESIGN.md) · [review-brief](templates/review-brief.md) · [fix-plan](templates/fix-plan.md) |

## Proof kit

Zero dependencies. Screenshots need Playwright (the project's, or `HELPME_PLAYWRIGHT=/path/to/node_modules/playwright`).

```
node $S/scripts/capture.mjs <url|file|dir>... [--vp phone,desktop] [--scheme both] [--full-page]
     [--query state=empty] [--hook open=hook.mjs] [--stress text-spacing] [--name settings] [--fail-on must]
node $S/scripts/board.mjs .helpme/options/ --title home          # cards A, B, C side by side
node $S/scripts/board.mjs --before .helpme/shots/r1 --after .helpme/shots/r2   # slider pairs
node $S/scripts/wiring.mjs diff .helpme/shots/r1 .helpme/shots/r2
node $S/scripts/contrast.mjs '#767676' '#fff'
```

- capture writes `<name>@<vp>[~dark][~hook].png`, `audit.json`, `wiring.json`, `census.json` and `contact.png` to `.helpme/shots/r<next>/`. Viewports: phone 360×800, tablet 768×1024, desktop 1280×800, wide 1440×900, reflow 320×256, or `WxH`.
- Exit codes: 0 clean · 1 findings at or above `--fail-on` · 2 usage · 3 environment.
- Exit 3: run `capture.mjs --doctor`, then install Playwright in the project or set the variable. No Node browser → paste `scripts/lib/audit-page.js` into any browser tool and call `helpmeAudit()`. Nothing works → ask for labelled screenshots (`settings@phone.png`) and mark measured checks "not verified".
- The board returns one line from the user: `helpme-verdict board="home" keep=B drop=A,C notes="..."`.

## Workspace

The skill writes only `.helpme/` in the project: `plan.md`, `ledger.md` (locks, waivers, allowed losses, rounds, assets, learned rules), `shots/rN/`, `board/`, `options/`, `hooks/`, and a `.gitignore` listing `shots/` and `board/`. Tools read `waive:` and `allow-loss:` lines from the ledger.

## Asking

Ask once, at most 3 questions, each with a default ("Register: 해요 unless you say 합니다"). Unattended → take the defaults and log them as assumptions in the plan.

## Hand-off

End every job with five lines: what changed · where to look (file, URL with query, PNG path) · what's left · waivers and allowed losses · "not verified" items.
