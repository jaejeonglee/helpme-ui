// capture.mjs hook: move every before/after slider to 38% so the shot shows more of "after".
export default async (page) => {
  await page.evaluate(() => {
    for (const input of document.querySelectorAll('input[type=range]')) {
      input.value = '38';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
};
