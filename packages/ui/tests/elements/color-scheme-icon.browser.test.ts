import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/color-scheme-icon/index.js';
import type { ColorSchemeIcon } from '../../src/html/elements/color-scheme-icon/color-scheme-icon.js';

// l-color-scheme-icon has no interaction of its own — it is a glyph. So these tests
// assert what a user and their screen reader actually get from it: which shape
// is drawn, whether it stays out of the accessibility tree, and that two of them
// on one page do not corrupt each other's mask.

class FakeMediaQueryList extends EventTarget {
  matches: boolean;
  media = '(prefers-color-scheme: dark)';

  constructor(matches: boolean) {
    super();
    this.matches = matches;
  }
}

let fakeMedia: FakeMediaQueryList;
const realMatchMedia = globalThis.matchMedia.bind(globalThis);

function givenOsPrefers(scheme: 'light' | 'dark') {
  fakeMedia.matches = scheme === 'dark';
}

function osSwitchesTo(scheme: 'light' | 'dark') {
  fakeMedia.matches = scheme === 'dark';
  fakeMedia.dispatchEvent(new Event('change'));
}

let host: HTMLElement;

beforeEach(() => {
  fakeMedia = new FakeMediaQueryList(false);
  globalThis.matchMedia = ((query: string) =>
    query.includes('prefers-color-scheme: dark')
      ? (fakeMedia as unknown as MediaQueryList)
      : realMatchMedia(query)) as typeof globalThis.matchMedia;
});

afterEach(() => {
  host?.remove();
  globalThis.matchMedia = realMatchMedia;
});

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-color-scheme-icon');
  await settle();
  return host;
}

async function settle() {
  const icons =
    host?.querySelectorAll<ColorSchemeIcon & { updateComplete: Promise<unknown> }>(
      'l-color-scheme-icon',
    ) ?? [];
  await Promise.all(Array.from(icons, (icon) => icon.updateComplete));
  await new Promise((r) => setTimeout(r, 0));
}

const icon = () => host.querySelector<ColorSchemeIcon>('l-color-scheme-icon')!;
/** What the CSS keys off — the resolved scheme, explicit or inherited from the OS. */
const drawn = () => icon().dataset.scheme;

describe('A glyph showing the current scheme', () => {
  it('draws the sun when told the scheme is light', async () => {
    await mount(`<l-color-scheme-icon scheme="light"></l-color-scheme-icon>`);
    expect(drawn()).toBe('light');
  });

  it('draws the moon when told the scheme is dark', async () => {
    await mount(`<l-color-scheme-icon scheme="dark"></l-color-scheme-icon>`);
    expect(drawn()).toBe('dark');
  });

  it('follows the operating system when it is told nothing', async () => {
    givenOsPrefers('dark');
    await mount(`<l-color-scheme-icon></l-color-scheme-icon>`);
    expect(drawn()).toBe('dark');
  });

  it('keeps following the OS as the preference changes', async () => {
    givenOsPrefers('light');
    await mount(`<l-color-scheme-icon></l-color-scheme-icon>`);
    expect(drawn()).toBe('light');

    osSwitchesTo('dark');
    await settle();

    expect(drawn()).toBe('dark');
  });

  it('ignores the page scheme once an app has told it what to show', async () => {
    await mount(`<l-color-scheme-icon scheme="dark"></l-color-scheme-icon>`);

    // The store is the default source, not a mandatory one: an app that owns
    // its own light/dark state drives the glyph through `scheme` and the store
    // never gets a say.
    localStorage.setItem('luxen-color-scheme', 'light');
    globalThis.dispatchEvent(
      new StorageEvent('storage', { key: 'luxen-color-scheme', newValue: 'light' }),
    );
    await settle();

    expect(drawn()).toBe('dark');

    localStorage.removeItem('luxen-color-scheme');
    globalThis.dispatchEvent(
      new StorageEvent('storage', { key: 'luxen-color-scheme', newValue: null }),
    );
  });

  it('ignores the OS once an app has told it what to show', async () => {
    givenOsPrefers('light');
    await mount(`<l-color-scheme-icon scheme="dark"></l-color-scheme-icon>`);

    osSwitchesTo('light');
    await settle();

    // The app owns the decision; the glyph must not contradict it.
    expect(drawn()).toBe('dark');
  });

  it('draws all eight rays, in the SVG namespace where they can render', async () => {
    await mount(`<l-color-scheme-icon scheme="light"></l-color-scheme-icon>`);
    const rays = Array.from(icon().shadowRoot!.querySelectorAll('.ray'));

    expect(rays).toHaveLength(8);
    // A nested Lit template inside <svg> is parsed as HTML unless it is built
    // with the `svg` tag — the circles then exist but paint nothing.
    for (const ray of rays) expect(ray.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('gives each instance its own mask, so two glyphs cannot corrupt each other', async () => {
    await mount(`
      <l-color-scheme-icon scheme="light"></l-color-scheme-icon>
      <l-color-scheme-icon scheme="dark"></l-color-scheme-icon>`);

    const [first, second] = Array.from(
      host.querySelectorAll<ColorSchemeIcon>('l-color-scheme-icon'),
    );
    const firstMask = first.shadowRoot!.querySelector('mask')!;
    const secondMask = second.shadowRoot!.querySelector('mask')!;

    // Same id by design — shadow roots scope it. In light DOM the second would
    // win globally and both discs would render through one mask.
    expect(firstMask.id).toBe(secondMask.id);
    expect(firstMask.getRootNode()).not.toBe(secondMask.getRootNode());
  });
});

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('stays out of the accessibility tree while it is decorative (WCAG 1.1.1 / RGAA 1.2)', async () => {
      await mount(`<l-color-scheme-icon scheme="dark"></l-color-scheme-icon>`);

      expect(icon().getAttribute('aria-hidden')).toBe('true');
      expect(icon().hasAttribute('role')).toBe(false);
    });

    it('becomes an image with a name when the author gives it one (WCAG 1.1.1 / RGAA 1.1)', async () => {
      await mount(`<l-color-scheme-icon
        scheme="dark"
        label="Dark theme"
      ></l-color-scheme-icon>`);

      const named = await page.getByRole('img', { name: 'Dark theme' }).elements();
      expect(named).toHaveLength(1);
      expect(icon().hasAttribute('aria-hidden')).toBe(false);
    });

    it('goes back to decorative when the name is removed', async () => {
      await mount(`<l-color-scheme-icon label="Dark theme"></l-color-scheme-icon>`);
      icon().removeAttribute('label');
      await settle();

      expect(icon().getAttribute('aria-hidden')).toBe('true');
      expect(icon().hasAttribute('role')).toBe(false);
    });
  });
});
