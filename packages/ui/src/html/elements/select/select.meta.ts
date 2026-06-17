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
 * @attribute data-size - xs | sm | md | lg | xl — Control height on the shared `--l-size-control-*` scale (default `md`).
 * @attribute disabled - Disables the select.
 * @attribute required - Marks the field as required.
 * @attribute multiple - Allows multiple selections.
 *
 * @event change - Fires when an option is selected.
 * @event input - Fires when the value changes.
 *
 * @cssClass .l-select - Base select element with `appearance: base-select`.
 * @cssClass .l-select-item - Option styling with checkmark indicator.
 * @cssClass .l-select-item-media - Leading image/icon inside a rich option.
 * @cssClass .l-select-item-text - Column wrapper stacking title + description.
 * @cssClass .l-select-item-title - Primary label of a rich option.
 * @cssClass .l-select-item-description - Secondary line of a rich option (hidden in the trigger).
 *
 * @cssproperty [--height=var(--l-form-control-height)] - Control height (set via `data-size` or directly).
 * @cssproperty [--border-radius=var(--l-form-control-border-radius)] - Trigger border radius.
 * @cssproperty [--caret-color=var(--l-form-control-placeholder-color)] - Chevron color.
 * @cssproperty [--caret-icon=mdi:chevron-down] - Chevron mask image; override with any `url()` to re-skin.
 *
 * @example Basic
 * <select class="l-select">
 *   <option class="l-select-item">One</option>
 *   <option class="l-select-item">Two</option>
 * </select>
 */
// oxlint-disable-next-line typescript/no-extraneous-class -- JSDoc-only metadata carrier.
export class SelectMeta {}
