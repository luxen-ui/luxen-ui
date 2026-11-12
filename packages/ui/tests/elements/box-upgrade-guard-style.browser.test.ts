import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';

// Asserts the `:not(:defined)` box guards in base CSS for the Shadow-DOM
// elements that draw a box of their own (`l-avatar`, `l-spinner`,
// `l-color-scheme-icon`), and how every guard handles `hidden` — what a visitor sees before the element script has
// loaded (slow network, SSR, a CDN hiccup). The browser config has no setup
// file, so the base stylesheet is imported here. No element script is imported
// on purpose: every element in this suite stays undefined. The upgraded box it
// must match comes from each element's own shadow CSS, applied to a plain
// shadow host, so the suite follows any change to that CSS.
import '../../src/css/base/_base.css';
import hostCss from '../../src/html/shared/styles/host.css?inline';
import avatarCss from '../../src/html/elements/avatar/avatar.css?inline';
import spinnerCss from '../../src/html/elements/spinner/spinner.css?inline';
import colorSchemeIconCss from '../../src/html/elements/color-scheme-icon/color-scheme-icon.css?inline';

const SHADOW_CSS: Record<string, string> = {
  'l-avatar': avatarCss,
  'l-spinner': spinnerCss,
  'l-color-scheme-icon': colorSchemeIconCss,
};

/** Every `size` step avatar.css defines, so a new or changed step is covered. */
const AVATAR_SIZES = [...avatarCss.matchAll(/:host\(\[size='([\w-]+)'\]\)/g)].map(
  ([, size]) => size,
);

/**
 * Consumer rules that set `--size` on the element from a stylesheet: a plain
 * class (unlayered) and a Tailwind-style arbitrary property (utilities layer).
 */
beforeAll(() => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    .size-64 { --size: 64px; }
    @layer utilities { .size-72 { --size: 72px; } }
  `);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
});

let host: HTMLElement;

afterEach(() => host?.remove());

/**
 * The upgraded box: a `<span>` shadow host with the element's real shadow CSS
 * and the same attributes takes the same `:host` / `:host([…])` rules.
 */
function upgradedReference(el: Element): HTMLElement {
  const ref = document.createElement('span');
  for (const { name, value } of el.attributes) ref.setAttribute(name, value);
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(hostCss + (SHADOW_CSS[el.localName] ?? ''));
  ref.attachShadow({ mode: 'open' }).adoptedStyleSheets = [sheet];
  return ref;
}

/**
 * The pre-upgrade element and its upgraded reference, each followed by a name,
 * as on a profile row or a button label.
 */
function mountPair(markup: string, rowStyle = '') {
  host = document.createElement('div');
  host.style.cssText = rowStyle;
  host.innerHTML = `<p>${markup}<span>Jane Cooper</span></p><p data-ref><span>Jane Cooper</span></p>`;
  document.body.append(host);
  const el = host.querySelector('p')!.firstElementChild as HTMLElement;
  const ref = upgradedReference(el);
  host.querySelector('[data-ref]')!.prepend(ref);
  return { el, ref, label: el.nextElementSibling!, refLabel: ref.nextElementSibling! };
}

const box = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width, height };
};

/** Same box, same display, and the text beside it where it will be after the upgrade. */
function expectUpgradedBox(markup: string, rowStyle = '') {
  const { el, ref, label, refLabel } = mountPair(markup, rowStyle);
  const offset = (a: Element, b: Element) => {
    const [ra, rb] = [a.getBoundingClientRect(), b.getBoundingClientRect()];
    return { left: rb.left - ra.left, top: rb.top - ra.top };
  };

  expect(el.matches(':defined')).toBe(false);
  expect(box(ref).width).toBeGreaterThan(0);
  expect(box(el)).toEqual(box(ref));
  expect(getComputedStyle(el).display).toBe(getComputedStyle(ref).display);
  expect(offset(el, label)).toEqual(offset(ref, refLabel));
  return { el, ref };
}

describe('An avatar whose script has not loaded yet', () => {
  it('reads its size steps from avatar.css', () => {
    expect(AVATAR_SIZES).toEqual(expect.arrayContaining(['xs', 'sm', 'lg', 'xl']));
  });

  for (const attrs of [
    '',
    'size="md"',
    'size="unknown"',
    ...AVATAR_SIZES.map((size) => `size="${size}"`),
  ]) {
    it(`reserves the upgraded box for <l-avatar ${attrs}>`, () => {
      expectUpgradedBox(`<l-avatar ${attrs}></l-avatar>`);
    });
  }

  describe('takes a `--size` set on the avatar itself, as the upgraded host does', () => {
    for (const [title, markup, width] of [
      ['inline', '<l-avatar style="--size: 20px"></l-avatar>', 20],
      ['inline, over a size step', '<l-avatar size="xl" style="--size: 72px"></l-avatar>', 72],
      ['from a class', '<l-avatar class="size-64"></l-avatar>', 64],
      ['from a class, over a size step', '<l-avatar size="xs" class="size-64"></l-avatar>', 64],
      ['from a utility layer', '<l-avatar class="size-72"></l-avatar>', 72],
    ] as const) {
      it(title, () => {
        const { el } = expectUpgradedBox(markup);

        expect(box(el).width).toBe(width);
      });
    }
  });

  describe('ignores a `--size` inherited from an ancestor, as the upgraded host does', () => {
    // A drawer's own `--size: 320px` reaches the avatars slotted in it.
    for (const markup of [
      '<l-avatar size="sm"></l-avatar>',
      '<l-avatar></l-avatar>',
      // Another custom property whose name starts with `--size`.
      '<l-avatar style="--size-ratio: 2"></l-avatar>',
    ]) {
      it(markup, () => {
        const { el } = expectUpgradedBox(markup, '--size: 320px');

        expect(box(el).width).toBeLessThan(320);
      });
    }
  });

  it('centres slotted text, as the upgraded avatar does', () => {
    const { el } = mountPair('<l-avatar>+5</l-avatar>');
    const range = document.createRange();
    range.selectNodeContents(el);
    const text = range.getBoundingClientRect();
    const avatar = el.getBoundingClientRect();

    // Within 1px: the glyph box is not exactly centred (font metrics, line box
    // rounding vary across platforms); uncentred text sits ~10px off.
    const offCentre = (a: number, b: number) => Math.abs(a - b);

    expect(text.width).toBeGreaterThan(0);
    expect(
      offCentre(text.left + text.width / 2, avatar.left + avatar.width / 2),
    ).toBeLessThanOrEqual(1);
    expect(
      offCentre(text.top + text.height / 2, avatar.top + avatar.height / 2),
    ).toBeLessThanOrEqual(1);
  });

  for (const attrs of ['name="Jane Cooper"', 'src="/avatar.png"']) {
    it(`does not show children the upgraded <l-avatar ${attrs}> will not render`, () => {
      const { el } = expectUpgradedBox(`<l-avatar ${attrs}><span>JC</span></l-avatar>`);

      expect(el.querySelector('span')!.checkVisibility()).toBe(false);
    });
  }
});

describe('A spinner or color-scheme icon whose script has not loaded yet', () => {
  for (const tag of ['l-spinner', 'l-color-scheme-icon']) {
    for (const [title, markup, rowStyle] of [
      ['the 1em square', `<${tag}></${tag}>`, 'font-size: 20px'],
      ['an inline `--size`', `<${tag} style="--size: 32px"></${tag}>`, ''],
      ['a `--size` from a class', `<${tag} class="size-64"></${tag}>`, ''],
      ['not an inherited `--size`', `<${tag}></${tag}>`, '--size: 320px; font-size: 20px'],
    ] as const) {
      it(`<${tag}> reserves ${title}`, () => {
        expectUpgradedBox(markup, rowStyle);
      });
    }

    it(`<${tag}> shows no light-DOM children, which it never renders`, () => {
      const { el } = mountPair(`<${tag}><span>Loading</span></${tag}>`, 'font-size: 20px');

      expect(el.querySelector('span')!.checkVisibility()).toBe(false);
      expect(box(el)).toEqual({ width: 20, height: 20 });
    });
  }
});

/** Every element base CSS reserves room for before upgrade. */
const GUARDED = {
  'l-dropdown':
    '<l-dropdown HIDDEN><button slot="trigger" type="button">Theme</button></l-dropdown>',
  'l-icon': '<l-icon name="lucide:palette" HIDDEN></l-icon>',
  'l-avatar': '<l-avatar name="Jane Cooper" HIDDEN></l-avatar>',
  'l-spinner': '<l-spinner HIDDEN></l-spinner>',
  'l-color-scheme-icon': '<l-color-scheme-icon HIDDEN></l-color-scheme-icon>',
};

describe('A hidden element takes no room, before and after upgrade', () => {
  // An upgraded Shadow-DOM element honours `hidden` (host.css), so no guard may
  // show one before upgrade: it would vanish, and shift the text, on upgrade.
  for (const [tag, markup] of Object.entries(GUARDED)) {
    it(`<${tag} hidden> before upgrade`, () => {
      const { el } = mountPair(markup.replace('HIDDEN', 'hidden'), 'font-size: 20px');

      expect(el.checkVisibility()).toBe(false);
      expect(box(el)).toEqual({ width: 0, height: 0 });
      for (const child of el.children) expect(child.checkVisibility()).toBe(false);
    });
  }

  for (const tag of ['l-avatar', 'l-spinner', 'l-color-scheme-icon']) {
    it(`<${tag} hidden> once upgraded`, () => {
      const { ref } = mountPair(`<${tag} hidden></${tag}>`, 'font-size: 20px');

      expect(ref.checkVisibility()).toBe(false);
      expect(box(ref)).toEqual({ width: 0, height: 0 });
    });
  }
});

describe('A `hidden="until-found"` element keeps its box, before and after upgrade', () => {
  // The browser hides it with `content-visibility`, not `display: none`, so
  // find-in-page can reveal it; its box stays, and must not change on upgrade.
  for (const tag of ['l-avatar', 'l-spinner', 'l-color-scheme-icon']) {
    it(`<${tag}>`, () => {
      const { el, ref } = expectUpgradedBox(
        GUARDED[tag as keyof typeof GUARDED].replace('HIDDEN', 'hidden="until-found"'),
        'font-size: 20px',
      );

      for (const node of [el, ref]) {
        expect(getComputedStyle(node).contentVisibility).toBe('hidden');
      }
    });
  }

  it('<l-icon> holds its 1em square', () => {
    const { el } = mountPair(
      GUARDED['l-icon'].replace('HIDDEN', 'hidden="until-found"'),
      'font-size: 20px',
    );

    expect(box(el)).toEqual({ width: 20, height: 20 });
  });

  it('<l-dropdown> stays inline-block, like the upgraded host', () => {
    const { el } = mountPair(GUARDED['l-dropdown'].replace('HIDDEN', 'hidden="until-found"'));

    expect(getComputedStyle(el).display).toBe('inline-block');
  });
});
