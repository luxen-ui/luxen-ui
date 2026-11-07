import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
// Only the dropdown is defined: `l-dropdown-item` is never imported in this
// file, so its items stay un-upgraded for every test — the state a consumer
// hits when the two modules load independently (parallel dynamic imports,
// per-element CDN scripts). Each browser test file runs in its own iframe, so
// this registry is not shared with the other suites. The late-upgrade flow
// lives in `dropdown-late-items-upgrade.browser.test.ts`, which does import
// the item; keeping it out of this file keeps these tests order-independent.
import '../../src/html/elements/dropdown/index.js';
import type { Dropdown } from '../../src/html/elements/dropdown/dropdown.js';
import { userEvent } from './support/user-event.js';

let host: HTMLElement;
afterEach(() => host?.remove());

const el = () => host.querySelector<Dropdown & { updateComplete: Promise<unknown> }>('l-dropdown')!;
const trigger = () => page.getByRole('button', { name: 'Actions' });

/** Mounts a closed dropdown whose items are not upgraded; collects async errors and lifecycle events. */
async function mountBeforeItems() {
  const errors: unknown[] = [];
  const onRejection = (event: PromiseRejectionEvent) => errors.push(event.reason);
  window.addEventListener('unhandledrejection', onRejection);
  const events: string[] = [];

  host = document.createElement('div');
  host.innerHTML = `
    <l-dropdown style="--show-duration: 0; --hide-duration: 0">
      <button slot="trigger">Actions</button>
      <l-dropdown-item value="edit">Edit</l-dropdown-item>
      <l-dropdown-item value="delete">Delete</l-dropdown-item>
    </l-dropdown>`;
  for (const type of ['show', 'after-show', 'hide', 'after-hide']) {
    el().addEventListener(type, () => events.push(type));
  }
  document.body.append(host);
  await el().updateComplete;
  // The close path is async (it awaits the hide animation) — let it run out.
  await new Promise((resolve) => setTimeout(resolve, 50));
  window.removeEventListener('unhandledrejection', onRejection);
  return { errors, events };
}

describe('A dropdown mounted before its items are defined', () => {
  it('mounts without error while its items are not upgraded yet', async () => {
    const { errors } = await mountBeforeItems();

    expect(customElements.get('l-dropdown-item')).toBeUndefined();
    expect(errors).toEqual([]);
  });

  it('does not report a hide on mount when it was never opened', async () => {
    const { events } = await mountBeforeItems();

    expect(events).toEqual([]);
  });
});

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('announces the trigger as a collapsed menu button before the items upgrade (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mountBeforeItems();

      const button = trigger().element();
      expect(button.getAttribute('aria-haspopup')).toBe('menu');
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Keyboard interaction (APG menu button pattern)', () => {
    it('keeps the trigger operable from the keyboard: Tab reaches it (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mountBeforeItems();

      await userEvent.tab();

      expect(document.activeElement).toBe(trigger().element());
    });
  });

  describe('Focus management', () => {
    it('leaves the items out of the tab order until they upgrade (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mountBeforeItems();

      await userEvent.tab();
      await userEvent.tab();

      // From the trigger, the next Tab leaves the dropdown: the un-upgraded
      // items are inert text, not focus stops.
      expect(host.contains(document.activeElement)).toBe(false);
    });
  });
});
