import { afterAll, describe, expect, it } from 'vite-plus/test';
import { getPrefix, setPrefix } from '../../src/html/registry.js';

// `setPrefix` mutates module-level state shared by every element, and
// `staticTag` memoizes against it — so leaving it flipped would make any suite
// that later ran in this context resolve `l-*` queries against `x-*` tags.
// Per-file isolation already covers that today; restoring explicitly means this
// suite stays safe if `isolate: false` is ever set.
const ORIGINAL_PREFIX = getPrefix();
afterAll(() => setPrefix(ORIGINAL_PREFIX));

// Every other suite runs at the default `l` prefix, where `cls()` is a no-op —
// so a hardcoded `class="l-…"` literal passes them all and only breaks in a
// consumer's rebranded build. This suite is the one place a renamed prefix is
// exercised.
//
// The failure it guards is silent: the stylesheet carrying the matching
// selector (`shared/styles/*.css` for shadow DOM, `src/css/elements/*.css` for
// light DOM) ships to dist as real CSS, so the CONSUMER's
// postcss-plugin-prefix rewrites `.l-checkbox` → `.<cssPrefix>-checkbox`. The
// vite-plugin's `transform` hook only rewrites the `_cssPrefix` initialiser in
// registry.js and never touches template literals — so a static class
// attribute desyncs from its own stylesheet and the element renders with
// native/unstyled appearance, with no error anywhere.
describe('A consumer who rebrands the prefix', () => {
  it('gets markup whose classes match the re-prefixed stylesheets', async () => {
    // Must precede the imports: `index.js` calls `define()` at module scope,
    // and the templates read the prefix at render time.
    setPrefix({ element: 'x', css: 'x' });
    await import('../../src/html/elements/tree/index.js');
    await import('../../src/html/elements/tree-item/index.js');
    await import('../../src/html/elements/story/index.js');
    await import('../../src/html/elements/alert-dialog/index.js');
    await import('../../src/html/elements/input-otp/index.js');
    await import('../../src/html/elements/input-stepper/index.js');
    await import('../../src/html/elements/form-field/index.js');
    await import('../../src/html/elements/stories-viewer/index.js');

    const host = document.createElement('div');
    host.innerHTML = `
      <x-tree selection="multiple"><x-tree-item>Item</x-tree-item></x-tree>
      <x-story label="Story"></x-story>
      <x-alert-dialog loading></x-alert-dialog>
      <x-input-otp digits="4"><input /></x-input-otp>
      <x-input-stepper with-roller><input type="number" value="1" /></x-input-stepper>
      <x-form-field>
        <label for="e">Email</label>
        <input id="e" type="email" />
        <p class="x-hint">Hint text</p>
        <p class="x-error">Error text</p>
      </x-form-field>`;
    document.body.appendChild(host);
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));

      const settle = async (el: Element) => {
        await (el as Element & { updateComplete?: Promise<unknown> }).updateComplete;
        return el;
      };

      // Shadow DOM: skin comes from shared/styles/checkbox-appearance.css
      const item = await settle(host.querySelector('x-tree-item')!);
      const box = item.shadowRoot!.querySelector('input[type=checkbox]')!;
      expect([...box.classList]).toContain('x-checkbox');
      expect([...box.classList]).not.toContain('l-checkbox');

      // Shadow DOM: skin comes from shared/styles/button-core.css
      const dialog = await settle(host.querySelector('x-alert-dialog')!);
      expect(dialog.shadowRoot!.querySelector('.x-button')).toBeTruthy();
      expect(dialog.shadowRoot!.querySelector('.l-button')).toBeNull();

      // Light DOM, Lit template: src/css/elements/story.css
      const story = await settle(host.querySelector('x-story')!);
      expect(story.querySelector('.x-story-trigger')).toBeTruthy();
      expect(story.querySelector('.x-story-thumb')).toBeTruthy();
      expect(story.querySelector('.l-story-trigger')).toBeNull();

      // Light DOM, imperative className: src/css/elements/input-otp.css
      const otp = await settle(host.querySelector('x-input-otp')!);
      expect(otp.querySelector('.x-input-otp-cells')).toBeTruthy();
      expect(otp.querySelector('.x-input-otp-cell')).toBeTruthy();
      expect(otp.querySelector('.l-input-otp-cells')).toBeNull();

      // Light DOM, imperative className: src/css/elements/input-stepper/_base.css
      const stepper = await settle(host.querySelector('x-input-stepper')!);
      expect(stepper.querySelector('.x-input-stepper-value')).toBeTruthy();
      expect(stepper.querySelector('.x-input-stepper-track')).toBeTruthy();
      expect(stepper.querySelector('.l-input-stepper-value')).toBeNull();

      // Consumer-authored `.x-hint` / `.x-error` must still be found and wired.
      const field = await settle(host.querySelector('x-form-field')!);
      const input = field.querySelector('input')!;
      const describedBy = input.getAttribute('aria-describedby') ?? '';
      expect(describedBy).not.toBe('');
      expect(field.querySelector('.x-error')!.getAttribute('role')).toBe('alert');
      for (const id of describedBy.split(/\s+/)) {
        expect(field.querySelector(`#${CSS.escape(id)}`)).toBeTruthy();
      }

      // Child custom elements render through `staticTag()`, so they upgrade.
      const dialogSpinner = dialog.shadowRoot!.querySelector('x-spinner');
      expect(dialogSpinner).toBeTruthy();
      expect(dialogSpinner!.shadowRoot).toBeTruthy();
      expect(dialog.shadowRoot!.querySelector('l-spinner')).toBeNull();

      // The module-scope scroll-lock sheet targets the renamed tag.
      const lock = document.adoptedStyleSheets
        .flatMap((s) => [...s.cssRules].map((r) => r.cssText))
        .filter((t) => t.includes('scrollbar-gutter'));
      expect(lock.some((t) => t.includes('x-stories-viewer'))).toBe(true);
      expect(lock.some((t) => t.includes('l-stories-viewer'))).toBe(false);
    } finally {
      host.remove();
    }
  });
});
