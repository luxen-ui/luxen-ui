import { expect, test, type Page } from '@playwright/test';

// In the modal case the picker is parented into the <l-dialog> shadow root (so
// the modal's inertness doesn't make it unclickable); in the non-modal case it
// is parented to <body>. `scope` selects which one we inspect.
function pickerState(scope: 'modal' | 'page') {
  const root =
    scope === 'modal'
      ? document.querySelector('#notes-dialog')?.shadowRoot
      : document.body;
  const picker = root?.querySelector('emoji-picker') as HTMLElement | null | undefined;
  // `:popover-open` alone is not enough: emoji-picker-element's `:host { display:
  // flex }` overrides the UA `display: none` for a closed popover, so a dismissed
  // picker can still be laid out and visible. Assert real on-screen visibility.
  const rect = picker?.getBoundingClientRect();
  const visible = Boolean(
    picker &&
      getComputedStyle(picker).display !== 'none' &&
      rect &&
      rect.width > 0 &&
      rect.height > 0,
  );
  return {
    exists: Boolean(picker),
    open: Boolean(picker?.matches(':popover-open')),
    visible,
  };
}

function dialogOpen() {
  return document.querySelector('#notes-dialog')?.shadowRoot?.querySelector('dialog')?.open ?? false;
}

// A point inside the editor's editable region but clear of the open picker, so a
// trusted click there lands on ProseMirror (which preventDefault()s pointerdown)
// rather than on the picker. Returns null if the picker covers the whole region.
function editorPointClearOfPicker(editorId: string) {
  const prose = document.querySelector(`${editorId} .ProseMirror`)?.getBoundingClientRect();
  const picker = document.body.querySelector('emoji-picker')?.getBoundingClientRect();
  if (!prose || !picker) return null;
  const inPicker = (x: number, y: number) =>
    x >= picker.left && x <= picker.right && y >= picker.top && y <= picker.bottom;
  // Prefer points low in the editable region (below a picker opened downward),
  // then fall back to the sides (a picker that flipped upward clears the bottom).
  const xs = [(prose.left + prose.right) / 2, prose.left + 16, prose.right - 16];
  const ys = [prose.bottom - 16, picker.bottom + 16, (prose.top + prose.bottom) / 2];
  for (const y of ys) {
    for (const x of xs) {
      if (y > prose.top && y < prose.bottom && !inPicker(x, y)) return { x, y };
    }
  }
  return null;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/cdn/prose-editor-emoji.html');
  await expect(page.locator('#status')).toContainText('✅ loaded', { timeout: 10_000 });
});

test.describe('l-prose-editor emoji picker dismissal — inside a modal l-dialog', () => {
  const editorId = '#editor';
  const emojiButton = (page: Page) => page.locator(`${editorId} [data-command="emoji"]`);

  async function openPicker(page: Page) {
    await emojiButton(page).click();
    await expect.poll(() => page.evaluate(pickerState, 'modal' as const)).toMatchObject({
      open: true,
      visible: true,
    });
  }

  async function expectPickerClosedDialogOpen(page: Page) {
    await expect.poll(() => page.evaluate(pickerState, 'modal' as const)).toMatchObject({
      open: false,
      visible: false,
    });
    // Only the picker dismisses — the dialog itself must stay open.
    expect(await page.evaluate(dialogOpen)).toBe(true);
  }

  test.beforeEach(async ({ page }) => {
    // Open the modal dialog via its public `open` property (avoids depending on
    // Invoker Commands support in the test browser).
    await page.locator('#notes-dialog').evaluate((el: HTMLElement & { open: boolean }) => {
      el.open = true;
    });
    await expect.poll(() => page.evaluate(dialogOpen)).toBe(true);
  });

  test('clicking outside the picker dismisses it (survives ancestor stopPropagation)', async ({
    page,
  }) => {
    await openPicker(page);

    // A trusted click on a point inside the dialog but outside the picker. The
    // ancestor #stopwrap swallows bubbling clicks, so this can only close via the
    // capture-phase document pointerdown listener, never via a bubbling one.
    const point = await page.evaluate(() => {
      const sr = document.querySelector('#notes-dialog')!.shadowRoot!;
      const dialog = sr.querySelector('dialog')!.getBoundingClientRect();
      const picker = sr.querySelector('emoji-picker')!.getBoundingClientRect();
      const candidates: [number, number][] = [
        [dialog.left + 6, dialog.top + 6],
        [dialog.right - 6, dialog.top + 6],
        [dialog.left + 6, dialog.bottom - 6],
        [dialog.right - 6, dialog.bottom - 6],
      ];
      const inPicker = (x: number, y: number) =>
        x >= picker.left && x <= picker.right && y >= picker.top && y <= picker.bottom;
      const free = candidates.find(([x, y]) => !inPicker(x, y));
      return free ? { x: free[0], y: free[1] } : null;
    });
    expect(point, 'no dialog point free of the picker to click').not.toBeNull();

    await page.mouse.click(point!.x, point!.y);
    await expectPickerClosedDialogOpen(page);
  });

  test('Escape dismisses the picker', async ({ page }) => {
    await openPicker(page);
    await page.keyboard.press('Escape');
    await expectPickerClosedDialogOpen(page);
  });

  test('clicking the emoji button again dismisses it', async ({ page }) => {
    await openPicker(page);
    await emojiButton(page).click();
    await expectPickerClosedDialogOpen(page);
  });

  test('selecting an emoji inserts it and dismisses the picker', async ({ page }) => {
    await openPicker(page);
    // The picker loads its data asynchronously; the emoji grid renders buttons
    // with role="menuitem" (Playwright's locator engine pierces its shadow DOM).
    // "grinning face" is in the first (default) category, so it renders without
    // switching tabs.
    await page
      .locator('emoji-picker')
      .getByRole('menuitem', { name: /grinning face/i })
      .click();
    await expectPickerClosedDialogOpen(page);
    const html = await page
      .locator(editorId)
      .evaluate((el: HTMLElement & { getHTML(): string }) => el.getHTML());
    expect(html).toContain('😀');
  });
});

test.describe('l-prose-editor emoji picker dismissal — parented to <body>', () => {
  const editorId = '#editor-page';
  const emojiButton = (page: Page) => page.locator(`${editorId} [data-command="emoji"]`);

  async function openPicker(page: Page) {
    await emojiButton(page).click();
    await expect.poll(() => page.evaluate(pickerState, 'page' as const)).toMatchObject({
      open: true,
      visible: true,
    });
  }

  async function expectPickerClosed(page: Page) {
    await expect.poll(() => page.evaluate(pickerState, 'page' as const)).toMatchObject({
      open: false,
      visible: false,
    });
  }

  test('clicking outside the picker dismisses it (survives ancestor stopPropagation)', async ({
    page,
  }) => {
    await openPicker(page);
    // Click the page corner, well clear of the picker.
    await page.mouse.click(5, 5);
    await expectPickerClosed(page);
  });

  test('clicking the editor content dismisses the picker (prevented-default pointerdown)', async ({
    page,
  }) => {
    await openPicker(page);
    // The regression case: ProseMirror preventDefault()s pointerdown inside the
    // editor, which suppresses native popover light-dismiss on the affected
    // Chromium. A trusted click on the editable content (clear of the picker)
    // must still dismiss — via the capture-phase document listener.
    const point = await page.evaluate(editorPointClearOfPicker, editorId);
    expect(point, 'no editor point free of the picker to click').not.toBeNull();
    await page.mouse.click(point!.x, point!.y);
    await expectPickerClosed(page);
  });

  test('Escape dismisses the picker', async ({ page }) => {
    await openPicker(page);
    await page.keyboard.press('Escape');
    await expectPickerClosed(page);
  });

  test('clicking the emoji button again dismisses it', async ({ page }) => {
    await openPicker(page);
    await emojiButton(page).click();
    await expectPickerClosed(page);
  });
});
