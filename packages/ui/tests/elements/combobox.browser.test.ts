import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/combobox/index.js';
import type { Combobox } from '../../src/html/elements/combobox/combobox.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';

// Drives l-combobox like a person — clicking to open, typing to filter, arrowing
// and pressing Enter to select — and asserts what a user (or their screen
// reader) observes: the combobox role/name, filtered options, the value, and
// form submission. Shadow-DOM, form-associated.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<Combobox> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-combobox');
  const el = host.querySelector<Combobox>('l-combobox')!;
  await settle(el);
  return el;
}

async function settle(el: Combobox) {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const FIXTURE = `
  <l-combobox label="Country" name="country">
    <datalist>
      <option value="us">United States</option>
      <option value="fr">France</option>
      <option value="de">Germany</option>
      <option value="es">Spain</option>
    </datalist>
  </l-combobox>
`;

const combobox = () => page.getByRole('combobox', { name: 'Country' });

// ---------------------------------------------------------------------------
// Roles and accessible names
// ---------------------------------------------------------------------------

describe('l-combobox exposes a combobox to assistive tech', () => {
  it('renders a combobox input with the label as its accessible name', async () => {
    await mount(FIXTURE);
    expect(combobox().elements()).toHaveLength(1);
  });

  it('is collapsed until opened', async () => {
    await mount(FIXTURE);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

describe('Typing filters the options', () => {
  it('opens and narrows the list to matching options', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await userEvent.keyboard('fr');
    await settle(el);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('true');
    const options = page.getByRole('option');
    expect(options.elements()).toHaveLength(1);
    expect((await options.element()).textContent?.trim()).toBe('France');
  });

  it('shows a no-results message when nothing matches', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await userEvent.keyboard('zzz');
    await settle(el);
    expect(page.getByRole('option').elements()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Keyboard selection (APG combobox)
// ---------------------------------------------------------------------------

describe('A keyboard user can select an option (WCAG 2.1.1 / RGAA 7.3)', () => {
  it('arrows to an option and commits it with Enter', async () => {
    const el = await mount(FIXTURE);
    const changed = waitForEvent(el, 'change');
    await userEvent.click(combobox());
    await userEvent.keyboard('fr');
    await settle(el);
    await userEvent.keyboard('{ArrowDown}');
    await settle(el);
    // The active option is reflected via aria-activedescendant.
    expect(combobox().element().getAttribute('aria-activedescendant')).toBeTruthy();
    await userEvent.keyboard('{Enter}');
    const event = (await changed) as Event & { value: string };
    await settle(el);
    expect(event.value).toBe('fr');
    expect(el.value).toBe('fr');
    expect(combobox().element().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape without selecting', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await settle(el);
    await userEvent.keyboard('{Escape}');
    await settle(el);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('false');
    expect(el.value).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Form participation
// ---------------------------------------------------------------------------

describe('l-combobox participates in forms', () => {
  it('submits the selected value under its name', async () => {
    const el = await mount(`<form>${FIXTURE}</form>`);
    await userEvent.click(combobox());
    await userEvent.keyboard('germ');
    await settle(el);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await settle(el);
    const data = new FormData(host.querySelector('form')!);
    expect(data.get('country')).toBe('de');
  });
});

// ---------------------------------------------------------------------------
// Accessibility details (APG combobox)
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  it('reflects required as aria-required on the input', async () => {
    await mount(
      `<l-combobox label="Country" required><datalist><option value="fr">France</option></datalist></l-combobox>`,
    );
    expect(combobox().element().getAttribute('aria-required')).toBe('true');
  });

  it('names the listbox and shows a no-results message outside it', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await settle(el);
    const listbox = el.shadowRoot!.querySelector('[role="listbox"]')!;
    expect(listbox.getAttribute('aria-label')).toBe('Country');
    await userEvent.keyboard('zzz');
    await settle(el);
    // The "no results" message is not an invalid listbox child.
    expect(listbox.querySelector('[part="empty"]')).toBeNull();
    expect(el.shadowRoot!.querySelector('[part="empty"]')).not.toBeNull();
  });

  it('keeps focus on the input while navigating (aria-activedescendant)', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await userEvent.keyboard('{ArrowDown}');
    await settle(el);
    // DOM focus stays on the input, not an option.
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.input'));
    expect(combobox().element().getAttribute('aria-activedescendant')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Rich options
// ---------------------------------------------------------------------------

const RICH = `
  <l-combobox label="Country">
    <datalist>
      <option value="us" label="United States">
        <span class="l-select-item-title">United States</span>
        <span class="l-select-item-description">North America</span>
      </option>
      <option value="fr" label="France">
        <span class="l-select-item-title">France</span>
        <span class="l-select-item-description">Europe</span>
      </option>
    </datalist>
  </l-combobox>
`;

describe('Options can carry rich content', () => {
  it('renders the authored markup and filters by the title', async () => {
    const el = await mount(RICH);
    await userEvent.click(combobox());
    await settle(el);
    expect(el.shadowRoot!.querySelector('.option-rich .l-select-item-title')).not.toBeNull();
    // "europe" is in a description, not the title → no match.
    await userEvent.keyboard('europe');
    await settle(el);
    expect(page.getByRole('option').elements()).toHaveLength(0);
  });

  it('selecting a rich option shows the title in the input', async () => {
    const el = await mount(RICH);
    await userEvent.click(combobox());
    await userEvent.keyboard('fra');
    await settle(el);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await settle(el);
    expect(el.value).toBe('fr');
    expect(el.shadowRoot!.querySelector<HTMLInputElement>('.input')!.value).toBe('France');
  });
});
