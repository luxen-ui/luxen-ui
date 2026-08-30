import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';

// The browser config has no setup file, so light-DOM stylesheets are not loaded
// by default. This suite asserts what is *painted*, so it pulls in the tokens
// and the badge skin. No element import: `l-badge` is styled by a type selector
// and needs no upgrade, and neither does the `l-icon` used below — the padding
// correction is a pure selector match.
import '../../src/css/tokens.css';
import '../../src/css/elements/badge.css';

let host: HTMLElement;

/**
 * The four hooks win over `[variant]` / `[appearance]` / `[pill]` because those
 * rules write the *private* variable underneath while the hook is threaded at
 * the declaration site — not because they out-specify anything. Move a hook up
 * into the attribute rules and a themed badge silently reverts the moment
 * someone adds an appearance.
 *
 * Declared in Tailwind's own `components` layer — the least favourable case,
 * same layer as the library, so specificity alone decides.
 */
beforeAll(() => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    @layer components {
      .chip-site { --text-color: rgb(200, 10, 10); --background-color: rgb(2, 2, 2); }
      .chip-ink { --text-color: rgb(200, 10, 10); }
      .chip-lined { --text-color: rgb(200, 10, 10); --border-color: rgb(7, 7, 7); }
      .chip-square { --border-radius: 2px; }
    }
  `);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
});

afterEach(() => host?.remove());

function mount(markup: string): HTMLElement {
  host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  return host.querySelector('l-badge') as HTMLElement;
}

const paint = (el: HTMLElement) => {
  const cs = getComputedStyle(el);
  return {
    color: cs.color,
    background: cs.backgroundColor,
    border: cs.borderTopColor,
    height: cs.minHeight,
    fontSize: cs.fontSize,
    paddingInlineStart: cs.paddingInlineStart,
    paddingInlineEnd: cs.paddingInlineEnd,
  };
};

const INK = 'rgb(200, 10, 10)';

describe('A consumer colours a badge by category', () => {
  it('overrides the variant and the appearance', () => {
    const badge = mount(
      '<l-badge class="chip-site" variant="danger" appearance="filled">Lyon</l-badge>',
    );
    const { color, background } = paint(badge);
    expect(color).toBe(INK);
    expect(background).toBe('rgb(2, 2, 2)');
  });

  it('pins the border through a filled appearance, whose default line is transparent', () => {
    const badge = mount('<l-badge class="chip-lined" appearance="filled">Lyon</l-badge>');
    expect(paint(badge).border).toBe('rgb(7, 7, 7)');
  });

  it('keeps the corner radius through the pill attribute', () => {
    const badge = mount('<l-badge class="chip-square" pill>Lyon</l-badge>');
    expect(getComputedStyle(badge).borderTopLeftRadius).toBe('2px');
  });

  it('carries the border with the ink, so an outlined chip needs one declaration', () => {
    const badge = mount('<l-badge class="chip-ink">Lyon</l-badge>');
    const { border } = paint(badge);
    // A 30% tint of the ink, resolved through color-mix — the alpha and the red
    // hue are what distinguishes it from the neutral default it used to keep.
    expect(border).toContain('0.3');
    expect(border).not.toBe('rgba(0, 0, 0, 0)');
    expect(border).not.toBe(INK);
    // The neutral default sits near oklab lightness 0.37; the red near 0.53.
    const lightness = Number(/oklab\(([\d.]+)/.exec(border)?.[1] ?? '0');
    expect(lightness).toBeGreaterThan(0.45);
  });

  it('leaves an untouched badge on the library defaults', () => {
    const badge = mount('<l-badge>Lyon</l-badge>');
    const { height, paddingInlineStart } = paint(badge);
    expect(height).toBe('22px');
    expect(paddingInlineStart).toBe('6px');
  });
});

describe('A badge carries an icon', () => {
  // `l-icon` renders its `iconify-icon` inside a shadow root, so a selector
  // written against the inner element never fires for the library's own icon —
  // it laid out fine (`display: contents`) and sat 2px too far in.
  const TIGHT = '4px';
  const FULL = '6px';

  const gutters = (el: HTMLElement) => {
    const { paddingInlineStart, paddingInlineEnd } = paint(el);
    return `${paddingInlineStart} / ${paddingInlineEnd}`;
  };

  it.each([
    ['l-icon', '<l-icon name="mdi:map-marker-outline"></l-icon>'],
    ['iconify-icon', '<iconify-icon icon="mdi:map-marker-outline"></iconify-icon>'],
    ['svg', '<svg viewBox="0 0 24 24" width="16" height="16"></svg>'],
  ])('tightens the start padding for a leading %s', (_name: string, icon: string) => {
    const badge = mount(`<l-badge>${icon}Lyon</l-badge>`);
    expect(gutters(badge)).toBe(`${TIGHT} / ${FULL}`);
  });

  // The label has to be an element for this to be expressible at all: with a
  // bare text node the icon is the only element child, so it is `:first-child`
  // and `:last-child` at once and CSS cannot tell the two layouts apart.
  it('tightens the end padding for a trailing icon, once the label is an element', () => {
    const badge = mount(
      '<l-badge><span>Lyon</span><l-icon name="mdi:lock-outline"></l-icon></l-badge>',
    );
    expect(gutters(badge)).toBe(`${FULL} / ${TIGHT}`);
  });

  it('tightens both ends when the badge is flanked by icons', () => {
    const badge = mount(
      '<l-badge><l-icon name="mdi:check"></l-icon><span>Lyon</span><l-icon name="mdi:open-in-new"></l-icon></l-badge>',
    );
    expect(gutters(badge)).toBe(`${TIGHT} / ${TIGHT}`);
  });

  it('leaves a trailing count on the full gutter — it is text, not a glyph', () => {
    const badge = mount(
      '<l-badge><l-icon name="mdi:check"></l-icon><span>Lyon</span><span>3</span></l-badge>',
    );
    expect(gutters(badge)).toBe(`${TIGHT} / ${FULL}`);
  });

  it('leaves a badge with no icon alone', () => {
    const badge = mount('<l-badge>Lyon</l-badge>');
    expect(gutters(badge)).toBe(`${FULL} / ${FULL}`);
  });
});
