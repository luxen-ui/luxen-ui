import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
// The end actions (clear, chevron) are sized from the form-control tokens — a
// required stylesheet — so without it they collapse and cannot be clicked.
import '../../src/css/tokens.css';
import '../../src/html/elements/combobox/index.js';
import type { Combobox } from '../../src/html/elements/combobox/combobox.js';
import { deepActiveElement } from './support/a11y.js';
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

describe('Clicking outside closes the list', () => {
  const OUTSIDE = `<p id="outside" style="block-size: 4rem">Elsewhere</p>${FIXTURE}`;
  const chevron = (el: Combobox) =>
    page.elementLocator(el.shadowRoot!.querySelector<HTMLElement>('.chevron')!);
  const clickOutside = () =>
    userEvent.click(page.elementLocator(document.getElementById('outside')!));

  it('closes a list opened from the input', async () => {
    const el = await mount(OUTSIDE);
    await userEvent.click(combobox());
    await settle(el);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('true');
    await clickOutside();
    await settle(el);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes a list opened from the chevron', async () => {
    const el = await mount(OUTSIDE);
    await userEvent.click(chevron(el));
    await settle(el);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('true');
    await clickOutside();
    await settle(el);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('false');
  });

  it('moves focus into the input when the chevron is clicked', async () => {
    const el = await mount(OUTSIDE);
    await userEvent.click(chevron(el));
    await settle(el);
    expect(deepActiveElement()).toBe(combobox().element());
  });
});

describe('A mouse user toggles the list with the chevron', () => {
  const chevron = (el: Combobox) =>
    page.elementLocator(el.shadowRoot!.querySelector<HTMLElement>('.chevron')!);

  it('opens the list, then closes it on a second click', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(chevron(el));
    await settle(el);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('true');
    await userEvent.click(chevron(el));
    await settle(el);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps focus in the input while it closes the list', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(chevron(el));
    await settle(el);
    await userEvent.click(chevron(el));
    await settle(el);
    expect(deepActiveElement()).toBe(combobox().element());
  });

  it('leaves the list open when the user clicks into the text', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await settle(el);
    await userEvent.click(combobox());
    await settle(el);
    expect(combobox().element().getAttribute('aria-expanded')).toBe('true');
  });
});

describe('A mouse user shares one highlight with the keyboard', () => {
  const highlighted = () => page.getByRole('option', { selected: true }).elements();

  it('highlights the hovered option, and only that one', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await userEvent.keyboard('{ArrowDown}');
    await settle(el);
    await userEvent.hover(page.getByRole('option', { name: 'Germany' }));
    await settle(el);
    const rows = highlighted();
    expect(rows).toHaveLength(1);
    expect(rows[0]!.textContent?.trim()).toBe('Germany');
  });

  it('commits the hovered option with Enter', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await settle(el);
    await userEvent.hover(page.getByRole('option', { name: 'Spain' }));
    await settle(el);
    await userEvent.keyboard('{Enter}');
    await settle(el);
    expect(el.value).toBe('es');
  });

  it('forgets the hovered option once the pointer leaves the list', async () => {
    const el = await mount(FIXTURE.replace('<l-combobox', '<l-combobox allow-custom'));
    await userEvent.click(combobox());
    await userEvent.keyboard('Ger');
    await settle(el);
    await userEvent.hover(page.getByRole('option', { name: 'Germany' }));
    await settle(el);
    await userEvent.hover(combobox());
    await settle(el);
    expect(highlighted()).toHaveLength(0);
    await userEvent.keyboard('{Enter}');
    await settle(el);
    expect(el.value).toBe('Ger');
  });

  it('does not leave the highlight behind on a disabled option', async () => {
    const el = await mount(FIXTURE.replace('value="de"', 'value="de" disabled'));
    await userEvent.click(combobox());
    await settle(el);
    await userEvent.hover(page.getByRole('option', { name: 'France' }));
    await settle(el);
    await userEvent.hover(page.getByRole('option', { name: 'Germany' }));
    await settle(el);
    expect(highlighted()).toHaveLength(0);
  });
});

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
// Options that change after mount
// ---------------------------------------------------------------------------

describe('The input follows the options it was given', () => {
  const displayed = (el: Combobox) =>
    el.shadowRoot!.querySelector<HTMLInputElement>('.input')!.value;

  const language = () => page.getByRole('combobox', { name: 'Language' });

  const LANGUAGES = `
    <l-combobox label="Language" name="language" value="fr">
      <datalist>
        <option value="fr" label="French"></option>
        <option value="en" label="English"></option>
      </datalist>
    </l-combobox>
  `;

  it('re-labels the closed input when an option label is rewritten in place', async () => {
    const el = await mount(LANGUAGES);
    expect(displayed(el)).toBe('French');
    // The form the docs recommend: the `label` IDL attribute, which reflects.
    el.querySelector<HTMLOptionElement>('option[value="fr"]')!.label = 'Francais';
    await settle(el);
    expect(displayed(el)).toBe('Francais');
  });

  it('keeps the highlighted option under the cursor when the list grows', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await settle(el);
    expect(page.getByRole('option', { name: 'France', selected: true }).elements()).toHaveLength(1);
    // A background refresh pushes a new option in above the highlighted one.
    const added = document.createElement('option');
    added.value = 'at';
    added.textContent = 'Austria';
    el.querySelector('datalist')!.prepend(added);
    await settle(el);
    expect(page.getByRole('option', { name: 'France', selected: true }).elements()).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
    await settle(el);
    expect(el.value).toBe('fr');
  });

  it('catches up on labels that changed while it was detached', async () => {
    const el = await mount(LANGUAGES);
    expect(displayed(el)).toBe('French');
    const parent = el.parentElement!;
    el.remove();
    el.querySelector('option[value="fr"]')!.setAttribute('label', 'Francais');
    parent.append(el);
    await settle(el);
    expect(displayed(el)).toBe('Francais');
  });

  it('keeps text the user is typing when the panel was kept closed', async () => {
    const el = await mount(FIXTURE);
    // A consumer vetoes `show`, so the panel never opens while the user types.
    el.addEventListener('show', (e) => e.preventDefault());
    await userEvent.click(combobox());
    await userEvent.keyboard('ger');
    await settle(el);
    expect(displayed(el)).toBe('ger');
    el.querySelector('option[value="fr"]')!.setAttribute('label', 'Francais');
    await settle(el);
    expect(displayed(el)).toBe('ger');
  });

  it('leaves the query alone while the user is typing', async () => {
    const el = await mount(`
      <l-combobox label="Language" name="language">
        <datalist>
          <option value="fr" label="French"></option>
          <option value="en" label="English"></option>
        </datalist>
      </l-combobox>
    `);
    await userEvent.click(language());
    await userEvent.keyboard('eng');
    await settle(el);
    el.querySelector('option[value="fr"]')!.setAttribute('label', 'Francais');
    await settle(el);
    expect(displayed(el)).toBe('eng');
    expect(page.getByRole('option', { name: 'English' }).elements()).toHaveLength(1);
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
    expect(el.shadowRoot!.querySelector('[role="option"] .l-select-item-title')).not.toBeNull();
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

  // A rich option with neither `label` nor `.l-select-item-title`.
  const UNTITLED = `
    <l-combobox label="Country">
      <datalist>
        <option value="fr">
          <span class="l-select-item-text">France</span>
          <span class="l-select-item-suffix">3 open</span>
        </option>
        <option value="de">
          <span class="l-select-item-text">Germany</span>
        </option>
      </datalist>
    </l-combobox>
  `;

  it('does not match the suffix of an untitled option', async () => {
    const el = await mount(UNTITLED);
    await userEvent.click(combobox());
    await userEvent.keyboard('open');
    await settle(el);
    expect(page.getByRole('option').elements()).toHaveLength(0);
  });

  it('writes an untitled option into the input without its suffix', async () => {
    const el = await mount(UNTITLED);
    await userEvent.click(combobox());
    await userEvent.keyboard('fra');
    await settle(el);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await settle(el);
    expect(el.value).toBe('fr');
    expect(el.shadowRoot!.querySelector<HTMLInputElement>('.input')!.value).toBe('France');
  });
});

describe('Typing highlights the match inside rich options', () => {
  const RICH_HIGHLIGHT = `
    <l-combobox label="Country">
      <datalist>
        <option value="lu" label="Luxembourg">
          <span class="l-select-item-media">🇱🇺</span>
          <span class="l-select-item-text">
            <span class="l-select-item-title">Luxembourg</span>
            <span class="l-select-item-description">Capital: Luxembourg City</span>
          </span>
        </option>
        <option value="ci" label="Côte d'Ivoire">
          <span class="l-select-item-text">
            <span class="l-select-item-title">Côte d'Ivoire</span>
            <span class="l-select-item-description">West Africa</span>
          </span>
        </option>
        <option value="ag" label="Antigua &amp; Barbuda">
          <span class="l-select-item-text">
            <span class="l-select-item-title">Antigua &amp; Barbuda</span>
            <span class="l-select-item-description">Caribbean</span>
          </span>
        </option>
      </datalist>
    </l-combobox>
  `;

  const marks = (el: Combobox, zone: 'title' | 'description') =>
    Array.from(
      el.shadowRoot!.querySelectorAll(`[role="option"] .l-select-item-${zone} mark`),
      (m) => m.textContent,
    );

  it('marks the match in the title and the description', async () => {
    const el = await mount(RICH_HIGHLIGHT);
    await userEvent.click(combobox());
    await userEvent.keyboard('lux');
    await settle(el);
    expect(marks(el, 'title')).toEqual(['Lux']);
    expect(marks(el, 'description')).toEqual(['Lux']);
  });

  it('keeps the option markup and its text as authored', async () => {
    const el = await mount(RICH_HIGHLIGHT);
    await userEvent.click(combobox());
    await userEvent.keyboard('lux');
    await settle(el);
    const option = el.shadowRoot!.querySelector('[role="option"]')!;
    expect(option.querySelector('.l-select-item-media')?.textContent).toBe('🇱🇺');
    expect(option.querySelector('.l-select-item-title')?.textContent).toBe('Luxembourg');
    expect(option.querySelector('.l-select-item-description')?.textContent).toBe(
      'Capital: Luxembourg City',
    );
    expect(page.getByRole('option', { name: /Luxembourg/ }).elements()).toHaveLength(1);
  });

  it('matches regardless of case and accents', async () => {
    const el = await mount(RICH_HIGHLIGHT);
    await userEvent.click(combobox());
    await userEvent.keyboard('COTE');
    await settle(el);
    expect(marks(el, 'title')).toEqual(['Côte']);
  });

  it('matches text that carries HTML-special characters as plain text', async () => {
    const el = await mount(RICH_HIGHLIGHT);
    await userEvent.click(combobox());
    await userEvent.keyboard('& b');
    await settle(el);
    // Each keyword is marked on its own.
    expect(marks(el, 'title')).toEqual(['&', 'B']);
    expect(el.shadowRoot!.querySelector('[role="option"] .l-select-item-title')?.textContent).toBe(
      'Antigua & Barbuda',
    );
  });

  it('marks text nested in two zones once', async () => {
    const el = await mount(`
      <l-combobox label="Country">
        <datalist>
          <option value="fr" label="Paris">
            <span class="l-select-item-title"
              >Paris <span class="l-select-item-description">Paris area</span></span
            >
          </option>
        </datalist>
      </l-combobox>
    `);
    await userEvent.click(combobox());
    await userEvent.keyboard('paris');
    await settle(el);
    expect(el.shadowRoot!.querySelectorAll('[role="option"] mark')).toHaveLength(2);
    expect(el.shadowRoot!.querySelector('[role="option"] mark mark')).toBeNull();
  });

  it('leaves rich options untouched when `highlight` is off', async () => {
    const el = await mount(RICH_HIGHLIGHT);
    el.highlight = false;
    await userEvent.click(combobox());
    await userEvent.keyboard('lux');
    await settle(el);
    expect(el.shadowRoot!.querySelectorAll('[role="option"] mark')).toHaveLength(0);
  });

  it('clears the marks once the query is erased', async () => {
    const el = await mount(RICH_HIGHLIGHT);
    await userEvent.click(combobox());
    await userEvent.keyboard('lux');
    await settle(el);
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');
    await settle(el);
    expect(page.getByRole('option').elements()).toHaveLength(3);
    expect(el.shadowRoot!.querySelectorAll('[role="option"] mark')).toHaveLength(0);
  });
});

describe('The highlight marks the characters that really match', () => {
  const plainMarks = (el: Combobox) =>
    Array.from(el.shadowRoot!.querySelectorAll('.option-label mark'), (m) => m.textContent);

  it('marks every keyword of a multi-word query', async () => {
    const el = await mount(FIXTURE);
    await userEvent.click(combobox());
    await userEvent.keyboard('united st');
    await settle(el);
    expect(plainMarks(el)).toEqual(['United', 'St']);
  });

  it('keeps its place in scripts whose letters decompose (kana, Hangul)', async () => {
    const el = await mount(`
      <l-combobox label="City">
        <datalist>
          <option value="kobe">神戸がいい</option>
          <option value="seoul">대한민국</option>
        </datalist>
      </l-combobox>
    `);
    const city = page.getByRole('combobox', { name: 'City' });
    await userEvent.fill(city, 'いい');
    await settle(el);
    expect(plainMarks(el)).toEqual(['いい']);
    await userEvent.fill(city, '민국');
    await settle(el);
    expect(plainMarks(el)).toEqual(['민국']);
  });
});
