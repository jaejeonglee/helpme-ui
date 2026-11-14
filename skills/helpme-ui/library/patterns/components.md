# Components

Use when building or reviewing one component (button, field, card, row, menu) or choosing how to group content.

## Specimen page

A dev-only page renders state × size × density with real labels, incl. the longest in [stress-ko.json](../../checks/stress-ko.json). Capture light and dark.

```
            default hover focus pressed disabled loading error
sm compact
md default
lg comfy
```
- Mirror pseudo-states with a dev class: `:hover, .is-hover { ... }`.
- State layers (M3): hover .08, focus .12, pressed .12 opacity.

## Focus ring

```css
:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
```
- Meets `FOCUS-VISIBLE`; the ring contrasts with the component and the page around it (`NONTEXT-CONTRAST`).
- Never `outline: none` bare. Sticky bars must not cover it (`FOCUS-OBSCURED`).

## Nested radius

Child ≤ parent. Concentric corners: inner = outer − gap.

```css
.card { --r: 16px; --gap: 8px; border-radius: var(--r); padding: var(--gap); }
.card > img { border-radius: calc(var(--r) - var(--gap)); }
```

## Push far before calling it done

- Longest real label, two lines of Hangul, a blank value (`KO-WRAP`, `TEXT-CLIP`).
- Zero, one, many items; every specimen state, disabled with a reason.
- Keyboard only: Tab order, Enter/Space, Esc, arrow keys inside groups.
- 200% zoom and `--stress text-spacing` (`TEXT-SPACING`).
- Narrowest real container, phone targets (`TARGET-TOUCH`), dark scheme, reduced motion.
- Can two props merge? Fewer variants beat more.

## Choosing a container

| container | when |
|---|---|
| none (space) | same-kind items read in sequence; proximity groups them |
| divider | dense rows that need scanning lines |
| card | independent objects you open, move or act on |
| panel | an app region (sidebar, inspector); framed by layout |

Start at none; go down a row only when grouping fails a squint test.

## Card rules

- One card = one object = one main action. Whole card is the link, or it has buttons; never a button inside a link.
- No card inside a card. Border or shadow, not both; one light source.
- Same anatomy across a grid, content top-aligned. One-line cards are a list: use rows.

## Six card anatomies

```
media      stat       row          person     task       plan
+------+   +------+   +---------+  +------+   +------+   +------+
|[img] |   |label |   |o title >|  | (o)  |   |title |   |name  |
|title |   |value |   |  meta   |  |name  |   |desc  |   |price |
|meta  |   |+8% wk|   +---------+  |role  |   |[go]  |   |- item|
+------+   +------+                +------+   +------+   |[pick]|
                                                          +------+
```

## Expand card → detail (View Transitions)

```js
function openDetail(card, render) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) return render();
  card.querySelector('img').style.viewTransitionName = 'hero';
  document.startViewTransition(() => {
    card.querySelector('img').style.viewTransitionName = '';
    render(); // detail image has view-transition-name: hero
  });
}
```
- No API or reduced motion: swap instantly (`REDUCED-MOTION`). Names unique per screen.
- Multi-page: `@view-transition { navigation: auto; }`. Timing: [motion](../foundations/motion.md).

## Sources

- WCAG 2.2 (2.4.7, 2.4.11, 2.4.13, 1.4.11): https://www.w3.org/TR/WCAG22/
- Vercel Web Interface Guidelines (`:focus-visible`, child radius ≤ parent): https://vercel.com/design/guidelines
- Material Design 3 (state-layer opacity): https://m3.material.io
- Refactoring UI (fewer borders, one light source): https://www.refactoringui.com
- Laws of UX (proximity, common region, similarity): https://lawsofux.com
- Specimen, push-far list, containers, anatomies: house default
