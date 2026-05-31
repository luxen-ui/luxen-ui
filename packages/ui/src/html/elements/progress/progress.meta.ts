/*
 * Metadata sidecar for the native <progress> element (CSS-only, styled via
 * `.l-progress`). JSDoc-only — read by the `native-meta` CEM plugin and emitted
 * into dist/metadata/progress.json. Keep in sync with
 * src/css/elements/progress.css.
 */

/**
 * @summary A progress bar built on the native `<progress>` element.
 *
 * @nativeElement progress
 * @selector .l-progress
 *
 * @attribute value - Current progress between `0` and `1` (omit for indeterminate).
 * @attribute data-orientation - vertical — Vertical orientation.
 *
 * @cssClass .l-progress - Base progress bar style.
 *
 * @cssproperty [--size=4px] - Bar thickness.
 * @cssproperty --track-color - Track background color.
 * @cssproperty --indicator-color - Fill/indicator color.
 * @cssproperty --indeterminate-animation - Animation name for the indeterminate state.
 *
 * @example Determinate
 * <progress class="l-progress" value="0.5"></progress>
 */
// oxlint-disable-next-line typescript/no-extraneous-class -- JSDoc-only metadata carrier.
export class ProgressMeta {}
