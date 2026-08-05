import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/tag/index.js';
import type { Tag, TagChangeEvent } from '../../src/html/elements/tag/tag.js';
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

  it.each(['sm', 'md', 'lg'])('shows descenders in full at size=%s', async (size: string) => {
    // The label sits in a one-em line box, so its descenders (g, j, p, q, y)
    // spill below it and a plain `overflow: hidden` shears them. The clip
    // rectangle has to cover that spill — assert the invariant rather than the
    // declaration, so it keeps holding if either side is retuned.
    const el = await mount(`<l-tag size="${size}">Language typography</l-tag>`);
    const content = el.shadowRoot!.querySelector('[part="content"]')!;
    const styles = getComputedStyle(content);
    const spill = content.scrollHeight - content.clientHeight;
    expect(styles.overflowY).toBe('clip');
    expect(parseFloat(styles.overflowClipMargin)).toBeGreaterThanOrEqual(spill);
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

  it('lets the × click reach a delegating ancestor', async () => {
    // Filter panels delegate clicks on a container. Swallowing the event inside
    // the shadow root would make removals invisible to that listener.
    const el = await mount(`<l-tag removable>Design</l-tag>`);
    el.addEventListener('remove', (e) => e.preventDefault());
    const seen: string[] = [];
    host.addEventListener('click', (e) => seen.push((e.target as Element).tagName));
    await userEvent.click(removeButton());
    await settle(el);
    expect(seen).toContain(el.tagName);
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
// Selection
// ---------------------------------------------------------------------------

describe('A user can toggle a selectable tag', () => {
  it('selects it on click and fires `change` with the new state', async () => {
    const el = await mount(`<l-tag selectable>A3</l-tag>`);
    const changed = waitForEvent(el, 'change');
    await userEvent.click(page.getByRole('button', { name: 'A3' }));
    const event = (await changed) as TagChangeEvent;
    expect(event.selected).toBe(true);
    expect(el.selected).toBe(true);
  });

  it('releases it on a second click — a facet always has a way back to "all"', async () => {
    const el = await mount(`<l-tag selectable selected>A3</l-tag>`);
    await userEvent.click(page.getByRole('button', { name: 'A3' }));
    await settle(el);
    expect(el.selected).toBe(false);
  });

  it('cannot be toggled when disabled — the chip is a disabled button', async () => {
    // A disabled button takes neither click nor focus, so no interaction can
    // reach the toggle path at all; the chip stays unselected.
    const el = await mount(`<l-tag selectable disabled>A3</l-tag>`);
    expect(page.getByRole('button', { name: 'A3' }).element().hasAttribute('disabled')).toBe(true);
    expect(el.selected).toBe(false);
  });

  it('reflects `selected` so a consumer can style and query [selected]', async () => {
    const el = await mount(`<l-tag selectable>A3</l-tag>`);
    el.selected = true;
    await settle(el);
    expect(el.matches('[selected]')).toBe(true);
  });

  it('lets a controlling host veto the toggle by setting `selected` back', async () => {
    // The chip is uncontrolled — it applies the state then dispatches. A host
    // enforcing its own rule (max N filters, an async guard) reverts inside the
    // listener; the revert lands in the same render, so the user never sees the
    // chip flip. Documented under "Controlled usage".
    const el = await mount(`<l-tag selectable>A3</l-tag>`);
    el.addEventListener('change', () => {
      el.selected = false;
    });
    await userEvent.click(page.getByRole('button', { name: 'A3' }));
    await settle(el);
    expect(el.selected).toBe(false);
    expect(page.getByRole('button', { name: 'A3', pressed: false }).elements()).toHaveLength(1);
  });

  it('is a plain chip — no button — without `selectable`', async () => {
    await mount(`<l-tag>A3</l-tag>`);
    expect(page.getByRole('button', { name: 'A3' }).elements()).toHaveLength(0);
  });
});

// The chip is the checkbox's <label>, so a user aims at the text, not at the
// 15px box — and that is also the only reliable target here: the box is sized
// from `--l-form-control-toggle-size`, and the behavioural suites deliberately
// run without the token stylesheet (the a11y suite is the one that loads it).
const chipLabel = (el: Tag) => el.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!;

describe('A user can toggle a tag that carries a checkbox', () => {
  it('checks the box when the chip label is clicked', async () => {
    const el = await mount(
      `<l-tag selectable control="checkbox">Color <span slot="suffix">54</span></l-tag>`,
    );
    const changed = waitForEvent(el, 'change');
    await userEvent.click(chipLabel(el));
    const event = (await changed) as TagChangeEvent;
    expect(event.selected).toBe(true);
    expect(el.selected).toBe(true);
    expect(page.getByRole('checkbox', { name: 'Color 54', checked: true }).elements()).toHaveLength(
      1,
    );
  });

  it('unchecks it again on a second click', async () => {
    const el = await mount(`<l-tag selectable control="checkbox" selected>Color</l-tag>`);
    await userEvent.click(chipLabel(el));
    await settle(el);
    expect(el.selected).toBe(false);
  });

  it('keeps the box in sync when `selected` is set from the outside', async () => {
    const el = await mount(`<l-tag selectable control="checkbox">Color</l-tag>`);
    el.selected = true;
    await settle(el);
    expect(page.getByRole('checkbox', { name: 'Color', checked: true }).elements()).toHaveLength(1);
  });

  it('unchecks the box too when a controlling host vetoes the toggle', async () => {
    // The veto sets `selected` back to the value Lit last wrote, so the
    // `.checked` binding dirty-checks itself out — but the click already had the
    // user agent flip the box. Without a re-assert the chip reads unselected
    // while its box stays checked, and a screen reader announces "checked".
    const el = await mount(`<l-tag selectable control="checkbox">Color</l-tag>`);
    el.addEventListener('change', () => {
      el.selected = false;
    });
    await userEvent.click(chipLabel(el));
    await settle(el);
    expect(el.selected).toBe(false);
    expect(page.getByRole('checkbox', { name: 'Color', checked: false }).elements()).toHaveLength(
      1,
    );
  });

  it('does not toggle when the × inside the label is clicked', async () => {
    // The remove button lives inside the chip's <label>. Label activation skips
    // interactive content descendants, so removing must never flip the box.
    const el = await mount(`<l-tag selectable control="checkbox" removable>Color</l-tag>`);
    el.addEventListener('remove', (e) => e.preventDefault());
    await userEvent.click(removeButton());
    await settle(el);
    expect(el.selected).toBe(false);
  });

  it('implies `selectable`, so the styling hook is there without repeating it', async () => {
    const el = await mount(`<l-tag control="checkbox">Color</l-tag>`);
    expect(el.matches('[selectable]')).toBe(true);
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

    it('a selectable tag is a toggle button named by its label (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(`<l-tag selectable>A3</l-tag>`);
      const toggle = page.getByRole('button', { name: 'A3' }).element();
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
    });

    it('exposes the pressed state when selected (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(`<l-tag selectable selected>A3</l-tag>`);
      const toggle = page.getByRole('button', { name: 'A3' }).element();
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
    });

    it('exposes a checkbox named by the whole chip with control="checkbox" (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(
        `<l-tag selectable control="checkbox" selected>Color <span slot="suffix">54</span></l-tag>`,
      );
      expect(
        page.getByRole('checkbox', { name: 'Color 54', checked: true }).elements(),
      ).toHaveLength(1);
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

    it('toggles a selectable tag with Space (WCAG 2.1.1 / RGAA 7.3)', async () => {
      const el = await mount(`<l-tag selectable>A3</l-tag>`);
      await userEvent.tab();
      const changed = waitForEvent(el, 'change');
      await userEvent.keyboard(' ');
      await changed;
      expect(el.selected).toBe(true);
    });

    it('toggles a selectable tag with Enter (WCAG 2.1.1 / RGAA 7.3)', async () => {
      const el = await mount(`<l-tag selectable>A3</l-tag>`);
      await userEvent.tab();
      const changed = waitForEvent(el, 'change');
      await userEvent.keyboard('{Enter}');
      await changed;
      expect(el.selected).toBe(true);
    });

    it('toggles a checkbox tag with Space (WCAG 2.1.1 / RGAA 7.3)', async () => {
      const el = await mount(`<l-tag selectable control="checkbox">Color</l-tag>`);
      await userEvent.tab();
      const changed = waitForEvent(el, 'change');
      await userEvent.keyboard(' ');
      await changed;
      expect(el.selected).toBe(true);
    });
  });

  describe('Focus management', () => {
    it('the remove button is reachable with Tab (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mountAndFocusRemove(`<l-tag removable>Design</l-tag>`);
      expect(deepActiveElement()).toBe(removeButton().element());
    });

    it('a selectable tag takes focus before its remove button (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(`<l-tag selectable removable>A3</l-tag>`);
      await userEvent.tab();
      expect(deepActiveElement()).toBe(page.getByRole('button', { name: 'A3' }).element());
      await userEvent.tab();
      expect(deepActiveElement()).toBe(removeButton().element());
    });

    it('shows a single focus indicator, drawn around the whole chip (WCAG 2.4.13)', async () => {
      // The shared checkbox appearance nests its own `:focus-visible` ring under
      // a selector list, which outranks a bare `.checkbox:focus-visible` — left
      // unqualified it paints a second ring inside the chip's. Assert the box
      // carries none; the chip's own ring uses `--l-focus-ring`, and the token
      // stylesheet is deliberately absent from the behavioural suites.
      const el = await mount(`<l-tag selectable control="checkbox">Color</l-tag>`);
      await userEvent.tab();
      const box = el.shadowRoot!.querySelector('input')!;
      expect(el.shadowRoot!.activeElement).toBe(box);
      expect(getComputedStyle(box).outlineStyle).toBe('none');
    });

    it('a disabled selectable tag is skipped by Tab (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(`<l-tag selectable disabled>A3</l-tag>`);
      await userEvent.tab();
      expect(deepActiveElement()).not.toBe(page.getByRole('button', { name: 'A3' }).element());
    });
  });
});
