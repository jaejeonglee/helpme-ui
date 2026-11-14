# States

Use when a screen, list or form needs every state designed, or a review asks how it fails. Meets `STATES`.

## State sheet

Write it in `.helpme/plan.md` before building, one row per reachable state (house default).

| state | trigger | shows | way forward | how to force |
|---|---|---|---|---|
| first run | new account | what this is for, one sample | create / import | `?state=first-run` |
| loading | request in flight | skeleton in final layout (`SPINNER-TIMING`) | cancel if long | `?state=loading` |
| empty | 0 results | why: no data, or a filter | clear filter / create | `?state=empty` |
| partial | one source failed | what loaded, what is missing | retry that part | `?state=partial` |
| error | request failed | what / why / next | retry, contact | `?state=error` |
| offline | no network | last data, marked as a copy | auto-retry on `online` | `?state=offline` |
| permission | 403 | who can grant it | request access | `?state=denied` |
| stale | older than promised | 마지막 동기화 11월 14일 09:12 | refresh | `?state=stale` |
| done | action succeeded | result in place | undo, next step | `?state=done` |

- Add the product's own: saving, locked, over quota.
- Fill rows with worst-case content ([stress-ko.json](../../checks/stress-ko.json)). Feedback per `LATENCY`; no layout jump when data lands.

## Errors: what · why · next

```
저장하지 못했어요. 인터넷 연결이 끊겼어요.   [다시 시도]
```
- Not "오류가 발생했습니다". Keep the user's input.
- Show it beside what failed; banner only if page-wide. Codes in a detail line. Copy: [ux-copy](../korean/ux-copy.md).

## Undo over confirm

- Reversible (archive, move, trash): act now, offer 「되돌리기」; a toast pauses on hover and focus.
- Confirm only what can't be undone or reaches others (payment, send, permanent delete). Name the result: 「영구 삭제」, not 「확인」. Wording: [forms-dialogs](forms-dialogs.md).

## Force any state: `?state=`

Dev builds only.

```js
const forced = import.meta.env.DEV
  ? new URLSearchParams(location.search).get('state') : null;
const state = forced ?? computeState(data, error, navigator.onLine);
```

One capture per row:
```
node $S/scripts/capture.mjs http://localhost:5173/orders --query state=empty --name orders-empty
```

## Sources

- NN/g, 10 Usability Heuristics (#1, #3, #9): https://www.nngroup.com/articles/ten-usability-heuristics/
- Vercel Web Interface Guidelines (errors say how to fix; Undo): https://vercel.com/design/guidelines
- Refactoring UI, design empty states: https://www.refactoringui.com
- Toss product principles (Explain Why, No More Loading): https://toss.im/tossfeed/article/tossproductprinciples
- idea: worst-case data behind a dev toggle — emilkowalski/skills break-ui, pbakaus/impeccable harden
- Sheet columns, `?state=` switch, toast pause: house default
