/*
 * Metadata sidecar for the native <textarea> element (CSS-only, styled via
 * `.l-textarea`). The JSDoc below is the single source of truth for the
 * textarea's reference docs and the generated skill, read by the `native-meta`
 * CEM plugin and emitted into dist/metadata/textarea.json.
 *
 * Keep this in sync with src/css/elements/textarea.css.
 */

/**
 * @summary Textareas let users enter and edit multi-line text.
 *
 * @nativeElement textarea
 * @selector .l-textarea
 *
 * @cssClass .l-textarea - Base textarea style, applied to a `<textarea>`. Inside `l-form-field` a bare textarea is auto-styled, so the class is optional there.
 *
 * @attribute rows - Number of visible text lines — sets the initial height.
 * @attribute data-size - xs | sm | md | lg | xl — Single-line min-height on the shared `--l-size-control-*` scale (default `md`). Affects only the control, not the label or hint/error.
 * @attribute data-resize - vertical | none | both | auto — User resize handle. Defaults to `vertical`. `auto` grows the box with its content via `field-sizing` (progressive: falls back to the `rows` height where unsupported).
 * @attribute placeholder - Native placeholder text.
 * @attribute disabled - Disables the textarea.
 * @attribute required - Marks the textarea as required for form submission.
 * @attribute readonly - Makes the textarea read-only.
 * @attribute maxlength - Native maximum character count.
 * @attribute aria-invalid - Set to `true` to force the invalid style (otherwise applied via `:user-invalid`). `l-form-field` manages this automatically.
 *
 * @cssproperty [--height=var(--l-form-control-height)] - Single-line min-height; `rows` grows the control from here.
 * @cssproperty [--border-radius=var(--l-form-control-border-radius)] - Control border radius.
 *
 * @example Default
 * <textarea class="l-textarea" rows="4" placeholder="Placeholder text"></textarea>
 *
 * @example In a field (no class needed)
 * <l-form-field>
 *   <label>Message</label>
 *   <textarea rows="4"></textarea>
 *   <p class="l-hint">Tell us what's on your mind.</p>
 * </l-form-field>
 *
 * @example Auto-growing
 * <textarea class="l-textarea" data-resize="auto" rows="2"></textarea>
 */
// JSDoc-only metadata carrier — the CEM analyzer reads the doc comment above; the
// class body is intentionally empty.
// oxlint-disable-next-line typescript/no-extraneous-class
export class TextareaMeta {}
