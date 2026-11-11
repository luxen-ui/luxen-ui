import { afterEach, describe, expect, it } from 'vite-plus/test';
import { userEvent } from './support/user-event.js';

// Asserts the :focus-visible ring that every non-text control draws, through
// the global --l-focus-ring-color / -width / -offset tokens. Two shapes: an
// outer ring (a gap of --l-focus-ring-offset around the element) that thickens
// and moves out with the tokens, and an inner ring (negative offset, so an
// `overflow: hidden` ancestor cannot clip it) whose offset follows the width so
// it grows inward and never spills out. Light-DOM skins and shadow-DOM elements
// are covered; the tokens are loaded here (component suites load no CSS by
// default).
import '../../src/css/tokens.css';
import '../../src/css/base/_base.css';
import '../../src/css/elements/input-otp.css';
import '../../src/css/elements/button.css';
import '../../src/css/elements/checkbox.css';
import '../../src/css/elements/disclosure.css';
import '../../src/html/elements/tag/index.js';
import '../../src/html/elements/slider/index.js';
import '../../src/html/elements/rating/index.js';
import '../../src/html/elements/carousel/index.js';
import '../../src/html/elements/carousel-item/index.js';
import '../../src/html/elements/select/index.js';
import '../../src/html/elements/combobox/index.js';
import '../../src/html/elements/input-otp/index.js';
import { deepActiveElement } from './support/a11y.js';

let host: HTMLElement;

afterEach(() => host?.remove());

interface Ring {
  markup: string;
  /** The focused node that draws the ring. */
  target: () => HTMLElement;
  /** Pseudo-element carrying the ring, when not the node itself. */
  pseudo?: string;
  /** Outer rings keep their gap; inner rings sit at minus their width. */
  inner: boolean;
}

const shadow = (tag: string) => host.querySelector(tag)!.shadowRoot!;

const RINGS: Record<string, Ring> = {
  '.l-button': {
    markup: '<button type="button" class="l-button">Save</button>',
    target: () => host.querySelector('.l-button')!,
    inner: false,
  },
  '.l-checkbox': {
    markup: '<input type="checkbox" class="l-checkbox" aria-label="Accept">',
    target: () => host.querySelector('.l-checkbox')!,
    inner: false,
  },
  '.l-disclosure summary': {
    markup:
      '<details class="l-disclosure" data-variant="bordered"><summary>Details</summary><div>Body</div></details>',
    target: () => host.querySelector('summary')!,
    inner: true,
  },
  'l-tag remove button (shadow DOM)': {
    markup: '<l-tag removable>Design</l-tag>',
    target: () => shadow('l-tag').querySelector('button')!,
    inner: true,
  },
  'a plain link (base CSS)': {
    markup: '<a href="#somewhere">Read more</a>',
    target: () => host.querySelector('a')!,
    inner: false,
  },
  'l-slider thumb (shadow DOM)': {
    markup: '<l-slider label="Volume" value="40"></l-slider>',
    target: () => shadow('l-slider').querySelector('.thumb')!,
    pseudo: '::before',
    inner: false,
  },
  'l-rating star (shadow DOM)': {
    markup: '<l-rating edit-mode value="3" label="Rating"></l-rating>',
    target: () => shadow('l-rating').querySelector('.icon-wrapper:has(input:focus-visible)')!,
    inner: false,
  },
};

async function mount(markup: string, style = ''): Promise<void> {
  host = document.createElement('div');
  host.style.cssText = `padding: 12px; ${style}`;
  // Tab from a sentinel button lands on the control with keyboard modality,
  // the way a keyboard user reaches it (`:focus-visible` matches).
  host.innerHTML = `<button type="button">Before</button>${markup}`;
  document.body.append(host);
  const elements = host.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>(
    'l-tag, l-slider, l-rating, l-carousel, l-select, l-combobox, l-input-otp',
  );
  await Promise.all(
    Array.from(elements, async (el) => {
      await customElements.whenDefined(el.localName);
      await el.updateComplete;
    }),
  );
  await new Promise((r) => setTimeout(r, 0));
  await userEvent.click(host.querySelector('button')!);
  await userEvent.tab();
}

function ring(spec: Ring) {
  const cs = getComputedStyle(spec.target(), spec.pseudo);
  return {
    style: cs.outlineStyle,
    width: cs.outlineWidth,
    offset: cs.outlineOffset,
    color: cs.outlineColor,
  };
}

for (const [name, spec] of Object.entries(RINGS)) {
  describe(`The focus ring of ${name}`, () => {
    it('is a solid 2px outline in the focus-ring color by default', async () => {
      await mount(spec.markup);
      expect(ring(spec)).toEqual({
        style: 'solid',
        width: '2px',
        offset: spec.inner ? '-2px' : '2px',
        color: 'rgb(217, 70, 31)',
      });
    });

    it('takes its color from --l-focus-ring-color', async () => {
      await mount(spec.markup, '--l-focus-ring-color: rgb(0, 0, 255)');
      expect(ring(spec).color).toBe('rgb(0, 0, 255)');
    });

    it(
      spec.inner
        ? 'thickens inward with --l-focus-ring-width, staying inside its element'
        : 'thickens with --l-focus-ring-width, keeping its gap',
      async () => {
        await mount(spec.markup, '--l-focus-ring-width: 4px');
        const { width, offset } = ring(spec);
        expect(width).toBe('4px');
        expect(offset).toBe(spec.inner ? '-4px' : '2px');
      },
    );

    it(
      spec.inner
        ? 'ignores --l-focus-ring-offset, staying flush inside its element'
        : 'moves out with --l-focus-ring-offset',
      async () => {
        await mount(spec.markup, '--l-focus-ring-offset: 5px');
        expect(ring(spec).offset).toBe(spec.inner ? '-2px' : '5px');
      },
    );
  });
}

/** Tab until `match` holds for the deep active element (at most `max` presses). */
async function tabTo(match: (el: Element | null) => boolean, max = 8) {
  for (let i = 0; i < max && !match(deepActiveElement()); i++) {
    // oxlint-disable-next-line no-await-in-loop -- each Tab depends on where the previous one landed.
    await userEvent.tab();
  }
  return deepActiveElement() as HTMLElement;
}

const settle = () => new Promise((r) => setTimeout(r, 50));

describe('The carousel controls', () => {
  const CAROUSEL = `<l-carousel style="--slide-size: 50%">
    <l-carousel-item><div style="height: 80px">One</div></l-carousel-item>
    <l-carousel-item><div style="height: 80px">Two</div></l-carousel-item>
    <l-carousel-item><div style="height: 80px">Three</div></l-carousel-item>
  </l-carousel>`;

  it('ring the next button and fill its gap with the surface color', async () => {
    await mount(CAROUSEL);
    const next = await tabTo((el) => !!el?.classList.contains('button-next'));
    expect(next.classList.contains('button-next')).toBe(true);
    const cs = getComputedStyle(next);
    expect([cs.outlineStyle, cs.outlineWidth, cs.outlineOffset, cs.outlineColor]).toEqual([
      'solid',
      '2px',
      '2px',
      'rgb(217, 70, 31)',
    ]);
    expect(cs.boxShadow).toMatch(/ 0px 0px 0px 2px$/);
  });

  it('ring a dot inside its hit box', async () => {
    await mount(CAROUSEL.replace('<l-carousel ', '<l-carousel with-dots '));
    const dot = await tabTo((el) => !!el?.classList.contains('dot'), 12);
    expect(dot.classList.contains('dot')).toBe(true);
    const cs = getComputedStyle(dot);
    expect([cs.outlineWidth, cs.outlineOffset, cs.outlineColor]).toEqual([
      '2px',
      '-2px',
      'rgb(217, 70, 31)',
    ]);
  });
});

describe('The active option of a listbox', () => {
  const OPTIONS =
    '<datalist><option value="fr">France</option><option value="de">Germany</option><option value="it">Italy</option></datalist>';

  it('draws an inside ring in l-combobox once the arrow keys move it', async () => {
    await mount(`<l-combobox label="Country">${OPTIONS}</l-combobox>`);
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    const root = host.querySelector('l-combobox')!.shadowRoot!;
    const active = root.querySelector<HTMLElement>('.option[aria-selected="true"]')!;
    const cs = getComputedStyle(active);
    expect([cs.outlineStyle, cs.outlineWidth, cs.outlineOffset]).toEqual(['solid', '2px', '-2px']);
    expect(cs.outlineColor).toBe('rgb(217, 70, 31)');
  });

  it('keeps a mouse-driven highlight a tint, without the ring', async () => {
    await mount(`<l-combobox label="Country">${OPTIONS}</l-combobox>`);
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    const root = host.querySelector('l-combobox')!.shadowRoot!;
    await userEvent.hover(root.querySelectorAll<HTMLElement>('.option')[2]);
    await settle();
    const active = root.querySelector<HTMLElement>('.option[aria-selected="true"]')!;
    expect(active.textContent).toContain('Italy');
    expect(getComputedStyle(active).outlineStyle).toBe('none');
  });

  it('draws an inside ring in a searchable l-select', async () => {
    await mount(`<l-select searchable label="Country">${OPTIONS}</l-select>`);
    await userEvent.keyboard('{Enter}');
    await settle();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    const root = host.querySelector('l-select')!.shadowRoot!;
    const active = root.querySelector<HTMLElement>('.option[data-active]')!;
    const cs = getComputedStyle(active);
    expect([cs.outlineStyle, cs.outlineWidth, cs.outlineOffset]).toEqual(['solid', '2px', '-2px']);
  });
});

describe('The active cell of l-input-otp', () => {
  // The cell's border and halo fade in over 150ms.
  const settleTransition = () => new Promise((r) => setTimeout(r, 250));

  it('looks focused like a text field: ring-colored border and halo', async () => {
    await mount('<l-input-otp><input aria-label="Code"></l-input-otp>');
    await settleTransition();
    const cell = host.querySelector<HTMLElement>('.l-input-otp-cell[data-active]')!;
    const cs = getComputedStyle(cell);
    expect(cs.borderTopColor).toBe('rgb(217, 70, 31)');
    expect(cs.boxShadow).toMatch(/ 0px 0px 0px 3px$/);
  });

  it('follows the focus stroke token', async () => {
    await mount(
      '<l-input-otp><input aria-label="Code"></l-input-otp>',
      '--l-form-control-focus-border-width: 2px',
    );
    await settleTransition();
    const cs = getComputedStyle(host.querySelector<HTMLElement>('.l-input-otp-cell[data-active]')!);
    expect([cs.outlineStyle, cs.outlineWidth, cs.outlineOffset]).toEqual(['solid', '2px', '-2px']);
  });
});
