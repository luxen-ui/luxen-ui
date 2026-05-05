import { html, nothing, unsafeCSS } from 'lit';
import { LuxenElement } from '../../shared/luxen-element';
import { property } from 'lit/decorators.js';
import hostStyles from '../../shared/styles/host.styles';
import rawStyles from './dropdown-item.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * A menu item for use inside `<l-dropdown>`.
 *
 * @slot - Label text.
 * @slot prefix - Leading content (e.g. icon).
 * @slot suffix - Trailing content.
 *
 * @cssproperty --color - Text color.
 */
export class DropdownItem extends LuxenElement {
  static override styles = [hostStyles, styles];

  /** The value associated with this item. */
  @property()
  accessor value = '';

  /** Disables the item. */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  /** The type of item: `normal` or `checkbox`. */
  @property()
  accessor type: 'normal' | 'checkbox' = 'normal';

  /** Whether the checkbox item is checked. */
  @property({ type: Boolean, reflect: true })
  accessor checked = false;

  /** Returns the text label of this item. */
  getTextLabel(): string {
    return (this.textContent ?? '').trim();
  }

  override render() {
    const isCheckbox = this.type === 'checkbox';

    return html`
      <div
        class="item"
        role=${isCheckbox ? 'menuitemcheckbox' : 'menuitem'}
        aria-checked=${isCheckbox ? String(this.checked) : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        tabindex="-1"
      >
        ${isCheckbox
          ? html`
              <span
                class="check"
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3.5 8.5L6.5 11.5L12.5 4.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            `
          : html` <slot name="prefix"></slot> `}
        <span class="label"><slot></slot></span>
        <slot name="suffix"></slot>
      </div>
    `;
  }
}
