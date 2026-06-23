import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Configuration for {@link ListboxNavController}. All accessors are read lazily,
 * so the host can back them with getters over its own reactive state.
 */
export interface ListboxNavConfig {
  /** Stable id of the `role="listbox"`; option ids derive from it. */
  listboxId: string;
  /** Number of currently navigable options. */
  getCount: () => number;
  /** Whether the option at `index` is disabled (skipped while navigating). */
  isDisabled: (index: number) => boolean;
  /** Whether the listbox is currently open. */
  isOpen: () => boolean;
  /** Open the listbox — called when a navigation key is pressed while closed. */
  open: () => void;
  /** The rendered option elements, in order, for scroll-into-view. */
  getOptionElements: () => ArrayLike<HTMLElement> | null | undefined;
}

/**
 * Owns roving `aria-activedescendant` navigation for the combobox/listbox
 * pattern: Arrow Up/Down move a virtual cursor over a `role="listbox"` while DOM
 * focus stays on the host input, skipping disabled options and scrolling the
 * active one into view. Enter/Escape/Tab stay with the host, which owns
 * commit/close semantics.
 *
 * Home/End are intentionally not handled — an editable combobox reserves them
 * for the text cursor (ARIA APG). Shared by `l-combobox` and (future) `l-select`.
 */
export class ListboxNavController implements ReactiveController {
  private host: ReactiveControllerHost;
  private config: ListboxNavConfig;

  /** Index of the active option, or `-1` when none is active. */
  activeIndex = -1;

  constructor(host: ReactiveControllerHost, config: ListboxNavConfig) {
    this.host = host;
    this.config = config;
    host.addController(this);
  }

  hostConnected() {}

  /** The DOM id for the option at `index` (matches the rendered option `id`). */
  optionId(index: number): string {
    return `${this.config.listboxId}-opt-${index}`;
  }

  /** `aria-activedescendant` value for the input, or `undefined` when none. */
  get activeDescendant(): string | undefined {
    return this.config.isOpen() && this.activeIndex >= 0
      ? this.optionId(this.activeIndex)
      : undefined;
  }

  /** Clear the active option. */
  reset() {
    if (this.activeIndex === -1) return;
    this.activeIndex = -1;
    this.host.requestUpdate();
  }

  /** Set the active option explicitly (e.g. pre-activate the current value). */
  setActive(index: number) {
    if (this.activeIndex === index) return;
    this.activeIndex = index;
    this.host.requestUpdate();
  }

  /** Move the active option by `diff`, opening the listbox first if closed. */
  move(diff: 1 | -1) {
    if (!this.config.isOpen()) {
      this.config.open();
      // Land on the first (Down) or last (Up) option — APG.
      this.activeIndex = diff > 0 ? -1 : this.config.getCount();
    }
    this._step(diff);
  }

  /**
   * Handle a keydown for listbox navigation. Returns `true` when the key was
   * consumed, so the host can early-return before its own Enter/Escape/Tab
   * handling.
   */
  onKeyDown(e: KeyboardEvent): boolean {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.move(1);
        return true;
      case 'ArrowUp':
        e.preventDefault();
        this.move(-1);
        return true;
      default:
        return false;
    }
  }

  private _step(diff: 1 | -1) {
    const n = this.config.getCount();
    if (n === 0) return;
    let i = this.activeIndex + diff;
    if (i < 0) i = n - 1;
    if (i >= n) i = 0;
    // Skip disabled options, bailing if every option is disabled.
    const start = i;
    while (this.config.isDisabled(i)) {
      i += diff;
      if (i < 0) i = n - 1;
      if (i >= n) i = 0;
      if (i === start) return;
    }
    this.activeIndex = i;
    this.host.requestUpdate();
    void this.host.updateComplete.then(() => this._scrollActiveIntoView());
  }

  private _scrollActiveIntoView() {
    const opts = this.config.getOptionElements();
    opts?.[this.activeIndex]?.scrollIntoView({ block: 'nearest' });
  }
}
