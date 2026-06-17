/*
 * Metadata sidecar for the native <input type="checkbox" role="switch"> element
 * (CSS-only, styled via `.l-switch`). The JSDoc below is the single source of
 * truth for the switch's reference docs and the generated skill, read by the
 * `native-meta` CEM plugin and emitted into dist/metadata/switch.json.
 *
 * Keep this in sync with src/css/elements/switch.css.
 */

/**
 * @summary Switches toggle a single setting on or off, taking effect immediately.
 *
 * @nativeElement input
 * @selector .l-switch
 *
 * @cssClass .l-switch - Base switch style, applied to `<input type="checkbox" role="switch">`. The `role="switch"` is required so assistive tech announces "on/off" (not "checked") and `l-form-field` lays it out inline. Inside `l-form-field` a bare switch is auto-styled, so the class is optional there.
 *
 * @attribute role - Must be `switch`. Promotes the native checkbox to a switch for assistive tech and triggers the switch skin / inline field layout.
 * @attribute checked - Whether the switch is on.
 * @attribute disabled - Disables the switch.
 * @attribute required - Marks the switch as required for form submission.
 * @attribute aria-invalid - Set to `true` to force the invalid style (otherwise applied via `:user-invalid`). `l-form-field` manages this automatically.
 *
 * @cssproperty [--size=1.25em] - Track height; the whole control scales from it. Defaults to `--l-form-control-toggle-size`.
 * @cssproperty [--accent=var(--l-form-control-activated-color)] - Track fill when on.
 *
 * @example Default
 * <input type="checkbox" role="switch" class="l-switch" checked />
 *
 * @example In a field (no class needed)
 * <l-form-field>
 *   <label>Email notifications</label>
 *   <input type="checkbox" role="switch" />
 *   <l-hint>We'll only email you about account activity.</l-hint>
 * </l-form-field>
 */
// JSDoc-only metadata carrier — the CEM analyzer reads the doc comment above; the
// class body is intentionally empty.
// oxlint-disable-next-line typescript/no-extraneous-class
export class SwitchMeta {}
