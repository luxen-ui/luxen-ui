import { afterEach, describe, expect, it } from 'vite-plus/test';

// Asserts what is *painted* at the end of l-select and l-combobox: the clear
// button and the chevron each take a square as tall as the field inside its
// borders, so the hit area and the spacing follow the control height; their
// glyph follows --l-form-control-icon-size. Both elements carry their own
// (shadow) styles; the tokens they read are loaded here.
import '../../src/css/tokens.css';
import '../../src/html/elements/select/index.js';
import '../../src/html/elements/combobox/index.js';
import type { Select } from '../../src/html/elements/select/select.js';
import type { Combobox } from '../../src/html/elements/combobox/combobox.js';

let host: HTMLElement;

afterEach(() => host?.remove());

const OPTIONS = `
  <datalist>
    <option value="fr" selected>France</option>
    <option value="de">Germany</option>
  </datalist>
`;

const PICKERS = {
  'l-select': (attrs = '') => `<l-select label="Country" with-clear ${attrs}>${OPTIONS}</l-select>`,
  'l-combobox': (attrs = '') =>
    `<l-combobox label="Country" with-clear value="fr" ${attrs}>${OPTIONS}</l-combobox>`,
} as const;

type Tag = keyof typeof PICKERS;

async function mount(markup: string, style = ''): Promise<Select | Combobox> {
  host = document.createElement('div');
  host.style.cssText = `inline-size: 20rem; ${style}`;
  host.innerHTML = markup;
  document.body.append(host);
  const el = host.firstElementChild as Select | Combobox;
  await customElements.whenDefined(el.localName);
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  return el;
}

/** The field frame and its two end actions, measured. */
function measure(el: Select | Combobox) {
  const root = el.shadowRoot!;
  const field = root.querySelector('.control, .trigger')!;
  const clear = root.querySelector('.clear-button')!;
  const chevron = root.querySelector('.chevron')!;
  return {
    field: field.getBoundingClientRect(),
    clear: clear.getBoundingClientRect(),
    chevron: chevron.getBoundingClientRect(),
    clearGlyph: parseFloat(getComputedStyle(clear, '::before').inlineSize),
    chevronGlyph: parseFloat(getComputedStyle(chevron, '::before').inlineSize),
    fontSize: parseFloat(getComputedStyle(clear).fontSize),
  };
}

for (const tag of Object.keys(PICKERS) as Tag[]) {
  const markup = PICKERS[tag];

  describe(`${tag} end actions`, () => {
    describe('The hit area follows the control height (WCAG 2.5.8)', () => {
      it('makes the clear button and the chevron 34px squares in the default 36px field', async () => {
        const { field, clear, chevron } = measure(await mount(markup()));
        expect(field.height).toBe(36);
        expect([clear.width, clear.height]).toEqual([34, 34]);
        expect(chevron.width).toBe(34);
      });

      it('grows them with --l-form-control-height', async () => {
        const { field, clear, chevron } = measure(
          await mount(markup(), '--l-form-control-height: 42px'),
        );
        expect(field.height).toBe(42);
        expect([clear.width, clear.height]).toEqual([40, 40]);
        expect(chevron.width).toBe(40);
      });

      it("grows them with the element's own --height", async () => {
        const { clear, chevron } = measure(await mount(markup('style="--height: 48px"')));
        expect([clear.width, clear.height]).toEqual([46, 46]);
        expect(chevron.width).toBe(46);
      });

      it('grows them with the size scale', async () => {
        const el = await mount(markup('size="lg"'));
        const { field, clear } = measure(el);
        expect(clear.height).toBe(field.height - 2);
      });
    });

    describe('The actions sit at the end, spaced by their own boxes', () => {
      it('puts the chevron flush against the end border', async () => {
        const { field, chevron } = measure(await mount(markup()));
        expect(field.right - chevron.right).toBe(1);
      });

      it('puts the clear button square against the chevron', async () => {
        const { clear, chevron } = measure(await mount(markup()));
        expect(chevron.left - clear.right).toBe(0);
      });
    });

    describe('The glyph follows --l-form-control-icon-size', () => {
      it('draws both glyphs at 1em by default', async () => {
        const { clearGlyph, chevronGlyph, fontSize } = measure(await mount(markup()));
        expect(clearGlyph).toBe(fontSize);
        expect(chevronGlyph).toBe(fontSize);
      });

      it('resizes both glyphs, and only the glyphs', async () => {
        const { clear, clearGlyph, chevronGlyph } = measure(
          await mount(markup(), '--l-form-control-icon-size: 20px'),
        );
        expect(clearGlyph).toBe(20);
        expect(chevronGlyph).toBe(20);
        expect(clear.width).toBe(34);
      });
    });

    describe('The glyphs can be re-skinned without styling the parts', () => {
      it('draws the --chevron-icon and --clear-icon set on the element', async () => {
        const marker = '%3Csvg xmlns=%27http://www.w3.org/2000/svg%27/%3E';
        const url = `url(&quot;data:image/svg+xml,${marker}&quot;)`;
        const el = await mount(markup(`style="--chevron-icon: ${url}; --clear-icon: ${url}"`));
        const root = el.shadowRoot!;
        for (const action of ['.chevron', '.clear-button']) {
          const { maskImage } = getComputedStyle(root.querySelector(action)!, '::before');
          expect(maskImage).toContain(marker);
        }
      });
    });
  });
}

describe('l-select keeps its value clear of the overlaid clear button', () => {
  it('ends a long value before the clear button starts', async () => {
    const el = await mount(
      `<l-select label="Country" with-clear>
        <datalist><option value="long" selected>A selected value long enough to run all the way into the end actions</option></datalist>
      </l-select>`,
    );
    const value = el.shadowRoot!.querySelector('.value')!.getBoundingClientRect();
    const { clear } = measure(el);
    expect(value.right).toBeLessThanOrEqual(clear.left);
  });
});
