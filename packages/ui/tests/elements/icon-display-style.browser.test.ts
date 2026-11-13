import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import '../../src/html/elements/icon/index.js';
import { addIcon } from '../../src/html/elements/icon/index.js';
import type { Icon } from '../../src/html/elements/icon/icon.js';

// Where the glyph lands when a consumer sets `display` on the icon itself — a
// Tailwind habit (`hidden md:block`, `block size-4`). The glyph must stay a
// 1em box with nothing under it, so a centring parent centres the glyph and
// not a line box around it. The icon's own shadow styles come with the
// element; no stylesheet is needed.

addIcon('luxen-display:dot', {
  body: '<circle cx="12" cy="12" r="8" fill="currentColor"/>',
  width: 24,
  height: 24,
});

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(markup: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.style.cssText = 'font-size: 14px; line-height: 20px';
  host.innerHTML = markup;
  document.body.append(host);
  const icon = host.querySelector<Icon>('l-icon')!;
  await icon.updateComplete;
  const inner = icon.renderRoot.querySelector('iconify-icon')!;
  await vi.waitFor(() => {
    if (!inner.shadowRoot?.querySelector('svg')) throw new Error('no <svg> painted yet');
  });
  return host;
}

const svgOf = (icon: Element) =>
  (icon as Icon).renderRoot
    .querySelector('iconify-icon')!
    .shadowRoot!.querySelector('svg')!
    .getBoundingClientRect();

const middle = (rect: DOMRect) => rect.top + rect.height / 2;

describe('An icon in a centring row', () => {
  for (const display of ['', 'block', 'inline-block', 'flex', 'inline-flex', 'grid']) {
    it(`centres its glyph with ${display ? `display: ${display}` : 'no display set'}`, async () => {
      const root = await mount(
        `<div style="display: flex; align-items: center; height: 40px">
          <l-icon name="luxen-display:dot" style="${display ? `display: ${display}` : ''}"></l-icon>
        </div>`,
      );
      const row = root.firstElementChild!.getBoundingClientRect();
      const icon = root.querySelector('l-icon')!;

      expect(svgOf(icon).height).toBe(14);
      expect(middle(svgOf(icon))).toBeCloseTo(middle(row), 1);
      // No line box around the glyph: the icon is exactly its glyph's height.
      expect(icon.getBoundingClientRect().height).toBe(14);
    });
  }
});

describe('An icon in running text', () => {
  it('stays inline, on the line of its text', async () => {
    const root = await mount(
      '<p style="margin: 0">Before <l-icon name="luxen-display:dot"></l-icon> after</p>',
    );
    const line = root.firstElementChild!.getBoundingClientRect();

    expect(line.height).toBe(20);
    expect(svgOf(root.querySelector('l-icon')!).height).toBe(14);
  });

  it('sits on the text baseline', async () => {
    const root = await mount(
      `<p style="margin: 0">Before
        <l-icon name="luxen-display:dot"></l-icon>
        <span style="display: inline-block; width: 0; height: 0"></span>
      </p>`,
    );
    // A zero-size inline-block sits with its bottom edge on the baseline.
    const baseline = root.querySelector('span')!.getBoundingClientRect().bottom;

    expect(svgOf(root.querySelector('l-icon')!).bottom).toBeCloseTo(baseline, 1);
  });
});
