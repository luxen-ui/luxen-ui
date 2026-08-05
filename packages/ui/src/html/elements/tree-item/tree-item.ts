import { html, unsafeCSS, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { cls, tagName } from '../../registry.js';
import hostStyles from '../../shared/styles/host.styles.js';
import checkboxAppearance from '../../shared/styles/checkbox-appearance.styles.js';
import rawStyles from './tree-item.css?inline';

const styles = unsafeCSS(rawStyles);

/** Fired when a tree item is expanded. Bubbles; not composed. */
export class ExpandEvent extends Event {
  constructor() {
    super('expand', { bubbles: true, composed: false, cancelable: false });
  }
}

/** Fired when a tree item is collapsed. Bubbles; not composed. */
export class CollapseEvent extends Event {
  constructor() {
    super('collapse', { bubbles: true, composed: false, cancelable: false });
  }
}

/** Fired when a lazy item is expanded for the first time. Bubbles; not composed. */
export class LazyLoadEvent extends Event {
  constructor() {
    super('lazy-load', { bubbles: true, composed: false, cancelable: false });
  }
}

/**
 * Internal contract: a tree-item's checkbox toggle, bubbling to its `<l-tree>`.
 * Not part of the public API — consumers listen on `<l-tree>` for
 * `selection-change` instead.
 */
export class TreeItemSelectionToggleEvent extends Event {
  readonly item: TreeItem;
  readonly checked: boolean;
  constructor(item: TreeItem, checked: boolean) {
    super('selection-toggle', { bubbles: true, composed: false, cancelable: false });
    this.item = item;
    this.checked = checked;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    expand: ExpandEvent;
    collapse: CollapseEvent;
    'lazy-load': LazyLoadEvent;
  }
}

/**
 * A node inside `<l-tree>`. Nested `<l-tree-item>` children become sub-nodes.
 *
 * @slot - Label content (kept to a single row).
 * @slot prefix - Leading content before the label (e.g. icon).
 * @slot suffix - Trailing content.
 * @slot expand-icon - Icon shown when the item is collapsed.
 * @slot collapse-icon - Icon shown when the item is expanded.
 * @slot content - Block content that belongs to the item but not to its header row (e.g. comment body, action bar). Hidden when a branch is collapsed.
 *
 * @csspart base - The item row.
 * @csspart expand-button - The chevron toggle area.
 * @csspart checkbox - The native checkbox input.
 * @csspart label - The label container.
 * @csspart branch - Wrapper around the content and children slots; carries the indent guide.
 * @csspart content - The content slot wrapper (block area between the row and the children).
 * @csspart children - The nested items container.
 *
 * @cssproperty [--_depth] - Internal depth index driving indentation. Set by `<l-tree>`.
 *
 * Layout tokens (`--chevron-size`, `--row-height`, `--row-padding-inline`, `--item-gap`) live on `<l-tree>` and cascade down — see its CSS custom properties.
 *
 * @event expand - Fired when the item is expanded.
 * @event collapse - Fired when the item is collapsed.
 * @event lazy-load - Fired when a lazy item is expanded for the first time. Consumers should append children and set `lazy=false`.
 *
 * @customElement l-tree-item
 */
export class TreeItem extends LuxenElement {
  static override styles = [hostStyles, checkboxAppearance, styles];

  private _internals = this.attachInternals();
  private _childObserver?: MutationObserver;

  /** Whether the item is expanded. */
  @property({ type: Boolean, reflect: true })
  accessor expanded = false;

  /** Whether the item is selected. */
  @property({ type: Boolean, reflect: true })
  accessor selected = false;

  /** Whether the checkbox is indeterminate (some descendants selected). */
  @property({ type: Boolean, reflect: true })
  accessor indeterminate = false;

  /** Whether the item is disabled. */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  /** Marks this item as having children that will be loaded on first expand. */
  @property({ type: Boolean, reflect: true })
  accessor lazy = false;

  /** Whether the item is currently loading (shows a spinner). */
  @property({ type: Boolean, reflect: true })
  accessor loading = false;

  /** Set by `<l-tree>`: whether a checkbox is shown. */
  set showCheckbox(value: boolean) {
    this._showCheckbox = value;
    this._setState('checkbox', value);
  }
  get showCheckbox(): boolean {
    return this._showCheckbox;
  }
  private _showCheckbox = false;

  /** Set by `<l-tree>`: depth of the item in the tree (0 = root). */
  set depth(value: number) {
    this._depth = value;
    this.style.setProperty('--_depth', String(value));
  }
  get depth(): number {
    return this._depth;
  }
  private _depth = 0;

  /**
   * Set by `<l-tree>`: ARIA position within the tree. `level` is 1-based depth,
   * `posInSet`/`setSize` describe the item's rank among its siblings. These let
   * screen readers announce "level 2, 3 of 5" even when `lazy` children keep the
   * full set out of the DOM.
   */
  setPosition(level: number, posInSet: number, setSize: number) {
    this._aria('ariaLevel', 'aria-level', String(level));
    this._aria('ariaPosInSet', 'aria-posinset', String(posInSet));
    this._aria('ariaSetSize', 'aria-setsize', String(setSize));
  }

  /** Whether this item has nested tree-item children. */
  get hasChildren(): boolean {
    return this._hasChildren;
  }
  private _hasChildren = false;

  /** Returns the child `<l-tree-item>` elements directly under this one. */
  getChildrenItems({ includeDisabled = true } = {}): TreeItem[] {
    const childTag = tagName('tree-item').toUpperCase();
    return (Array.from(this.children) as TreeItem[]).filter(
      (el) => el.tagName === childTag && (includeDisabled || !el.disabled),
    );
  }

  /** Returns true if this item has no expandable children. */
  isLeaf(): boolean {
    return !this.lazy && this.getChildrenItems().length === 0;
  }

  /** Returns the text label of this item. */
  getTextLabel(): string {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    if (!slot) return (this.textContent ?? '').trim();
    return slot
      .assignedNodes({ flatten: true })
      .map((n) => n.textContent ?? '')
      .join('')
      .trim();
  }

  override connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'treeitem';
    // Mirror the role to a DOM attribute too, so `[role="treeitem"]` selectors
    // (CSS, querySelector, Cypress/Playwright CSS) keep matching — the
    // ElementInternals role alone is not attribute-selectable. ARIA states are
    // mirrored the same way in `_aria()` (aria-expanded/selected/disabled/…).
    if (!this.hasAttribute('role')) this.setAttribute('role', 'treeitem');
    this._childObserver = new MutationObserver(() => this._syncChildren());
    this._childObserver.observe(this, { childList: true });
    this._syncChildren();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._childObserver?.disconnect();
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('expanded')) {
      this._reflectExpanded();
      // Emit lazy-load for ANY transition to expanded (keyboard, chevron,
      // `expandAll()`…), not just `toggle()` — otherwise keyboard users expand a
      // lazy branch with no children and no fetch. Fires while still `lazy`; the
      // consumer appends children and clears `lazy`, so it won't re-fire.
      if (this.expanded && this.lazy) this.dispatchEvent(new LazyLoadEvent());
      this.dispatchEvent(this.expanded ? new ExpandEvent() : new CollapseEvent());
    }

    if (changed.has('selected')) {
      this._aria('ariaSelected', 'aria-selected', String(this.selected));
    }

    if (changed.has('disabled')) {
      this._aria('ariaDisabled', 'aria-disabled', this.disabled ? 'true' : null);
    }

    if (changed.has('loading')) {
      this._aria('ariaBusy', 'aria-busy', this.loading ? 'true' : null);
    }
  }

  /** Leaf items omit `aria-expanded` entirely; branches reflect their state. */
  private _reflectExpanded() {
    this._aria('ariaExpanded', 'aria-expanded', this.isLeaf() ? null : String(this.expanded));
  }

  /**
   * Write an ARIA state to BOTH ElementInternals (the semantic source, in the
   * accessibility tree) and a content attribute (so `[aria-*]` CSS / query / test
   * selectors keep matching — same belt-and-suspenders as the mirrored `role`).
   * A `null` value clears both.
   */
  private _aria(key: keyof ElementInternals, attr: string, value: string | null) {
    (this._internals as unknown as Record<string, string | null>)[key] = value;
    if (value === null) this.removeAttribute(attr);
    else this.setAttribute(attr, value);
  }

  private _setState(name: string, on: boolean) {
    if (!this._internals.states) return;
    if (on) this._internals.states.add(name);
    else this._internals.states.delete(name);
  }

  private _syncChildren() {
    // Auto-slot nested tree-items into the `children` slot so they render in the group container,
    // while label text/elements remain in the default slot.
    const childTag = tagName('tree-item').toUpperCase();
    let count = 0;
    for (const child of Array.from(this.children) as HTMLElement[]) {
      if (child.tagName === childTag) {
        count++;
        if (child.slot !== 'children') child.slot = 'children';
      }
    }
    this._hasChildren = count > 0;
    this._setState('has-children', this._hasChildren);
    if (!this._hasChildren && !this.lazy && this.expanded) {
      this.expanded = false;
    }
    this._reflectExpanded();
  }

  /** Toggle expand state. Opening a `lazy` item emits `lazy-load` (via `updated`). */
  toggle() {
    if (this.isLeaf() && !this.lazy) return;
    // lazy-load is emitted centrally from `updated()` on the expand transition.
    this.expanded = !this.expanded;
  }

  private _onCheckboxChange = (event: Event) => {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    this.dispatchEvent(new TreeItemSelectionToggleEvent(this, input.checked));
  };

  override render() {
    return html`
      <div
        class="item"
        part="base"
      >
        <span
          class="expand"
          part="expand-button"
          aria-hidden="true"
        >
          ${this.loading
            ? html`<span
                class="spinner"
                role="status"
              ></span>`
            : this.expanded || this.isLeaf()
              ? html`<slot name="collapse-icon">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3.5 6l4.5 5 4.5-5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </slot>`
              : html`<slot name="expand-icon">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M6 3.5l5 4.5-5 4.5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </slot>`}
        </span>

        <input
          class="checkbox ${cls('checkbox')}"
          part="checkbox"
          type="checkbox"
          tabindex="-1"
          aria-hidden="true"
          .checked=${this.selected}
          .indeterminate=${this.indeterminate}
          ?disabled=${this.disabled}
          @click=${(e: Event) => e.stopPropagation()}
          @change=${this._onCheckboxChange}
        />

        <slot name="prefix"></slot>
        <span
          class="label"
          part="label"
          ><slot></slot
        ></span>
        <slot name="suffix"></slot>
      </div>

      <div
        class="branch"
        part="branch"
      >
        <div
          class="content"
          part="content"
        >
          <slot name="content"></slot>
        </div>
        <div
          class="children"
          part="children"
          role="group"
        >
          <slot name="children"></slot>
        </div>
      </div>
    `;
  }
}
