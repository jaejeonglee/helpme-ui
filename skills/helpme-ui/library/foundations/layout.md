# Layout

Use when spacing looks uneven, a screen must work from phone to wide desktop, sticky bars hide content, or the page scrolls sideways.

## Spacing scale
An 8 base (M3 "8dp scale") plus a 4 half-step for dense UI. Every gap and padding comes from it (`SCALE-OFF`).
```css
:root { --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px; --s8:64px; }
```

## Proximity
- Less space inside a group than between; same function, same look (Laws of UX). Label-field 4-8, field-field 16, section 32-48 (house default).
- Start with too much space, then remove; no gap may read as belonging to both sides (Refactoring UI).

## Alignment by screen type
- Single-action short screens (sign-in, sign-up, verify, one-step confirmation, success, empty): centre one narrow column; labels and fields stay left-aligned inside it.
- Reading and scanning screens (docs, lists, articles, settings, dashboards): align left to the page grid.
- Don't move a centred single-action screen left "for consistency"; the screen's type decides, not its neighbours (house default).

## Breakpoints
- M3 window classes (dp): compact <600 · medium 600-839 · expanded 840-1199 · large 1200-1599 · extra-large 1600+.
- KRDS: 360 / 768 / 1024 / 1280 / 1440; content max 1200 px, side padding 24 px (16 px mobile).
- Capture viewports: phone 360, tablet 768, desktop 1280, wide 1440, reflow 320x256.
- Break where content breaks, not at device names; components use `@container` (house default).

## Phone: recompose, don't shrink
```
desktop                   phone
+----+--------------+     +---------------+
| nav| filters      |     | Title     [..]|
|    | table, 6 cols|     | [filter chip] |
|    |              |     | name          |
|    |              |     | status · date |
+----+--------------+     | [main action] | sticky
                          +---------------+
```
- Table → cards with the 2-3 fields people scan; the rest behind a tap.
- Side nav → bottom bar or drawer; multi-column form → one column.
- Main action at the bottom in thumb reach; secondary ones in an overflow menu.

## Sticky bars and safe areas
Add `viewport-fit=cover` to the viewport meta, then:
```css
html { scroll-padding-top: var(--header-h); scroll-padding-bottom: var(--bar-h); }
.bottom-bar { padding-bottom: max(var(--s4), env(safe-area-inset-bottom)); }
```
- `scroll-padding` keeps anchors and focused fields clear of sticky bars (`FOCUS-OBSCURED`).
- Never add `maximum-scale` or `user-scalable=no` (`ZOOM-LOCK`, `VIEWPORT-META`).
- Insets keep controls off the notch and home bar (house default).

## Sideways scroll (`OVERFLOW-X`)
Capture names the culprits; check reflow too.
- fixed `width` → `max-width: 100%`; `100vw` → `100%` (vw counts the scrollbar)
- flex or grid child with long text → `min-width: 0`
- long URL, ID, email → `overflow-wrap: break-word`
- wide data table → own `overflow-x: auto` region, or recompose
- `img, video { max-width: 100%; height: auto; }`

## Sources
- Material Design 3, spacing and window classes: https://m3.material.io
- KRDS: https://www.krds.go.kr (values cited; repo has no license)
- Laws of UX: https://lawsofux.com
- Refactoring UI: https://www.refactoringui.com
- WCAG 2.2, 1.4.4, 1.4.10, 2.4.11: https://www.w3.org/TR/WCAG22/
- House default: gap sizes, container queries, recompose moves, safe areas, overflow fixes.
- House default, alignment by screen type: scanning needs a fixed left edge, a lone action does not.
