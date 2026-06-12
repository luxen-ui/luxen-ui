import { html, unsafeCSS, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { tagName } from '../../registry.js';
import type { TreeItem } from '../tree-item/tree-item.js';
import type { TreeItemSelectionToggleEvent } from '../tree-item/tree-item.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './tree.css?inline';

const styles = unsafeCSS(rawStyles);

export type TreeSelection = 'single' | 'multiple' | 'leaf' | 'none';

/** Fired when the tree's selected items change. */
export class SelectionChangeEvent extends Event {
  readonly selection: TreeItem[];
  constructor(selection: TreeItem[]) {
    super('selection-change', { bubbles: false, composed: false, cancelable: false });
    this.selection = selection;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    'selection-change': SelectionChangeEvent;
  }
}

/**
 * A hierarchical tree view composed of `<l-tree-item>` children.
 *
 * The host carries `role="tree"`, so give it an accessible name with
 * `aria-label` or `aria-labelledby` (e.g. `<l-tree aria-label="Files">`).
 *
 * @slot - One or more `l-tree-item` elements.
 *
 * @csspart base - The root tree container.
 *
 * @cssproperty --indent-size - Horizontal indent per depth level. Default `1rem`.
 * @cssproperty --indent-guide-width - Thickness of the vertical guide line between a parent and its children. Default `1px`. Set to `0` to hide guides.
 * @cssproperty --indent-guide-style - Line style of the guide (`solid`, `dashed`, `dotted`, `double`…). Default `solid`.
 * @cssproperty --indent-guide-color - Color of the guide line.
 * @cssproperty --row-height - Minimum row height. Default `1.75rem`.
 * @cssproperty --row-padding-inline - Inner inline padding of the row; also drives the content slot left indent and the indent guide column. Default `0.25rem`.
 * @cssproperty --chevron-size - Size of the expand/collapse chevron box. Default `1.125rem`.
 * @cssproperty --item-gap - Horizontal gap between chevron, prefix, label and suffix on the row; also drives the content slot left indent. Default `0.375rem`.
 *
 * @event selection-change - Fired when the selected items change. Properties: `selection: TreeItem[]`.
 *
 * @customElement l-tree
 */
export class Tree extends LuxenElement {
  static override styles = [hostStyles, styles];

  private _internals = this.attachInternals();
  private _mutationObserver?: MutationObserver;
  private _lastFocusedItem: TreeItem | null = null;

  /**
   * Selection behaviour:
   * - `single` (default): at most one item selected via `aria-selected`.
   * - `multiple`: any number of items selected. Checkboxes are rendered.
   * - `leaf`: only leaf items can be selected (single). Branches just toggle.
   * - `none`: purely navigable, no selection state.
   */
  @property({ reflect: true })
  accessor selection: TreeSelection = 'single';

  /**
   * When set with `selection="multiple"`, parent and children selection are decoupled:
   * toggling a parent does NOT toggle its descendants and vice versa.
   * Without it, selection cascades both ways and branches may become indeterminate.
   */
  @property({ type: Boolean, reflect: true })
  accessor independent = false;

  override connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'tree';
    // Mirror the role to a DOM attribute too. The ElementInternals role alone is
    // not `[role]`-selectable (CSS, querySelector, Cypress/Playwright CSS), which
    // silently breaks consumers migrating from libraries that expose an attribute
    // role. Respect an author-provided role if one is already set.
    if (!this.hasAttribute('role')) this.setAttribute('role', 'tree');
    this._mutationObserver = new MutationObserver(() => this._syncAll());
    this._mutationObserver.observe(this, { childList: true, subtree: true });
    this.addEventListener('selection-toggle', this._onItemToggle as EventListener);

    // Defer sync to let light DOM upgrade.
    queueMicrotask(() => this._syncAll());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._mutationObserver?.disconnect();
    this.removeEventListener('selection-toggle', this._onItemToggle as EventListener);
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('selection')) {
      // Mirror to ElementInternals (a11y tree) and a content attribute, so
      // `[aria-multiselectable]` selectors keep matching — see tree-item `_aria`.
      const multiselectable = this.selection === 'multiple' ? 'true' : 'false';
      this._internals.ariaMultiSelectable = multiselectable;
      this.setAttribute('aria-multiselectable', multiselectable);
    }
    if (changed.has('selection') || changed.has('independent')) {
      this._syncAll();
    }
  }

  // --- Public API ---

  /** Returns all items in document (flat) order, including nested ones. */
  getAllItems({ includeDisabled = true } = {}): TreeItem[] {
    const tag = tagName('tree-item');
    return Array.from(this.querySelectorAll<TreeItem>(tag)).filter(
      (item) => includeDisabled || !item.disabled,
    );
  }

  /** Returns currently selected items. */
  getSelection(): TreeItem[] {
    return this.getAllItems().filter((i) => i.selected);
  }

  /** Expands every item that has children. */
  expandAll() {
    for (const item of this.getAllItems()) {
      if (!item.isLeaf()) item.expanded = true;
    }
  }

  /** Collapses every item. */
  collapseAll() {
    for (const item of this.getAllItems()) {
      item.expanded = false;
    }
  }

  // --- Sync / ARIA / depth / checkbox visibility ---

  private _syncAll() {
    // `_syncAll()` may run from `updated()` before `<l-tree-item>` is registered
    // (e.g. when the tree module is imported before tree-item, or in async chunks).
    // Force-upgrade any pending custom elements in our subtree, then bail and retry
    // once the registration completes if any item is still un-upgraded.
    customElements.upgrade(this);
    const itemTag = tagName('tree-item');
    const roots = this._rootItems();
    if (roots.some((r) => typeof r.getChildrenItems !== 'function')) {
      void customElements.whenDefined(itemTag).then(() => this._syncAll());
      return;
    }

    const showCheckbox = this.selection === 'multiple';
    this._syncLevel(roots, 0, showCheckbox);
    this._updateBranchStates();
    // Ensure at least one item is tabbable.
    this._ensureTabStop();
  }

  /**
   * Sync depth, checkbox visibility and ARIA position for a sibling group, then
   * recurse. `aria-level`/`aria-setsize`/`aria-posinset` let screen readers
   * announce "level N, M of K" — valuable here because `lazy` items mean the
   * full set isn't always in the DOM (see WAI-ARIA Tree View pattern).
   */
  private _syncLevel(items: TreeItem[], depth: number, showCheckbox: boolean) {
    const setSize = items.length;
    items.forEach((item, index) => {
      item.depth = depth;
      item.showCheckbox = showCheckbox && this._canShowCheckboxOn(item);
      item.setPosition(depth + 1, index + 1, setSize);
      this._syncLevel(item.getChildrenItems(), depth + 1, showCheckbox);
    });
  }

  private _canShowCheckboxOn(_item: TreeItem): boolean {
    if (this.selection !== 'multiple') return false;
    // In cascade mode, branches get a checkbox too so you can bulk-toggle children.
    // In leaf-only selection, hidden here because selection !== 'multiple'.
    return true;
  }

  private _rootItems(): TreeItem[] {
    const tag = tagName('tree-item').toUpperCase();
    return (Array.from(this.children) as TreeItem[]).filter((el) => el.tagName === tag);
  }

  private _ensureTabStop() {
    const items = this._visibleItems();
    if (items.length === 0) return;
    const hasTabStop = items.some((i) => i.tabIndex === 0);
    if (!hasTabStop) {
      for (const i of items) i.tabIndex = -1;
      items[0].tabIndex = 0;
    }
  }

  /** Items currently visible (parent chain all expanded). */
  private _visibleItems(): TreeItem[] {
    const out: TreeItem[] = [];
    const walk = (items: TreeItem[]) => {
      for (const i of items) {
        out.push(i);
        if (i.expanded) walk(i.getChildrenItems());
      }
    };
    walk(this._rootItems());
    return out;
  }

  // --- Selection handling ---

  private _onItemToggle = (event: TreeItemSelectionToggleEvent) => {
    this._selectItem(event.item, event.checked);
  };

  private _handleRowActivate(item: TreeItem) {
    if (item.disabled) return;

    switch (this.selection) {
      case 'single':
        this._setSingleSelection(item);
        // Mirror the row-click behaviour: activating a branch also toggles it,
        // so keyboard users expand lazy branches (and trigger their fetch) too.
        if (!item.isLeaf()) item.toggle();
        break;
      case 'leaf':
        if (item.isLeaf()) this._setSingleSelection(item);
        else item.toggle();
        break;
      case 'multiple':
        this._selectItem(item, !item.selected);
        break;
      case 'none':
        item.toggle();
        break;
    }
  }

  private _setSingleSelection(item: TreeItem) {
    for (const i of this.getAllItems()) {
      if (i !== item && i.selected) i.selected = false;
    }
    item.selected = true;
    this._emitSelectionChange();
  }

  private _selectItem(item: TreeItem, value: boolean) {
    if (item.disabled) return;
    item.selected = value;

    if (this.selection === 'multiple' && !this.independent) {
      // Cascade DOWN: toggling a branch toggles all descendants.
      this._setSubtreeSelection(item, value);
    }

    item.indeterminate = false;
    this._updateBranchStates();
    this._emitSelectionChange();
  }

  private _setSubtreeSelection(item: TreeItem, value: boolean) {
    for (const child of item.getChildrenItems()) {
      if (child.disabled) continue;
      child.selected = value;
      child.indeterminate = false;
      this._setSubtreeSelection(child, value);
    }
  }

  /** Propagate child state UP to parents (indeterminate / auto-checked). */
  private _updateBranchStates() {
    if (this.selection !== 'multiple' || this.independent) {
      // In independent or non-multiple modes, clear any indeterminate flags.
      for (const i of this.getAllItems()) i.indeterminate = false;
      return;
    }

    const recompute = (item: TreeItem): { all: boolean; any: boolean } => {
      const children = item.getChildrenItems({ includeDisabled: false });
      if (children.length === 0) {
        return { all: item.selected, any: item.selected };
      }

      let all = true;
      let any = false;
      for (const child of children) {
        const state = recompute(child);
        if (!state.all) all = false;
        if (state.any) any = true;
      }

      item.selected = all;
      item.indeterminate = !all && any;
      return { all: all && (item.getChildrenItems().length > 0 ? all : item.selected), any };
    };

    for (const root of this._rootItems()) recompute(root);
  }

  private _emitSelectionChange() {
    this.dispatchEvent(new SelectionChangeEvent(this.getSelection()));
  }

  // --- Keyboard / focus ---

  private _onClick = (event: MouseEvent) => {
    const item = this._itemFromEvent(event);
    if (!item || item.disabled) return;

    const path = event.composedPath();
    const onCheckbox = path.some((n) => n instanceof HTMLInputElement && n.type === 'checkbox');
    if (onCheckbox) return; // handled via change event

    // Clicks on consumer-provided interactive elements (buttons, links, form
    // controls, menu items…) must not toggle the row — the consumer owns that
    // interaction. Works regardless of which slot the element was placed in.
    const INTERACTIVE_TAGS = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']);
    const INTERACTIVE_ROLES = new Set(['button', 'link', 'menuitem', 'menuitemcheckbox']);
    const onInteractive = path.some((n) => {
      if (!(n instanceof HTMLElement) || n === item) return false;
      if (n.getAttribute?.('part') === 'expand-button') return false;
      if (n instanceof HTMLInputElement && n.type === 'checkbox') return false;
      if (INTERACTIVE_TAGS.has(n.tagName)) return true;
      const role = n.getAttribute?.('role');
      return role !== null && INTERACTIVE_ROLES.has(role);
    });
    if (onInteractive) return;

    const onExpand = path.some(
      (n) => n instanceof HTMLElement && n.getAttribute?.('part') === 'expand-button',
    );

    this._focusItem(item);

    if (onExpand) {
      item.toggle();
      return;
    }

    // Row click (label area): mode-dependent behaviour.
    switch (this.selection) {
      case 'single':
        this._setSingleSelection(item);
        if (!item.isLeaf()) item.toggle();
        break;
      case 'leaf':
        if (item.isLeaf()) this._setSingleSelection(item);
        else item.toggle();
        break;
      case 'multiple':
        // The whole row acts like a <label> for the checkbox: clicking anywhere
        // on it toggles selection. Use the chevron to expand/collapse branches.
        this._selectItem(item, !item.selected);
        break;
      case 'none':
        item.toggle();
        break;
    }
  };

  private _itemFromEvent(event: Event): TreeItem | null {
    const tag = tagName('tree-item');
    const path = event.composedPath();
    for (const node of path) {
      if (node instanceof HTMLElement && node.matches?.(tag)) {
        return node as TreeItem;
      }
    }
    return null;
  }

  private _focusItem(item: TreeItem) {
    const visible = this._visibleItems();
    for (const i of visible) i.tabIndex = -1;
    item.tabIndex = 0;
    item.focus();
    this._lastFocusedItem = item;
  }

  private _onFocusIn = (event: FocusEvent) => {
    const target = event.target;
    if (target instanceof HTMLElement) {
      const item = target.closest<TreeItem>(tagName('tree-item'));
      if (item) this._lastFocusedItem = item;
    }
  };

  private _onKeyDown = (event: KeyboardEvent) => {
    const current = this._lastFocusedItem ?? this._visibleItems()[0];
    if (!current) return;

    const visible = this._visibleItems();
    const index = visible.indexOf(current);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = visible[Math.min(index + 1, visible.length - 1)];
        if (next) this._focusItem(next);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = visible[Math.max(index - 1, 0)];
        if (prev) this._focusItem(prev);
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!current.isLeaf() && !current.expanded) {
          current.expanded = true;
        } else if (current.expanded) {
          const first = current.getChildrenItems()[0];
          if (first) this._focusItem(first);
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (current.expanded && !current.isLeaf()) {
          current.expanded = false;
        } else {
          const parent = current.parentElement?.closest(tagName('tree-item')) as TreeItem | null;
          if (parent) this._focusItem(parent);
        }
        break;
      }
      case 'Home': {
        event.preventDefault();
        if (visible[0]) this._focusItem(visible[0]);
        break;
      }
      case 'End': {
        event.preventDefault();
        const last = visible[visible.length - 1];
        if (last) this._focusItem(last);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        this._handleRowActivate(current);
        break;
      }
      case '*': {
        event.preventDefault();
        // Expand all siblings of the current item.
        const siblings = (
          current.parentElement ? (Array.from(current.parentElement.children) as TreeItem[]) : []
        ).filter((el) => el.tagName === tagName('tree-item').toUpperCase());
        for (const sib of siblings) {
          if (!sib.isLeaf()) sib.expanded = true;
        }
        break;
      }
    }
  };

  override render() {
    return html`
      <div
        class="tree"
        part="base"
        @click=${this._onClick}
        @keydown=${this._onKeyDown}
        @focusin=${this._onFocusIn}
      >
        <slot></slot>
      </div>
    `;
  }
}
