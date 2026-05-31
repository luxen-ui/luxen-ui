/*
 * Metadata sidecar for the native disclosure (CSS-only, styled via `.l-disclosure`
 * on a native `<details>`/`<summary>`). JSDoc-only — read by the `native-meta`
 * CEM plugin and emitted into dist/metadata/disclosure.json. Keep in sync with
 * src/css/elements/disclosure.css.
 */

/**
 * @summary A headless, animated disclosure built on native `<details>`/`<summary>`.
 *
 * @nativeElement details
 * @selector .l-disclosure
 *
 * @attribute open - Native attribute — starts the disclosure expanded.
 * @attribute name - Native attribute — groups disclosures into an exclusive accordion.
 * @attribute data-marker - arrow | plus — Marker icon: `arrow` rotates 180° when open; `plus` rotates 45° into a cross.
 * @attribute data-variant - bordered — Adds border, background, and border-radius.
 * @attribute disabled - Disables interaction (set on `<details>` or `<summary>`).
 *
 * @event toggle - Fires when the disclosure opens or closes (`e.newState` is `"open"` or `"closed"`).
 *
 * @cssClass .l-disclosure - Headless base — layout, animation, and marker behavior only.
 *
 * @cssproperty [--marker-size=20px] - Marker icon size.
 * @cssproperty --marker-color - Marker icon color (default `var(--l-color-text-tertiary)`).
 *
 * @example Bordered with arrow marker
 * <details class="l-disclosure" data-variant="bordered" data-marker="arrow">
 *   <summary>Details</summary>
 *   <div>Content</div>
 * </details>
 */
// oxlint-disable-next-line typescript/no-extraneous-class -- JSDoc-only metadata carrier.
export class DisclosureMeta {}
