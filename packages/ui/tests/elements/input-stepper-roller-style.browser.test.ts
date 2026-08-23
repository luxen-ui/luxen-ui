import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/input-stepper/index.js';
import { userEvent } from './support/user-event.js';

// The browser config has no setup file, so light-DOM stylesheets are not loaded
// by default — `input-stepper.browser.test.ts` asserts DOM/ARIA and does not
// need them. This suite asserts what the roller overlay *paints*, so it pulls in
// the tokens and all three skins: `default` owns the disabled fill this started
// with, and `rounded` and `pill` are the ones that used to carry their own copy
// of the rule and now lean on the base for it.
import '../../src/css/tokens.css';
import '../../src/css/elements/input-stepper/default.css';
import '../../src/css/elements/input-stepper/rounded.css';
import '../../src/css/elements/input-stepper/pill.css';

// The roller replaces the input's digits rather than masking them behind an
// opaque fill. Two invariants hold that together, and neither is visible in the
// DOM — only in the paint:
//
//  1. The overlay carries no background. It used to paint `--_track-bg`, which
//     the disabled state set to the same translucent token as the host's own
//     fill — so the tint composited twice and the value area read as a lighter
//     (dark mode) / darker (light mode) rectangle against the buttons.
//  2. The input is faded with `opacity`, never `visibility`/`display`. Those
//     would drop it out of the tab order, and since the overlay only steps aside
//     on `:focus-within`, the field would become unreachable.

let host: HTMLElement;

afterEach(() => host?.remove());

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const ROLLER = (attrs = '', appearance = '') => `
  <l-input-stepper with-roller ${appearance ? `appearance="${appearance}"` : ''}>
    <input type="number" min="1" max="10" value="5" ${attrs} />
  </l-input-stepper>
`;

async function mount(html: string): Promise<void> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-input-stepper');
  await settle();
}

async function settle() {
  await new Promise((r) => setTimeout(r, 0));
}

const stepper = () => host.querySelector('l-input-stepper')!;
const input = () => stepper().querySelector<HTMLInputElement>('input[type=number]')!;
const overlay = () => stepper().querySelector('.l-input-stepper-track-display')!;
const decrementBtn = () => page.getByRole('button', { name: 'Decrease value' });

describe('The roller overlay lets the stepper’s own background show through', () => {
  it('paints no fill of its own, so a disabled stepper greys out evenly', async () => {
    await mount(ROLLER('disabled'));
    // The host paints --l-form-control-disabled-background, which is translucent.
    // A fill here would composite it a second time over the value area only —
    // the reported lighter rectangle. Transparent means the value area shows
    // exactly what the button area shows.
    expect(getComputedStyle(overlay()).backgroundColor).toBe(TRANSPARENT);
  });

  it('paints no fill when the stepper is enabled either, so it never masks a tinted backdrop', async () => {
    await mount(ROLLER());
    expect(getComputedStyle(overlay()).backgroundColor).toBe(TRANSPARENT);
  });

  it('hides the input’s digits behind it so the two never show through each other', async () => {
    await mount(ROLLER());
    expect(getComputedStyle(input()).opacity).toBe('0');
  });
});

// `rounded` and `pill` each used to turn the overlay's fill off for themselves.
// Those blocks are gone in favour of the base rule above, so these are what keep
// the deletion honest. `rounded` is the pointed case: it gives the host no
// background at all, so the overlay's old opaque fallback stamped a page-coloured
// rectangle over any tinted backdrop — enabled as well as disabled, which is why
// both states are checked rather than just the disabled one that was reported.
for (const appearance of ['rounded', 'pill']) {
  describe(`The \`${appearance}\` appearance gets that from the base, not its own copy`, () => {
    it('paints no fill of its own while enabled', async () => {
      await mount(ROLLER('', appearance));
      expect(getComputedStyle(overlay()).backgroundColor).toBe(TRANSPARENT);
    });

    it('paints no fill of its own while disabled', async () => {
      await mount(ROLLER('disabled', appearance));
      expect(getComputedStyle(overlay()).backgroundColor).toBe(TRANSPARENT);
    });

    it('still fades the input the overlay is standing in for', async () => {
      await mount(ROLLER('', appearance));
      expect(getComputedStyle(input()).opacity).toBe('0');
    });

    it('still leaves the input reachable', async () => {
      await mount(ROLLER('', appearance));
      expect(page.getByRole('spinbutton').elements()).toHaveLength(1);
    });
  });
}

describe('A keyboard user can still reach the input the roller is covering', () => {
  it('keeps it in the tab order (WCAG 2.1.1 / RGAA 7.3)', async () => {
    await mount(ROLLER());
    await userEvent.click(decrementBtn()); // focus the first control, like a user
    await settle();
    await userEvent.tab();
    await settle();
    expect(document.activeElement).toBe(input());
  });

  it('keeps it in the accessibility tree while the roller is showing (WCAG 4.1.2 / RGAA 7.1)', async () => {
    await mount(ROLLER());
    expect(page.getByRole('spinbutton').elements()).toHaveLength(1);
  });

  it('swaps the roller away for the real field once it has focus', async () => {
    await mount(ROLLER());
    await userEvent.click(page.getByRole('spinbutton'));
    await settle();
    expect(getComputedStyle(input()).opacity).toBe('1');
    expect(getComputedStyle(overlay()).visibility).toBe('hidden');
  });

  it('brings the roller back on blur', async () => {
    await mount(ROLLER());
    await userEvent.click(page.getByRole('spinbutton'));
    await settle();
    await userEvent.click(decrementBtn());
    await settle();
    expect(getComputedStyle(input()).opacity).toBe('0');
    expect(getComputedStyle(overlay()).visibility).toBe('visible');
  });
});

describe('The fade is tied to the overlay actually being on screen', () => {
  // The overlay is built once, during setup. Toggling `with-roller` afterwards
  // does not rebuild it, so the fade has to be gated on both the attribute and
  // the overlay's presence — otherwise one of the two toggles blanks the value.
  it('restores the digits when `with-roller` is removed after setup', async () => {
    await mount(ROLLER());
    stepper().removeAttribute('with-roller');
    await settle();
    expect(getComputedStyle(overlay()).display).toBe('none');
    expect(getComputedStyle(input()).opacity).toBe('1');
  });

  it('leaves the digits alone when `with-roller` is added after setup and no overlay was built', async () => {
    await mount(`
      <l-input-stepper>
        <input type="number" min="1" max="10" value="5" />
      </l-input-stepper>
    `);
    stepper().setAttribute('with-roller', '');
    await settle();
    expect(stepper().querySelector('.l-input-stepper-track-display')).toBeNull();
    expect(getComputedStyle(input()).opacity).toBe('1');
  });
});
