import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

/**
 * @summary Visually joins related `.l-button` elements into a single segmented
 * control. The joined appearance is pure CSS; this element adds the group
 * semantics (`role="group"`, `aria-label`).
 *
 * @example
 * ```html
 * <l-button-group label="Alignment">
 *   <button class="l-button">Left</button>
 *   <button class="l-button">Center</button>
 *   <button class="l-button">Right</button>
 * </l-button-group>
 * ```
 *
 * @customElement l-button-group
 */
export class ButtonGroup extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** Accessible label announced for the group. Not displayed on screen. */
  @property({ reflect: true })
  label?: string;

  /**
   * Layout direction of the buttons. Visual only (drives the CSS via the
   * reflected attribute): ARIA 1.2 does not allow `aria-orientation` on
   * `role="group"`, so no ARIA attribute is set.
   */
  @property({ reflect: true })
  orientation: ButtonGroupOrientation = 'horizontal';

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'group');
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('label')) {
      if (this.label) {
        this.setAttribute('aria-label', this.label);
      } else {
        this.removeAttribute('aria-label');
      }
    }
  }
}
