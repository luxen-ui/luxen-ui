/*
 * Metadata sidecar for the native <input type="radio"> element (CSS-only,
 * styled via `.l-radio`). The JSDoc below is the single source of truth for the
 * radio's reference docs and the generated skill, read by the `native-meta` CEM
 * plugin and emitted into dist/metadata/radio.json.
 *
 * Keep this in sync with src/css/elements/radio.css.
 */

/**
 * @summary Radios let users pick a single option from a set of mutually exclusive choices.
 *
 * @nativeElement input
 * @selector .l-radio
 *
 * @cssClass .l-radio - Base radio style, applied to `<input type="radio">`. Inside `l-form-field` a bare radio is auto-styled, so the class is optional there.
 *
 * @attribute name - Groups radios so only one can be selected at a time. Every radio in a group shares the same `name`.
 * @attribute value - The value submitted with the form when this radio is the selected one in its group.
 * @attribute checked - Whether the radio is selected.
 * @attribute disabled - Disables the radio.
 * @attribute required - Marks the group as required for form submission.
 * @attribute aria-invalid - Set to `true` to force the invalid style (otherwise applied via `:user-invalid`). `l-form-field` manages this automatically.
 *
 * @cssproperty [--size=1.25em] - Box size. Defaults to `--l-form-control-toggle-size`.
 * @cssproperty [--accent=var(--l-form-control-activated-color)] - Selected fill color.
 * @cssproperty --dot - Selected dot icon as a `url()`. Override to swap the SVG (color is baked into the image).
 *
 * @example Default
 * <input type="radio" class="l-radio" name="plan" value="free" checked />
 *
 * @example In a field (no class needed)
 * <l-form-field>
 *   <label>Free</label>
 *   <input type="radio" name="plan" value="free" />
 * </l-form-field>
 */
// JSDoc-only metadata carrier — the CEM analyzer reads the doc comment above; the
// class body is intentionally empty.
// oxlint-disable-next-line typescript/no-extraneous-class
export class RadioMeta {}
