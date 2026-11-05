import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
// The browser config has no setup file, so the design tokens are not loaded by
// default. This suite asserts what is *painted*, so it pulls them in. The
// elements bring their own shadow CSS.
import '../../src/css/tokens.css';
import '../../src/html/elements/combobox/index.js';
import '../../src/html/elements/select/index.js';
import type { Combobox } from '../../src/html/elements/combobox/combobox.js';
import type { Select } from '../../src/html/elements/select/select.js';
import { userEvent } from './support/user-event.js';

// The search-query match in the listbox of l-combobox and searchable l-select is
// themed by two form-control tokens. A site that sets them must see every match
// follow — in plain options and in a rich option's title and description alike.

let host: HTMLElement;

afterEach(() => host?.remove());

const OPTIONS = `
  <datalist>
    <option value="fr">France</option>
    <option value="lu" label="Luxembourg">
      <span class="l-select-item-text">
        <span class="l-select-item-title">Luxembourg</span>
        <span class="l-select-item-description">Capital: Luxembourg City</span>
      </span>
    </option>
  </datalist>
`;

async function mount<T extends HTMLElement & { updateComplete: Promise<boolean> }>(
  markup: string,
  tag: string,
  style = '',
): Promise<T> {
  host = document.createElement('div');
  host.setAttribute('style', style);
  host.innerHTML = markup;
  document.body.append(host);
  await customElements.whenDefined(tag);
  const el = host.querySelector<T>(tag)!;
  await settle(el);
  return el;
}

async function settle(el: { updateComplete: Promise<boolean> }) {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const paint = (el: HTMLElement) =>
  Array.from(el.shadowRoot!.querySelectorAll('mark'), (mark) => {
    const cs = getComputedStyle(mark);
    return { text: mark.textContent, background: cs.backgroundColor, weight: cs.fontWeight };
  });

const THEMED =
  '--l-form-control-match-background-color: rgb(1, 2, 3); --l-form-control-match-font-weight: 800;';

describe('A site can theme the search match with form-control tokens', () => {
  it('l-combobox paints plain and rich matches with the tokens', async () => {
    const el = await mount<Combobox>(
      `<l-combobox label="Country">${OPTIONS}</l-combobox>`,
      'l-combobox',
      THEMED,
    );
    await userEvent.click(page.getByRole('combobox', { name: 'Country' }));
    await userEvent.keyboard('r');
    await settle(el);
    const marks = paint(el);
    // "France" (plain) + "Luxembourg" title and description (rich).
    expect(marks.map((m) => m.text)).toEqual(['r', 'r', 'r']);
    for (const mark of marks) {
      expect(mark.background).toBe('rgb(1, 2, 3)');
      expect(mark.weight).toBe('800');
    }
  });

  it('searchable l-select paints plain and rich matches with the tokens', async () => {
    const el = await mount<Select>(
      `<l-select searchable label="Country">${OPTIONS}</l-select>`,
      'l-select',
      THEMED,
    );
    await userEvent.click(page.getByRole('button', { name: 'Country' }));
    await userEvent.keyboard('r');
    await settle(el);
    const marks = paint(el);
    expect(marks.map((m) => m.text)).toEqual(['r', 'r', 'r']);
    for (const mark of marks) {
      expect(mark.background).toBe('rgb(1, 2, 3)');
      expect(mark.weight).toBe('800');
    }
  });

  it('leaves a <mark> authored in a rich option alone', async () => {
    const el = await mount<Combobox>(
      `<l-combobox label="Country">
        <datalist>
          <option value="lu" label="Luxembourg">
            <span class="l-select-item-text">
              <span class="l-select-item-title">Luxembourg</span>
              <span class="l-select-item-description"><mark>New</mark> route</span>
            </span>
          </option>
        </datalist>
      </l-combobox>`,
      'l-combobox',
      THEMED,
    );
    await userEvent.click(page.getByRole('combobox', { name: 'Country' }));
    await userEvent.keyboard('lux');
    await settle(el);
    const marks = paint(el);
    expect(marks.find((m) => m.text === 'Lux')?.background).toBe('rgb(1, 2, 3)');
    const authored = marks.find((m) => m.text === 'New')!;
    expect(authored.background).not.toBe('rgb(1, 2, 3)');
    expect(authored.weight).not.toBe('800');
  });

  it('marks the match with a tinted background by default', async () => {
    const el = await mount<Combobox>(
      `<l-combobox label="Country">${OPTIONS}</l-combobox>`,
      'l-combobox',
    );
    await userEvent.click(page.getByRole('combobox', { name: 'Country' }));
    await userEvent.keyboard('fr');
    await settle(el);
    const [mark] = paint(el);
    expect(mark.background).not.toBe('rgba(0, 0, 0, 0)');
  });
});
