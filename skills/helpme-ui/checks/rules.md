# Rules

Use when judging any screen. Every finding cites one id. Tiers: must (WCAG A/AA; blocks ship) · should (fix or waive) · polish (when cheap) · info (check by hand). Method: render (capture.mjs measures) · static (read code) · review (judge a screenshot; name screen and element).
Waiver, one line in `.helpme/ledger.md`: `waive: ID <selector|*> — reason`. capture honours it; no reason = error.

| id | tier | method | check | pass when | source |
|---|---|---|---|---|---|
| OVERFLOW-X | must | render | page wider than viewport | scrollWidth ≤ clientWidth + 1, every vp | WCAG 1.4.10 |
| ZOOM-LOCK | must | render | viewport meta blocks zoom | no user-scalable=no; maximum-scale ≥ 2 | WCAG 1.4.4; axe-core |
| CONTRAST-TEXT | must | render | text on composited background | ≥ 4.5:1, unrounded | WCAG 1.4.3 |
| CONTRAST-LARGE | must | render | text ≥ 24 px or ≥ 18.67 px bold | ≥ 3:1, unrounded | WCAG 1.4.3 |
| TARGET-MIN | must | render | pointer target | ≥ 24×24 px, or its 24 px circle meets no target; inline exempt | WCAG 2.5.8 |
| TEXT-SPACING | must | render | clipping under `--stress text-spacing` | nothing clipped | WCAG 1.4.12 |
| NONTEXT-CONTRAST | must | review | borders, icons, rings, chart marks | ≥ 3:1 vs adjacent | WCAG 1.4.11 |
| COLOR-ONLY | must | review | meaning by colour alone | a second cue; colour-only link ≥ 3:1 vs text | WCAG 1.4.1 |
| FOCUS-VISIBLE | must | review | keyboard focus | visible everywhere; 2 px perimeter, ≥ 3:1 change | WCAG 2.4.7, 2.4.13 |
| FOCUS-OBSCURED | must | review | sticky UI over focus | never fully hidden | WCAG 2.4.11 |
| AUTO-MOTION | must | review | auto-moving content > 5 s | pause, stop or hide | WCAG 2.2.2 |
| DRAG-ALT | must | review | drag-only action | single-pointer path | WCAG 2.5.7 |
| WIRING-LOSS | must | render | links, fields, handlers, headings lost | no loss without `allow-loss:` | house default |
| VIEWPORT-META | should | render | responsive viewport meta | width=device-width | house default |
| IMG-BROKEN | should | render | image decode | naturalWidth > 0 | house default |
| CONSOLE-ERROR | should | render | console errors on load | 0 | house default |
| REQUEST-FAIL | should | render | failed or ≥ 400 requests | 0 | house default |
| TARGET-TOUCH | should | render | target on phone vp (< 600 px) | ≥ 44×44 px | Apple HIG; WCAG 2.5.5; M3 |
| TEXT-CLIP | should | render | text cut by overflow | nothing clipped | house default |
| TEXT-MIN | should | render | smallest text | ≥ 12 px | house default; Apple |
| INPUT-ZOOM | should | render | input text on phone vp | ≥ 16 px | Vercel |
| LEADING-BODY | should | render | multi-line body text | line-height ≥ 1.5 | WCAG 1.4.8; KRDS |
| KO-WRAP | should | render | Hangul blocks | keep-all + overflow-wrap | MDN; KRDS; W3C klreq |
| KO-REGISTER-MIX | should | render | sentence endings per surface | one register (해요 or 합니다) | Apps in Toss guide |
| KO-IME | should | static | Enter on text inputs | ignored while isComposing | house default |
| REDUCED-MOTION | should | static | non-essential motion | a reduced-motion variant | WCAG 2.3.3; Apple; Vercel |
| LATENCY | should | review | feedback after input | ack ≤ 0.1 s; < 400 ms or progress | NN/g; Doherty |
| ONE-JOB | should | review | focal point per view | one main action, one emphasis | Toss principles; Von Restorff |
| STATES | should | review | state sheet | every row designed | house default |
| TEXT-TRUNCATE | polish | render | ellipsis hides text | full text reachable | house default |
| KO-TRACKING | polish | render | letter-spacing on Hangul | ≤ 0 | house default |
| KO-DISMISS | polish | review | dialog dismiss label | 닫기; 취소 only cancels an action | Apps in Toss guide |
| SCALE-OFF | polish | render | margins, paddings, gaps | on the 4 px grid | M3; Refactoring UI |
| FONT-COUNT | polish | render | families in use | ≤ 2 | Refactoring UI; house |
| DRIFT | polish | render | colours vs :root tokens (≥ 3 declared) | 0 off-token colours | house default |
| TARGET-GAP | polish | review | space between targets | ≥ 8 px | M3 |
| LINE-LENGTH | polish | review | characters per line | ≤ 80 Latin, ≤ 40 Hangul | WCAG 1.4.8 |
| MOTION-DURATION | polish | static | transitions | 50–600 ms; exit < enter | M3 tokens |
| SPINNER-TIMING | polish | static | spinner delay, minimum | 150–300 ms delay; ≥ 300 ms shown | Vercel |
| SIGNATURE | polish | review | one bold element from product nouns | passes twin-brief test | house default |
| CONTRAST-UNKNOWN | info | render | text on image or gradient | worst pixel checked | WCAG 1.4.3 |

## Sources
WCAG 2.2 https://www.w3.org/TR/WCAG22/ · Apple HIG https://developer.apple.com/design/human-interface-guidelines/ · Material 3 https://m3.material.io · NN/g https://www.nngroup.com · Vercel https://vercel.com/design/guidelines · Refactoring UI https://www.refactoringui.com · KRDS https://www.krds.go.kr · Apps in Toss https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md · Toss principles https://toss.im/tossfeed/article/tossproductprinciples
