# Hangul type

Use when a UI shows Korean: fonts, wrapping, line height, tracking, or ko-KR dates, money and big numbers.

## Fonts (all SIL OFL 1.1)
- Pretendard (orioncactus/pretendard): built from Inter, Source Han Sans, M PLUS 1; variable and subset builds.
- SUIT (sun-typeface/SUIT) · Noto Sans KR (google/fonts, notofonts/noto-cjk).
- IBM Plex Sans KR (IBM/plex): its npm package sends IBM Telemetry unless you opt out; self-host the files.

OFL: bundle freely, never sell the font alone, rename modified builds. KRDS ships Pretendard GOV.
```css
:root { --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
  "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif; }
```
Fallbacks: Apple SD Gothic Neo (Apple), Malgun Gothic (Windows), Noto Sans CJK via `sans-serif` (Android). Hangul files are large: serve a `unicode-range` subset; loading in [type](../foundations/type.md).

## Markup
`<html lang="ko">` picks Korean glyph forms, the Korean screen-reader voice and `:lang(ko)` rules. Tag foreign runs: `<span lang="en">`.

## Wrapping (`KO-WRAP`)
```css
body { word-break: keep-all; overflow-wrap: break-word; }
```
```
normal    설정을 저장하지 못했습니
          다. 다시 시도해 주세요.
keep-all  설정을 저장하지 못했습니다.
          다시 시도해 주세요.
```
- `keep-all` breaks Korean only at spaces (MDN); `overflow-wrap` still breaks a long URL or ID. KRDS's reset ships the pair.
- Flex and grid children also need `min-width: 0`.
- Headings: `text-wrap: balance`.

## Leading (`LEADING-BODY`)
Body `line-height: 1.6`, headings 1.3. No Hangul standard exists; klreq's 160% is only an illustration. KRDS body size: 17 px.

## Tracking (`KO-TRACKING`)
- No positive `letter-spacing` on Hangul: syllable blocks carry their own air, and extra tracking splits words into loose syllables.
- Wide-tracked caps labels have no Hangul twin; use weight or color.
- Large headings may go slightly negative (-0.01em to -0.02em).

## Dates, money, big numbers
Outputs as printed by Node 25 (ICU 78), 2026-11-14.
```js
const d = new Date("2026-11-14T09:00:00+09:00"), tz = { timeZone: "Asia/Seoul" };
new Intl.DateTimeFormat("ko-KR", tz).format(d); // "2026. 11. 14."
new Intl.DateTimeFormat("ko-KR", { ...tz, dateStyle: "long" }).format(d); // "2026년 11월 14일"
new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(27900); // "₩27,900"
(27900).toLocaleString("ko-KR") + "원"; // "27,900원"
new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(123456789); // "1.2억"
new Intl.RelativeTimeFormat("ko-KR", { numeric: "auto" }).format(-1, "day"); // "어제"
```
- Always pass `timeZone`: a UTC server prints `2026. 11. 13.` for 08:30 KST.
- `₩` in price columns, `원` in sentences.
- Compact (`1.2억`, `1.5만`) for KPIs and charts; exact amounts on bills.
- Number columns: `tabular-nums`. Worst-case data: [stress-ko.json](../../checks/stress-ko.json).

## Sources
- W3C klreq, Note Draft 2026-03-21: https://www.w3.org/TR/klreq/
- MDN, word-break: https://developer.mozilla.org/en-US/docs/Web/CSS/word-break
- KRDS: https://www.krds.go.kr (values cited; repo has no license)
- WCAG 2.2, 1.4.8: https://www.w3.org/TR/WCAG22/
- Font licenses: checked in the GitHub repos named above.
- House default: fallback stack, subsetting, `text-wrap`, leading and tracking values, `₩` vs `원`.
