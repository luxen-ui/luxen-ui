import type { CSSResult } from 'lit';
import { cls, tagName } from '../registry.js';
import badgeStyles from './styles/badge-core.styles.js';

/**
 * Filter/display label of a `<datalist>` option shared by l-select and
 * l-combobox: the `label` attribute, else the rich `.l-select-item-title`, else
 * the option's text, else its value.
 *
 * The text fallback leaves out any `.l-select-item-suffix`: a badge, count or
 * status icon is not part of the option's name, so it must not be matched by the
 * filter nor written into the input / trigger / chips. The text is collected
 * with a walker that skips the suffix subtree, so no copy of the option is made
 * on each (re-)read of the list.
 */
export function richOptionLabel(option: HTMLOptionElement): string {
  const explicit = option.getAttribute('label');
  if (explicit) return explicit.trim();

  const title = option.querySelector(`.${cls('select-item-title')}`)?.textContent?.trim();
  if (title) return title;

  const suffix = cls('select-item-suffix');
  let text = '';
  const walker = document.createTreeWalker(option, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node instanceof Element && node.classList.contains(suffix)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) text += node.nodeValue;
  }
  return text.trim() || option.value;
}

/**
 * Light-DOM elements whose look the l-select / l-combobox shadow roots carry for
 * rich options. Their markup is copied into the shadow root, where the global
 * element stylesheets cannot reach, so each entry pairs a tag with the shared
 * styles that paint it there. Add an entry to support another element.
 */
const RICH_CONTENT_STYLES: ReadonlyArray<{ tag: () => string; styles: CSSResult }> = [
  { tag: () => tagName('badge'), styles: badgeStyles },
];

/**
 * Adopt, once, the styles of the light-DOM elements found in the rich options'
 * markup — and only those, so a list without badges pays for no badge rules.
 */
export function adoptRichContentStyles(
  root: ShadowRoot | null,
  items: ReadonlyArray<{ html?: string }>,
): void {
  if (!root) return;
  for (const { tag, styles } of RICH_CONTENT_STYLES) {
    const sheet = styles.styleSheet;
    if (!sheet || root.adoptedStyleSheets.includes(sheet)) continue;
    const open = `<${tag()}`;
    if (items.some((item) => item.html?.includes(open))) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    }
  }
}

/**
 * The line box of the row an option's content sits in, as an absolute length.
 * The title inherits the row's font and line-height, so this is the title's
 * line: the suffix centres itself on it (select-item-suffix.css). It has to be
 * a registered `<length>` so `1lh` resolves on the row — unregistered, it would
 * resolve on the smaller suffix. The stylesheet declares it with `@property`
 * too, which covers the native tier (no JS); in a shadow root that rule is not
 * honoured, hence this registration.
 */
const ITEM_LINE_PROPERTY = '--_select-item-line';

if (typeof CSS !== 'undefined' && 'registerProperty' in CSS) {
  try {
    CSS.registerProperty({
      name: ITEM_LINE_PROPERTY,
      syntax: '<length>',
      inherits: true,
      initialValue: '0px',
    });
  } catch {
    // Already registered by another copy of this module.
  }
}
