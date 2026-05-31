/*
 * Metadata sidecar for the native close button (CSS-only, styled via `.l-close`
 * on a native `<button>`). JSDoc-only — read by the `native-meta` CEM plugin and
 * emitted into dist/metadata/close-button.json. Keep in sync with
 * src/css/elements/close-button/ (_base.css + ring/square/circle appearances).
 */

/**
 * @summary A circular/square icon button that renders an X via CSS mask, for dismissing dialogs and panels.
 *
 * @nativeElement button
 * @selector .l-close
 *
 * @attribute data-appearance - ring | square | circle — Visual appearance (matches the imported appearance CSS).
 * @attribute command - Invoker command (typically `close`).
 * @attribute commandfor - ID of the target element to close.
 *
 * @cssClass .l-close - Base close button with X icon via CSS mask.
 *
 * @cssproperty [--size=36px] - Button size.
 * @cssproperty --icon-color - Icon color.
 * @cssproperty [--icon-size=24px] - Icon size.
 * @cssproperty --ring-color - Hover ring color (`ring` appearance only).
 * @cssproperty --ring-tickness - Hover ring thickness (`ring` appearance only).
 *
 * @example Ring appearance
 * <button class="l-close" data-appearance="ring" aria-label="Close"></button>
 */
// oxlint-disable-next-line typescript/no-extraneous-class -- JSDoc-only metadata carrier.
export class CloseButtonMeta {}
