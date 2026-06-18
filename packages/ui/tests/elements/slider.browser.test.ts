import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/slider/index.js';
import type { Slider } from '../../src/html/elements/slider/slider.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';

// These tests drive l-slider the way a person would — focusing a thumb and
// pressing arrow keys — and assert what a user (or their screen reader)
// observes: the slider role, value, accessible name, and the typed events.
// l-slider is a Shadow-DOM, form-associated element with custom thumbs.

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(html: string): Promise<Slider> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-slider');
  const el = host.querySelector<Slider>('l-slider')!;
  await settle(el);
  return el;
}

async function settle(el: Slider) {
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}

const SINGLE = `<l-slider label="Volume" min="0" max="100" value="40"></l-slider>`;
const RANGE = `<l-slider label="Price" range min="0" max="100" min-value="20" max-value="70"></l-slider>`;

// ---------------------------------------------------------------------------
// Roles and accessible names
// ---------------------------------------------------------------------------

describe('l-slider exposes a slider to assistive tech', () => {
  it('renders one slider thumb with the label as its accessible name', async () => {
    await mount(SINGLE);
    const slider = page.getByRole('slider', { name: 'Volume' });
    expect(slider.elements()).toHaveLength(1);
  });

  it('reports min, max and the current value', async () => {
    await mount(SINGLE);
    const thumb = page.getByRole('slider', { name: 'Volume' }).element();
    expect(thumb.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb.getAttribute('aria-valuemax')).toBe('100');
    expect(thumb.getAttribute('aria-valuenow')).toBe('40');
  });
});

// ---------------------------------------------------------------------------
// Range mode
// ---------------------------------------------------------------------------

describe('Range mode exposes two ordered thumbs', () => {
  it('labels the thumbs Minimum and Maximum, suffixed to the label', async () => {
    await mount(RANGE);
    expect(page.getByRole('slider', { name: 'Price Minimum' }).elements()).toHaveLength(1);
    expect(page.getByRole('slider', { name: 'Price Maximum' }).elements()).toHaveLength(1);
  });

  it('starts with the authored values', async () => {
    const el = await mount(RANGE);
    expect(el.values).toEqual([20, 70]);
  });

  it('does not let the lower thumb cross above the upper one', async () => {
    const el = await mount(RANGE);
    el.minValue = 90; // beyond the upper thumb (70)
    await settle(el);
    expect(el.values).toEqual([70, 70]);
  });
});

// ---------------------------------------------------------------------------
// Keyboard interaction (APG slider)
// ---------------------------------------------------------------------------

describe('A keyboard user can change the value (WCAG 2.1.1 / RGAA 7.3)', () => {
  it('increments on ArrowRight and emits a typed change', async () => {
    const el = await mount(SINGLE);
    await userEvent.tab(); // focus the thumb
    const changed = waitForEvent(el, 'change');
    await userEvent.keyboard('{ArrowRight}');
    const event = (await changed) as Event & { value: number };
    await settle(el);
    expect(event.value).toBe(41);
    expect(el.value).toBe(41);
  });

  it('jumps to the maximum on End and the minimum on Home', async () => {
    const el = await mount(SINGLE);
    await userEvent.tab();
    await userEvent.keyboard('{End}');
    await settle(el);
    expect(el.value).toBe(100);
    await userEvent.keyboard('{Home}');
    await settle(el);
    expect(el.value).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Form participation
// ---------------------------------------------------------------------------

describe('l-slider participates in forms', () => {
  it('submits the single value under its name', async () => {
    host = document.createElement('div');
    host.innerHTML = `<form><l-slider name="volume" value="40"></l-slider></form>`;
    document.body.append(host);
    await customElements.whenDefined('l-slider');
    const el = host.querySelector<Slider>('l-slider')!;
    await settle(el);
    const data = new FormData(host.querySelector('form')!);
    expect(data.get('volume')).toBe('40');
  });

  it('submits both range values under its name', async () => {
    host = document.createElement('div');
    host.innerHTML = `<form><l-slider name="price" range min-value="20" max-value="70"></l-slider></form>`;
    document.body.append(host);
    await customElements.whenDefined('l-slider');
    const el = host.querySelector<Slider>('l-slider')!;
    await settle(el);
    const data = new FormData(host.querySelector('form')!);
    expect(data.getAll('price')).toEqual(['20', '70']);
  });
});

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

describe('with-tooltip shows the current value', () => {
  const tooltipText = (el: Slider) =>
    el.shadowRoot!.querySelector('[part="tooltip"]')!.textContent.trim();

  it('renders the value in the tooltip and updates it on change', async () => {
    const el = await mount(`<l-slider label="Volume" value="40" with-tooltip></l-slider>`);
    expect(tooltipText(el)).toBe('40');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await settle(el);
    expect(tooltipText(el)).toBe('41');
  });

  it('formats the tooltip and aria-valuetext via valueFormatter', async () => {
    const el = await mount(`<l-slider label="Storage" value="60" with-tooltip></l-slider>`);
    el.valueFormatter = (v) => `${v}%`;
    el.requestUpdate();
    await settle(el);
    expect(tooltipText(el)).toBe('60%');
    expect(
      page.getByRole('slider', { name: 'Storage' }).element().getAttribute('aria-valuetext'),
    ).toBe('60%');
  });
});
