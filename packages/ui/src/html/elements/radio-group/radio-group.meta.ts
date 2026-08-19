/*
 * Metadata sidecar for the radio group in button appearance (CSS-only, styled
 * via `.l-radio-group`). The JSDoc below is the single source of truth for its
 * reference docs and the generated skill, read by the `native-meta` CEM plugin
 * and emitted into dist/metadata/radio-group.json.
 *
 * Keep this in sync with src/css/elements/radio-group.css.
 */

/**
 * @summary A set of native radios, shown as the classic dot or as joined buttons — the form counterpart of a segmented control.
 *
 * @nativeElement fieldset
 * @selector .l-radio-group
 *
 * @cssClass .l-radio-group - Applied to the `<fieldset>` grouping the radios. Its first child is the `<legend>` naming them; each item is a `<label>` wrapping one `<input type="radio">`.
 *
 * @attribute aria-label - Names the group when no visible `<legend>` fits — a view switcher in a toolbar, say. Prefer a `<legend>`: it is the technique WCAG H71 and RGAA 11.6 ask for.
 * @attribute data-appearance - button — Renders the items as joined buttons: put `.l-button` on each label. Omit it for the radio primitive: put `.l-radio` on each input.
 * @attribute data-orientation - horizontal | vertical — Stacks the items. Defaults to horizontal.
 *
 * @example Default appearance
 * <fieldset class="l-radio-group" data-orientation="vertical">
 *   <legend>Notifications</legend>
 *   <label>
 *     <input type="radio" class="l-radio" name="notifications" value="all" checked />
 *     All new messages
 *   </label>
 *   <label>
 *     <input type="radio" class="l-radio" name="notifications" value="none" />
 *     Nothing
 *   </label>
 * </fieldset>
 *
 * @example Button appearance
 * <fieldset class="l-radio-group" data-appearance="button">
 *   <legend>View</legend>
 *   <label class="l-button">
 *     <input type="radio" name="view" value="list" checked />
 *     List
 *   </label>
 *   <label class="l-button">
 *     <input type="radio" name="view" value="board" />
 *     Board
 *   </label>
 * </fieldset>
 */
// JSDoc-only metadata carrier — the CEM analyzer reads the doc comment above; the
// class body is intentionally empty.
// oxlint-disable-next-line typescript/no-extraneous-class
export class RadioGroupMeta {}
