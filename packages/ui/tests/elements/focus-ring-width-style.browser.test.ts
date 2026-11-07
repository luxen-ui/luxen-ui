import { afterEach, describe, expect, it } from 'vite-plus/test';
import { userEvent } from './support/user-event.js';

// Asserts the thickness of the :focus-visible ring that every non-text control
// draws, through the global --l-focus-ring-width token. Two shapes: an outer
// ring (offset +2px, a gap around the element) that only thickens, and an
// inner ring (negative offset, so an `overflow: hidden` ancestor cannot clip
// it) whose offset follows the width so it grows inward and never spills out.
// Light-DOM skins and a shadow-DOM part are covered; the tokens are loaded here
// (component suites load no CSS by default).
import '../../src/css/tokens.css';
import '../../src/css/elements/button.css';
import '../../src/css/elements/checkbox.css';
import '../../src/css/elements/disclosure.css';
import '../../src/html/elements/tag/index.js';

let host: HTMLElement;

afterEach(() => host?.remove());

interface Ring {
  markup: string;
  /** The focused node that draws the ring. */
  target: () => HTMLElement;
  /** Outer rings keep their gap; inner rings sit at minus their width. */
  inner: boolean;
}

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
    target: () => host.querySelector('l-tag')!.shadowRoot!.querySelector('button')!,
    inner: true,
  },
};

async function mount(markup: string, style = ''): Promise<void> {
  host = document.createElement('div');
  host.style.cssText = `padding: 12px; ${style}`;
  // Tab from a sentinel button lands on the control with keyboard modality,
  // the way a keyboard user reaches it (`:focus-visible` matches).
  host.innerHTML = `<button type="button">Before</button>${markup}`;
  document.body.append(host);
  const tag = host.querySelector('l-tag');
  if (tag) {
    await customElements.whenDefined('l-tag');
    await (tag as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
  }
  await new Promise((r) => setTimeout(r, 0));
  await userEvent.click(host.querySelector('button')!);
  await userEvent.tab();
}

function ring(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return { width: cs.outlineWidth, offset: cs.outlineOffset, color: cs.outlineColor };
}

for (const [name, spec] of Object.entries(RINGS)) {
  describe(`The focus ring of ${name}`, () => {
    it('is 2px in the focus-ring color by default', async () => {
      await mount(spec.markup);
      expect(ring(spec.target())).toEqual({
        width: '2px',
        offset: spec.inner ? '-2px' : '2px',
        color: 'rgb(217, 70, 31)',
      });
    });

    it(
      spec.inner
        ? 'thickens inward with --l-focus-ring-width, staying inside its element'
        : 'thickens with --l-focus-ring-width, keeping its gap',
      async () => {
        await mount(spec.markup, '--l-focus-ring-width: 4px');
        const { width, offset } = ring(spec.target());
        expect(width).toBe('4px');
        expect(offset).toBe(spec.inner ? '-4px' : '2px');
      },
    );
  });
}
