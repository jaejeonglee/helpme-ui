# Review a UI

Use when asked to review, audit or 검수 a screen without editing it, or to check your own work before hand-off.

## Order
1. Capture: phone + desktop, both schemes, every state you can force.
   ```
   node $S/scripts/capture.mjs http://localhost:3000/settings --scheme both --name settings
   node $S/scripts/capture.mjs http://localhost:3000/settings --query state=error --name settings-error
   ```
   Exit 3 → paste `scripts/lib/audit-page.js` into any browser tool and call `helpmeAudit()`; else ask for screenshots labelled screen + device.
2. Contact sheet: open `contact.png` before any single shot. Squint: one focal point and one main action per screen (`ONE-JOB`)?
3. NN/g heuristics: one pass per heuristic over each main flow. Start with status (1, `LATENCY`), users' words (2), undo and exit (3), error recovery (9).
4. AI defaults: walk [ai-defaults](../checks/ai-defaults.md) in its cleanup order; "already good" is a valid result.
5. Korean: [hangul-type](../library/korean/hangul-type.md), [ux-copy](../library/korean/ux-copy.md); `KO-*` ids; capture with stress data and `--stress text-spacing`.
6. States: every row of the state sheet forced and seen ([states](../library/patterns/states.md)); missing rows → `STATES`.

Measured ids come from audit.json; review ids (`ONE-JOB`, `STATES`, `FOCUS-OBSCURED`, `DRAG-ALT`) cite a screen and an element. Tiers and thresholds: [rules](../checks/rules.md).

## Finding lines
`[tier] ID · screen@vp · selector · measured → target · fix · file:line`
```
[must] CONTRAST-TEXT · settings@phone · .hint · 2.85:1 → AA · #999 → var(--text-2) · src/Settings.css:42
[must] OVERFLOW-X · settings@phone · table.wide · 700px wide → fits · scroll inside .card · src/Settings.vue:88
[should] KO-WRAP · settings@phone · .notice · word-break normal → keep-all · add pair · src/base.css:12
[should] KO-REGISTER-MIX · settings@desktop · footer · 합니다 in 해요 surface → 해요 · 저장했어요 · src/i18n/ko.json:31
```
Sort must → should → polish; put the top three first. Waived ids stay listed with their `waive:` line.

## Verdict
| Verdict | When |
|---|---|
| ship | 0 must; shoulds fixed or waived |
| patch | findings fixable inside the current bet and structure |
| rethink | top findings come from structure: `ONE-JOB` fails, the bet does not serve the job, or the same top finding came back after a fix |

## Fresh eyes
The maker sees what it meant, not what it made. If subagents exist, hand one a filled [review-brief](../templates/review-brief.md): PNG paths, contact sheet, the brief, the bet. No code, no diff, no plan reasoning. Merge its findings with yours, dedupe by id + element, and keep its disagreements visible. No subagent → label the report "self-review".

## Read-only
Review edits nothing. Each must/should cluster becomes one [fix-plan](../templates/fix-plan.md) that another agent or a fresh session can run without this conversation.

## Report
Verdict · top findings · fix-plan paths · waivers · "not verified" for every viewport, scheme or state not captured.

## Sources
- NN/g, 10 usability heuristics — https://www.nngroup.com/articles/ten-usability-heuristics/
- NN/g, response time limits — https://www.nngroup.com/articles/response-times-3-important-limits/
- WCAG 2.2 — https://www.w3.org/TR/WCAG22/
- idea: read-only review that writes plans for another agent — ibelick/ui-skills improve-ui
- idea: fresh-context reviewer — Nutlope/hallmark
- idea: terse `file:line` findings — vercel-labs/web-interface-guidelines
- idea: "already good" as an outcome — heydamir/unslop
- house default: review order, verdict table
