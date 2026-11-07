import { afterEach, describe, expect, it } from 'vite-plus/test';
import { userEvent } from './support/user-event.js';

// Asserts what a focused text control *paints*, through the two focus tokens:
// --l-form-control-focus-border-width (the stroke) and
// --l-form-control-focus-halo-width (the soft ring outside it). The stroke
// beyond the resting border is an outline drawn inward over the border, so a
// thicker focus stroke must never move the control or its text. Light-DOM
// skins and the shadow pickers are covered alike; the tokens are loaded here
// (component suites load no CSS by default).
import '../../src/css/tokens.css';
import '../../src/css/elements/input.css';
import '../../src/css/elements/select.css';
import '../../src/css/elements/textarea.css';
import '../../src/css/elements/checkbox.css';
import '../../src/css/elements/form-field.css';
import '../../src/html/elements/select/index.js';
import '../../src/html/elements/combobox/index.js';
import type { Select } from '../../src/html/elements/select/select.js';
import type { Combobox } from '../../src/html/elements/combobox/combobox.js';

let host: HTMLElement;

afterEach(() => host?.remove());

const OPTIONS = `<datalist><option value="fr" selected>France</option><option value="de">Germany</option></datalist>`;

interface Control {
  markup: (attrs?: string) => string;
  /** The box that draws the border, the stroke and the halo. */
  frame: (el: HTMLElement) => HTMLElement;
  /** The box the value text is laid out in — it must not move on focus. */
  text: (el: HTMLElement) => HTMLElement;
  /** Whether the control has an invalid skin that recolors its halo. */
  invalidHalo: boolean;
}

const self = (el: HTMLElement) => el;
const shadow = (selector: string) => (el: HTMLElement) =>
  el.shadowRoot!.querySelector<HTMLElement>(selector)!;

const CONTROLS: Record<string, Control> = {
  '.l-input': {
    markup: (attrs = '') => `<input class="l-input" aria-label="Name" value="Jane" ${attrs}>`,
    frame: self,
    text: self,
    invalidHalo: true,
  },
  'select.l-select': {
    markup: (attrs = '') =>
      `<select class="l-select" aria-label="Country" ${attrs}><option>France</option></select>`,
    frame: self,
    text: self,
    invalidHalo: true,
  },
  '.l-textarea': {
    markup: (attrs = '') => `<textarea class="l-textarea" aria-label="Bio" ${attrs}>Hi</textarea>`,
    frame: self,
    text: self,
    invalidHalo: true,
  },
  'l-input-group': {
    markup: (attrs = '') =>
      `<l-input-group><input aria-label="Weight" value="42" ${attrs}><span>kg</span></l-input-group>`,
    frame: self,
    text: (el) => el.querySelector('input')!,
    invalidHalo: true,
  },
  'l-select': {
    markup: (attrs = '') => `<l-select label="Country" ${attrs}>${OPTIONS}</l-select>`,
    frame: shadow('.trigger'),
    text: shadow('.value'),
    invalidHalo: false,
  },
  'l-combobox': {
    markup: (attrs = '') =>
      `<l-combobox label="Country" value="fr" ${attrs}>${OPTIONS}</l-combobox>`,
    frame: shadow('.control'),
    text: shadow('.input'),
    invalidHalo: false,
  },
};

/** Lets the 150ms border-color / box-shadow transition finish before a read. */
const settleTransition = () => new Promise((r) => setTimeout(r, 200));

async function mount(markup: string, style = ''): Promise<HTMLElement> {
  host = document.createElement('div');
  host.style.cssText = `inline-size: 20rem; padding: 8px; ${style}`;
  // A button before the control: Tab from it lands on the control with keyboard
  // modality, the way a keyboard user reaches it (`:focus-visible` matches).
  host.innerHTML = `<button type="button">Before</button>${markup}`;
  document.body.append(host);
  const el = host.lastElementChild as HTMLElement;
  if (el.localName.includes('-') && customElements.get(el.localName)) {
    await (el as Select | Combobox).updateComplete;
  }
  await new Promise((r) => setTimeout(r, 0));
  return el;
}

async function focusByKeyboard() {
  await userEvent.click(host.querySelector('button')!);
  await userEvent.tab();
  await settleTransition();
}

/** Geometry of the frame and of the text box: everything a focus must leave alone. */
function geometry(control: Control, el: HTMLElement) {
  const frame = control.frame(el);
  const text = control.text(el);
  const cs = getComputedStyle(text);
  const { x, y, width, height } = frame.getBoundingClientRect();
  const t = text.getBoundingClientRect();
  return {
    frame: { x, y, width, height },
    text: { x: t.x, y: t.y, width: t.width, height: t.height },
    // Where the value starts inside a native control: border + padding.
    inset: [cs.borderTopWidth, cs.borderLeftWidth, cs.paddingTop, cs.paddingLeft].join(' '),
  };
}

function paint(control: Control, el: HTMLElement) {
  const cs = getComputedStyle(control.frame(el));
  return {
    border: cs.borderTopColor,
    borderWidth: cs.borderTopWidth,
    outlineWidth: cs.outlineStyle === 'none' ? '0px' : cs.outlineWidth,
    outlineOffset: cs.outlineOffset,
    outlineColor: cs.outlineColor,
    boxShadow: cs.boxShadow,
  };
}

/** Spread of the halo: the 4th length of `box-shadow` (computed order: color first). */
const haloSpread = (boxShadow: string) => {
  if (boxShadow === 'none') return 0;
  const lengths = boxShadow.match(/-?[\d.]+px/g)!;
  return parseFloat(lengths[3]);
};

const STRONG = '--l-form-control-focus-border-width: 2px; --l-form-control-focus-halo-width: 0px';

for (const [name, control] of Object.entries(CONTROLS)) {
  describe(`A focused ${name}`, () => {
    describe('keeps the default focus look', () => {
      it('takes the focus-ring color on its 1px border, with no extra stroke', async () => {
        const el = await mount(control.markup());
        await focusByKeyboard();
        const p = paint(control, el);
        expect(p.borderWidth).toBe('1px');
        expect(p.border).toBe('rgb(217, 70, 31)');
        expect(p.outlineWidth).toBe('0px');
      });

      it('casts the 3px soft halo', async () => {
        const el = await mount(control.markup());
        await focusByKeyboard();
        expect(haloSpread(paint(control, el).boxShadow)).toBe(3);
      });
    });

    describe('follows --l-form-control-focus-border-width', () => {
      it('draws a 2px stroke in the focus-ring color, inward over the border', async () => {
        const el = await mount(control.markup(), '--l-form-control-focus-border-width: 2px');
        await focusByKeyboard();
        const p = paint(control, el);
        expect(p.outlineWidth).toBe('2px');
        expect(p.outlineOffset).toBe('-2px');
        expect(p.outlineColor).toBe(p.border);
        // The border itself keeps its resting width: the box cannot grow.
        expect(p.borderWidth).toBe('1px');
      });

      it('does not move the control or its text, nor resize them', async () => {
        const el = await mount(control.markup(), STRONG);
        const atRest = geometry(control, el);
        await focusByKeyboard();
        expect(geometry(control, el)).toEqual(atRest);
      });

      it('draws no stroke on a borderless field by default', async () => {
        const el = await mount(control.markup(), '--l-form-control-border-width: 0px');
        await focusByKeyboard();
        expect(paint(control, el).outlineWidth).toBe('0px');
      });
    });

    describe('follows --l-form-control-focus-halo-width', () => {
      it('widens the halo', async () => {
        const el = await mount(control.markup(), '--l-form-control-focus-halo-width: 6px');
        await focusByKeyboard();
        expect(haloSpread(paint(control, el).boxShadow)).toBe(6);
      });

      it('removes the halo at 0, and keeps the stroke', async () => {
        const el = await mount(control.markup(), STRONG);
        await focusByKeyboard();
        const p = paint(control, el);
        expect(haloSpread(p.boxShadow)).toBe(0);
        expect(p.outlineWidth).toBe('2px');
      });
    });
  });
}

describe('An invalid focused control keeps the error color', () => {
  for (const [name, control] of Object.entries(CONTROLS)) {
    if (name === 'l-select' || name === 'l-combobox') continue; // no invalid skin yet
    it(`draws the ${name} stroke in the invalid color`, async () => {
      const el = await mount(control.markup('aria-invalid="true"'), STRONG);
      await focusByKeyboard();
      const p = paint(control, el);
      // The invalid rule wins the border over the focus ring…
      expect(p.border).not.toBe('rgb(217, 70, 31)');
      // …and the stroke follows it, so the 2px reads as one ring.
      expect(p.outlineColor).toBe(p.border);
    });

    if (control.invalidHalo) {
      it(`tints the ${name} halo with the invalid color`, async () => {
        const valid = await mount(control.markup());
        await focusByKeyboard();
        const validHalo = paint(control, valid).boxShadow;
        host.remove();
        const invalid = await mount(control.markup('aria-invalid="true"'));
        await focusByKeyboard();
        const invalidHalo = paint(control, invalid).boxShadow;
        expect(haloSpread(invalidHalo)).toBe(3);
        expect(invalidHalo).not.toBe(validHalo);
      });
    }
  }
});

describe('A checkbox inside l-form-field keeps its own focus outline', () => {
  it('is not reset by the text-field stroke', async () => {
    await mount(
      `<l-form-field><input type="checkbox" class="l-checkbox" id="c"><label for="c">Accept</label></l-form-field>`,
      STRONG,
    );
    await focusByKeyboard();
    const box = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(document.activeElement).toBe(box);
    const cs = getComputedStyle(box);
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineOffset).toBe('2px');
    expect(cs.outlineColor).toBe('rgb(217, 70, 31)');
  });
});
