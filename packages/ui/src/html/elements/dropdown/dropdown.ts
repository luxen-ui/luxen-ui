import { html, unsafeCSS, type PropertyValues } from 'lit';
import { LuxenElement } from '../../shared/luxen-element.js';
import { property } from 'lit/decorators.js';
import type { Placement } from '@floating-ui/dom';
import { PopoverController } from '../../shared/controllers/popover.js';
import { tagName } from '../../registry.js';
import type { DropdownItem } from '../dropdown-item/dropdown-item.js';
import { ShowEvent, AfterShowEvent, HideEvent, AfterHideEvent } from '../../events/index.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './dropdown.css?inline';

const styles = unsafeCSS(rawStyles);

/** Fired when a dropdown item is selected. Bubbles; not composed. */
export class DropdownSelectEvent extends Event {
  readonly item: DropdownItem;
  constructor(item: DropdownItem) {
    super('select', { bubbles: true, composed: false, cancelable: false });
    this.item = item;
  }
}

interface DropdownEventMap {
  select: DropdownSelectEvent;
}

/**
 * A dropdown menu anchored to a trigger element.
 *
 * @slot trigger - The element that triggers the dropdown.
 * @slot header - Optional content rendered above the menu items (e.g. a user profile row). Use an `<l-divider>` (or `<hr>`) after it to separate from items.
 * @slot - Menu content (`l-dropdown-item` elements). Drop an `<l-divider>` (or `<hr>`) between items to render a section separator, or an `<l-dropdown-label>` to caption a group of items. Nest items with `slot="submenu"` inside an item to create a submenu.
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
 * @event select - Fired when an item is selected, including items nested in submenus. Bubbles. Properties: `item: DropdownItem`.
 *
 * @customElement l-dropdown
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below; no uninitialized properties.
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

  /**
   * Floor the panel's width at the trigger's width. Set to `trigger` so the
   * panel is never narrower than the trigger; it still grows with its content.
   * Useful for select-like triggers (a date-range or filter button) where the
   * panel should line up with the control. Re-applies if the trigger resizes
   * while open.
   */
  @property({ attribute: 'min-width' })
  accessor minWidth: 'trigger' | undefined;

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

  /** Every item in the menu tree, submenu items included (light-DOM descendants). */
  private _getAllItemsDeep(): DropdownItem[] {
    return [...this.querySelectorAll<DropdownItem>(tagName('dropdown-item'))];
  }

  /** The enabled items of the menu level `item` belongs to (its siblings, itself included). */
  private _levelItemsOf(item: DropdownItem): DropdownItem[] {
    const parent = item.parentElement;
    if (parent && parent.tagName === tagName('dropdown-item').toUpperCase()) {
      return (parent as DropdownItem).getSubmenuItems();
    }
    return this._getItems();
  }

  /** The parent item whose submenu contains `item`, or null at the root level. */
  private _parentItemOf(item: DropdownItem | null): DropdownItem | null {
    const parent = item?.parentElement;
    if (parent && parent.tagName === tagName('dropdown-item').toUpperCase()) {
      return parent as DropdownItem;
    }
    return null;
  }

  /** The enabled items of the level that currently holds focus (root level as fallback). */
  private _currentLevelItems(): DropdownItem[] {
    const current = this._getCurrentItem();
    return current ? this._levelItemsOf(current) : this._getItems();
  }

  private _getDuration(prop: '--show-duration' | '--hide-duration'): number {
    const parsed = parseFloat(getComputedStyle(this).getPropertyValue(prop));
    return Number.isNaN(parsed) ? 150 : parsed;
  }

  // --- Public API ---

  show() {
    if (this.open || this.disabled) return;
    if (this.dispatchEvent(new ShowEvent())) this.open = true;
  }

  hide() {
    if (!this.open) return;
    if (this.dispatchEvent(new HideEvent())) this.open = false;
  }

  toggle() {
    if (this.open) this.hide();
    else this.show();
  }

  // --- Lifecycle ---

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._hoverTimer);
    this._hoverItem = null;
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      void this._handleOpenChange();
    }
  }

  // --- Open/Close ---

  private async _handleOpenChange() {
    const panel = this._panelEl;
    if (!panel) return;

    const posOpts = {
      placement: this.placement,
      distance: this.distance,
      minWidth: this.minWidth,
    };

    if (this.open) {
      panel.showPopover();
      await this._floating.updatePosition(posOpts);
      if (!this.open) return;
      await this._floating.animateShow(panel, this._getDuration('--show-duration'));
      this._floating.startPositioning(posOpts);
      this._triggerEl?.setAttribute('aria-expanded', 'true');
      this.dispatchEvent(new AfterShowEvent());
    } else {
      this._floating.stopPositioning();
      this._closeAllSubmenus();
      this._triggerEl?.setAttribute('aria-expanded', 'false');
      await this._floating.animateHide(panel, this._getDuration('--hide-duration'));
      if (panel.matches(':popover-open')) panel.hidePopover();
      this.dispatchEvent(new AfterHideEvent());
    }
  }

  // --- Submenus ---

  private _hoverTimer = 0;
  private _hoverItem: DropdownItem | null = null;

  private async _openSubmenu(item: DropdownItem, { focus = false } = {}) {
    // A pending hover timer may fire after the menu closed or unmounted
    if (!this.open || !this.isConnected) return;
    // Only one submenu open per level. If a sibling we're about to close holds
    // the focus (keyboard focus inside it, mouse hovers another row), the panel
    // would vanish under the focus and drop it to <body> — move focus to `item`
    // first so the roving tabindex stays coherent.
    let stealsFocus = false;
    for (const sibling of this._levelItemsOf(item)) {
      if (sibling === item) continue;
      if (sibling.contains(document.activeElement)) stealsFocus = true;
      sibling.closeSubmenu();
    }
    if (stealsFocus && !focus) this._setActiveItem(item);
    item.openSubmenu();
    if (focus) {
      await item.updateComplete;
      const first = item.getSubmenuItems()[0];
      if (first) this._setActiveItem(first);
    }
  }

  private _closeAllSubmenus() {
    clearTimeout(this._hoverTimer);
    this._hoverItem = null;
    for (const item of this._getAllItems()) item.closeSubmenu();
  }

  /**
   * The item targeted by a pointer event, via the composed path. Returns null
   * for hits inside an item's submenu panel that miss every nested item row
   * (e.g. the panel padding) — those must not read as hits on the parent item.
   */
  private _itemFromEvent(e: Event): DropdownItem | null {
    const path = e.composedPath();
    const itemTag = tagName('dropdown-item').toUpperCase();
    const item =
      path.find((n): n is DropdownItem => n instanceof Element && n.tagName === itemTag) ?? null;
    if (!item) return null;
    const row = item.shadowRoot?.querySelector('.item');
    if (row && !path.includes(row)) return null;
    return item;
  }

  // --- Focus management ---

  private _setActiveItem(item: DropdownItem) {
    const itemEl = item.shadowRoot!.querySelector<HTMLElement>('.item');
    if (!itemEl) return;

    // Reset all items, submenu items included — one roving tabindex tree-wide
    for (const i of this._getAllItemsDeep()) {
      const el = i.shadowRoot!.querySelector<HTMLElement>('.item');
      el?.setAttribute('tabindex', '-1');
    }

    itemEl.setAttribute('tabindex', '0');
    itemEl.focus();

    // APG: moving focus within a level collapses any sibling's open submenu, so
    // an unfocused parent never keeps aria-expanded="true". The active item's
    // own submenu (one level down) is untouched — `item` is not its own sibling.
    for (const sibling of this._levelItemsOf(item)) {
      if (sibling !== item) sibling.closeSubmenu();
    }
  }

  private _focusFirstItem(items = this._getItems()) {
    if (items.length) this._setActiveItem(items[0]);
  }

  private _focusLastItem(items = this._getItems()) {
    if (items.length) this._setActiveItem(items[items.length - 1]);
  }

  private _getCurrentItem(): DropdownItem | null {
    return (
      this._getAllItemsDeep().find((item) => {
        const el = item.shadowRoot!.querySelector<HTMLElement>('.item');
        return el?.getAttribute('tabindex') === '0' && item.shadowRoot!.activeElement === el;
      }) ?? null
    );
  }

  private _focusNextItem() {
    const items = this._currentLevelItems();
    const current = this._getCurrentItem();
    const index = current ? items.indexOf(current) : -1;
    const next = items[(index + 1) % items.length];
    if (next) this._setActiveItem(next);
  }

  private _focusPreviousItem() {
    const items = this._currentLevelItems();
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

    const items = this._currentLevelItems();
    const match = items.find((item) =>
      item.getTextLabel().toLowerCase().startsWith(this._typeaheadBuffer),
    );
    if (match) this._setActiveItem(match);
  }

  // --- Event handlers ---

  /**
   * Expose menu-button semantics on whatever element is slotted as the trigger,
   * and give the root `role="menu"` panel an accessible name derived from it.
   * Runs on initial assignment and on any runtime trigger swap.
   */
  private _onTriggerSlotChange = () => {
    const trigger = this._triggerEl;
    if (!trigger) return;
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', String(this.open));

    // Cross-shadow aria-labelledby to the trigger is impossible, so copy its
    // accessible name onto the menu as a plain aria-label.
    const name = trigger.getAttribute('aria-label') ?? trigger.textContent?.trim() ?? '';
    const menu = this.shadowRoot?.querySelector<HTMLElement>('[role="menu"]');
    if (menu && name) menu.setAttribute('aria-label', name);
  };

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
        this._focusFirstItem(this._currentLevelItems());
        break;
      case 'End':
        e.preventDefault();
        this._focusLastItem(this._currentLevelItems());
        break;
      case 'ArrowRight': {
        const current = this._getCurrentItem();
        if (current?.hasSubmenu) {
          e.preventDefault();
          void this._openSubmenu(current, { focus: true });
        }
        break;
      }
      case 'ArrowLeft': {
        const parentItem = this._parentItemOf(this._getCurrentItem());
        if (parentItem) {
          e.preventDefault();
          parentItem.closeSubmenu();
          this._setActiveItem(parentItem);
        }
        break;
      }
      case 'Escape': {
        // Close one level at a time: a submenu first, the menu itself at the root
        e.preventDefault();
        const parentItem = this._parentItemOf(this._getCurrentItem());
        if (parentItem) {
          parentItem.closeSubmenu();
          this._setActiveItem(parentItem);
        } else {
          this.hide();
          this._triggerEl?.focus();
        }
        break;
      }
      case 'Tab':
        // APG: Tab closes the menu (and any open submenus, via the hide path)
        // and lets focus move to the next tab-sequence element naturally — so
        // no preventDefault and no focus return to the trigger.
        this.hide();
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
    const item = this._itemFromEvent(e);
    if (!item || item.disabled) return;
    if (item.hasSubmenu) {
      // A parent item toggles its submenu instead of selecting
      if (item.submenuOpen) item.closeSubmenu();
      else void this._openSubmenu(item);
      return;
    }
    this._selectItem(item);
  };

  /** Open submenus on hover after a short intent delay; hovering a sibling closes them. */
  private _onPanelPointerOver = (e: PointerEvent) => {
    // Touch taps fire pointerover too — they must only toggle via click,
    // or the hover timer would reopen a submenu the tap just closed.
    if (e.pointerType !== 'mouse') return;
    const item = this._itemFromEvent(e);
    if (item === this._hoverItem) return;
    clearTimeout(this._hoverTimer);
    this._hoverItem = item;
    if (!item || item.disabled) return;
    this._hoverTimer = window.setTimeout(() => {
      void this._openSubmenu(item);
    }, 100);
  };

  private _onPanelPointerOut = () => {
    clearTimeout(this._hoverTimer);
    this._hoverItem = null;
  };

  private _selectCurrentItem() {
    const current = this._getCurrentItem();
    if (!current) return;
    if (current.hasSubmenu) {
      void this._openSubmenu(current, { focus: true });
    } else {
      this._selectItem(current);
    }
  }

  private _selectItem(item: DropdownItem) {
    if (item.type === 'checkbox') {
      item.checked = !item.checked;
    }
    this.dispatchEvent(new DropdownSelectEvent(item));
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
        <slot
          name="trigger"
          @slotchange=${this._onTriggerSlotChange}
        ></slot>
      </div>
      <div
        popover="auto"
        part="panel"
        @keydown=${this._onPanelKeyDown}
        @click=${this._onItemClick}
        @pointerover=${this._onPanelPointerOver}
        @pointerout=${this._onPanelPointerOut}
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

// Types `addEventListener('select', …)` as `DropdownSelectEvent` on this element
// (the global event map can't be augmented for the colliding name `select`).
// See the Tabs interface in tabs.ts for the full rationale and the gotchas.
export interface Dropdown {
  addEventListener<K extends keyof DropdownEventMap>(
    type: K,
    listener: (this: Dropdown, ev: DropdownEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof DropdownEventMap>(
    type: K,
    listener: (this: Dropdown, ev: DropdownEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
