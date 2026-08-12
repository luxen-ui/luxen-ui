import { html, svg, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { colorScheme, type ColorScheme } from '../../color-scheme.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './color-scheme-icon.css?inline';

const styles = unsafeCSS(rawStyles);

export type { ColorScheme };

/** Eight ray dots on a circle of radius 9.2 around the glyph's centre. */
const RAYS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * Math.PI) / 4;
  return {
    i,
    cx: (12 + Math.cos(angle) * 9.2).toFixed(2),
    cy: (12 + Math.sin(angle) * 9.2).toFixed(2),
  };
});

/**
 * @summary A sun that morphs into a moon. Purely presentational: it shows a
 * color scheme, it does not choose or store one.
 *
 * The two glyphs are a single shape — the disc grows, a mask slides in to carve
 * the crescent, and the rays retract in a ripple — so the change reads as one
 * object turning rather than two icons swapping. That is why this is authored
 * SVG rather than an `<l-icon>`: an Iconify icon is opaque, and you cannot grow
 * one into another or animate a mask inside it.
 *
 * Use it wherever a scheme needs a glyph and the surrounding element is already
 * the control — a `menuitemcheckbox` row, a button, a legend. With no `scheme`
 * it follows the page's scheme from `luxen-ui/color-scheme`, so it needs no
 * wiring; set `scheme` to pin it.
 *
 * @example In a menu row, where the row is the control
 * ```html
 * <l-dropdown-item type="checkbox" checked>
 *   <l-color-scheme-icon slot="prefix" scheme="dark"></l-color-scheme-icon>
 *   Dark theme
 * </l-dropdown-item>
 * ```
 *
 * @cssproperty [--size=1em] - Width and height of the glyph.
 * @cssproperty [--color=currentColor] - Glyph color.
 *
 * @csspart base - The root `<svg>`, for overriding the morph's timing or tilt.
 *
 * @customElement l-color-scheme-icon
 */
export class ColorSchemeIcon extends LuxenElement {
  static override styles = [hostStyles, styles];

  /**
   * Which glyph to show. Leave it unset and the icon follows the page's scheme
   * (`colorScheme.current` — a stored override, else the OS preference), so it
   * stays in step with every other control without wiring. Set it to pin the
   * glyph, for a legend or a preview that must not move.
   */
  @property({ reflect: true })
  scheme?: ColorScheme;

  /**
   * Accessible label. When set, the glyph becomes meaningful (`role="img"`);
   * when absent it is decorative and hidden from assistive tech — the right
   * default inside a row or button that already carries the name.
   */
  @property()
  label?: string;

  private _unsubscribe?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    // Follows the page's scheme, not the OS directly: an override chosen
    // elsewhere on the page — or in another tab — has to move this glyph too.
    this._unsubscribe = colorScheme.subscribe(() => this.requestUpdate());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe?.();
    this._unsubscribe = undefined;
  }

  override willUpdate() {
    // Set *before* the first render, not after: the shapes are then created
    // already carrying the right values, and a page that loads in dark mode
    // shows a moon instead of a sun animating into one.
    //
    // The CSS keys off `data-scheme` rather than the `scheme` attribute so the
    // inherited value styles exactly like an explicit one — one selector, not two.
    this.dataset.scheme = this.scheme ?? colorScheme.current;

    // Not gated on a changed `label`: the decorative default has to be applied
    // on the very first update too, when nothing has changed yet.
    if (this.label) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', this.label);
      this.removeAttribute('aria-hidden');
    } else {
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
      this.setAttribute('aria-hidden', 'true');
    }
  }

  override render() {
    return html`
      <svg
        part="base"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <mask id="crescent">
          <rect
            width="24"
            height="24"
            fill="#fff"
          />
          <circle
            class="biter"
            cx="12"
            cy="12"
            r="11"
            fill="#000"
          />
        </mask>

        <circle
          class="disc"
          cx="12"
          cy="12"
          r="9"
          mask="url(#crescent)"
        />

        <!-- \`svg\`, not \`html\`: a nested template is parsed as HTML even when it
             sits inside an <svg>, so these circles would land in the HTML
             namespace and render nothing at all. -->
        ${RAYS.map(
          (ray) => svg`
            <circle
              class="ray"
              cx=${ray.cx}
              cy=${ray.cy}
              r="1.5"
              style="--i:${ray.i}"
            />
          `,
        )}
      </svg>
    `;
  }
}
