import { html, unsafeCSS, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element';
import { tagName } from '../../registry';
import type { TreeItem } from '../tree-item/tree-item';
import hostStyles from '../../shared/styles/host.styles';
import rawStyles from './tree.css?inline';

const styles = unsafeCSS(rawStyles);

export type TreeSelection = 'single' | 'multiple' | 'leaf' | 'none';

/**
 * A hierarchical tree view composed of `<l-tree-item>` children.
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
 * @event selection-change - Fired when the selected items change. Detail: `{ selection: TreeItem[] }`.
 */
export class Tree extends LuxenElement {
  static override styles = [hostStyles, styles];

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
    this._mutationObserver = new MutationObserver(() => this._syncAll());
    this._mutationObserver.observe(this, { childList: true, subtree: true });
    this.addEventListener('l-tree-item-toggle', this._onItemToggle as EventListener);

    // Defer sync to let light DOM upgrade.
    queueMicrotask(() => this._syncAll());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._mutationObserver?.disconnect();
    this.removeEventListener('l-tree-item-toggle', this._onItemToggle as EventListener);
  }

  override updated(changed: PropertyValues<this>) {
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
    const showCheckbox = this.selection === 'multiple';
    const roots = this._rootItems();
    for (const root of roots) {
      this._syncSubtree(root, 0, showCheckbox);
    }
    this._updateBranchStates();
    // Ensure at least one item is tabbable.
    this._ensureTabStop();
  }

  private _syncSubtree(item: TreeItem, depth: number, showCheckbox: boolean) {
    item.depth = depth;
    item.showCheckbox = showCheckbox && this._canShowCheckboxOn(item);
    for (const child of item.getChildrenItems()) {
      this._syncSubtree(child, depth + 1, showCheckbox);
    }
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

  private _onItemToggle = (event: CustomEvent<{ item: TreeItem; checked: boolean }>) => {
    const { item, checked } = event.detail;
    this._selectItem(item, checked);
  };

  private _handleRowActivate(item: TreeItem) {
    if (item.disabled) return;

    switch (this.selection) {
      case 'single':
        this._setSingleSelection(item);
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
    this.emit('selection-change', { detail: { selection: this.getSelection() } });
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
        role="tree"
        aria-multiselectable=${this.selection === 'multiple' ? 'true' : 'false'}
        @click=${this._onClick}
        @keydown=${this._onKeyDown}
        @focusin=${this._onFocusIn}
      >
        <slot></slot>
      </div>
    `;
  }
}
