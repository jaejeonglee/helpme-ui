# helpme-ui

An [Agent Skill](https://agentskills.io) that designs, fixes and reviews user interfaces, then proves the result with screenshots and measured checks. Built for products that already exist. Korean-ready.

## What it does

- Picks one of ten jobs from the request (fix, review, create, restyle, repair, extend, port, system, round, component) and reads only the files that job needs.
- Captures phone and desktop screenshots and measures them against rules sourced from WCAG 2.2, Apple HIG, Material 3, NN/g and KRDS.
- Compares links, fields, forms and handlers before and after a change, and fails on any loss you did not allow.
- Puts design options, or before and after, side by side on one board.
- Handles Korean UI: line breaking, one 해요/합니다 register per screen, ₩ and 억 formats, IME-safe Enter.

## Install

```sh
npx skills add jaejeonglee/helpme-ui --skill helpme-ui -g -a claude-code
```

Or copy it by hand:

```sh
git clone https://github.com/jaejeonglee/helpme-ui
cp -R helpme-ui/skills/helpme-ui ~/.claude/skills/
```

Then ask your agent for UI work; the skill loads on its own.

## Requirements

Node.js 20+. Screenshots need Playwright, either the project's own or `HELPME_PLAYWRIGHT=/path/to/node_modules/playwright`. Nothing else to install. The skill writes only to `.helpme/` in your project and makes no network requests of its own.

## License

[MIT](LICENSE) © 2026 jaejeonglee
