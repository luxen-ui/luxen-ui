import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/form-field/index.js';
import '../../src/html/elements/slider/index.js';
// The field owns its error's visibility through CSS keyed on the reflected
// `invalid` state, so load the real stylesheet and assert what a user sees.
import '../../src/css/elements/form-field.css';
import { userEvent } from './support/user-event';

// l-form-field wires id/for/aria-describedby/aria-invalid around its control and
// keeps the .l-error message hidden until the control is invalid after
// interaction. The control can be a native input/select/textarea OR a
// form-associated custom element such as l-slider — this suite guards the
// custom-element path, which once stayed unwired and left the error visible.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-form-field');
  await customElements.whenDefined('l-slider');
  const field = host.querySelector<HTMLElement>('l-form-field')!;
  await settle(field);
  return field;
}

async function settle(field: HTMLElement) {
  await (field as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
  // Setup runs synchronously, then retries on a macrotask, then again once the
  // control's custom element is defined — wait past all three, plus the
  // reflection of `invalid` to the host attribute that drives the CSS.
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  await (field as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
}

const SLIDER_FIELD = `
  <l-form-field>
    <label>Volume</label>
    <l-slider min="0" max="100" value="40"></l-slider>
    <p class="l-hint">This is a hint to help the user.</p>
    <p class="l-error">This is an error message.</p>
  </l-form-field>`;

const INPUT_FIELD = `
  <form>
    <l-form-field>
      <label>Email</label>
      <input type="email" required />
      <p class="l-error">Enter your email.</p>
    </l-form-field>
    <button type="submit">Send</button>
  </form>`;

// A form-associated control that exposes `checkValidity()` but no `validity`
// getter — the field can only learn its state by firing `invalid` at it. It
// starts invalid (value missing) and reports a keystroke as `input`, like a real
// control would.
class BareControl extends HTMLElement {
  static formAssociated = true;
  private _internals = this.attachInternals();

  constructor() {
    super();
    // Invalid from the start, before the field wires up around it.
    this._internals.setValidity({ valueMissing: true }, 'Fill this in.');
  }

  connectedCallback() {
    this.tabIndex = 0;
    this.addEventListener('keydown', () =>
      this.dispatchEvent(new Event('input', { bubbles: true })),
    );
  }

  checkValidity() {
    return this._internals.checkValidity();
  }
}
customElements.define('test-bare-control', BareControl);

const BARE_FIELD = `
  <l-form-field>
    <label>Code</label>
    <test-bare-control></test-bare-control>
    <p class="l-error">Fill this in.</p>
  </l-form-field>`;

const displayOf = (el: HTMLElement) => getComputedStyle(el).display;

describe('l-form-field wires a form-associated custom element control', () => {
  it('keeps the error hidden on load (a valid slider is not invalid)', async () => {
    const field = await mount(SLIDER_FIELD);
    const error = field.querySelector<HTMLElement>('.l-error')!;
    expect(field.hasAttribute('invalid')).toBe(false);
    expect(displayOf(error)).toBe('none');
  });

  it('links the control to the hint via aria-describedby', async () => {
    const field = await mount(SLIDER_FIELD);
    const slider = field.querySelector('l-slider')!;
    const hint = field.querySelector<HTMLElement>('.l-hint')!;
    expect(slider.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('associates the label with the control', async () => {
    const field = await mount(SLIDER_FIELD);
    const slider = field.querySelector('l-slider')!;
    const label = field.querySelector('label')!;
    expect(slider.id).toBeTruthy();
    expect(label.htmlFor).toBe(slider.id);
  });

  it('reveals the error once the control is invalid after interaction', async () => {
    const field = await mount(SLIDER_FIELD);
    const error = field.querySelector<HTMLElement>('.l-error')!;
    const slider = field.querySelector<HTMLElement & { setCustomValidity(m: string): void }>(
      'l-slider',
    )!;

    // l-form-field re-reads the control's validity on interaction, so the
    // control must genuinely fail — a custom validity stands in for a real constraint.
    slider.setCustomValidity('Pick a higher value.');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await settle(field);

    expect(field.hasAttribute('invalid')).toBe(true);
    expect(displayOf(error)).not.toBe('none');
    expect(error.getAttribute('role')).toBe('alert');
    expect(slider.getAttribute('aria-describedby')).toContain(error.id);
  });

  it('leaves a standalone .l-error (outside a field) visible by default', async () => {
    host = document.createElement('div');
    host.innerHTML = `<p class="l-error">Standalone error</p>`;
    document.body.append(host);
    const error = host.querySelector<HTMLElement>('.l-error')!;
    expect(displayOf(error)).toBe('block');
    error.hidden = true;
    expect(displayOf(error)).toBe('none');
  });
});

// Reading the control's state must not fire `invalid` at it: the field listens
// for `invalid`, so a check that fires it re-enters and loops — and every other
// listener on the control receives the burst.
describe('l-form-field checks validity without firing invalid at the control', () => {
  function countInvalid(control: Element) {
    const count = { fired: 0 };
    control.addEventListener('invalid', () => count.fired++);
    return count;
  }

  it('flags an emptied required input without firing invalid', async () => {
    const field = await mount(INPUT_FIELD);
    const input = field.querySelector('input')!;
    const count = countInvalid(input);

    await userEvent.type(input, 'a');
    await userEvent.keyboard('{Backspace}');
    await settle(field);

    expect(field.hasAttribute('invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(count.fired).toBe(0);
  });

  it('receives exactly one invalid, the browser’s own, when an empty form is submitted', async () => {
    const field = await mount(INPUT_FIELD);
    const input = field.querySelector('input')!;
    const count = countInvalid(input);

    await userEvent.click(host.querySelector('button')!);
    await settle(field);

    expect(field.hasAttribute('invalid')).toBe(true);
    expect(count.fired).toBe(1);
  });

  it('flags an invalid form-associated control without firing invalid', async () => {
    const field = await mount(SLIDER_FIELD);
    const slider = field.querySelector<HTMLElement & { setCustomValidity(m: string): void }>(
      'l-slider',
    )!;
    const count = countInvalid(slider);

    slider.setCustomValidity('Pick a higher value.');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await settle(field);

    expect(field.hasAttribute('invalid')).toBe(true);
    expect(count.fired).toBe(0);
  });

  it('keeps the error hidden on load for a control with no validity getter', async () => {
    const field = await mount(BARE_FIELD);
    const error = field.querySelector<HTMLElement>('.l-error')!;

    expect(field.hasAttribute('invalid')).toBe(false);
    expect(displayOf(error)).toBe('none');
  });

  it('asks a control with no validity getter only once per interaction', async () => {
    const field = await mount(BARE_FIELD);
    const control = field.querySelector('test-bare-control')!;
    const count = countInvalid(control);

    await userEvent.tab();
    await userEvent.keyboard('a');
    await settle(field);

    expect(field.hasAttribute('invalid')).toBe(true);
    // Its only way to answer is `checkValidity()`, which fires `invalid` once.
    expect(count.fired).toBe(1);
  });
});
