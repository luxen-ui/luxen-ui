import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';

// Asserts the `l-icon:not(:defined)` guard in base CSS — what a visitor sees
// before the element script has loaded (slow network, SSR, a CDN hiccup). The
// browser config has no setup file, so the base stylesheet is imported here.
// No element script is imported on purpose: every `l-icon` in this suite stays
// undefined. The upgraded box it must match is a 1em square (`iconify-icon`
// around a 1em `<svg>`), or nothing for an icon with no name.
import '../../src/css/base/_base.css';

let host: HTMLElement;

/** A Tailwind-style display utility, in its own layer declared after `base`. */
beforeAll(() => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`@layer utilities { .flex { display: flex; } }`);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
});

afterEach(() => host?.remove());

function mount(markup: string, fontSize: string): HTMLElement {
  host = document.createElement('div');
  host.style.fontSize = fontSize;
  host.innerHTML = markup;
  document.body.append(host);
  return host.firstElementChild as HTMLElement;
}

const box = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width, height };
};

describe('An icon whose script has not loaded yet', () => {
  it('is not upgraded in this suite', () => {
    const icon = mount('<l-icon name="lucide:palette"></l-icon>', '20px');

    expect(icon.matches(':defined')).toBe(false);
  });

  it('holds the 1em square the glyph will take', () => {
    const icon = mount('<l-icon name="lucide:palette"></l-icon>', '20px');

    expect(box(icon)).toEqual({ width: 20, height: 20 });
  });

  it('holds it as a flex item too, next to a label', () => {
    const row = mount(
      `<div class="flex">
        <l-icon name="lucide:palette"></l-icon>
        Theme
        <l-icon name="lucide:chevron-down" class="flex"></l-icon>
      </div>`,
      '16px',
    );

    // Width only: a flex row stretches its items to the line height.
    for (const icon of row.querySelectorAll('l-icon')) expect(box(icon).width).toBe(16);
  });
});

describe('An icon that will draw nothing takes no room before upgrade either', () => {
  for (const [title, markup] of [
    ['with no name', '<l-icon></l-icon>'],
    ['with an empty name', '<l-icon name=""></l-icon>'],
    ['when hidden', '<l-icon name="lucide:palette" hidden></l-icon>'],
  ]) {
    it(title, () => {
      const icon = mount(markup, '20px');

      expect(box(icon).width).toBe(0);
    });
  }
});
