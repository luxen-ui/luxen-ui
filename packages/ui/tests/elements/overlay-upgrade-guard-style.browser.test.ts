import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';

// Asserts the `:not(:defined)` guard in base CSS — what a visitor sees before
// the element script has loaded (slow network, SSR, a CDN hiccup). The browser
// config has no setup file, so the base stylesheet is imported here. No element
// is imported on purpose: every `l-*` tag in this suite stays undefined.
import '../../src/css/base/_base.css';

let host: HTMLElement;

/**
 * A Tailwind-style display utility, in its own layer declared after `base`
 * (adopted sheets cascade after the document's) — the case that used to win
 * over the guard and paint the whole menu inline.
 */
beforeAll(() => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`@layer utilities { .flex { display: flex; } }`);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
});

afterEach(() => host?.remove());

function mount(markup: string): HTMLElement {
  host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  return host.firstElementChild as HTMLElement;
}

const DROPDOWN = (hostClass = '') => `
  <l-dropdown class="${hostClass}">
    <button slot="trigger" type="button">Theme</button>
    <div slot="header">Signed in as Jane Cooper</div>
    <l-dropdown-item>Light</l-dropdown-item>
    <l-dropdown-item>Dark</l-dropdown-item>
    <div slot="footer">v1.0</div>
  </l-dropdown>
`;

const visible = (el: Element) => el.checkVisibility();

describe('A dropdown whose script has not loaded yet', () => {
  it('is not upgraded in this suite', () => {
    const dropdown = mount(DROPDOWN());

    expect(dropdown.matches(':defined')).toBe(false);
  });

  it('shows its trigger in place, so the layout does not shift on upgrade', () => {
    const dropdown = mount(DROPDOWN());
    const trigger = dropdown.querySelector('[slot="trigger"]')!;

    expect(visible(trigger)).toBe(true);
    expect(trigger.getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it('lays the host out like the upgraded element (inline-block)', () => {
    const dropdown = mount(DROPDOWN());

    expect(getComputedStyle(dropdown).display).toBe('inline-block');
  });

  it('hides the menu items, header and footer', () => {
    const dropdown = mount(DROPDOWN());
    const content = [...dropdown.children].filter((el) => el.slot !== 'trigger');

    expect(content).toHaveLength(4);
    for (const el of content) expect(visible(el)).toBe(false);
  });

  it('keeps the menu hidden when a display utility sits on the host', () => {
    const dropdown = mount(DROPDOWN('flex'));
    const items = dropdown.querySelectorAll('l-dropdown-item');

    expect(getComputedStyle(dropdown).display).toBe('flex');
    expect(visible(dropdown.querySelector('[slot="trigger"]')!)).toBe(true);
    for (const item of items) expect(visible(item)).toBe(false);
  });
});

describe('Overlays without a slotted trigger stay hidden until upgrade', () => {
  // Popover and tooltip point at an outside trigger with `for`; dialog and
  // drawer open from outside. Everything they hold is content.
  for (const tag of ['l-dialog', 'l-drawer', 'l-popover', 'l-tooltip']) {
    it(`hides <${tag}> and its content`, () => {
      const el = mount(`<${tag}><p>Overlay content</p></${tag}>`);

      expect(getComputedStyle(el).display).toBe('none');
      expect(visible(el.querySelector('p')!)).toBe(false);
    });
  }
});
