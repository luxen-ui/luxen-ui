import { afterEach, describe, expect, it } from 'vite-plus/test';
import '../../src/html/elements/form-field/index.js';
import '../../src/html/elements/slider/index.js';
// The field owns its error's visibility through CSS keyed on the reflected
// `invalid` state, so load the real stylesheet and assert what a user sees.
import '../../src/css/elements/form-field.css';

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

    // l-form-field re-runs checkValidity on interaction, so the control must
    // genuinely fail — a custom validity stands in for a real constraint.
    slider.setCustomValidity('Pick a higher value.');
    slider.dispatchEvent(new Event('input', { bubbles: true }));
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
