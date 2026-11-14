# Korean UX copy

Use when writing or reviewing Korean UI text: labels, buttons, status, messages, errors, empty states, dialogs.

## Register: one per surface (`KO-REGISTER-MIX`)
- Pick 해요체 or 합니다체 once and store it as `register` under `x-helpme` in [DESIGN.md](../../templates/DESIGN.md). Apps in Toss: 해요체 everywhere.
- One register per surface (screen, dialog, toast set, email).
- Labels, buttons and status are nouns, so register shows only in sentences.

| | 해요체 | 합니다체 |
|---|---|---|
| done | 저장했어요 | 저장했습니다 |
| failed | 저장하지 못했어요 | 저장하지 못했습니다 |
| ask | 다시 시도해 주세요 | 다시 시도해 주십시오 |

The last row is the usual slip: 주세요 inside 합니다체 copy.
- Light honorifics: no ~시겠어요, no ~께. Active voice: 저장됐어요 → 저장했어요. Say what is possible, not what is forbidden.

## Labels and status: nouns
- 연결된 곳 → 연결 대상 · 7일 남음 → 만료 7일 전
- 11월 10일 확인 → 마지막 확인 11월 10일 · 안 열려요 → 접속 불가 · 3일 경과
- Unstack noun chains: 사용자 이메일 주소 입력 → 이메일.

## Buttons name the outcome
- 저장 · 삭제 · 보내기 · 주소 추가, not 확인 or 예. The label predicts what happens.
- Destructive: name the object, 주소 삭제.
- Dismiss (`KO-DISMISS`): 닫기 leaves with no change. 취소 reads as cancelling a thing (예약 취소), so use it only for that and name it.

## Messages
- Status and toasts: one sentence. 저장했어요.
- Errors: what failed, why, what next. Two sentences at most; the next step can be the button.
  카드 한도를 넘어 결제하지 못했어요. 다른 카드를 선택해 주세요. [카드 변경]
- No blame, no raw code first; a code goes last: (오류 코드 E402).
- Helper text only where people fail: number formats (사업자등록번호 10자리), password rules, effects that can't be undone. Elsewhere it appears on error. Forms: [forms and dialogs](../patterns/forms-dialogs.md).
- Empty state: what lives here, and how to add the first one. 아직 연결된 주소가 없어요. [주소 추가]

## Before → after (해요체)
| Before | After |
|---|---|
| [확인] | [저장] |
| 오류가 발생했습니다. | 저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요. |
| 정말 삭제하시겠습니까? [취소] [확인] | 주소를 삭제할까요? 되돌릴 수 없어요. [닫기] [삭제] |
| 비밀번호가 틀렸습니다. | 비밀번호가 맞지 않아요. 다시 입력하거나 재설정해 주세요. |

## Review questions
Toss's eight writing principles, turned into checks (our wording):
1. Predictable hint: does the label alone tell what happens next?
2. Weed cutting: what can go without losing meaning?
3. Remove empty sentences: does each sentence say something new?
4. Focus on key message: one main message, placed first?
5. Easy to speak: would you say it aloud this way?
6. Suggest over force: does it invite rather than order or blame?
7. Universal words: would a first-time user know every word?
8. Find hidden emotion: does it fit how they feel now (waiting, paying, failing)?

## Sources
- Toss, 8 writing principles of Toss (2022-11-15): https://toss.tech/article/8-writing-principles-of-toss
- Apps in Toss UI/UX guide: https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md
- Toss product principles: https://toss.im/tossfeed/article/tossproductprinciples
- NN/g, 10 usability heuristics (2, 9): https://www.nngroup.com/articles/ten-usability-heuristics/
- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
- House default: noun labels, outcome buttons, message length, helper text, error codes, examples.
