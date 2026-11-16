# Changelog

## 0.1.1 — 2026-11-16

A restyle keeps what the product already is.

- `playbooks/existing.md`: new "Identity first" section. At Look, the shipped heading face, brand and background colours and key-screen alignment become `lock:` lines. A lock changes only when the user asks or a must fails; "consistency with another page" is no reason; changes the user can't see are left alone; locks are checked against r0 before hand-off.
- `library/foundations/type.md`: in a restyle, headings keep the shipped display face; size, weight and spacing only.
- `library/foundations/layout.md`: alignment by screen type. Single-action short screens centre a narrow column; reading and scanning screens align left.
- `SKILL.md`: restyle points to Identity first; version 0.1.1 (also in `capture.mjs` audit output).
- Tests: per-file caps raised for `existing.md` (4.5 KB), `type.md` and `layout.md` (3.5 KB).

## 0.1.0 — 2026-11-14

First release.

- `SKILL.md` router: ten jobs, a look → plan → make → prove loop, five gates (truth, plan, wiring, proof, honest report), a floor of rule ids, and a problem → file map.
- Playbooks: create, existing (restyle, repair, extend), port, system, rounds, review.
- Library: type, colour, layout, motion; states, forms and dialogs, workspaces, components, pages, effects, game scenes; Hangul type and Korean UX copy.
- Checks: 41 rules with tier, method, threshold and source (`checks/rules.md`, parsed at runtime); 17 AI-default tells with a cleanup order; invented Korean worst-case data.
- Templates: plan, ledger, DESIGN.md, review brief, fix plan.
- Scripts (Node 20+, zero dependencies, Playwright optional): `capture.mjs` with 23 in-page checks, waivers and a contact sheet; `board.mjs` for options and before/after pairs with a verdict line; `wiring.mjs` diff; `contrast.mjs`.
- Example: `examples/settings-ko`, a Korean settings page before and after one round (must 18 → 0 on phone, 0 wiring loss).
- Tests: 31 `node --test` cases; browser cases run when `HELPME_PLAYWRIGHT` is set.

## Next

- Static wiring scan from source files, not only rendered pages.
- Colour sampler for text over images and gradients (today `CONTRAST-UNKNOWN`).
- Measured focus-ring check (`FOCUS-VISIBLE`).
- Hangul line-break checks beyond `keep-all` (orphaned particles, broken numbers and units).
- Eval briefs: 6–8 product screens, Korean included, scored by the audit and a review rubric, kept out of the shipped folder.
- Run the `design.md` linter on `templates/DESIGN.md` in CI.
