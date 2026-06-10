import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { uniqueId } from '../../registry.js';

export type TabsVariant = 'enclosed' | 'line';
export type TabsOrientation = 'horizontal' | 'vertical';

/**
 * @summary A tabs component that progressively enhances light DOM markup
 * with ARIA roles, keyboard navigation, and animated indicators.
 *
 * @example
 * ```html
 * <l-tabs variant="enclosed">
 *   <div>
 *     <button>Tab 1</button>
 *     <button>Tab 2</button>
 *   </div>
 *   <div>Content 1</div>
 *   <div>Content 2</div>
 * </l-tabs>
 * ```
 *
 * @event change - Fired when the active tab changes. Detail: `{ index: number, name: string | null }`.
 *
 * @cssproperty [--indicator-color=var(--l-color-text-primary)] - `line` variant: color of the active underline that slides under the selected tab.
 * @cssproperty [--indicator-thickness=2px] - `line` variant: thickness of the active underline.
 * @cssproperty [--track-color=var(--l-color-border)] - `line` variant: color of the static bottom border the tabs sit on.
 * @cssproperty [--track-thickness=1px] - `line` variant: thickness of the static bottom border.
 *
 * @customElement l-tabs
 */
export class Tabs extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  private _initialized = false;
  private _setupTimer = 0;
  private _instanceId = uniqueId('tabs');
  private _tablistEl: HTMLElement | null = null;
  private _tabs: HTMLButtonElement[] = [];
  private _panels: HTMLElement[] = [];

  /** Visual variant. */
  @property({ reflect: true })
  variant: TabsVariant = 'line';

  /** Index of the active tab (0-based). */
  @property({ reflect: true })
  value = '0';

  /** Stretch tabs to fill container width. */
  @property({ type: Boolean, reflect: true, attribute: 'full-width' })
  fullWidth = false;

  /** Tab orientation. */
  @property({ reflect: true })
  orientation: TabsOrientation = 'horizontal';

  // --- Lifecycle ---

  override connectedCallback() {
    super.connectedCallback();
    // Children may not be parsed yet when the element upgrades mid-parse: try
    // synchronously, then retry once on a macrotask. setTimeout, not rAF — rAF
    // is suspended in hidden documents, so the element would stay inert there.
    if (!this._trySetup()) {
      this._setupTimer = window.setTimeout(() => this._trySetup(), 0);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._setupTimer);
    this._teardown();
  }

  /** @returns true when setup ran or was already done; false to schedule a retry. */
  private _trySetup(): boolean {
    if (this._initialized || !this.isConnected) return true;
    if (this.children.length < 2) return false;
    this._setup();
    return true;
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('value') && this._tabs.length) {
      this._selectTab(Number(this.value), false);
    }
    if (changed.has('orientation') && this._tablistEl) {
      this._tablistEl.setAttribute('aria-orientation', this.orientation);
    }
  }

  // --- Setup / Teardown ---

  private _setup() {
    const children = Array.from(this.children) as HTMLElement[];
    if (children.length < 2) return;
    this._initialized = true;

    // First child is the tablist container
    this._tablistEl = children[0];
    this._tablistEl.setAttribute('role', 'tablist');
    this._tablistEl.setAttribute('aria-orientation', this.orientation);

    // Buttons inside tablist become tabs
    this._tabs = Array.from(this._tablistEl.querySelectorAll('button'));

    // Remaining children become panels
    this._panels = children.slice(1);

    const activeIndex = Number(this.value) || 0;

    // Enhance tabs
    for (let i = 0; i < this._tabs.length; i++) {
      const tab = this._tabs[i];
      const panel = this._panels[i];
      const name = tab.getAttribute('name') ?? String(i);
      const tabId = `${this._instanceId}-tab-${name}`;
      const panelId = `${this._instanceId}-panel-${name}`;

      tab.setAttribute('role', 'tab');
      tab.setAttribute('id', tabId);
      tab.setAttribute('aria-selected', String(i === activeIndex));
      tab.setAttribute('tabindex', i === activeIndex ? '0' : '-1');

      if (panel) {
        tab.setAttribute('aria-controls', panelId);
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('id', panelId);
        panel.setAttribute('aria-labelledby', tabId);
        panel.setAttribute('tabindex', '0');
        if (i !== activeIndex) {
          panel.hidden = true;
        } else {
          panel.hidden = false;
        }
      }
    }

    // Attach listeners
    this._tablistEl.addEventListener('click', this._onClick);
    this._tablistEl.addEventListener('keydown', this._onKeyDown);

    // Initial indicator position
    requestAnimationFrame(() => this._updateIndicator());
  }

  private _teardown() {
    this._tablistEl?.removeEventListener('click', this._onClick);
    this._tablistEl?.removeEventListener('keydown', this._onKeyDown);
    this._initialized = false;
  }

  // --- Tab selection ---

  private _selectTab(index: number, emitEvent = true) {
    if (index < 0 || index >= this._tabs.length) return;

    for (let i = 0; i < this._tabs.length; i++) {
      const tab = this._tabs[i];
      const panel = this._panels[i];
      const isActive = i === index;

      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');

      if (panel) {
        panel.hidden = !isActive;
      }
    }

    this.value = String(index);
    this._updateIndicator();

    if (emitEvent) {
      const name = this._tabs[index]?.getAttribute('name') ?? null;
      this.emit('change', { detail: { index, name } });
    }
  }

  // --- Indicator ---

  private _updateIndicator() {
    if (!this._tablistEl) return;
    const activeTab = this._tabs[Number(this.value)];
    if (!activeTab) return;

    const isVertical = this.orientation === 'vertical';

    if (isVertical) {
      this._tablistEl.style.setProperty('--_indicator-top', `${activeTab.offsetTop}px`);
      this._tablistEl.style.setProperty('--_indicator-height', `${activeTab.offsetHeight}px`);
    } else {
      this._tablistEl.style.setProperty('--_indicator-left', `${activeTab.offsetLeft}px`);
      this._tablistEl.style.setProperty('--_indicator-width', `${activeTab.offsetWidth}px`);
    }
  }

  // --- Event handlers ---

  private _onClick = (e: Event) => {
    const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]');
    if (!tab) return;
    const index = this._tabs.indexOf(tab);
    if (index >= 0) {
      this._selectTab(index);
      tab.focus();
    }
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') !== 'tab') return;

    const isHorizontal = this.orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    let index = this._tabs.indexOf(target as HTMLButtonElement);

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        index = (index + 1) % this._tabs.length;
        this._selectTab(index);
        this._tabs[index].focus();
        break;
      case prevKey:
        e.preventDefault();
        index = (index - 1 + this._tabs.length) % this._tabs.length;
        this._selectTab(index);
        this._tabs[index].focus();
        break;
      case 'Home':
        e.preventDefault();
        this._selectTab(0);
        this._tabs[0].focus();
        break;
      case 'End':
        e.preventDefault();
        this._selectTab(this._tabs.length - 1);
        this._tabs[this._tabs.length - 1].focus();
        break;
    }
  };
}
