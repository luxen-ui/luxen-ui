import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';

// The system icons (chevrons, check, close, clear, plus, minus) are `--l-icon-*` tokens: a
// brand re-skins one on `:root` and every element that draws it follows, the
// shadow-DOM ones included. This suite overrides each token with a sentinel URL
// and asserts the mask each element actually paints. The browser config loads
// no CSS, so the tokens and the light-DOM skins are imported here; the
// shadow-DOM elements carry their own styles.
import '../../src/css/tokens.css';
import '../../src/css/elements/disclosure.css';
import '../../src/css/elements/select.css';
import '../../src/css/elements/input.css';
import '../../src/css/elements/close-button/ring.css';
import '../../src/css/elements/input-stepper/default.css';
import '../../src/html/elements/select/index.js';
import '../../src/html/elements/combobox/index.js';
import '../../src/html/elements/dropdown-item/index.js';
import '../../src/html/elements/tree/index.js';
import '../../src/html/elements/tree-item/index.js';
import '../../src/html/elements/input-stepper/index.js';
import type { LitElement } from 'lit';

const SENTINEL = {
  'chevron-down': 'sentinel-chevron-down',
  'chevron-right': 'sentinel-chevron-right',
  check: 'sentinel-check',
  close: 'sentinel-close',
  clear: 'sentinel-clear',
  plus: 'sentinel-plus',
  minus: 'sentinel-minus',
} as const;

/**
 * Unlayered, like a consumer's own stylesheet: it beats the tokens, which sit
 * in `@layer theme`. One declaration per icon and nothing per element — that
 * is the whole promise of the tokens.
 */
beforeAll(() => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(
    `:root { ${Object.entries(SENTINEL)
      .map(([name, id]) => `--l-icon-${name}: url("data:,${id}");`)
      .join(' ')} }`,
  );
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
});

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount<T extends Element = HTMLElement>(
  markup: string,
  selector: string,
): Promise<T> {
  host = document.createElement('div');
  host.style.inlineSize = '20rem';
  host.innerHTML = markup;
  document.body.append(host);
  const lit = [...host.querySelectorAll('*')].filter((el) => el.localName.includes('-'));
  await Promise.all(
    lit.map(async (el) => {
      await customElements.whenDefined(el.localName);
      await (el as LitElement).updateComplete;
    }),
  );
  await new Promise((r) => setTimeout(r, 0));
  return host.querySelector(selector) as T;
}

/** Mounts an l-input-stepper and returns a getter for its generated buttons. */
async function mountStepper(attrs = '') {
  const stepper = await mount(
    `<l-input-stepper ${attrs}><input type="number" min="0" max="10" value="5" /></l-input-stepper>`,
    'l-input-stepper',
  );
  // The buttons are built once the stepper finds its input, possibly a task later.
  await new Promise((r) => setTimeout(r, 0));
  return (name: 'decrement' | 'increment') =>
    stepper.querySelector(`.l-input-stepper-${name}`) as HTMLElement;
}

/** The mask image painted on an element or one of its pseudo-elements. */
const maskOf = (el: Element, pseudo?: string) => getComputedStyle(el, pseudo).maskImage;

const OPTIONS = `
  <datalist>
    <option value="fr" selected>France</option>
    <option value="de">Germany</option>
  </datalist>
`;

describe('A brand re-skins a system icon once, on :root', () => {
  describe('the downward chevron', () => {
    it('paints the l-disclosure arrow marker', async () => {
      const summary = await mount(
        '<details class="l-disclosure" data-marker="arrow"><summary>Shipping</summary><p>Free.</p></details>',
        'summary',
      );
      expect(maskOf(summary, '::after')).toContain(SENTINEL['chevron-down']);
    });

    it('paints the native select caret', async () => {
      const select = await mount(
        '<select class="l-select"><option>France</option></select>',
        'select',
      );
      expect(maskOf(select, '::picker-icon')).toContain(SENTINEL['chevron-down']);
    });

    it('paints the l-select chevron, inside its shadow root', async () => {
      const el = await mount<LitElement>(
        `<l-select label="Country">${OPTIONS}</l-select>`,
        'l-select',
      );
      const chevron = el.shadowRoot!.querySelector('.chevron')!;
      expect(maskOf(chevron, '::before')).toContain(SENTINEL['chevron-down']);
    });

    it('paints the l-combobox chevron, inside its shadow root', async () => {
      const el = await mount<LitElement>(
        `<l-combobox label="Country">${OPTIONS}</l-combobox>`,
        'l-combobox',
      );
      const chevron = el.shadowRoot!.querySelector('.chevron')!;
      expect(maskOf(chevron, '::before')).toContain(SENTINEL['chevron-down']);
    });

    it('paints the collapse indicator of an expanded l-tree-item', async () => {
      const item = await mount<LitElement>(
        '<l-tree><l-tree-item expanded>Fruits<l-tree-item>Apple</l-tree-item></l-tree-item></l-tree>',
        'l-tree-item',
      );
      const glyph = item.shadowRoot!.querySelector('.expand-glyph')!;
      expect(maskOf(glyph)).toContain(SENTINEL['chevron-down']);
    });
  });

  describe('the inline-end chevron', () => {
    it('paints the submenu indicator of an l-dropdown-item', async () => {
      const item = await mount<LitElement>(
        '<l-dropdown-item>Share<l-dropdown-item slot="submenu">Email</l-dropdown-item></l-dropdown-item>',
        'l-dropdown-item',
      );
      const indicator = item.shadowRoot!.querySelector('.submenu-indicator')!;
      expect(maskOf(indicator)).toContain(SENTINEL['chevron-right']);
    });

    it('paints the expand indicator of a collapsed l-tree-item', async () => {
      const item = await mount<LitElement>(
        '<l-tree><l-tree-item>Fruits<l-tree-item>Apple</l-tree-item></l-tree-item></l-tree>',
        'l-tree-item',
      );
      const glyph = item.shadowRoot!.querySelector('.expand-glyph')!;
      expect(maskOf(glyph)).toContain(SENTINEL['chevron-right']);
    });
  });

  describe('the check mark', () => {
    it('paints the selected option of l-select', async () => {
      const el = await mount<LitElement>(
        `<l-select label="Country">${OPTIONS}</l-select>`,
        'l-select',
      );
      const option = el.shadowRoot!.querySelector('.option[data-current]')!;
      expect(maskOf(option, '::after')).toContain(SENTINEL.check);
    });

    it('paints the check of a checked l-dropdown-item', async () => {
      const item = await mount<LitElement>(
        '<l-dropdown-item type="checkbox" checked>Show grid</l-dropdown-item>',
        'l-dropdown-item',
      );
      const check = item.shadowRoot!.querySelector('.check')!;
      expect(maskOf(check)).toContain(SENTINEL.check);
    });
  });

  describe('the close and clear crosses', () => {
    it('paints the .l-close button', async () => {
      const button = await mount('<button class="l-close" aria-label="Close"></button>', 'button');
      expect(maskOf(button, '::after')).toContain(SENTINEL.close);
    });

    it('paints the clear action of l-select, inside its shadow root', async () => {
      const el = await mount<LitElement>(
        `<l-select label="Country" with-clear>${OPTIONS}</l-select>`,
        'l-select',
      );
      const clear = el.shadowRoot!.querySelector('.clear-button')!;
      expect(maskOf(clear, '::before')).toContain(SENTINEL.clear);
    });

    it('paints the search clear of a native .l-input', async () => {
      const input = await mount(
        '<input class="l-input" type="search" value="Lyon" aria-label="City" />',
        'input',
      );
      // getComputedStyle cannot read ::-webkit-search-cancel-button: assert the
      // property its mask reads (input.css) instead.
      expect(getComputedStyle(input).getPropertyValue('--clear-icon')).toContain(SENTINEL.clear);
    });
  });

  describe('the plus sign', () => {
    it('paints the l-disclosure plus marker', async () => {
      const summary = await mount(
        '<details class="l-disclosure" data-marker="plus"><summary>Shipping</summary><p>Free.</p></details>',
        'summary',
      );
      expect(maskOf(summary, '::after')).toContain(SENTINEL.plus);
    });

    it('paints the l-input-stepper increment button', async () => {
      const button = await mountStepper();
      expect(maskOf(button('increment'), '::before')).toContain(SENTINEL.plus);
    });
  });

  describe('the minus sign', () => {
    it('paints the l-input-stepper decrement button', async () => {
      const button = await mountStepper();
      expect(maskOf(button('decrement'), '::before')).toContain(SENTINEL.minus);
    });
  });
});

describe('An element-level icon property still beats the token', () => {
  it('lets --caret-icon re-skin one native select', async () => {
    const select = await mount(
      '<select class="l-select" style=\'--caret-icon: url("data:,own-caret")\'><option>France</option></select>',
      'select',
    );
    expect(maskOf(select, '::picker-icon')).toContain('own-caret');
  });

  it('lets --chevron-icon re-skin one l-select', async () => {
    const el = await mount<LitElement>(
      `<l-select label="Country" style='--chevron-icon: url("data:,own-chevron")'>${OPTIONS}</l-select>`,
      'l-select',
    );
    const chevron = el.shadowRoot!.querySelector('.chevron')!;
    expect(maskOf(chevron, '::before')).toContain('own-chevron');
  });

  it('lets --decrement-icon and --increment-icon re-skin one l-input-stepper', async () => {
    const button = await mountStepper(
      'style=\'--decrement-icon: url("data:,own-minus"); --increment-icon: url("data:,own-plus")\'',
    );
    expect(maskOf(button('decrement'), '::before')).toContain('own-minus');
    expect(maskOf(button('increment'), '::before')).toContain('own-plus');
  });

  it('lets --decrement-icon set on an ancestor reach the l-input-stepper inside', async () => {
    const wrapper = await mount(
      `<div style='--decrement-icon: url("data:,area-minus")'><l-input-stepper><input type="number" value="5" /></l-input-stepper></div>`,
      'div',
    );
    await new Promise((r) => setTimeout(r, 0));
    const decrement = wrapper.querySelector('.l-input-stepper-decrement') as HTMLElement;
    expect(maskOf(decrement, '::before')).toContain('area-minus');
  });
});
