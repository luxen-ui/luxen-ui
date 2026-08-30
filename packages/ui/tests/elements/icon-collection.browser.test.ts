import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import '../../src/html/elements/icon/index.js';
import { addCollection } from '../../src/html/elements/icon/index.js';
import type { Icon } from '../../src/html/elements/icon/icon.js';

// A prefix that is deliberately not an Iconify collection: if this renders, it
// rendered from local storage and not from the CDN. The whole point of the
// re-export is that the *element's* storage is the one being written to — a
// consumer reaching for `@iconify/vue`'s addCollection writes to a different
// copy of the module and gets a silent 0px box.
const PREFIX = 'luxen-test-set';

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(name: string): Promise<Icon> {
  host = document.createElement('div');
  host.innerHTML = `<l-icon name="${name}"></l-icon>`;
  document.body.append(host);
  const icon = host.firstElementChild as Icon & { updateComplete: Promise<unknown> };
  await customElements.whenDefined('l-icon');
  await icon.updateComplete;
  return icon;
}

/** `iconify-icon` paints on its own queued check, not on our update cycle. */
function paintedSvg(icon: Icon): Promise<SVGElement> {
  const inner = icon.renderRoot.querySelector('iconify-icon');
  return vi.waitFor(() => {
    const svg = inner?.shadowRoot?.querySelector('svg');
    if (!svg) throw new Error('no <svg> painted yet');
    return svg as SVGElement;
  });
}

describe('A consumer ships an icon set that is not on the Iconify CDN', () => {
  it('renders it once the collection is registered through this package', async () => {
    expect(
      addCollection({
        prefix: PREFIX,
        width: 24,
        height: 24,
        icons: { dot: { body: '<circle cx="12" cy="12" r="8" fill="currentColor"/>' } },
      }),
    ).toBe(true);

    const icon = await mount(`${PREFIX}:dot`);
    await paintedSvg(icon);

    // `l-icon` is `display: contents`, so the box belongs to the inner element.
    const inner = icon.renderRoot.querySelector('iconify-icon') as HTMLElement;
    expect(inner.getBoundingClientRect().width).toBeGreaterThan(0);
  });
});
