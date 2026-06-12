import { html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { LuxenElement } from '../../shared/luxen-element.js';
import { property, state } from 'lit/decorators.js';
import type { Placement } from '@floating-ui/dom';
import { PopoverController } from '../../shared/controllers/popover.js';
import { tagName } from '../../registry.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './dropdown-item.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * A menu item for use inside `<l-dropdown>`.
 *
 * @slot - Label text.
 * @slot prefix - Leading content (e.g. icon).
 * @slot suffix - Trailing content.
 * @slot submenu - Nested `l-dropdown-item` elements rendered in a submenu panel anchored to this item. Drop an `<hr>` between them for a separator.
 *
 * @csspart submenu - The floating submenu panel.
 *
 * @cssproperty --color - Text color.
 *
 * @customElement l-dropdown-item
 */
export class DropdownItem extends LuxenElement {
  static override styles = [hostStyles, styles];

  private _submenuFloating = new PopoverController(this, {
    getTriggerElement: () => this,
    getFloatingElement: () => this._submenuEl,
    getArrowElement: () => null,
  });

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

  /** Whether this item's submenu is open. Managed by the parent `l-dropdown`. */
  @property({ type: Boolean, reflect: true, attribute: 'submenu-open' })
  accessor submenuOpen = false;

  @state()
  private accessor _hasSubmenu = false;

  /** Whether this item has nested `slot="submenu"` items. */
  get hasSubmenu(): boolean {
    return this._hasSubmenu;
  }

  override connectedCallback() {
    super.connectedCallback();
    // The host is a generic wrapper between the `role="menu"` panel and the
    // `role="menuitem"` row in its shadow root; `none` removes it from the
    // accessibility tree so the menu owns its menuitems directly (ARIA
    // required-owned-elements). The inner row keeps its menuitem role.
    // Guard preserves a consumer-set role.
    if (!this.hasAttribute('role')) this.setAttribute('role', 'none');
  }

  private get _submenuEl(): HTMLElement | null {
    return this.shadowRoot!.querySelector<HTMLElement>('.submenu');
  }

  /** Returns the text label of this item (excludes nested submenu items). */
  getTextLabel(): string {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    if (!slot) return (this.textContent ?? '').trim();
    return slot
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? '')
      .join('')
      .trim();
  }

  /** Returns the enabled `l-dropdown-item` elements slotted into this item's submenu. */
  getSubmenuItems(): DropdownItem[] {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="submenu"]');
    if (!slot) return [];
    return (slot.assignedElements() as DropdownItem[]).filter(
      (el) => el.tagName === tagName('dropdown-item').toUpperCase() && !el.disabled,
    );
  }

  /** Opens this item's submenu panel. No-op without submenu items. */
  openSubmenu() {
    if (!this._hasSubmenu || this.disabled || this.submenuOpen) return;
    this.submenuOpen = true;
  }

  /** Closes this item's submenu panel, including any open nested submenus. */
  closeSubmenu() {
    for (const child of this.getSubmenuItems()) child.closeSubmenu();
    if (this.submenuOpen) this.submenuOpen = false;
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('submenuOpen')) {
      void this._handleSubmenuOpenChange();
    }
  }

  private _getDuration(prop: '--show-duration' | '--hide-duration'): number {
    const parsed = parseFloat(getComputedStyle(this).getPropertyValue(prop));
    return Number.isNaN(parsed) ? 150 : parsed;
  }

  private async _handleSubmenuOpenChange() {
    const panel = this._submenuEl;
    if (!panel) return;

    const isRTL = getComputedStyle(this).direction === 'rtl';
    const posOpts = {
      placement: (isRTL ? 'left-start' : 'right-start') as Placement,
      distance: 0,
      // Pull the panel up by its own padding so its first item lines up with this item.
      skidding: -parseFloat(getComputedStyle(panel).paddingTop || '0'),
    };

    if (this.submenuOpen) {
      if (!this.isConnected) return;
      panel.showPopover();
      await this._submenuFloating.updatePosition(posOpts);
      if (!this.submenuOpen) return;
      await this._submenuFloating.animateShow(panel, this._getDuration('--show-duration'));
      this._submenuFloating.startPositioning(posOpts);
    } else {
      if (!panel.matches(':popover-open')) return;
      this._submenuFloating.stopPositioning();
      await this._submenuFloating.animateHide(panel, this._getDuration('--hide-duration'));
      if (panel.matches(':popover-open')) panel.hidePopover();
    }
  }

  private _onSubmenuSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._hasSubmenu = slot
      .assignedElements()
      .some((el) => el.tagName === tagName('dropdown-item').toUpperCase());
  };

  override render() {
    const isCheckbox = this.type === 'checkbox';

    return html`
      <div
        class="item"
        role=${isCheckbox ? 'menuitemcheckbox' : 'menuitem'}
        aria-checked=${isCheckbox ? String(this.checked) : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        aria-haspopup=${this._hasSubmenu ? 'menu' : nothing}
        aria-expanded=${this._hasSubmenu ? String(this.submenuOpen) : nothing}
        aria-controls=${this._hasSubmenu ? 'submenu' : nothing}
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
        <span
          class="label"
          id="label"
          ><slot></slot
        ></span>
        <slot name="suffix"></slot>
        ${this._hasSubmenu
          ? html`<span
              class="submenu-indicator"
              aria-hidden="true"
            ></span>`
          : nothing}
      </div>
      <div
        class="submenu"
        part="submenu"
        id="submenu"
        popover="manual"
        role="menu"
        aria-labelledby="label"
      >
        <slot
          name="submenu"
          @slotchange=${this._onSubmenuSlotChange}
        ></slot>
      </div>
    `;
  }
}
