# Design system file and page sets

Use when writing or updating DESIGN.md, bringing a set of pages into line, or splitting multi-page work across agents.

## DESIGN.md
Copy [the template](../templates/DESIGN.md) to the repo root. Format: google-labs-code design.md, YAML tokens (`colors`, `typography`, `rounded`, `spacing`, `components` with refs like `"{colors.primary}"`) then prose sections in fixed order. helpme-ui adds one block:
```yaml
x-helpme:
  register: haeyo          # haeyo | hamnida, one per surface (KO-REGISTER-MIX)
  density: comfortable     # compact | comfortable | spacious
  motion: subtle           # none | subtle | expressive
  host: none               # none | apps-in-toss | <host system>
  platforms: [web-mobile, web-desktop]
  locale: ko-KR
```
- Values come from assets: logo SVG, shipped CSS, brand guide. Never from memory.
- Host design system present → DESIGN.md records its tokens, never overrides them.
- Lint: `npx -y @google/design.md@0.4.0 lint DESIGN.md`, 0 errors. Offline → report "lint not verified".

## Conflict table
Census first: capture every page; census.json counts the sizes, colours, radii and gaps in use. Decide in plan.md:

| Token | In use (count) | Chosen | Why |
|---|---|---|---|
| body size | 14 (31), 15 (12), 16 (40) | 16 | most used, avoids `INPUT-ZOOM` |
| gray text | #999 (9), #6b7280 (22) | #6b7280 | #999 fails `CONTRAST-TEXT` |

Losing values become `DRIFT` findings to migrate.

## Page map
Group pages by type; each type gets one locked reference page.
```
type       reference (locked)   followers
list       /orders              /refunds /coupons
detail     /orders/:id          /refunds/:id
form       /settings/profile    /settings/address
dashboard  /home                -
```
Ledger: `lock: /orders · layout = list reference — user OK 11/14`. Followers match their reference; changing a reference needs the user.

## DRIFT
`DRIFT` (polish) flags values off the DESIGN.md tokens. Capture all pages in one run, fix type by type, reference page first:
```
node $S/scripts/capture.mjs http://localhost:3000/orders http://localhost:3000/refunds --out .helpme/shots/r3
```

## Agent split (more than 3 pages)
- One agent owns DESIGN.md and token files; nobody else edits them.
- Page agents get DESIGN.md, the reference page's shots, ledger locks and their page list. They send token requests instead of adding tokens.
- Merge order: tokens → reference pages → followers. One capture over every page at the end.

## Corrections become rules
The same correction twice (two rounds or two pages) → propose a ledger rule and ask:
`rule: 금액 숫자는 tabular-nums — from r1, r3 · approved no`
On yes: add it to DESIGN.md Do's and Don'ts and set `approved yes`. Unapproved rules are never applied.

## Sources
- design.md format and `lint` — https://github.com/google-labs-code/design.md
- Apps in Toss UI/UX guide (해요체) — https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md
- idea: project context written once — pbakaus/impeccable
- idea: master file plus per-page overrides — nextlevelbuilder/ui-ux-pro-max-skill
- idea: density and motion stored as settings — Leonxlnx/taste-skill
- idea: corrections turned into rules — emilkowalski/skills learn-taste
- house default: `x-helpme` keys, page map, agent split
