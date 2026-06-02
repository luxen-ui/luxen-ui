/*
 * Metadata sidecar for the native <input type="checkbox"> element (CSS-only,
 * styled via `.l-checkbox`). The JSDoc below is the single source of truth for
 * the checkbox's reference docs and the generated skill, read by the
 * `native-meta` CEM plugin and emitted into dist/metadata/checkbox.json.
 *
 * Keep this in sync with src/css/elements/checkbox.css.
 */

/**
 * @summary Checkboxes let users select one or more options, or toggle a single setting on or off.
 *
 * @nativeElement input
 * @selector .l-checkbox
 *
 * @cssClass .l-checkbox - Base checkbox style, applied to `<input type="checkbox">`. Inside `l-form-field` a bare checkbox is auto-styled, so the class is optional there.
 *
 * @attribute checked - Whether the checkbox is checked.
 * @attribute disabled - Disables the checkbox.
 * @attribute required - Marks the checkbox as required for form submission.
 * @attribute indeterminate - Indeterminate state (DOM property `el.indeterminate = true`; renders a dash). Typically the parent of a group.
 * @attribute aria-invalid - Set to `true` to force the invalid style (otherwise applied via `:user-invalid`). `l-form-field` manages this automatically.
 *
 * @cssproperty [--size=1.25em] - Box size. Defaults to `--l-form-control-toggle-size`.
 * @cssproperty [--accent=var(--l-form-control-activated-color)] - Checked/indeterminate fill color.
 * @cssproperty --checkmark - Checkmark icon as a `url()`. Override to swap the SVG (color is baked into the image).
 *
 * @example Default
 * <input type="checkbox" class="l-checkbox" checked />
 *
 * @example In a field (no class needed)
 * <l-form-field>
 *   <label>Subscribe to the newsletter</label>
 *   <input type="checkbox" />
 *   <l-hint>One email a month.</l-hint>
 * </l-form-field>
 */
// JSDoc-only metadata carrier — the CEM analyzer reads the doc comment above; the
// class body is intentionally empty.
// oxlint-disable-next-line typescript/no-extraneous-class
export class CheckboxMeta {}
