import { html, unsafeCSS, type CSSResultGroup } from 'lit';
import { LuxenElement } from '../../shared/luxen-element.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './dropdown-label.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * A non-interactive section label for grouping items inside `<l-dropdown>`.
 *
 * @slot - Label text.
 *
 * @cssproperty --color - Text color. Defaults to `var(--l-color-text-tertiary)`.
 *
 * @customElement l-dropdown-label
 */
export class DropdownLabel extends LuxenElement {
  static override styles: CSSResultGroup = [hostStyles, styles];

  override connectedCallback() {
    super.connectedCallback();
    // Set the role on the host — that's the node that lands in the
    // `role="menu"` light-DOM subtree (mirrors `l-divider`'s `role="separator"`).
    // A role on the shadow-DOM `.label` <div> would not change how the host is
    // announced. `presentation` keeps the label out of menu-item navigation
    // while its text is still read as plain content.
    this.setAttribute('role', 'presentation');
  }

  override render() {
    return html`<div class="label">
      <slot></slot>
    </div>`;
  }
}
