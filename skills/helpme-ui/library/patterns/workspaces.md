# Workspaces

Use when building or reviewing dashboards, admin tools, data tables or other screens people work in all day.

## Layout per job

Name the job; the layout follows (house default).

```
monitor: is it ok?           triage: work a queue to zero
+------+------+------+       +---------+---------------+
| KPI  | KPI  | KPI  |       | filter  | item detail   |
+------+------+------+       | > item !| [assign][hold]|
| trend 24h  | alerts|       |   item  |               |
+------------+-------+       +---------+---------------+

analyse: ask the data        configure: change settings
+--------------------+       +--------+---------------+
| period | group | v |       | general| field         |
+--------------------+       | > team | field         |
| chart              |       | billing|       [save]  |
| table              |       +--------+---------------+

author: make a thing
+------+-------------+------+
| tools| canvas      | props|
+------+-------------+------+
```

- monitor: exceptions first; quiet when all is well.
- triage: keyboard next/prev; act without leaving the list.
- analyse: controls above results; one change never resets the rest.
- configure: section nav; sticky save, or autosave with a saved mark.
- author: canvas centre; side panels collapse on phones.

## KPI: value · change · period · basis

```
매출                  label
₩1.2억                value
▲ 8.4%  지난주 대비    change + basis
11월 8일 – 14일       period
```
- No KPI without a period. Change names its basis (지난주, 목표).
- Colour by meaning, not direction: rising cost is bad. Add arrow and sign (`COLOR-ONLY`).
- Formats: [hangul-type](../korean/hangul-type.md) (`Intl`, 만/억).

## Tables

- `font-variant-numeric: tabular-nums`; numbers right-aligned with their header; text left.
- Non-breaking space before units: `1,200&nbsp;건`.
- Sticky header: `position: sticky; top: 0`, plus `scroll-padding-top` so focus stays visible (`FOCUS-OBSCURED`).
- Row actions visible without hover. Main action = row link; destructive in a menu; bulk on selection.
- Wide tables scroll in their own `overflow-x: auto` wrapper, never the page (`OVERFLOW-X`); or become cards on phones.
- Empty, loading, partial: [states](states.md).

## Filters live in the URL

```js
const q = new URLSearchParams(location.search);
q.set('status', 'open');
history.replaceState(null, '', '?' + q);
```
- Reload, share and back keep the view; capture can shoot it: `--query status=open`.
- Show active filters as removable chips + 「모두 지우기」, and the result count.

## Sources

- Vercel Web Interface Guidelines (tabular-nums, non-breaking space before units): https://vercel.com/design/guidelines
- WCAG 2.2 (1.4.1, 1.4.10, 2.4.11): https://www.w3.org/TR/WCAG22/
- NN/g heuristics #1, #6, #7: https://www.nngroup.com/articles/ten-usability-heuristics/
- Jobs and sketches, KPI anatomy, URL filters: house default
