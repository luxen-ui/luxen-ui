import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
// The dropdown is defined up front; `l-dropdown-item` is defined only after the
// dropdown has mounted (see `mountThenDefineItems`). Each browser test file
// runs in its own iframe, so the first test to call it does the late upgrade
// and later ones find the item already defined — every test mounts its own
// dropdown before awaiting that import, so none depends on the order.
import '../../src/html/elements/dropdown/index.js';
import type { Dropdown } from '../../src/html/elements/dropdown/dropdown.js';
import type { DropdownItem } from '../../src/html/elements/dropdown-item/dropdown-item.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';

let host: HTMLElement;
let errors: unknown[] = [];
const onRejection = (event: PromiseRejectionEvent) => errors.push(event.reason);

afterEach(() => {
  host?.remove();
  window.removeEventListener('unhandledrejection', onRejection);
});

const el = () => host.querySelector<Dropdown & { updateComplete: Promise<unknown> }>('l-dropdown')!;
const item = (value: string) => host.querySelector<DropdownItem>(`[value="${value}"]`)!;
const trigger = () => page.getByRole('button', { name: 'Actions' });

/** Mounts the dropdown, then defines its items — collecting async errors for the whole test. */
async function mountThenDefineItems() {
  errors = [];
  window.addEventListener('unhandledrejection', onRejection);
  host = document.createElement('div');
  host.innerHTML = `
    <l-dropdown style="--show-duration: 0; --hide-duration: 0">
      <button slot="trigger">Actions</button>
      <l-dropdown-item value="edit">Edit</l-dropdown-item>
      <l-dropdown-item value="delete">Delete</l-dropdown-item>
    </l-dropdown>`;
  document.body.append(host);
  await el().updateComplete;
  await import('../../src/html/elements/dropdown-item/index.js');
  await Promise.all(
    [
      ...host.querySelectorAll<DropdownItem & { updateComplete: Promise<unknown> }>(
        'l-dropdown-item',
      ),
    ].map((i) => i.updateComplete),
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function openByClick() {
  const shown = waitForEvent(el(), 'after-show');
  await userEvent.click(trigger());
  await shown;
}

describe('A dropdown whose items are defined after it', () => {
  it('opens and selects normally, with no error from mount to selection', async () => {
    await mountThenDefineItems();
    await openByClick();
    const selected = waitForEvent(el(), 'select');
    await userEvent.click(page.getByRole('menuitem', { name: 'Delete' }));

    const event = (await selected) as Event & { item: { value: string } };
    expect(event.item.value).toBe('delete');
    // The regression: mounting before the items upgraded threw from the
    // dropdown's first update, as an unhandled rejection.
    expect(errors).toEqual([]);
  });
});

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes the late-upgraded items as menu items once open (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mountThenDefineItems();
      await openByClick();

      expect(page.getByRole('menu').elements()).toHaveLength(1);
      expect(page.getByRole('menuitem', { name: 'Edit' }).elements()).toHaveLength(1);
      expect(page.getByRole('menuitem', { name: 'Delete' }).elements()).toHaveLength(1);
    });
  });

  describe('Keyboard interaction (APG menu button pattern)', () => {
    it('opens on ArrowDown from the trigger and focuses the first item (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mountThenDefineItems();
      await userEvent.tab();
      const shown = waitForEvent(el(), 'after-show');
      await userEvent.keyboard('{ArrowDown}');
      await shown;
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(item('edit').shadowRoot!.activeElement).not.toBeNull();
    });
  });

  describe('Focus management', () => {
    it('returns focus to the trigger when Escape closes the menu (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mountThenDefineItems();
      await openByClick();
      const hidden = waitForEvent(el(), 'after-hide');
      await userEvent.keyboard('{Escape}');
      await hidden;

      expect(document.activeElement).toBe(trigger().element());
    });
  });
});
