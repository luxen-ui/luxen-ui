import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import { userEvent } from './support/user-event.js';

// Asserts where the native end actions are *painted*: the date/time picker icon
// and the search clear of `.l-input`, and the chevron of the native
// `select.l-select`. Their boxes live in the browser's own shadow tree, out of
// reach of getComputedStyle and the DOM, so the suite screenshots the control
// and measures the glyph's ink: its centre tells where the action's square
// sits, its width tells the glyph size.
import '../../src/css/tokens.css';
import '../../src/css/elements/input.css';
import '../../src/css/elements/select.css';

let host: HTMLElement;

afterEach(() => host?.remove());

function mount(markup: string): HTMLElement {
  host = document.createElement('div');
  host.style.cssText = 'inline-size: 20rem; padding: 4px; background: white; color-scheme: light';
  host.innerHTML = markup;
  document.body.append(host);
  return host.firstElementChild as HTMLElement;
}

/** Ink of the glyph at the end of `el`: its centre and width, in CSS px from `el`'s end edge. */
async function endGlyph(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const base64 = await page.screenshot({ element: el, base64: true, save: false });
  const img = new Image();
  img.src = `data:image/png;base64,${base64}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const scale = img.width / rect.width;
  // Look only at the end square (the field's height from the end edge), and
  // only at its middle band: the glyph is centred there, while the value text
  // stays left of the square and the border — rounded at the corners — stays
  // above and below the band.
  const from = Math.floor(img.width - rect.height * scale);
  const top = Math.floor(img.height * 0.25);
  const bottom = Math.ceil(img.height * 0.75);
  const inset = Math.ceil(2 * scale);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);
  const inked: number[] = [];
  for (let x = from; x < img.width - inset; x++) {
    for (let y = top; y < bottom; y++) {
      const i = (y * img.width + x) * 4;
      const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (luminance < 200) {
        inked.push(x);
        break;
      }
    }
  }
  expect(inked.length).toBeGreaterThan(0);
  const left = inked[0] / scale;
  const right = (inked[inked.length - 1] + 1) / scale;
  return { centreFromEnd: rect.width - (left + right) / 2, width: right - left };
}

const DATE = (style = '') =>
  `<input class="l-input" type="date" value="2026-01-02" style="${style}">`;
const SEARCH = (style = '') =>
  `<input class="l-input" type="search" value="query" aria-label="Search" style="${style}">`;
const SELECT = (style = '') =>
  `<select class="l-select" aria-label="Team" style="inline-size: 100%; ${style}"><option>Design</option></select>`;

describe('A native end action sits in a square of the field height', () => {
  it('centres the date picker icon in a square flush against the end border', async () => {
    const { centreFromEnd } = await endGlyph(mount(DATE('--height: 56px')));
    // 1px border + half of the 54px square.
    expect(Math.abs(centreFromEnd - 28)).toBeLessThanOrEqual(1.5);
  });

  it('centres the search clear the same way while the field has focus', async () => {
    const input = mount(SEARCH('--height: 56px'));
    await userEvent.click(input);
    const { centreFromEnd } = await endGlyph(input);
    expect(Math.abs(centreFromEnd - 28)).toBeLessThanOrEqual(1.5);
  });

  it('centres the native select chevron the same way', async () => {
    const { centreFromEnd } = await endGlyph(mount(SELECT('--height: 56px')));
    expect(Math.abs(centreFromEnd - 28)).toBeLessThanOrEqual(1.5);
  });

  it('follows the size of an l-input-group and sits flush against its border', async () => {
    const group = mount(`<l-input-group size="xl">${DATE()}</l-input-group>`);
    const { centreFromEnd } = await endGlyph(group);
    // Flush against the border like a picker's chevron: 1px border + half of
    // the 42px square inside a 44px group — not the default 34px square behind
    // the group's padding (12 + 17 = 29).
    expect(Math.abs(centreFromEnd - 22)).toBeLessThanOrEqual(1.5);
  });

  it('keeps the search clear whole inside an l-input-group, behind its end padding', async () => {
    const group = mount(`<l-input-group>${SEARCH()}</l-input-group>`);
    await userEvent.click(group.querySelector('input')!);
    const inGroup = await endGlyph(group);
    host.remove();
    const standalone = mount(SEARCH());
    await userEvent.click(standalone);
    const alone = await endGlyph(standalone);
    // 1px border + 12px group padding + half of the 34px square. Bleeding over
    // the end padding like a standalone input would push the square past the
    // input's edge, where the input clips the glyph.
    expect(Math.abs(inGroup.centreFromEnd - 30)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(inGroup.width - alone.width)).toBeLessThanOrEqual(1);
  });
});

describe('A native end glyph follows --l-form-control-icon-size', () => {
  it('draws the date picker icon at the token size', async () => {
    // 1em is 16px here (the test page's font size): 32px doubles the glyph.
    const regular = await endGlyph(mount(DATE('--height: 56px')));
    host.remove();
    const doubled = await endGlyph(mount(DATE('--height: 56px; --l-form-control-icon-size: 32px')));
    expect(doubled.width / regular.width).toBeCloseTo(2, 0);
  });

  it('draws the native select chevron at the token size', async () => {
    const regular = await endGlyph(mount(SELECT('--height: 56px')));
    host.remove();
    const doubled = await endGlyph(
      mount(SELECT('--height: 56px; --l-form-control-icon-size: 32px')),
    );
    expect(doubled.width / regular.width).toBeCloseTo(2, 0);
  });
});
