import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/select/index.js';
import type { Select } from '../../src/html/elements/select/select.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';
import { deepActiveElement } from './support/a11y.js';

// Drives l-select (single mode) like a person — clicking the trigger to open,
// typing to filter, arrowing and clicking/Entering to select — and asserts what
// a user or their screen reader observes: the trigger role/name/expanded state,
// the selected value, focus return, and form submission. Shadow DOM,
// form-associated.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<Select> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-select');
  const el = host.querySelector<Select>('l-select')!;
  await settle(el);
  return el;
}

async function settle(el: Select) {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const FIXTURE = `
  <l-select searchable label="Country" name="country" placeholder="Select a country">
    <datalist>
      <option value="us">United States</option>
      <option value="fr">France</option>
      <option value="de">Germany</option>
      <option value="es">Spain</option>
    </datalist>
  </l-select>
`;

const trigger = () => page.getByRole('button', { name: 'Country' });

// ---------------------------------------------------------------------------
// Roles and accessible names
// ---------------------------------------------------------------------------

describe('l-select exposes a listbox trigger to assistive tech', () => {
  it('renders a button labelled by `label` that controls a listbox', async () => {
    await mount(FIXTURE);
    const btn = trigger().element();
    expect(btn.getAttribute('aria-haspopup')).toBe('listbox');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows the placeholder until something is selected', async () => {
    const el = await mount(FIXTURE);
    expect(el.shadowRoot!.querySelector('.placeholder')?.textContent).toContain('Select a country');
  });
});

// ---------------------------------------------------------------------------
// Opening, filtering, selecting
// ---------------------------------------------------------------------------

describe('A user can open, search, and select', () => {
  it('opens on click and moves focus into the search box', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(trigger());
    await settle(el);
    expect(trigger().element().getAttribute('aria-expanded')).toBe('true');
    expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.search'));
  });

  it('filters the options as the user types', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(trigger());
    await userEvent.keyboard('fr');
    await settle(el);
    expect(page.getByRole('option').elements()).toHaveLength(1);
    expect(page.getByRole('option', { name: 'France' }).elements()).toHaveLength(1);
  });

  it('commits a clicked option, closes, and returns focus to the trigger', async () => {
    const el = await mount(FIXTURE);
    const changed = waitForEvent(el, 'change');
    await userEvent.click(trigger());
    await settle(el);
    await userEvent.click(page.getByRole('option', { name: 'France' }));
    const event = (await changed) as SelectChange;
    await settle(el);
    expect(event.value).toBe('fr');
    expect(el.value).toBe('fr');
    expect(trigger().element().getAttribute('aria-expanded')).toBe('false');
    expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.trigger'));
  });

  it('shows a no-results message when nothing matches', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(trigger());
    await userEvent.keyboard('zzz');
    await settle(el);
    expect(el.shadowRoot!.querySelector('[part="empty"]')).not.toBeNull();
  });
});

describe('Search is opt-in (off by default)', () => {
  const PLAIN = `
    <l-select label="Country" name="country">
      <datalist>
        <option value="us">United States</option>
        <option value="fr">France</option>
      </datalist>
    </l-select>
  `;

  it('renders no search box by default and focuses the listbox on open', async () => {
    const el = await mount(PLAIN);
    await userEvent.click(trigger());
    await settle(el);
    expect(el.shadowRoot!.querySelector('.search')).toBeNull();
    expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.listbox'));
  });

  it('navigates and selects by keyboard without a search box', async () => {
    const el = await mount(PLAIN);
    await userEvent.click(trigger());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await settle(el);
    expect(el.value).toBe('fr');
  });
});

// ---------------------------------------------------------------------------
// Pre-selection, clear, form
// ---------------------------------------------------------------------------

describe('Selection state', () => {
  it('seeds the value from a `<option selected>`', async () => {
    const el = await mount(`
      <l-select label="Country" name="country">
        <datalist>
          <option value="us">United States</option>
          <option value="fr" selected>France</option>
        </datalist>
      </l-select>
    `);
    expect(el.value).toBe('fr');
    expect(el.shadowRoot!.querySelector('.value-text')?.textContent).toContain('France');
  });

  it('clears the value with the clear button', async () => {
    const el = await mount(`
      <l-select label="Country" with-clear>
        <datalist>
          <option value="fr" selected>France</option>
        </datalist>
      </l-select>
    `);
    await userEvent.click(page.getByRole('button', { name: 'Clear' }));
    await settle(el);
    expect(el.value).toBe('');
  });

  it('submits the selected value under its name', async () => {
    const el = await mount(`<form>${FIXTURE}</form>`);
    await userEvent.click(trigger());
    await settle(el);
    await userEvent.click(page.getByRole('option', { name: 'Germany' }));
    await settle(el);
    const data = new FormData(host.querySelector('form')!);
    expect(data.get('country')).toBe('de');
  });
});

// ---------------------------------------------------------------------------
// Options that change after mount
// ---------------------------------------------------------------------------

describe('The closed trigger follows the options it was given', () => {
  const valueText = (el: Select) =>
    el.shadowRoot!.querySelector('.value-text')?.textContent?.trim();

  it('re-labels the trigger when an option label is rewritten in place', async () => {
    const el = await mount(`
      <l-select label="Language" name="language" value="fr">
        <datalist>
          <option value="fr" label="French"></option>
          <option value="en" label="English"></option>
        </datalist>
      </l-select>
    `);
    expect(valueText(el)).toBe('French');
    el.querySelector('option[value="fr"]')!.setAttribute('label', 'Francais');
    await settle(el);
    expect(valueText(el)).toBe('Francais');
  });

  it('re-labels the trigger when the text of an option is rewritten', async () => {
    const el = await mount(`
      <l-select label="Language" name="language" value="fr">
        <datalist>
          <option value="fr">French</option>
        </datalist>
      </l-select>
    `);
    el.querySelector('option[value="fr"]')!.textContent = 'Francais';
    await settle(el);
    expect(valueText(el)).toBe('Francais');
  });

  it('keeps the highlighted option under the cursor when the list grows', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(trigger());
    await settle(el);
    // Arrow to the third option, then let a background refresh push a new
    // option in above it.
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await settle(el);
    expect(el.shadowRoot!.querySelector('[data-active]')?.textContent?.trim()).toBe('Germany');
    const added = document.createElement('option');
    added.value = 'at';
    added.textContent = 'Austria';
    el.querySelector('datalist')!.prepend(added);
    await settle(el);
    expect(el.shadowRoot!.querySelector('[data-active]')?.textContent?.trim()).toBe('Germany');
    await userEvent.keyboard('{Enter}');
    await settle(el);
    expect(el.value).toBe('de');
  });

  it('drops the highlight when the highlighted option disappears', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(trigger());
    await settle(el);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await settle(el);
    el.querySelector('option[value="de"]')!.remove();
    await settle(el);
    expect(el.shadowRoot!.querySelector('[data-active]')).toBeNull();
    // No dangling aria-activedescendant pointing at a row that no longer exists.
    const listbox = el.shadowRoot!.querySelector('.listbox')!;
    expect(listbox.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('re-labels the chips of a multiple select', async () => {
    const el = await mount(`
      <l-select multiple label="Tags" name="tags">
        <datalist>
          <option value="design" selected>Design</option>
        </datalist>
      </l-select>
    `);
    el.querySelector('option[value="design"]')!.setAttribute('label', 'Conception');
    await settle(el);
    expect(el.shadowRoot!.querySelector('[part="tag"]')?.textContent?.trim()).toBe('Conception');
  });
});

// ---------------------------------------------------------------------------
// Accessibility (APG: select-only / listbox popup)
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('reflects required as aria-required on the trigger', async () => {
      await mount(
        `<l-select label="Country" required><datalist><option value="fr">France</option></datalist></l-select>`,
      );
      expect(trigger().element().getAttribute('aria-required')).toBe('true');
    });
  });

  describe('Keyboard interaction (APG listbox)', () => {
    it('opens with ArrowDown and commits with Enter', async () => {
      const el = await mount(FIXTURE);
      await userEvent.click(trigger());
      await userEvent.keyboard('{ArrowDown}{Enter}');
      await settle(el);
      expect(el.value).toBe('us');
      expect(trigger().element().getAttribute('aria-expanded')).toBe('false');
    });

    it('closes on Escape and returns focus to the trigger', async () => {
      const el = await mount(FIXTURE);
      await userEvent.click(trigger());
      await settle(el);
      await userEvent.keyboard('{Escape}');
      await settle(el);
      expect(trigger().element().getAttribute('aria-expanded')).toBe('false');
      expect(deepActiveElement()).toBe(el.shadowRoot!.querySelector('.trigger'));
    });
  });
});

// ---------------------------------------------------------------------------
// Multiple mode
// ---------------------------------------------------------------------------

const MULTI = `
  <l-select multiple label="Tags" name="tags">
    <datalist>
      <option value="design">Design</option>
      <option value="dev">Development</option>
      <option value="qa">QA</option>
    </datalist>
  </l-select>
`;

const multiTrigger = () => page.getByRole('combobox', { name: 'Tags' });

describe('Multiple mode lets a user pick several values', () => {
  it('exposes a multiselectable listbox from a combobox trigger', async () => {
    const el = await mount(MULTI);
    expect(multiTrigger().elements()).toHaveLength(1);
    await userEvent.click(multiTrigger());
    await settle(el);
    expect(
      el.shadowRoot!.querySelector('[role="listbox"]')!.getAttribute('aria-multiselectable'),
    ).toBe('true');
  });

  it('toggles options on and off without closing', async () => {
    const el = await mount(MULTI);
    await userEvent.click(multiTrigger());
    await settle(el);
    await userEvent.click(page.getByRole('option', { name: 'Design' }));
    await settle(el);
    await userEvent.click(page.getByRole('option', { name: 'QA' }));
    await settle(el);
    expect(el.value).toEqual(['design', 'qa']);
    // Still open after selecting.
    expect(multiTrigger().element().getAttribute('aria-expanded')).toBe('true');
    // Re-clicking deselects.
    await userEvent.click(page.getByRole('option', { name: 'Design' }));
    await settle(el);
    expect(el.value).toEqual(['qa']);
  });

  it('seeds chips from `<option selected>` and removes one via its × button', async () => {
    const el = await mount(`
      <l-select multiple label="Tags" name="tags">
        <datalist>
          <option value="design" selected>Design</option>
          <option value="dev" selected>Development</option>
          <option value="qa">QA</option>
        </datalist>
      </l-select>
    `);
    expect(el.value).toEqual(['design', 'dev']);
    expect(page.getByRole('button', { name: 'Remove' }).elements().length).toBeGreaterThanOrEqual(
      2,
    );
    // Remove the first chip.
    await userEvent.click(page.getByRole('button', { name: 'Remove' }).first());
    await settle(el);
    expect(el.value).toEqual(['dev']);
  });

  it('submits one form entry per selected value', async () => {
    const el = await mount(`<form>${MULTI}</form>`);
    await userEvent.click(multiTrigger());
    await settle(el);
    await userEvent.click(page.getByRole('option', { name: 'Design' }));
    await userEvent.click(page.getByRole('option', { name: 'QA' }));
    await settle(el);
    const data = new FormData(host.querySelector('form')!);
    expect(data.getAll('tags')).toEqual(['design', 'qa']);
  });
});

interface SelectChange extends Event {
  value: string | string[];
}
