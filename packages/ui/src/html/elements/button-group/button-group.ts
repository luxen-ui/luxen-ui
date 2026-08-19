import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

/**
 * @summary A wrapper for multiple related buttons, joined into a single unit
 * with shared borders. The joined appearance is pure CSS; this element only
 * adds the group semantics (`role="group"`, `aria-label`).
 *
 * The group never manages the selection: buttons that carry state expose it
 * themselves with `aria-pressed`, and the group holds no value. For a
 * single-choice control that owns a value and submits it with a form, use
 * `l-segmented-control` instead.
 *
 * @example
 * ```html
 * <l-button-group label="Record actions">
 *   <button class="l-button">Edit</button>
 *   <button class="l-button">Duplicate</button>
 *   <button class="l-button">Archive</button>
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
