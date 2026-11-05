import { cls } from '../registry.js';

/**
 * Filter/display label of a `<datalist>` option shared by l-select and
 * l-combobox: the `label` attribute, else the rich `.l-select-item-title`, else
 * the option's text, else its value.
 *
 * The text fallback leaves out any `.l-select-item-suffix`: a badge, count or
 * status icon is not part of the option's name, so it must not be matched by the
 * filter nor written into the input / trigger / chips.
 */
export function richOptionLabel(option: HTMLOptionElement): string {
  const explicit = option.getAttribute('label');
  if (explicit) return explicit.trim();

  const title = option.querySelector(`.${cls('select-item-title')}`)?.textContent?.trim();
  if (title) return title;

  const suffix = `.${cls('select-item-suffix')}`;
  let text = option.textContent ?? '';
  if (option.querySelector(suffix)) {
    const copy = option.cloneNode(true) as HTMLOptionElement;
    for (const el of copy.querySelectorAll(suffix)) el.remove();
    text = copy.textContent ?? '';
  }
  return text.trim() || option.value;
}
