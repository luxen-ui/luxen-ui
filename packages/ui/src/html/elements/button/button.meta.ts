/*
 * Metadata sidecar for the native <button> element (CSS-only, styled via
 * `.l-button`). It carries no runtime code — the JSDoc below is the single
 * source of truth for the button's reference docs and the generated skill,
 * read by the `native-meta` CEM plugin (see scripts/cem-plugins/native-meta.js)
 * and emitted into dist/metadata/button.json by normalize-metadata.mjs.
 *
 * Keep this in sync with src/css/elements/button.css.
 */

/**
 * @summary Buttons trigger actions such as submitting forms, confirming dialogs, or navigating.
 *
 * @nativeElement button
 * @selector .l-button
 *
 * @cssClass .l-button - Base button style.
 *
 * @attribute disabled - Disables the button.
 * @attribute command - Invoker command (`show-modal`, `close`, `show-popover`, etc.).
 * @attribute commandfor - ID of the target element for `command`.
 * @attribute data-variant - primary | destructive — Visual variant. Default is the secondary style.
 * @attribute data-size - sm | lg | xl — Control size. Default is md.
 * @attribute data-icon-only - Icon-only mode (square button, width equals height). Auto-detected for a single icon child.
 * @attribute data-press-effect - Press effect (scale + translate on active).
 *
 * @cssproperty [--height=36px] - Button height (md size).
 * @cssproperty [--padding-inline=0.625rem] - Horizontal padding.
 * @cssproperty --background-color - Background color.
 * @cssproperty --background-color-hover - Background color on hover.
 * @cssproperty --background-color-active - Background color on press.
 * @cssproperty --text-color - Text color.
 * @cssproperty --text-color-hover - Text color on hover.
 * @cssproperty --border-color - Border color.
 * @cssproperty --border-color-hover - Border color on hover.
 * @cssproperty [--font-size=0.875rem] - Label font size. Stays 14px across all sizes; override to opt into a larger label.
 *
 * @example Primary
 * <button class="l-button" data-variant="primary">Save</button>
 */
// JSDoc-only metadata carrier — the CEM analyzer reads the doc comment above; the
// class body is intentionally empty.
// oxlint-disable-next-line typescript/no-extraneous-class
export class ButtonMeta {}
