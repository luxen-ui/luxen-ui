import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/tag/index.js';
import type { Tag } from '../../src/html/elements/tag/tag.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';
import { deepActiveElement } from './support/a11y.js';

// Drives l-tag like a person — clicking the × button, pressing Backspace/Delete
// while it is focused — and asserts what a user (or their screen reader)
// observes: the label, the remove button's accessible name, the `remove` event,
// and whether the chip leaves the DOM. Shadow DOM.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<Tag> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-tag');
  const el = host.querySelector<Tag>('l-tag')!;
  await settle(el);
  return el;
}

// A removable tag's only focusable node is its × button — clicking it to focus
// would also remove it. So to land keyboard focus on the button the way a user
// would, mount a focusable sentinel before the tag, click it, then Tab once.
async function mountAndFocusRemove(html: string): Promise<Tag> {
  const el = await mount(`<button type="button">before</button>${html}`);
  await userEvent.click(page.getByRole('button', { name: 'before' }));
  await userEvent.tab();
  return el;
}

async function settle(el: Tag) {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const removeButton = () => page.getByRole('button', { name: 'Remove' });

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('l-tag renders a chip', () => {
  it('shows its label', async () => {
    const el = await mount(`<l-tag>Design</l-tag>`);
    expect(el.textContent?.trim()).toBe('Design');
  });

  it('has no remove button unless removable', async () => {
    await mount(`<l-tag>Design</l-tag>`);
    expect(removeButton().elements()).toHaveLength(0);
  });

  it('exposes a named remove button when removable', async () => {
    await mount(`<l-tag removable>Design</l-tag>`);
    expect(removeButton().elements()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Removal
// ---------------------------------------------------------------------------

describe('A user can remove the tag', () => {
  it('fires `remove` and leaves the DOM when the × button is clicked', async () => {
    const el = await mount(`<l-tag removable>Design</l-tag>`);
    const removed = waitForEvent(el, 'remove');
    await userEvent.click(removeButton());
    await removed;
    expect(el.isConnected).toBe(false);
  });

  it('stays in the DOM when a listener calls preventDefault (controlled host)', async () => {
    const el = await mount(`<l-tag removable>Design</l-tag>`);
    el.addEventListener('remove', (e) => e.preventDefault());
    await userEvent.click(removeButton());
    await settle(el);
    expect(el.isConnected).toBe(true);
  });

  it('cannot be removed when disabled — the × button is disabled and unfocusable', async () => {
    const el = await mount(`<l-tag removable disabled>Locked</l-tag>`);
    // A disabled button is non-interactive and skipped by Tab, so neither click
    // nor keyboard can reach the removal path — the chip stays in the DOM.
    expect(removeButton().element().hasAttribute('disabled')).toBe(true);
    await userEvent.tab();
    expect(deepActiveElement()).not.toBe(removeButton().element());
    expect(el.isConnected).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Accessibility (APG: no dedicated pattern — a chip with a remove button)
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('the remove button has an accessible name (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(`<l-tag removable>Design</l-tag>`);
      expect(removeButton().element().getAttribute('aria-label')).toBe('Remove');
    });
  });

  describe('Keyboard interaction', () => {
    it('removes the focused tag with Backspace (WCAG 2.1.1 / RGAA 7.3)', async () => {
      const el = await mountAndFocusRemove(`<l-tag removable>Design</l-tag>`);
      expect(deepActiveElement()).toBe(removeButton().element());
      const removed = waitForEvent(el, 'remove');
      await userEvent.keyboard('{Backspace}');
      await removed;
      expect(el.isConnected).toBe(false);
    });

    it('removes the focused tag with Delete (WCAG 2.1.1 / RGAA 7.3)', async () => {
      const el = await mountAndFocusRemove(`<l-tag removable>Design</l-tag>`);
      expect(deepActiveElement()).toBe(removeButton().element());
      const removed = waitForEvent(el, 'remove');
      await userEvent.keyboard('{Delete}');
      await removed;
      expect(el.isConnected).toBe(false);
    });
  });

  describe('Focus management', () => {
    it('the remove button is reachable with Tab (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mountAndFocusRemove(`<l-tag removable>Design</l-tag>`);
      expect(deepActiveElement()).toBe(removeButton().element());
    });
  });
});
