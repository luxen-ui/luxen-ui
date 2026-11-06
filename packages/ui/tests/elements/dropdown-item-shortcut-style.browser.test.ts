import { afterEach, describe, expect, it } from 'vite-plus/test';
// The browser config has no setup file, so the design tokens are not loaded by
// default. This suite asserts what is *painted*, so it pulls them in. The
// element brings its own shadow CSS.
import '../../src/css/tokens.css';
import '../../src/html/elements/dropdown-item/index.js';
import type { DropdownItem } from '../../src/html/elements/dropdown-item/dropdown-item.js';

// The `shortcut` of l-dropdown-item is shown the way menus show it: small muted
// text in the row's own font — not as the browser's monospace <kbd>, and not in
// the label's colour — even on a page whose reset restyles every <kbd>.

let host: HTMLElement;
let reset: CSSStyleSheet | undefined;

afterEach(() => {
  host?.remove();
  if (reset) {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== reset);
    reset = undefined;
  }
});

async function mount(markup: string): Promise<DropdownItem> {
  host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const item = host.querySelector<DropdownItem>('l-dropdown-item')!;
  await item.updateComplete;
  return item;
}

/** The colour a token resolves to on this page. */
function tokenColor(token: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  host.append(probe);
  return getComputedStyle(probe).color;
}

function expectMutedShortcut(item: DropdownItem) {
  const kbd = getComputedStyle(item.shadowRoot!.querySelector('[part="shortcut"]')!);
  const row = getComputedStyle(item.shadowRoot!.querySelector('[role="menuitem"]')!);
  expect(kbd.fontSize).toBe('12px');
  expect(kbd.fontFamily).toBe(row.fontFamily);
  expect(kbd.color).toBe(tokenColor('--l-color-text-tertiary'));
}

describe('A dropdown item shows its shortcut as muted menu text', () => {
  it('paints the shortcut small and muted, in the row font', async () => {
    expectMutedShortcut(await mount(`<l-dropdown-item shortcut="Ctrl+C">Copy</l-dropdown-item>`));
  });

  it('keeps that look under a page reset that restyles kbd', async () => {
    // What Tailwind's preflight and normalize.css ship.
    reset = new CSSStyleSheet();
    reset.replaceSync(`kbd { font-family: monospace; font-size: 1em; }`);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, reset];
    expectMutedShortcut(await mount(`<l-dropdown-item shortcut="Ctrl+C">Copy</l-dropdown-item>`));
  });

  it('keeps the shortcut muted on a destructive item', async () => {
    const item = await mount(
      `<l-dropdown-item variant="destructive" shortcut="Ctrl+D">Delete</l-dropdown-item>`,
    );
    const kbd = item.shadowRoot!.querySelector('[part="shortcut"]')!;
    expect(getComputedStyle(kbd).color).toBe(tokenColor('--l-color-text-tertiary'));
  });

  it('renders no shortcut when none is set', async () => {
    const item = await mount(`<l-dropdown-item>Copy</l-dropdown-item>`);
    expect(item.shadowRoot!.querySelector('[part="shortcut"]')).toBeNull();
  });
});
