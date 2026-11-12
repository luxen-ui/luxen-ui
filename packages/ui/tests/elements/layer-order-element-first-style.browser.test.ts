import { afterEach, describe, expect, it } from 'vite-plus/test';

// The first stylesheet to name a cascade layer fixes its position. A project
// may import an element skin before the preset, so every Luxen entry file
// declares `@layer theme, base, components;` itself — otherwise the element
// would create `components` first and `base` would outrank it. Each browser
// suite gets its own document, so this one loads an element skin FIRST
// (component suites load no CSS by default).
import '../../src/css/elements/button.css';
import '../../src/css/preset.css';

const added: HTMLElement[] = [];

afterEach(() => {
  for (const node of added.splice(0)) node.remove();
});

describe('Luxen keeps its layer order when an element skin loads first', () => {
  it('lets a components rule beat a base rule', () => {
    // Base listed after components on purpose: only the layer order decides.
    const style = document.createElement('style');
    style.textContent = `
      @layer components { .layer-probe { color: rgb(0, 128, 0); } }
      @layer base { .layer-probe { color: rgb(255, 0, 0); } }
    `;
    const probe = document.createElement('span');
    probe.className = 'layer-probe';
    document.head.append(style);
    document.body.append(probe);
    added.push(style, probe);

    expect(getComputedStyle(probe).color).toBe('rgb(0, 128, 0)');
  });

  it('still declares the tokens in @layer theme', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--l-color-bg-fill-brand')
      .trim();
    expect(value).not.toBe('');

    const style = document.createElement('style');
    style.textContent = '@layer base { :root { --l-color-bg-fill-brand: red; } }';
    document.head.append(style);
    added.push(style);
    expect(
      getComputedStyle(document.documentElement).getPropertyValue('--l-color-bg-fill-brand').trim(),
    ).toBe('red');
  });
});
