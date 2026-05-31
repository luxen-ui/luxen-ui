/*
 * Metadata sidecar for the native <select> element (CSS-only, styled via
 * `.l-select` with `appearance: base-select`). JSDoc-only — read by the
 * `native-meta` CEM plugin and emitted into dist/metadata/select.json. Keep in
 * sync with src/css/elements/select.css.
 */

/**
 * @summary A styled native `<select>` using the customizable `base-select` appearance.
 *
 * @nativeElement select
 * @selector .l-select
 *
 * @attribute disabled - Disables the select.
 * @attribute required - Marks the field as required.
 * @attribute multiple - Allows multiple selections.
 *
 * @event change - Fires when an option is selected.
 * @event input - Fires when the value changes.
 *
 * @cssClass .l-select - Base select element with `appearance: base-select`.
 * @cssClass .l-select-item - Option styling with checkmark indicator.
 *
 * @cssproperty [--border-radius=4px] - Border radius.
 * @cssproperty --border-color - Border color (adapts to light/dark).
 *
 * @example Basic
 * <select class="l-select">
 *   <option>One</option>
 *   <option>Two</option>
 * </select>
 */
// oxlint-disable-next-line typescript/no-extraneous-class -- JSDoc-only metadata carrier.
export class SelectMeta {}
