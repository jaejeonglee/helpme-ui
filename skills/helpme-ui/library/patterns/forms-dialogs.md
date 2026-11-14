# Forms and dialogs

Use when building or reviewing inputs, validation, Enter handlers, dialogs or sheets.

## Labels and input types

- Every field has a visible `<label>`. A placeholder is an example that vanishes on typing, never the label.
- Group with `<fieldset>` + `<legend>`. Mark the minority: if most are required, tag 「선택」 on the rest.

| data | markup |
|---|---|
| email | `type="email" autocomplete="email"` |
| phone | `type="tel" autocomplete="tel"` |
| amount | `inputmode="numeric"`, format on blur (not `type="number"`) |
| 인증번호 | `inputmode="numeric" autocomplete="one-time-code"` |
| password | `autocomplete="new-password"` (or `current-`); paste allowed |

- Accept spaces and hyphens. On phones every input meets `INPUT-ZOOM`; never fix zoom with `maximum-scale` (`ZOOM-LOCK`).

## Validation timing

- Silent during first typing; check on blur once there is content.
- Once an error shows, re-check on each input so it clears when fixed.
- On submit, check all and focus the first invalid field. Errors say how to fix, via `aria-describedby` + `aria-invalid`.

```js
form.addEventListener('submit', (e) => {
  const bad = form.querySelector(':invalid, [aria-invalid="true"]');
  if (bad) { e.preventDefault(); bad.focus(); }
});
```

## Hangul IME and Enter (`KO-IME`)

The Enter that commits the last syllable also fires `keydown`: chat sends 「안녕하세」 then 「요」, search runs twice.

```js
input.addEventListener('keydown', (e) => {
  if (e.isComposing || e.keyCode === 229) return; // still composing
  if (e.key === 'Enter') submit();
});
```

`229` catches browsers that report that keydown with `isComposing` false (Safari). React: `e.nativeEvent.isComposing`. Guard every Enter handler.

## Container ladder: inline < popover < dialog < sheet < page

| container | holds | e.g. |
|---|---|---|
| inline | one value, edited in place | 이름 변경 |
| popover | short pick, anchored, non-blocking | 날짜 선택 |
| dialog | one blocking decision | 삭제 확인 |
| sheet | phone task that keeps context | 배송지 추가 |
| page | long or multi-step; URL and back | 회원가입 |

Smallest that fits wins; a dialog that scrolls or stacks moves up a step.

## `<dialog>` + `showModal()`

```html
<dialog id="del" aria-labelledby="del-t">
  <h2 id="del-t">주문을 삭제할까요?</h2>
  <form method="dialog">
    <button value="close">닫기</button>
    <button value="delete">주문 삭제</button>
  </form>
</dialog>
```
```js
const opener = document.activeElement;
del.showModal(); // top layer, page inert, Esc closes
del.addEventListener('close', () => opener.focus(), { once: true });
```

## 닫기 vs 취소 (`KO-DISMISS`)

- Dismiss that changes nothing: 「닫기」. 「취소」 reads as cancelling the thing.
- 「예약을 취소할까요? [취소] [확인]」 is a trap; write 「[닫기] [예약 취소]」. Register: [ux-copy](../korean/ux-copy.md).

## Sources

- Vercel Web Interface Guidelines (label controls; focus first error; never block paste or zoom): https://vercel.com/design/guidelines
- Apps in Toss UI/UX guide (dismiss is 닫기): https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md
- NN/g heuristics #5, #9: https://www.nngroup.com/articles/ten-usability-heuristics/
- idea: IME-safe Enter — nextlevelbuilder/ui-ux-pro-max-skill
- Input table, validation timing, ladder: house default
