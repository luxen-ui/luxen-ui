import { afterEach, describe, expect, it } from 'vite-plus/test';
import registry from '../../elements.json';
import '../../src/html/elements/alert-dialog/index.js';
import '../../src/html/elements/avatar/index.js';
import '../../src/html/elements/carousel/index.js';
import '../../src/html/elements/carousel-item/index.js';
import '../../src/html/elements/color-scheme-icon/index.js';
import '../../src/html/elements/combobox/index.js';
import '../../src/html/elements/dialog/index.js';
import '../../src/html/elements/drawer/index.js';
import '../../src/html/elements/dropdown/index.js';
import '../../src/html/elements/dropdown-item/index.js';
import '../../src/html/elements/dropdown-label/index.js';
import '../../src/html/elements/icon/index.js';
import '../../src/html/elements/popover/index.js';
import '../../src/html/elements/prose-editor/index.js';
import '../../src/html/elements/rating/index.js';
import '../../src/html/elements/select/index.js';
import '../../src/html/elements/slider/index.js';
import '../../src/html/elements/spinner/index.js';
import '../../src/html/elements/sticky-bar/index.js';
import '../../src/html/elements/stories-viewer/index.js';
import '../../src/html/elements/tag/index.js';
import '../../src/html/elements/tooltip/index.js';
import '../../src/html/elements/tree/index.js';
import '../../src/html/elements/tree-item/index.js';

// `hidden` on a Shadow-DOM host. Each element's `:host { display: … }` is an
// author rule, so it beats the browser's own `[hidden] { display: none }`;
// the shared host.css restores it for every one of them.

/** Every Shadow-DOM element, each imported above. */
const SHADOW_ELEMENTS = [
  'alert-dialog',
  'avatar',
  'carousel',
  'carousel-item',
  'color-scheme-icon',
  'combobox',
  'dialog',
  'drawer',
  'dropdown',
  'dropdown-item',
  'dropdown-label',
  'icon',
  'popover',
  'prose-editor',
  'rating',
  'select',
  'slider',
  'spinner',
  'sticky-bar',
  'stories-viewer',
  'tag',
  'tooltip',
  'tree',
  'tree-item',
];

let host: HTMLElement;

afterEach(() => host?.remove());

async function mount(tag: string, hidden: string): Promise<HTMLElement> {
  host = document.createElement('div');
  const el = document.createElement(`l-${tag}`);
  el.setAttribute('hidden', hidden);
  host.append(el);
  document.body.append(host);
  await (el as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
  return el;
}

describe('A hidden Shadow-DOM element', () => {
  it('covers every Shadow-DOM element in the registry', () => {
    const shadow = registry.elements.filter((e) => e.type === 'shadow').map((e) => e.name);

    expect(new Set(SHADOW_ELEMENTS)).toEqual(new Set(shadow));
  });

  for (const tag of SHADOW_ELEMENTS) {
    it(`<l-${tag} hidden> takes no room and is not shown`, async () => {
      const el = await mount(tag, '');

      expect(el.matches(':defined')).toBe(true);
      expect(getComputedStyle(el).display).toBe('none');
      expect(el.checkVisibility()).toBe(false);
    });
  }

  it('keeps `hidden="until-found"` searchable, like the browser does', async () => {
    // The browser hides it with `content-visibility`, not `display: none`, so
    // find-in-page can reveal it.
    const el = await mount('avatar', 'until-found');

    expect(getComputedStyle(el).display).not.toBe('none');
  });
});
