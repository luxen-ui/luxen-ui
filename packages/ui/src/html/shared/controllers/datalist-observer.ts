import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * `<option>` attributes that change what the host displays.
 *
 * Deliberately not `selected`: it seeds the initial value once, in the host's
 * `connectedCallback`, and is read nowhere else — `l-combobox` does not even
 * keep it. Watching it would buy a datalist walk and a render per toggle for no
 * visible change, and imply a live binding that does not exist.
 */
const OPTION_ATTRIBUTES = ['label', 'value', 'disabled'];

/**
 * Keeps an element in sync with the light-DOM `<datalist>` it reads its options
 * from (`l-select`, `l-combobox`).
 *
 * Those elements cache the options in a `_items` array rather than re-reading
 * the DOM on every render, so the cache needs invalidating — and nothing else
 * can do it. The `<datalist>` is never slotted (it is read, not projected), so
 * there is no `slotchange` to listen for, and a consumer that re-labels an
 * option in place — a localized language picker, or any framework re-render,
 * since Vue/React/Svelte all patch the existing `<option>` nodes instead of
 * replacing them — triggers no reconnection either. Without this, the
 * always-visible surface (the closed trigger, the input) goes on showing the
 * previous label until something happens to re-read the list. The native tier
 * (`<select class="l-select">`) reflects the edit immediately; this makes the
 * custom tier match.
 *
 * Two observers, because the host is the wrong thing to watch for options: it
 * reflects its own `value` / `disabled` attributes, so watching it for
 * attributes means the element wakes its own observer on every selection. The
 * options are watched on the `<datalist>` itself; the host is watched for
 * children alone, which is what notices the list being inserted or swapped.
 *
 * ```ts
 * private _options = new DatalistObserverController(this, () => this._syncItems());
 * ```
 */
export class DatalistObserverController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private onChange: () => void;
  private hostObserver?: MutationObserver;
  private listObserver?: MutationObserver;
  private list: HTMLDataListElement | null = null;

  constructor(host: ReactiveControllerHost & HTMLElement, onChange: () => void) {
    this.host = host;
    this.onChange = onChange;
    host.addController(this);
  }

  hostConnected(): void {
    this.hostObserver ??= new MutationObserver(() => this.onHostMutation());
    // `childList` only: no `attributes`, or the host's own reflected `value` /
    // `disabled` would wake this observer on every selection.
    this.hostObserver.observe(this.host, { childList: true, subtree: true });
    this.listObserver ??= new MutationObserver(() => this.onChange());
    // No `onChange()` here — the host re-reads the list in its own
    // `connectedCallback`.
    this.observeList();
  }

  hostDisconnected(): void {
    this.hostObserver?.disconnect();
    this.listObserver?.disconnect();
  }

  /** A child was added or removed: re-attach if the `<datalist>` itself moved. */
  private onHostMutation(): void {
    if (this.host.querySelector('datalist') === this.list) return;
    this.observeList();
    this.onChange();
  }

  /** Watch the current `<datalist>`, if there is one. */
  private observeList(): void {
    this.list = this.host.querySelector('datalist');
    this.listObserver?.disconnect();
    if (!this.list) return;
    // Text nodes carry the label when no `label` attribute is set, hence
    // `characterData` + `subtree`.
    this.listObserver?.observe(this.list, {
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: OPTION_ATTRIBUTES,
    });
  }
}
