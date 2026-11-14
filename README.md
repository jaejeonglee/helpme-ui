# helpme-ui

**UI design judgment and screenshot proof for coding agents, built for products that already exist. Korean-ready.**

helpme-ui is an [Agent Skill](https://agentskills.io): one short `SKILL.md` that routes the agent to the right playbook, a library of sourced design rules, and a few zero-dependency Node scripts that capture screens at phone and desktop size, measure them, and show before and after side by side.

![A helpme-ui board comparing a Korean settings page before and after one round. The slider splits the page: on the left the old page with grey hints and tiny icon buttons, on the right the new one with labelled fields, a seat meter and 44 px buttons. The card header reads "must 17 → 0 · should 37 → 0".](examples/settings-ko/shots/board/board@desktop~split.png)

<sub>The board above is a real output of this repo: [`examples/settings-ko`](examples/settings-ko), captured with `capture.mjs`, paired with `board.mjs`, then photographed by `capture.mjs` itself. Phone version: [`board@phone~split.png`](examples/settings-ko/shots/board/board@phone~split.png).</sub>

## Why

Coding agents can write a screen in seconds. Three things keep going wrong:

- **Look-alike output.** Left alone, agents converge on the same safe defaults: the same gradient, the same card grid, the same centred hero. helpme-ui makes the agent state a bet ("optimizes X, gives up Y") and rework anything that would fit a rival's brief unchanged.
- **Lost wiring.** A restyle that drops a form field, a link or an `onclick` looks fine in a screenshot and breaks the product. helpme-ui records every link, field, form, handler, heading and label before and after, and fails the diff on any loss you did not allow.
- **Unsourced numbers.** "Make the text bigger" and "add more contrast" are opinions until they are measured. Every threshold in helpme-ui cites WCAG 2.2, Apple HIG, Material 3, NN/g, Vercel's guidelines or KRDS, and anything the project decided on its own is labelled *house default*.

## Ten jobs

The skill picks one job from the request and reads only the files that job needs.

| Job | Signal | Reads |
|---|---|---|
| fix | the exact change is named | nothing extra; one capture if pixels change |
| review | "audit this", 검수, no edits wanted | `playbooks/review.md` |
| create | a new page, flow or app | `playbooks/create.md` |
| restyle | a new look for a shipped screen | `playbooks/existing.md` |
| repair | a broken flow, layout or state | `playbooks/existing.md` |
| extend | a feature inside a shipped UI | `playbooks/existing.md` |
| port | prototype or screenshot → real components | `playbooks/port.md` |
| system | DESIGN.md, tokens, a set of pages | `playbooks/system.md` |
| round | "좀 답답해요", feedback on built work | `playbooks/rounds.md` |
| component | one control, card or row | `library/patterns/components.md` |

## Loop and gates

**Look → plan → make → prove.** Capture the current screen before touching it, write `.helpme/plan.md`, build with the project's own tokens and components using real and worst-case data, then capture, look and fix (at most three rounds unattended).

| Gate | Applies to | Passes when |
|---|---|---|
| Truth | all but fix | the source of truth is named before the first visual edit: host design system > DESIGN.md > tokens > components > skill |
| Plan | create, restyle, system | a bet, a signature element from the product's own nouns, a state sheet, ASCII at phone and desktop, the twin-brief test |
| Wiring | restyle, repair, extend, port | `wiring.mjs diff` reports no loss without an `allow-loss:` line and a reason |
| Proof | any pixel change | phone + desktop (+ dark), 0 must findings, shoulds fixed or waived, a `seen:` line per viewport, Korean stress pass |
| Honest report | always | anything not run is reported as "not verified" |

Findings come out as one line each — `[tier] ID · screen@vp · selector · measured → target · fix · file:line` — and a review ends with a verdict: **ship**, **patch** or **rethink**.

## Proof kit

Node 20+ and nothing else. Screenshots use Playwright if the project has it (or `HELPME_PLAYWRIGHT=/path/to/node_modules/playwright`); helpme-ui never installs it for you.

```sh
S=~/.claude/skills/helpme-ui
node $S/scripts/capture.mjs before.html --name settings --vp phone,desktop --full-page
node $S/scripts/wiring.mjs diff .helpme/shots/r1 .helpme/shots/r2
node $S/scripts/board.mjs --before .helpme/shots/r1 --after .helpme/shots/r2
node $S/scripts/contrast.mjs '#999' '#fff'
```

This is the first part of what `capture.mjs` printed for the example's *before* page (exit code 1, because must findings exist):

```text
settings@phone               must 18 · should 41 · polish 15 · info 0
  [must] OVERFLOW-X · settings@phone · form > div.box > table · page 801 px wide at 360 px; ends at x=801 → ≤ 361 px
  [must] CONTRAST-TEXT · settings@phone · main > p.hint · 2.73:1 (#999999 on #fafafa, 13 px) → ≥ 4.5:1
  [must] CONTRAST-TEXT · settings@phone · main > form > button.save · 3.73:1 (#ffffff on #3d7eff, 14 px) → ≥ 4.5:1
  [must] CONTRAST-TEXT · settings@phone · main > div.box > button.danger · 3.91:1 (#e5484d on #ffffff, 13.33 px) → ≥ 4.5:1
  [must] TARGET-MIN · settings@phone · tr > td > button.icon · 20×20 px, neighbour within 24 px → ≥ 24×24 px or spaced
```

And for the *after* page, plus the wiring diff between them:

```text
settings@phone               must 0 · should 0 · polish 0 · info 0
settings@desktop             must 0 · should 0 · polish 0 · info 0

settings@phone: lost 0 · added 2
  added  aria:좌석 10개 중 7개 사용
  added  aria:주 메뉴
no unallowed losses
```

What each script does:

- **`capture.mjs`** — shoots `<name>@<vp>[~dark][~hook].png` at phone 360×800, tablet, desktop 1280×800, wide, reflow 320×256 or any `WxH`; light, dark or both; optional reduced motion, full page, `?state=` queries, a hook module that runs before the shot, and the WCAG 1.4.12 text-spacing stress. It writes `audit.json`, `wiring.json`, `census.json` and a `contact.png` contact sheet. Exit codes: 0 clean, 1 findings at or above `--fail-on`, 2 usage, 3 environment.
- **`lib/audit-page.js`** — 23 measured checks that run inside the page: horizontal overflow (naming the element that causes it), zoom lock, contrast with alpha compositing and no rounding, target size with the WCAG 2.5.8 spacing exception, clipped and truncated text, tiny text, iOS input zoom, body line height, Korean wrapping, positive tracking on Hangul, mixed 해요/합니다 endings, off-grid spacing, font count, colours outside your `:root` tokens, broken images, console errors and failed requests. No Playwright? Paste it into any browser tool and call `helpmeAudit()`.
- **`board.mjs`** — an offline page that shows options A, B, C in sandboxed iframes or before/after pairs with a slider, and returns one line to paste back: `helpme-verdict board="home" keep=B drop=A,C notes="..."`.
- **`wiring.mjs`** — lists what a change lost, added or likely renamed; exits 1 on any loss not allowed in `.helpme/ledger.md`.
- **`contrast.mjs`** — one WCAG AA check from the command line.

All 41 rules, with tier, method, threshold and source, live in one table: [`checks/rules.md`](skills/helpme-ui/checks/rules.md). The scripts parse that table at runtime, so the tiers you read are the tiers they enforce. Waive a finding with one line and a reason: `waive: OVERFLOW-X .wide — vendor table scrolls on purpose`.

## Korean-ready

- **Type** — Hangul-capable OFL fonts with system fallbacks, `lang="ko"`, `word-break: keep-all` with `overflow-wrap: break-word`, body line height ≥ 1.5, no positive tracking on Hangul.
- **Copy** — one register per surface (해요체 or 합니다체, checked on the rendered page), noun labels and status (연결 대상, 만료 7일 전), outcome buttons (저장, 삭제), dialogs dismissed with 닫기, errors that say what happened, why and what to do next.
- **Formats** — `Intl` for `2026. 11. 14.`, `₩27,900` and `1.2억`.
- **Input** — an IME guard so Enter does not submit mid-composition (`isComposing`).
- **Data** — [`stress-ko.json`](skills/helpme-ui/checks/stress-ko.json): long compounds with no spaces, long legal company names, addresses, amounts up to 1.2조, mixed scripts and blanks. All invented.
- **Hosts** — Apps in Toss non-game mini-apps use TDS as the source of truth.

## Install

With the `skills` CLI (Node ≥ 22.20, and a git or `gh` login for GitHub):

```sh
npx skills add jaejeonglee/helpme-ui --skill helpme-ui -g -a claude-code
```

Use `-a` to target another agent. Or copy the folder by hand:

```sh
git clone https://github.com/jaejeonglee/helpme-ui
cp -R helpme-ui/skills/helpme-ui ~/.claude/skills/
```

Only `skills/helpme-ui/` ships. In your project the skill writes only to `.helpme/` (plan, ledger, shots, boards); add `.helpme/shots` and `.helpme/board` to `.gitignore` if you do not want screenshots committed.

## Try it

- "Review the checkout page on phone and desktop and give me a verdict."
- "Restyle the settings page to match DESIGN.md without losing any fields or links."
- "Turn this prototype HTML into our React components and show me before and after."
- "이 설정 화면 검수해 주세요. 폰이랑 PC 둘 다요."
- "대시보드 시안 세 가지 만들어서 비교판으로 보여 주세요."
- "버튼이 너무 커 보여요. 좀 답답하기도 하고요." *(a feedback round)*

## Footprint

Measured with `wc -c` on this commit:

| What | Size |
|---|--:|
| `SKILL.md` (loaded when the skill triggers) | 8,395 B |
| Description in the frontmatter | 600 characters |
| All 28 docs (Markdown + JSON) | 82,635 B |
| Whole `skills/helpme-ui/` folder, scripts included | 142,976 B |
| Scripts | 1,085 lines, 0 dependencies |

A job reads `SKILL.md` plus the few files it routes to. Examples from this repo: a review (`review.md`, `rules.md`, `ai-defaults.md`) is 21,014 B; a restyle (`existing.md`, `color.md`, `type.md`) is 17,648 B; a Korean form fix (`forms-dialogs.md`, `ux-copy.md`) is 15,603 B.

## Where it fits

- You want an agent to **change a product that already ships** and prove it did not break anything.
- You build **Korean product UI** and want wrapping, register and number formats checked, not just suggested.
- You want **evidence in the hand-off**: screenshots, measured findings, a wiring diff, a board.

If you mainly want to generate marketing sites from themes or search a large style database, the projects under Inspirations do that well, and they can sit next to this skill.

## Privacy

The scripts make no network requests of their own. `capture.mjs` loads only the pages you give it, serves local files on `127.0.0.1` (refusing path traversal, dotfiles and symlinks that leave the folder), and writes results to disk. Boards are static HTML; option pages run in `sandbox` iframes without same-origin access.

## Limitations

- Chromium only, through Playwright. No Playwright, no screenshots: the in-page audit and labelled user screenshots are the fallbacks.
- The audit is heuristic. Text on images or gradients is reported as `CONTRAST-UNKNOWN` rather than measured; the 해요/합니다 check reads sentence endings and can miss or misread unusual ones; spacing is checked against a 4 px grid.
- Rules marked *review* (focus visibility, colour-only cues, motion, one main action per view) need the agent's judgment and a screenshot; they are not automated.
- The `DESIGN.md` template follows the [design.md](https://github.com/google-labs-code/design.md) format, but its linter has not been run in this repo yet.
- Run so far on macOS with Node 25 and Chromium 149. `package.json` declares Node ≥ 20, but Node 20 and Windows have not been tried.

## Development

```sh
npm test                                                      # node --test, no install step
HELPME_PLAYWRIGHT=/path/to/node_modules/playwright npm test   # also runs the browser tests
```

The browser tests capture one fixture per measured rule in [`tests/fixtures`](tests/fixtures) and check exit codes, waivers, hooks and dark-mode naming. Without Playwright they are skipped with a reason. CI installs Playwright outside `package.json` so the skill itself stays dependency-free.

## Inspirations

Ideas only, in our own words; no text or code was copied. Each idea is credited where it is used, in the Sources section of the file.

- [anthropics/skills — frontend-design](https://github.com/anthropics/skills) (Apache-2.0): check the plan against the brief before building.
- [Nutlope/hallmark](https://github.com/Nutlope/hallmark) (MIT): keep a redesign's wiring; severity tiers; a fresh-context reviewer.
- [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0): deterministic checks next to judgment.
- [ibelick/ui-skills](https://github.com/ibelick/ui-skills) (MIT): read-only reviews that write plans another agent can run.
- [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT): turn repeated corrections into rules; break the UI with worst-case data.
- [heydamir/unslop](https://github.com/heydamir/unslop) (CC BY 4.0): a fixed cleanup order, and "already good" as a valid outcome.
- [google-labs-code/design.md](https://github.com/google-labs-code/design.md) (Apache-2.0): a design system as one file with tokens and rationale.
- [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (MIT): product kind as a starting point.
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT): a finish gate before hand-off.
- [alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design) (MIT): brand facts from assets, not memory; a ledger of past looks.
- [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) (MIT): rules as data, terse `file:line` findings.
- [oil-oil/oil-ui](https://github.com/oil-oil/oil-ui) (MIT): studied its structure; nothing reused.

## Sources

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) · [Material Design 3](https://m3.material.io) · [NN/g usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) and [response-time limits](https://www.nngroup.com/articles/response-times-3-important-limits/) · [Laws of UX](https://lawsofux.com) · [Refactoring UI](https://www.refactoringui.com) · [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) · [Toss writing principles](https://toss.tech/article/8-writing-principles-of-toss) · [Toss product principles](https://toss.im/tossfeed/article/tossproductprinciples) · [Apps in Toss UX guide](https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md) · [KRDS](https://www.krds.go.kr) · [W3C klreq](https://www.w3.org/TR/klreq/)

## License

[MIT](LICENSE) © 2026 jaejeonglee
