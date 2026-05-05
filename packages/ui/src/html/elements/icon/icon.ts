import 'iconify-icon';
import type { PropertyValues } from 'lit';
import { html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element';
import hostStyles from '../../shared/styles/host.styles';
import rawStyles from './icon.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * @summary An icon component that renders icons from any Iconify icon set. Decorative by default. Set `label` for meaningful icons.
 * @customElement l-icon
 *
 * @cssproperty --color - The color of the icon. Defaults to `currentColor`.
 */
export class Icon extends LuxenElement {
  static override styles = [hostStyles, styles];

  /** The icon name in Iconify format (e.g. `mdi:home`, `lucide:check`). */
  @property()
  name = '';

  /** Accessible label. When set, the icon becomes meaningful (`role="img"` + `aria-label`). When absent, the icon is decorative. */
  @property()
  label?: string;

  override updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('label')) {
      if (this.label) {
        this.setAttribute('role', 'img');
        this.setAttribute('aria-label', this.label);
      } else {
        this.removeAttribute('role');
        this.removeAttribute('aria-label');
      }
    }
  }

  override render() {
    return html`
      <iconify-icon
        icon=${this.name}
        aria-hidden="true"
      ></iconify-icon>
    `;
  }
}
