import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import { userEvent } from './support/user-event.js';

// The browser config has no setup file, so light-DOM stylesheets are not loaded
// by default. This suite asserts what is *painted* — where the
// `.l-select-item-suffix` of a rich option sits — so it pulls in the tokens,
// the native `.l-select` skin and the badge skin. l-select / l-combobox carry
// their own (shadow) styles.
import '../../src/css/tokens.css';
import '../../src/css/elements/select.css';
import '../../src/css/elements/badge.css';
import '../../src/html/elements/badge/index.js';
import '../../src/html/elements/select/index.js';
import '../../src/html/elements/combobox/index.js';
import type { Select } from '../../src/html/elements/select/select.js';
import type { Combobox } from '../../src/html/elements/combobox/combobox.js';

let host: HTMLElement;

// Set the page up like a consumer's: the usual border-box reset (Tailwind's
// preflight and most resets ship it; the shadow roots get it from host.css), and
// the l-select / l-combobox panels — which size to their content — capped, so
// the long title has to give way to the suffix.
beforeAll(() => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    *, ::before, ::after { box-sizing: border-box; }
    l-select::part(panel), l-combobox::part(panel) { max-inline-size: 16rem; }
  `);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
});

afterEach(() => host?.remove());

function mount(markup: string): HTMLElement {
  host = document.createElement('div');
  host.style.inlineSize = '16rem';
  host.innerHTML = markup;
  document.body.append(host);
  return host;
}

async function settle(el: Select | Combobox) {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

/**
 * Let the picker's open transition (a small scale-up) finish before measuring.
 * `document.getAnimations()` cannot see into shadow roots, so a custom element's
 * own root is asked too.
 */
async function finishOpening(root?: ShadowRoot | null) {
  const running = [...document.getAnimations(), ...(root?.getAnimations() ?? [])];
  await Promise.all(running.map((a) => a.finished.catch(() => undefined)));
}

const LONG_TITLE = 'A very long option title that cannot possibly fit in the row';

/**
 * Rich option markup shared by every tier. The custom elements read `label`; the
 * native picker must not get one — a labelled option paints its label instead of
 * its rich children.
 */
const option = (value: string, title: string, { selected = false, native = false } = {}) => `
  <option value="${value}"${native ? '' : ` label="${title}"`}${selected ? ' selected' : ''}>
    <span class="l-select-item-text">
      <span class="l-select-item-title">${title}</span>
      <span class="l-select-item-description">Secondary line</span>
    </span>
    <span class="l-select-item-suffix"><l-badge size="sm">7 in use</l-badge></span>
  </option>
`;

const OPTIONS = option('short', 'Short', { selected: true }) + option('long', LONG_TITLE);
const NATIVE_OPTIONS =
  option('short', 'Short', { selected: true, native: true }) +
  option('long', LONG_TITLE, { native: true });

/**
 * Both rows carry the same suffix. In each, it ends at the row's inline-end
 * content edge, after the text column, centred on the title's line (not on the
 * title + description block) without pushing that title down; and the
 * long-title row's suffix is exactly as wide as the short-title one — it
 * never shrinks — while that long title truncates instead of pushing the
 * suffix out.
 */
function expectSuffix(short: Element, long: Element) {
  const middle = (r: DOMRect) => r.top + r.height / 2;
  const measure = (row: Element) => {
    const suffix = row.querySelector<HTMLElement>('.l-select-item-suffix')!.getBoundingClientRect();
    const text = row.querySelector<HTMLElement>('.l-select-item-text')!.getBoundingClientRect();
    const title = row.querySelector<HTMLElement>('.l-select-item-title')!.getBoundingClientRect();
    const contentEnd =
      row.getBoundingClientRect().right - parseFloat(getComputedStyle(row).paddingRight);
    expect(Math.abs(suffix.right - contentEnd)).toBeLessThanOrEqual(1);
    expect(suffix.left).toBeGreaterThanOrEqual(text.right - 0.5);
    // The suffix never pushes the title down, off the checkmark's line.
    const rowTop = row.getBoundingClientRect().top + parseFloat(getComputedStyle(row).paddingTop);
    expect(Math.abs(title.top - rowTop)).toBeLessThanOrEqual(1);
    expect(Math.abs(middle(suffix) - middle(title))).toBeLessThanOrEqual(1);
    return suffix.width;
  };
  expect(Math.abs(measure(long) - measure(short))).toBeLessThanOrEqual(0.5);
  const title = long.querySelector<HTMLElement>('.l-select-item-title')!;
  expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
}

/**
 * The badge inside the suffix is painted as a chip (bordered, padded), not left
 * as bare inline text — the shadow root has to carry the badge styles itself.
 */
function expectStyledBadge(row: Element) {
  const cs = getComputedStyle(row.querySelector('l-badge')!);
  expect(cs.borderTopStyle).toBe('solid');
  expect(parseFloat(cs.paddingInlineStart)).toBeGreaterThan(0);
}

describe('A native select shows a suffix on rich options', () => {
  const NATIVE = `
    <select class="l-select" aria-label="Pool" style="inline-size: 100%">
      <button><selectedcontent></selectedcontent></button>
      ${NATIVE_OPTIONS}
    </select>
  `;

  it('pins the suffix to the end of each row and truncates a long title', async () => {
    const select = mount(NATIVE).querySelector('select')!;
    await userEvent.click(select);
    await finishOpening();
    expectSuffix(
      select.querySelector('option[value="short"]')!,
      select.querySelector('option[value="long"]')!,
    );
    await userEvent.keyboard('{Escape}');
  });

  it('keeps the suffix out of the trigger, like the description', () => {
    const select = mount(NATIVE).querySelector('select')!;
    // The test browser supports <selectedcontent>, so the selected option's
    // markup must have been mirrored — otherwise this test would prove nothing.
    const mirrored = select.querySelector('selectedcontent .l-select-item-suffix');
    expect(mirrored).not.toBeNull();
    expect(getComputedStyle(mirrored!).display).toBe('none');
  });
});

describe('l-select shows a suffix on rich options', () => {
  const ENHANCED = `
    <l-select label="Pool"><datalist>${OPTIONS}</datalist></l-select>
  `;

  async function open() {
    const el = mount(ENHANCED).querySelector<Select>('l-select')!;
    await customElements.whenDefined('l-select');
    await settle(el);
    await userEvent.click(page.getByRole('button', { name: 'Pool' }));
    await settle(el);
    await finishOpening(el.shadowRoot);
    return el;
  }

  it('pins the suffix to the end of each row and truncates a long title', async () => {
    const el = await open();
    const [short, long] = el.shadowRoot!.querySelectorAll('.option-rich');
    expectSuffix(short, long);
  });

  it('paints a badge placed in the suffix', async () => {
    const el = await open();
    expectStyledBadge(el.shadowRoot!.querySelector('.option-rich')!);
  });

  it('keeps the suffix out of the trigger, like the description', async () => {
    const el = mount(ENHANCED).querySelector<Select>('l-select')!;
    await customElements.whenDefined('l-select');
    await settle(el);
    const mirrored = el.shadowRoot!.querySelector('.value .l-select-item-suffix')!;
    expect(getComputedStyle(mirrored).display).toBe('none');
  });
});

describe('l-combobox shows a suffix on rich options', () => {
  async function open() {
    const el = mount(
      `<l-combobox label="Pool"><datalist>${OPTIONS}</datalist></l-combobox>`,
    ).querySelector<Combobox>('l-combobox')!;
    await customElements.whenDefined('l-combobox');
    await settle(el);
    await userEvent.click(page.getByRole('combobox', { name: 'Pool' }));
    await settle(el);
    await finishOpening(el.shadowRoot);
    return el;
  }

  it('pins the suffix to the end of each row and truncates a long title', async () => {
    const el = await open();
    const [short, long] = el.shadowRoot!.querySelectorAll('.option-rich');
    expectSuffix(short, long);
  });

  it('paints a badge placed in the suffix', async () => {
    const el = await open();
    expectStyledBadge(el.shadowRoot!.querySelector('.option-rich')!);
  });

  it('filters by the title, never by the suffix text', async () => {
    const el = await open();
    await userEvent.keyboard('in use');
    await settle(el);
    expect(page.getByRole('option').elements()).toHaveLength(0);
  });
});
