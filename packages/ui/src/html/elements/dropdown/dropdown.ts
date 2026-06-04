import { html, unsafeCSS, type PropertyValues } from 'lit';
import { LuxenElement } from '../../shared/luxen-element.js';
import { property } from 'lit/decorators.js';
import type { Placement } from '@floating-ui/dom';
import { PopoverController } from '../../shared/controllers/popover.js';
import { tagName } from '../../registry.js';
import type { DropdownItem } from '../dropdown-item/dropdown-item.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './dropdown.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * A dropdown menu anchored to a trigger element.
 *
 * @slot trigger - The element that triggers the dropdown.
 * @slot header - Optional content rendered above the menu items (e.g. a user profile row). Use an `<l-divider>` (or `<hr>`) after it to separate from items.
 * @slot - Menu content (`l-dropdown-item` elements). Drop an `<l-divider>` (or `<hr>`) between items to render a section separator, or an `<l-dropdown-label>` to caption a group of items.
 * @slot footer - Optional content rendered below the menu items (e.g. a version label or shortcut row). Use an `<l-divider>` (or `<hr>`) before it to separate from items.
 *
 * @csspart panel - The floating menu container.
 *
 * @cssproperty --background - Panel background color.
 * @cssproperty --border-radius - Panel border radius. Default `8px`.
 * @cssproperty --padding - Panel inner padding. Default `0.25rem`. Slotted `<l-divider>` elements bleed by this amount on each side to span the panel edges.
 * @cssproperty --shadow - Panel box shadow.
 * @cssproperty --show-duration - Show animation duration in ms. Default `150`.
 * @cssproperty --hide-duration - Hide animation duration in ms. Default `150`.
 *
 * @event show - Fired before the dropdown opens. Cancelable.
 * @event after-show - Fired after the open animation completes.
 * @event hide - Fired before the dropdown closes. Cancelable.
 * @event after-hide - Fired after the close animation completes.
 * @event select - Fired when an item is selected. Detail: `{ item: DropdownItem }`.
 *
 * @customElement l-dropdown
 */
export class Dropdown extends LuxenElement {
  static override styles = [hostStyles, styles];

  private _floating = new PopoverController(this, {
    getTriggerElement: () => this._triggerEl,
    getFloatingElement: () => this._panelEl,
    getArrowElement: () => null,
  });

  private _typeaheadBuffer = '';
  private _typeaheadTimeout = 0;

  /** Whether the dropdown is open. */
  @property({ type: Boolean, reflect: true })
  accessor open = false;

  /** Preferred placement of the panel. */
  @property()
  accessor placement: Placement = 'bottom-start';

  /** Distance in pixels from the trigger. */
  @property({ type: Number })
  accessor distance = 4;

  /** Disables the dropdown trigger. */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  private get _triggerEl(): HTMLElement | null {
    const slot = this.shadowRoot!.querySelector<HTMLSlotElement>('.trigger slot');
    return (slot?.assignedElements()[0] as HTMLElement) ?? null;
  }

  private get _panelEl(): HTMLElement | null {
    return this.shadowRoot!.querySelector<HTMLElement>('[popover]');
  }

  private _getItems(): DropdownItem[] {
    const menuSlot = this.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])');
    if (!menuSlot) return [];
    return (menuSlot.assignedElements() as DropdownItem[]).filter(
      (el) => el.tagName === tagName('dropdown-item').toUpperCase() && !el.disabled,
    );
  }

  private _getAllItems(): DropdownItem[] {
    const menuSlot = this.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])');
    if (!menuSlot) return [];
    return (menuSlot.assignedElements() as DropdownItem[]).filter(
      (el) => el.tagName === tagName('dropdown-item').toUpperCase(),
    );
  }

  private _getDuration(prop: '--show-duration' | '--hide-duration'): number {
    const parsed = parseFloat(getComputedStyle(this).getPropertyValue(prop));
    return Number.isNaN(parsed) ? 150 : parsed;
  }

  // --- Public API ---

  show() {
    if (this.open || this.disabled) return;
    if (this.emit('show', { cancelable: true })) this.open = true;
  }

  hide() {
    if (!this.open) return;
    if (this.emit('hide', { cancelable: true })) this.open = false;
  }

  toggle() {
    if (this.open) this.hide();
    else this.show();
  }

  // --- Lifecycle ---

  override updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      void this._handleOpenChange();
    }
  }

  // --- Open/Close ---

  private async _handleOpenChange() {
    const panel = this._panelEl;
    if (!panel) return;

    const posOpts = { placement: this.placement, distance: this.distance };

    if (this.open) {
      panel.showPopover();
      await this._floating.updatePosition(posOpts);
      if (!this.open) return;
      await this._floating.animateShow(panel, this._getDuration('--show-duration'));
      this._floating.startPositioning(posOpts);
      this._triggerEl?.setAttribute('aria-expanded', 'true');
      this.emit('after-show');
    } else {
      this._floating.stopPositioning();
      this._triggerEl?.setAttribute('aria-expanded', 'false');
      await this._floating.animateHide(panel, this._getDuration('--hide-duration'));
      if (panel.matches(':popover-open')) panel.hidePopover();
      this.emit('after-hide');
    }
  }

  // --- Focus management ---

  private _setActiveItem(item: DropdownItem) {
    const itemEl = item.shadowRoot!.querySelector<HTMLElement>('.item');
    if (!itemEl) return;

    // Reset all items
    for (const i of this._getAllItems()) {
      const el = i.shadowRoot!.querySelector<HTMLElement>('.item');
      el?.setAttribute('tabindex', '-1');
    }

    itemEl.setAttribute('tabindex', '0');
    itemEl.focus();
  }

  private _focusFirstItem() {
    const items = this._getItems();
    if (items.length) this._setActiveItem(items[0]);
  }

  private _focusLastItem() {
    const items = this._getItems();
    if (items.length) this._setActiveItem(items[items.length - 1]);
  }

  private _getCurrentItem(): DropdownItem | null {
    const items = this._getItems();
    return (
      items.find((item) => {
        const el = item.shadowRoot!.querySelector<HTMLElement>('.item');
        return el?.getAttribute('tabindex') === '0' && item.shadowRoot!.activeElement === el;
      }) ?? null
    );
  }

  private _focusNextItem() {
    const items = this._getItems();
    const current = this._getCurrentItem();
    const index = current ? items.indexOf(current) : -1;
    const next = items[(index + 1) % items.length];
    if (next) this._setActiveItem(next);
  }

  private _focusPreviousItem() {
    const items = this._getItems();
    const current = this._getCurrentItem();
    const index = current ? items.indexOf(current) : 0;
    const prev = items[(index - 1 + items.length) % items.length];
    if (prev) this._setActiveItem(prev);
  }

  // --- Typeahead ---

  private _handleTypeahead(key: string) {
    clearTimeout(this._typeaheadTimeout);
    this._typeaheadBuffer += key.toLowerCase();
    this._typeaheadTimeout = window.setTimeout(() => {
      this._typeaheadBuffer = '';
    }, 500);

    const items = this._getItems();
    const match = items.find((item) =>
      item.getTextLabel().toLowerCase().startsWith(this._typeaheadBuffer),
    );
    if (match) this._setActiveItem(match);
  }

  // --- Event handlers ---

  private _onTriggerClick = (e: MouseEvent) => {
    if (this.disabled) return;
    this.toggle();
    // Space/Enter on a native button dispatches click with detail=0; focus the
    // first item so the menu is keyboard-navigable immediately on open.
    if (this.open && e.detail === 0) {
      requestAnimationFrame(() => this._focusFirstItem());
    }
  };

  private _onTriggerKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.show();
      requestAnimationFrame(() => this._focusFirstItem());
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.show();
      requestAnimationFrame(() => this._focusLastItem());
    }
  };

  private _onPanelKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._focusNextItem();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._focusPreviousItem();
        break;
      case 'Home':
        e.preventDefault();
        this._focusFirstItem();
        break;
      case 'End':
        e.preventDefault();
        this._focusLastItem();
        break;
      case 'Escape':
        e.preventDefault();
        this.hide();
        this._triggerEl?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._selectCurrentItem();
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          this._handleTypeahead(e.key);
        }
    }
  };

  private _onItemClick = (e: Event) => {
    const item = (e.target as HTMLElement).closest<DropdownItem>(tagName('dropdown-item'));
    if (item && !item.disabled) {
      this._selectItem(item);
    }
  };

  private _selectCurrentItem() {
    const current = this._getCurrentItem();
    if (current) this._selectItem(current);
  }

  private _selectItem(item: DropdownItem) {
    if (item.type === 'checkbox') {
      item.checked = !item.checked;
    }
    this.emit('select', { detail: { item } });
    if (item.type !== 'checkbox') {
      this.hide();
      this._triggerEl?.focus();
    }
  }

  /** Sync `open` when popover="auto" light-dismiss fires. */
  private _onToggle = (e: Event) => {
    const toggleEvent = e as ToggleEvent;
    if (toggleEvent.newState === 'closed' && this.open) {
      this.open = false;
      this._triggerEl?.setAttribute('aria-expanded', 'false');
    }
  };

  override render() {
    return html`
      <div
        class="trigger"
        @click=${this._onTriggerClick}
        @keydown=${this._onTriggerKeyDown}
      >
        <slot name="trigger"></slot>
      </div>
      <div
        popover="auto"
        part="panel"
        @keydown=${this._onPanelKeyDown}
        @click=${this._onItemClick}
        @toggle=${this._onToggle}
      >
        <slot name="header"></slot>
        <div role="menu">
          <slot></slot>
        </div>
        <slot name="footer"></slot>
      </div>
    `;
  }
}
