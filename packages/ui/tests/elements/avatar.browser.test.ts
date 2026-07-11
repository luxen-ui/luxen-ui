import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/avatar/index.js';
import type { Avatar } from '../../src/html/elements/avatar/avatar.js';

// Drives l-avatar like a person: sets a name and asserts the initials a sighted
// user reads inside the badge, plus the accessible name a screen reader hears.
// The initials derivation must be Unicode-safe — an accented name like
// "Markus Nösterer" yields "MN", not the "MS" the old \b/\w regex produced.
// Shadow DOM.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<Avatar> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-avatar');
  const el = host.querySelector<Avatar>('l-avatar')!;
  await settle(el);
  return el;
}

async function settle(el: Avatar) {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const initialsOf = (el: Avatar) => el.shadowRoot!.querySelector('.initials')?.textContent ?? '';

// ---------------------------------------------------------------------------
// Initials fallback
// ---------------------------------------------------------------------------

describe('l-avatar derives initials from the name', () => {
  // Mirrors the getInitials JSDoc examples — first + last word, uppercased.
  const cases: [name: string, initials: string][] = [
    ['John Doe', 'JD'],
    ['Markus Nösterer', 'MN'], // accents preserved (regression: used to be "MS")
    ['Cher', 'C'], // single word → one initial
    ['  John   Doe  ', 'JD'], // extra whitespace ignored
    ['Björk Guðmundsdóttir', 'BG'], // non-ASCII first letter kept whole
  ];

  for (const [name, initials] of cases) {
    it(`renders "${initials}" for "${name}"`, async () => {
      const el = await mount(`<l-avatar name="${name}"></l-avatar>`);
      expect(initialsOf(el)).toBe(initials);
    });
  }
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('exposes the name as the accessible label of an image (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(`<l-avatar name="Markus Nösterer"></l-avatar>`);
      expect(page.getByRole('img', { name: 'Markus Nösterer' }).elements()).toHaveLength(1);
    });
  });
});
