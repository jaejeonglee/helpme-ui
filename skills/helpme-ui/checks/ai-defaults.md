# AI defaults

Use when reviewing or cleaning a screen that looks generated: the same choices an agent makes when nobody decided.

A default is a finding only when it replaces a decision. Each row says when it is fine; banning all of them breeds a new uniform look.

| id | tell | why | try instead | fine when |
|---|---|---|---|---|
| D-01 | violet-to-blue gradient on hero and buttons | sample palette, not the brand | brand colour from real assets, one flat accent | the brand owns it |
| D-02 | gradient-filled headline | decoration posing as hierarchy | weight and size, solid colour | it is the wordmark |
| D-03 | three equal feature tiles, icon in a tinted circle | fits any product | the product doing those three things | items are truly parallel (plans) |
| D-04 | every block in a card | borders flatten hierarchy | space, dividers | objects you open or move |
| D-05 | tracked caps eyebrow over each section | Latin habit; noise on Hangul (`KO-TRACKING`) | plain section title, or none | one real category label |
| D-06 | emoji as icons or bullets | differs per OS; a tone nobody chose | the project's icon set | user content, chat |
| D-07 | blurred glow blobs behind the hero | fills a hero with no product | a real product screen | it is the one ambient effect |
| D-08 | 「New」 pill with sparkle | false novelty that never leaves | dated changelog line | new, with a removal date |
| D-09 | one big radius everywhere, nested too | inner corners bulge | radius scale, child ≤ parent | a deliberately soft brand |
| D-10 | light grey for anything secondary | fails `CONTRAST-TEXT`, flattens levels | fewer levels, weight over grey | it passes and is secondary |
| D-11 | slogan headline 「일하는 방식을 바꾸다」 | says nothing | what + for whom | under a plain what line |
| D-12 | 「10,000+ 팀」, logo row | invented proof | sourced numbers, or none | counted, dated, agreed |
| D-13 | pulsing dots, idle loops | steals attention (`AUTO-MOTION`) | motion only on change | live state that ends |
| D-14 | lift-and-shadow hover on every card | promises a click | hover only where clickable | the card is a link |
| D-15 | happy path only, full demo data | the sample state is all that exists | a state sheet | static marketing copy |
| D-16 | two equal buttons under the hero | no main action (Hick) | one main action, one quiet link | truly equal paths (로그인 / 가입) |
| D-17 | Latin-only font stack | Hangul falls to a random system face | a Hangul-capable family | system stack chosen on purpose |

See [states](../library/patterns/states.md), [pages](../library/patterns/pages.md), [hangul-type](../library/korean/hangul-type.md).

## Cleanup order

Each pass changes what the next one sees, so go in order and stop a pass when it finds nothing.

1. hierarchy: one focal point per view, main action obvious (`ONE-JOB`)
2. states: sheet complete (`STATES`)
3. spacing: on scale, groups by proximity (`SCALE-OFF`)
4. type: few families, weights, sizes (`FONT-COUNT`)
5. colour: roles and contrast (`CONTRAST-TEXT`, `COLOR-ONLY`)
6. copy: one register, noun labels (`KO-REGISTER-MIX`)
7. icons: one set, one stroke, labelled
8. motion: purposeful, reduced variant (`REDUCED-MOTION`)

"Already good, no change" is a valid result. Report it with the capture that shows why.

## Sources

- Refactoring UI (hierarchy, spacing, fewer borders): https://www.refactoringui.com
- Laws of UX (Hick, Von Restorff, proximity): https://lawsofux.com
- Vercel Web Interface Guidelines (child radius, motion): https://vercel.com/design/guidelines
- pass order idea: heydamir/unslop, CC BY 4.0
- idea: naming the looks AI design drifts to — anthropics/skills frontend-design
- ban lists harden into a house look — Nutlope/hallmark (issue #30)
- Entries D-01 to D-17: house default
