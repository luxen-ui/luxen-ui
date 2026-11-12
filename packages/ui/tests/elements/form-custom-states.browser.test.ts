import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/rating/index.js';
import '../../src/html/elements/segmented-control/index.js';
import '../../src/html/elements/slider/index.js';
import type { LuxenFormAssociatedElement } from '../../src/html/shared/luxen-form-associated-element.js';
import { userEvent } from './support/user-event.js';

// The custom states every form element documents in its API reference
// (`required`, `optional`, `valid`, `invalid`, `user-valid`, `user-invalid`),
// asserted the way a stylesheet sees them: through `:state()` selectors.
// Slider, rating and segmented control never set validity themselves, so they
// are the ones that must still expose the states.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(markup: string): Promise<LuxenFormAssociatedElement> {
  host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const el = host.firstElementChild as LuxenFormAssociatedElement;
  await customElements.whenDefined(el.localName);
  await settle(el);
  return el;
}

async function settle(el: LuxenFormAssociatedElement) {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const matching = (el: Element) =>
  ['required', 'optional', 'valid', 'invalid', 'user-valid', 'user-invalid'].filter((state) =>
    el.matches(`:state(${state})`),
  );

const ELEMENTS = {
  'l-slider': '<l-slider label="Volume" min="0" max="100" value="40"></l-slider>',
  'l-rating': '<l-rating label="Rating" value="3"></l-rating>',
  'l-segmented-control': `
    <l-segmented-control label="View" value="board">
      <button value="list">List</button>
      <button value="board">Board</button>
    </l-segmented-control>`,
};

describe('A form element exposes its states from the first render', () => {
  for (const [tag, markup] of Object.entries(ELEMENTS)) {
    it(`<${tag}> matches :state(optional) and :state(valid)`, async () => {
      const el = await mount(markup.trim());

      expect(matching(el)).toEqual(['optional', 'valid']);
    });
  }
});

describe('The states follow the element', () => {
  it('switches to :state(required) when required is set', async () => {
    const el = await mount(ELEMENTS['l-slider']);

    el.required = true;
    await settle(el);

    expect(matching(el)).toEqual(['required', 'valid']);
  });

  it('adds :state(user-valid) once the user changes the value', async () => {
    const el = await mount(ELEMENTS['l-slider']);

    await userEvent.tab(); // focus the thumb
    await userEvent.keyboard('{ArrowRight}');
    await settle(el);

    expect(matching(el)).toEqual(['optional', 'valid', 'user-valid']);
  });
});
