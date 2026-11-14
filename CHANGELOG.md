# Changelog

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
