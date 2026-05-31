import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';

export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * @summary Dividers visually separate or group elements.
 *
 * @example <l-divider></l-divider>
 *
 * @cssproperty --color - The color of the divider line.
 * @cssproperty --thickness - The thickness of the divider line.
 * @cssproperty --spacing - The spacing between the divider and its neighboring elements.
 *
 * @customElement l-divider
 */
export class Divider extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** The divider's orientation. */
  @property({ reflect: true })
  orientation: DividerOrientation = 'horizontal';

  /** Optional text label displayed over the divider line. */
  @property({ reflect: true })
  label?: string;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'separator');
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('orientation')) {
      if (this.orientation === 'vertical') {
        this.setAttribute('aria-orientation', 'vertical');
      } else {
        this.removeAttribute('aria-orientation');
      }
    }
  }
}
