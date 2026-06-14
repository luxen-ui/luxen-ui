/*
 * Metadata sidecar for the native <input> element (CSS-only, styled via
 * `.l-input`). The JSDoc below is the single source of truth for the input's
 * reference docs and the generated skill, read by the `native-meta` CEM plugin
 * and emitted into dist/metadata/input.json.
 *
 * Keep this in sync with src/css/elements/input.css. The adornment wrapper is
 * its own element — see src/html/elements/input-group/input-group.ts.
 */

/**
 * @summary Inputs let users enter and edit text, numbers, dates, and other single-line values.
 *
 * @nativeElement input
 * @selector .l-input
 *
 * @cssClass .l-input - Base input style, applied to a text-like `<input>` (text, search, number, password, email, url, tel, date, time, …). Inside `l-form-field` or `l-input-group` a bare text input is auto-styled, so the class is optional there.
 *
 * @attribute type - text | search | number | password | email | url | tel | date | time — Native input type. `date`/`time` get custom picker icons; `search` gets a custom clear button.
 * @attribute data-size - xs | sm | md | lg | xl — Control height on the shared `--l-size-control-*` scale (default `md`). Affects only the height, not the label or hint/error.
 * @attribute placeholder - Native placeholder text.
 * @attribute disabled - Disables the input.
 * @attribute required - Marks the input as required for form submission.
 * @attribute readonly - Makes the input read-only.
 * @attribute aria-invalid - Set to `true` to force the invalid style (otherwise applied via `:user-invalid`). `l-form-field` manages this automatically.
 *
 * @cssproperty [--height=var(--l-form-control-height)] - Control height.
 * @cssproperty [--border-radius=var(--l-form-control-border-radius)] - Control border radius.
 * @cssproperty --calendar-icon - Date picker glyph as a `url()`. Masked, so color is taken from the control, not the image.
 * @cssproperty --clock-icon - Time picker glyph as a `url()`.
 * @cssproperty --clear-icon - Search clear glyph as a `url()`.
 *
 * @example Default
 * <input type="text" class="l-input" placeholder="Placeholder text" />
 *
 * @example With a trailing unit
 * <l-input-group>
 *   <input type="number" placeholder="Placeholder text" />
 *   <span>cm</span>
 * </l-input-group>
 *
 * @example With a leading icon
 * <l-input-group>
 *   <l-icon name="lucide:search"></l-icon>
 *   <input type="search" placeholder="Search" />
 * </l-input-group>
 *
 * @example Password with a show/hide toggle
 * <l-input-group password-toggle>
 *   <input type="password" autocomplete="current-password" />
 * </l-input-group>
 *
 * @example In a field (no class needed)
 * <l-form-field>
 *   <label>Email</label>
 *   <input type="email" />
 *   <l-hint>We'll never share it.</l-hint>
 * </l-form-field>
 */
// JSDoc-only metadata carrier — the CEM analyzer reads the doc comment above; the
// class body is intentionally empty.
// oxlint-disable-next-line typescript/no-extraneous-class
export class InputMeta {}
