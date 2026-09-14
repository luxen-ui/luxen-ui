import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { uniqueId } from '../../registry.js';

export type TabsVariant = 'enclosed' | 'line';
export type TabsOrientation = 'horizontal' | 'vertical';

/** Fired when the active tab changes. Bubbles; not composed. */
export class TabsChangeEvent extends Event {
  readonly index: number;
  readonly name: string | null;
  constructor(index: number, name: string | null) {
    super('change', { bubbles: true, composed: false, cancelable: false });
    this.index = index;
    this.name = name;
  }
}

interface TabsEventMap {
  change: TabsChangeEvent;
}

/**
 * Elements that take a tab stop of their own. `tabindex="-1"` is deliberately
 * absent: it makes an element programmatically focusable but leaves it out of
 * the tab sequence, and the tab sequence is what the APG rule below is about.
 *
 * A selector is the wrong shape for this question and the platform offers
 * nothing better yet. `el.tabIndex >= 0` looks like the answer and is not: it
 * reports 0 for `<a>` without `href`, `<input type="hidden">` and `<video>`
 * without `controls`, none of which take focus, and -1 for `[contenteditable]`,
 * which does. `:focusable` / `:tabbable` would settle it, but they are not in
 * Selectors Level 4 and no engine ships them (checked against Chrome 152) —
 * when they land, this whole list collapses to `:tabbable` and `takesTabStop`
 * becomes one `matches` call. Probing with `focus()` is the only exact answer
 * available today, and it is unusable here: this runs inside a MutationObserver
 * callback, where moving focus would be destructive.
 *
 * Two clauses are narrower than their element name suggests:
 * - `input[type="hidden"]` renders nothing and takes no focus, yet is a routine
 *   first child of a form panel (a CSRF field).
 * - Only the first `summary` child of a `details` is the disclosure control; a
 *   `summary` anywhere else is inert content.
 */
const TAB_STOP_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'details > summary:first-of-type',
  'audio[controls]',
  'video[controls]',
  // Focus enters an iframe's content, so it is a tab stop rather than the
  // opaque box it looks like.
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex^="-"])',
].join(',');

/**
 * Content that is not focusable and not text — the walk has to stop on these
 * rather than skip ahead, or a panel opening with an illustration would be read
 * as opening with whatever link happens to follow it.
 */
const OPAQUE_CONTENT_SELECTOR = 'img, picture, svg, canvas, video, object, embed, hr';

/**
 * Markup that is never rendered. Only consulted for a panel that is itself
 * off-screen, where real visibility cannot be measured — see `panelIsRendered`.
 */
const NOT_RENDERED_SELECTOR = '[hidden], template, script, style';

/**
 * Is this element actually rendered right now?
 *
 * Asking the platform rather than pattern-matching markup is what keeps
 * `display: none` content — a Tailwind `hidden` class, a framework's collapsed
 * block, a hidden input — from being mistaken for the panel's first content.
 * The option was renamed mid-standardisation and unknown keys are ignored, so
 * both spellings are passed; `getClientRects` covers engines without the method.
 */
function isRendered(el: Element): boolean {
  const check = (el as Element & { checkVisibility?: (options?: object) => boolean })
    .checkVisibility;
  if (typeof check === 'function') {
    return check.call(el, { checkVisibilityCSS: true, visibilityProperty: true });
  }
  return el.getClientRects().length > 0;
}

function takesTabStop(el: Element): boolean {
  if (el.matches(TAB_STOP_SELECTOR) && !el.matches(':disabled')) return true;
  // A custom element keeps its control inside a shadow root, out of reach of a
  // light-DOM selector — `l-select` and `l-slider` both put their tab stop on a
  // shadow node.
  return Boolean(el.shadowRoot?.querySelector(TAB_STOP_SELECTOR));
}

interface FirstContentVerdict {
  /** Whether the panel's first content already offers a tab stop. */
  takesTabStop: boolean;
  /**
   * Tag name of a custom element met before reaching a verdict whose shadow
   * root was not attached yet, so the verdict has to be retaken once it is.
   */
  pendingTag: string | null;
}

/**
 * Does the first thing a reader meets in this panel take a tab stop of its own?
 *
 * The APG asks for `tabindex="0"` on a tabpanel "when the tabpanel does not
 * contain any focusable elements **or the first element with content is not
 * focusable**". One walk answers both clauses: stop at the first content and ask
 * whether it is focusable; a panel holding nothing focusable runs off the end
 * and returns false, which is the first clause.
 *
 * The walk descends through wrappers on purpose. The APG's own manual-activation
 * example is `<p><a href>…`, where the link is the first content even though the
 * `<p>` is visited first — and that example's panels carry no `tabindex`.
 *
 * `measured` says whether real visibility can be trusted. It cannot for a panel
 * that is itself hidden — every descendant would report invisible — so that case
 * falls back to the markup heuristic and is remeasured when the panel is shown.
 */
function firstContentTakesTabStop(panel: Element, measured: boolean): FirstContentVerdict {
  const skipSubtree = (el: Element) =>
    measured ? !isRendered(el) : el.matches(NOT_RENDERED_SELECTOR);

  const walker = document.createTreeWalker(panel, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.nodeType === Node.ELEMENT_NODE && skipSubtree(node as Element)
        ? // REJECT, not SKIP: a TreeWalker drops the whole subtree, so text
          // inside an unrendered block never reads as prose.
          NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });

  let pendingTag: string | null = null;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Whitespace between tags is not content. Real text is — and is not focusable.
      if (node.nodeValue?.trim()) return { takesTabStop: false, pendingTag };
      continue;
    }
    const el = node as Element;
    if (takesTabStop(el)) return { takesTabStop: true, pendingTag: null };
    // Inert content is visible content that cannot be focused, so it settles the
    // question: this panel needs a stop of its own. (Unlike an unrendered block,
    // which is genuinely absent and is skipped above.)
    if (el.matches('[inert]')) return { takesTabStop: false, pendingTag };
    if (el.matches(OPAQUE_CONTENT_SELECTOR)) return { takesTabStop: false, pendingTag };
    // An un-upgraded custom element cannot be judged yet: its control may be
    // about to appear in a shadow root. Keep walking — it may be a light-DOM
    // element whose children answer the question — but remember to come back.
    if (!pendingTag && el.tagName.includes('-') && !el.shadowRoot) {
      pendingTag = el.tagName.toLowerCase();
    }
  }
  return { takesTabStop: false, pendingTag };
}

/**
 * @summary A tabs component that progressively enhances light DOM markup
 * with ARIA roles, keyboard navigation, and animated indicators.
 *
 * @example
 * Mark the initially-active tab with `aria-selected="true"` so it is styled as
 * selected before the script upgrades the element (progressive enhancement).
 * ```html
 * <l-tabs variant="enclosed">
 *   <div>
 *     <button aria-selected="true">Tab 1</button>
 *     <button>Tab 2</button>
 *   </div>
 *   <div>Content 1</div>
 *   <div>Content 2</div>
 * </l-tabs>
 * ```
 *
 * @example
 * A tab button marked `disabled` (or `aria-disabled="true"`) is skipped by
 * arrow keys, `Home` and `End`, and cannot be selected by a click or by
 * `value` — it still owns its panel, so the tab/panel order is unchanged.
 * ```html
 * <button disabled>Billing</button>
 * ```
 *
 * @event change - Fired when the active tab changes. Bubbles. Not cancelable. Properties: `index: number`, `name: string | null`.
 *
 * @cssproperty [--indicator-color=var(--l-color-text-primary)] - `line` variant: color of the active underline that slides under the selected tab.
 * @cssproperty [--indicator-thickness=2px] - `line` variant: thickness of the active underline.
 * @cssproperty [--track-color=var(--l-color-border)] - `line` variant: color of the static bottom border the tabs sit on.
 * @cssproperty [--track-thickness=1px] - `line` variant: thickness of the static bottom border.
 * @cssproperty [--hover-color=var(--l-color-bg-state-hover)] - `line` variant: fill of the pill that appears behind a hovered tab label.
 * @cssproperty [--hover-inset=4px] - `line` variant: block-axis gap between the hover pill and the tab edges, keeping it detached from the bottom border.
 *
 * @customElement l-tabs
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below; no uninitialized properties.
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
  private _resizeObserver: ResizeObserver | null = null;
  private _mutationObserver: MutationObserver | null = null;
  /** Custom-element tags already scheduled for a re-check once they upgrade. */
  private _pendingTags = new Set<string>();
  /**
   * Whether this element owns a panel's `tabindex`, decided the first time the
   * panel is seen and never revisited: a panel that already carried one belongs
   * to the consumer. Re-deciding on every setup would misread our own attribute
   * after a detach/reattach and freeze the panel out of the sync.
   */
  private _ownsPanelTabindex = new WeakMap<Element, boolean>();

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
      const requested = Number(this.value);
      if (this._isSelectable(requested)) {
        this._selectTab(requested, false);
      } else {
        // The target is disabled or out of range, so the selection stays put —
        // and `value` must not keep claiming a tab that was never selected.
        // Reverting here would schedule an update from within an update, so
        // defer it (same reason as a vetoed dialog `show`).
        const current = this._activeIndex();
        queueMicrotask(() => {
          this.value = String(current);
        });
      }
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

    // Remaining children become panels. Disabled buttons stay in `_tabs` so the
    // tab↔panel pairing keeps following DOM order — they are filtered out at
    // navigation time, not here.
    this._panels = children.slice(1);

    const activeIndex = this._resolveActiveIndex();

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
        if (!this._ownsPanelTabindex.has(panel)) {
          this._ownsPanelTabindex.set(panel, !panel.hasAttribute('tabindex'));
        }
        if (i !== activeIndex) {
          panel.hidden = true;
        } else {
          panel.hidden = false;
        }
      }
    }

    // `value` may have pointed at a disabled tab: canonicalize it to the tab
    // that is actually selected.
    if (Number(this.value) !== activeIndex) this.value = String(activeIndex);

    // Attach listeners
    this._tablistEl.addEventListener('click', this._onClick);
    this._tablistEl.addEventListener('keydown', this._onKeyDown);

    // Initial indicator position. Synchronous first (offset reads force
    // layout), then a ResizeObserver keeps it correct across hidden→visible
    // transitions and size changes — rAF is suspended in hidden documents,
    // so it must not be the only scheduling mechanism here.
    this._updateIndicator();
    this._resizeObserver = new ResizeObserver(() => this._updateIndicator());
    this._resizeObserver.observe(this._tablistEl);

    // Panels are routinely filled after mount — a framework rendering into them
    // once its data lands — and whether a panel belongs in the tab sequence
    // depends on what arrives. So the decision is re-run on content changes
    // rather than frozen at setup. `childList` does not report attribute
    // mutations, so writing `tabindex` back cannot feed this.
    //
    // Two scopes, deliberately: our own child list (panels added or removed,
    // which needs the whole pairing rebuilt) and each panel's subtree (content
    // changes, which only need the stops retaken). The tablist is left out —
    // relabelling a tab cannot change any panel's verdict.
    this._syncPanelTabStops();
    this._mutationObserver = new MutationObserver((records) => this._onMutation(records));
    this._mutationObserver.observe(this, { childList: true });
    for (const panel of this._panels) {
      this._mutationObserver.observe(panel, { childList: true, subtree: true });
    }
  }

  private _onMutation(records: MutationRecord[]) {
    // Lit renders into this element's light DOM (`createRenderRoot` returns
    // `this`), so its marker comments land in our child list too — compare the
    // element children we wired instead of trusting the record's target.
    if (records.some((r) => r.target === this) && this._structureChanged()) {
      this._rewire();
      return;
    }
    this._syncPanelTabStops();
  }

  /** Have panels been added, removed or reordered since setup? */
  private _structureChanged(): boolean {
    const children = Array.from(this.children);
    if (children.length !== this._panels.length + 1) return true;
    if (children[0] !== this._tablistEl) return true;
    return this._panels.some((panel, i) => children[i + 1] !== panel);
  }

  /**
   * Rebuild the tab↔panel pairing after a structural change: a panel added
   * later has no role, no id and no stop until it is wired.
   */
  private _rewire() {
    // Too few children to pair up — keep the observer alive so the element
    // recovers when they arrive, rather than tearing down into an inert state.
    if (this.children.length < 2) return;
    this._teardown();
    this._setup();
  }

  /**
   * A panel joins the tab sequence unless its first content already takes a tab
   * stop of its own — then `Tab` out of the tablist reaches that control
   * directly, instead of stopping on the panel box first. Per the APG Tabs
   * pattern; `firstContentTakesTabStop` carries the reasoning.
   */
  private _syncPanelTabStops() {
    for (const panel of this._panels) {
      if (!this._ownsPanelTabindex.get(panel)) continue;

      const verdict = firstContentTakesTabStop(panel, isRendered(panel));
      if (verdict.pendingTag) this._recheckOnUpgrade(verdict.pendingTag);

      const wanted = verdict.takesTabStop ? null : '0';
      // Only write on a real change: an unconditional `setAttribute` would queue
      // a mutation record for every consumer observing this panel's attributes,
      // on every batch of DOM changes inside it.
      if (panel.getAttribute('tabindex') === wanted) continue;

      if (wanted === null) {
        // Taking `tabindex` off the focused panel blurs it and drops the user at
        // the top of the document. Keep the stop and retake the decision once
        // focus has moved on (WCAG 2.4.3).
        if (document.activeElement === panel) {
          panel.addEventListener('focusout', this._onPanelFocusOut, { once: true });
          continue;
        }
        panel.removeAttribute('tabindex');
      } else {
        panel.setAttribute('tabindex', wanted);
      }
    }
  }

  private _onPanelFocusOut = () => this._syncPanelTabStops();

  /**
   * A custom element rendering into its shadow root produces no light-DOM
   * mutation, so nothing would otherwise retake a verdict that was blocked on
   * it. Wait for the definition, then a task for the first render (Lit schedules
   * its initial update on a microtask).
   */
  private _recheckOnUpgrade(tag: string) {
    if (this._pendingTags.has(tag)) return;
    this._pendingTags.add(tag);
    void customElements.whenDefined(tag).then(() => {
      setTimeout(() => {
        this._pendingTags.delete(tag);
        if (this._initialized) this._syncPanelTabStops();
      }, 0);
    });
  }

  private _teardown() {
    this._tablistEl?.removeEventListener('click', this._onClick);
    this._tablistEl?.removeEventListener('keydown', this._onKeyDown);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._mutationObserver?.disconnect();
    this._mutationObserver = null;
    for (const panel of this._panels) {
      panel.removeEventListener('focusout', this._onPanelFocusOut);
    }
    this._initialized = false;
  }

  // --- Tab selection ---

  private _selectTab(index: number, emitEvent = true) {
    // A disabled tab is never selectable: it cannot take focus, so selecting it
    // would move the roving tabindex entry point onto an unfocusable button and
    // drop the whole tablist out of the tab sequence (WCAG 2.1.1).
    if (!this._isSelectable(index)) return;

    // Whether this is an actual change — re-selecting the current tab must not
    // re-fire `change` (the event is documented as firing when the active tab
    // changes, and this matches native `change` on radios / `<select>`).
    const changed = this._tabs[index].getAttribute('aria-selected') !== 'true';

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
    // The panel just shown can be measured for real now; the one just hidden
    // keeps whatever it had, which is moot while `hidden` holds it out of the
    // tab sequence anyway.
    this._syncPanelTabStops();

    if (emitEvent && changed) {
      const name = this._tabs[index]?.getAttribute('name') ?? null;
      this.dispatchEvent(new TabsChangeEvent(index, name));
    }
  }

  // --- Disabled tabs ---

  /**
   * Both spellings count, and they behave identically here. `aria-disabled`
   * leaves the button focusable in principle, but a roving tabindex hands
   * `tabindex="0"` to the selected tab only — so a tab that can never be
   * selected is never in the tab sequence either, and the arrow keys skip it
   * like a native one. It is the escape hatch for consumers who cannot set the
   * native attribute (a framework binding, a non-`button` element), not a
   * "reachable but inert" variant.
   */
  private _isDisabled(tab: HTMLButtonElement): boolean {
    return tab.disabled || tab.getAttribute('aria-disabled') === 'true';
  }

  private _isSelectable(index: number): boolean {
    return (
      Number.isInteger(index) &&
      index >= 0 &&
      index < this._tabs.length &&
      !this._isDisabled(this._tabs[index])
    );
  }

  /** Index of the currently selected tab, read back from the DOM. */
  private _activeIndex(): number {
    const i = this._tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    return i >= 0 ? i : 0;
  }

  /** Resolve the initial selection from `value`, falling back to the first enabled tab. */
  private _resolveActiveIndex(): number {
    const requested = Number(this.value) || 0;
    if (this._isSelectable(requested)) return requested;
    const firstEnabled = this._tabs.findIndex((t) => !this._isDisabled(t));
    // Every tab disabled: nothing is focusable anyway, so index 0 is as good as
    // any and the tablist is simply unreachable — which is what was asked for.
    return firstEnabled >= 0 ? firstEnabled : 0;
  }

  /** Index of the next enabled tab from `from`, moving by `dir`, wrapping. */
  private _nextEnabled(from: number, dir: 1 | -1): number {
    const len = this._tabs.length;
    for (let step = 1; step <= len; step++) {
      const i = (from + dir * step + len * step) % len;
      if (!this._isDisabled(this._tabs[i])) return i;
    }
    return from;
  }

  /** Index of the first (`dir` 1) or last (`dir` -1) enabled tab. */
  private _edgeEnabled(dir: 1 | -1): number {
    const len = this._tabs.length;
    const start = dir === 1 ? 0 : len - 1;
    for (let i = start; i >= 0 && i < len; i += dir) {
      if (!this._isDisabled(this._tabs[i])) return i;
    }
    return start;
  }

  // --- Indicator ---

  private _updateIndicator() {
    if (!this._tablistEl) return;
    const activeTab = this._tabs[this._activeIndex()];
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
    // A native `disabled` button dispatches no click at all, but an
    // `aria-disabled` one does — `_selectTab` refuses it, and focus must not
    // follow either.
    if (index < 0 || this._isDisabled(tab)) return;
    this._selectTab(index);
    tab.focus();
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') !== 'tab') return;

    const isHorizontal = this.orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    const current = this._tabs.indexOf(target as HTMLButtonElement);
    if (current < 0) return;

    // Every move lands on an enabled tab: selection follows focus here
    // (automatic activation), so a disabled target would split the two apart.
    let index: number;
    switch (e.key) {
      case nextKey:
        index = this._nextEnabled(current, 1);
        break;
      case prevKey:
        index = this._nextEnabled(current, -1);
        break;
      case 'Home':
        index = this._edgeEnabled(1);
        break;
      case 'End':
        index = this._edgeEnabled(-1);
        break;
      default:
        return;
    }

    e.preventDefault();
    // Only reachable when every tab is disabled — then there is nowhere to go
    // and focus must not be dragged onto a disabled tab.
    if (!this._isSelectable(index)) return;
    this._selectTab(index);
    this._tabs[index].focus();
  };
}

// Type `addEventListener('change', …)` on this element so the listener receives
// a `TabsChangeEvent` (with `.index`/`.name`) instead of a bare `Event`, with no
// cast. This is the canonical reference for the pattern used across the library.
//
// Why a same-named interface and not a global augmentation: `change` already
// exists in lib.dom's `GlobalEventHandlersEventMap` (typed `Event`), and TS
// forbids re-declaring an existing key with a different type — so colliding
// names (`change`, `select`, `input`, `toggle`) can't be typed globally. Merging
// a same-named `interface Tabs` into the `class Tabs` adds these overloads to
// the element's own type only. (Non-colliding names like `show`/`story-change`
// ARE augmented globally in their event-class module — no per-element block.)
//
// In `(type: K, listener: (ev: TabsEventMap[K]) => void)`, K is pinned to the
// string literal you pass, and `TabsEventMap[K]` indexes the event type from it
// (`'change'` → `TabsChangeEvent`). `this: Tabs` is a fake parameter that types
// `this` inside a non-arrow listener; it emits no runtime code.
//
// Three load-bearing details:
//   1. The `(type: string, …)` fallback overloads are REQUIRED: declaring our
//      own `addEventListener` hides ALL inherited `HTMLElement` overloads, so
//      without them `addEventListener('click', …)` would stop compiling. The
//      typed overload comes first so `'change'` resolves before the fallback.
//   2. This interface sits AFTER the class: the CEM analyzer dedups on the first
//      declaration of the name, so an interface before the class would shadow it
//      and the manifest would extract nothing for this element.
//   3. The merge is flagged by `no-unsafe-declaration-merging` (disabled on the
//      class above) — safe here because we merge only method overloads, never
//      uninitialized properties.
export interface Tabs {
  addEventListener<K extends keyof TabsEventMap>(
    type: K,
    listener: (this: Tabs, ev: TabsEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof TabsEventMap>(
    type: K,
    listener: (this: Tabs, ev: TabsEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
