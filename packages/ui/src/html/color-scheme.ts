/**
 * Page-level light/dark state, shared by every control that shows or changes it.
 *
 * Deliberately not an element: the scheme is one value per document, and a
 * document can hold several controls for it — a header button, a menu row, a
 * settings page. Whichever one the user touches, all of them have to agree, so
 * the state belongs to the page rather than to any of them.
 *
 * The model is the one argued in Lea Verou's *Dark mode toggles should be a
 * two-state switch* (2026): three values — an explicit `light`, an explicit
 * `dark`, or no preference at all — but only two ever shown. That falls out of
 * two rules, both implemented here:
 *
 * 1. An override is stored **only when it differs from the OS preference**.
 *    Choosing the scheme the OS already reports removes the override instead,
 *    handing control back to the system. So a user on a dark OS who switches to
 *    light and back is following the system again, not pinned to dark — and
 *    "system" stays reachable without a third button.
 * 2. The stored value is read **only when the user acts**. If the OS flips while
 *    an explicit override exists, the override survives: the user asked for it,
 *    and nothing they did says otherwise.
 *
 * SSR-safe: nothing here touches `window`, `document` or `localStorage` at
 * module scope, and listeners are attached lazily on the first subscription.
 */

export type ColorScheme = 'light' | 'dark';

/** Called whenever the effective scheme changes, from any source. */
export type ColorSchemeListener = (scheme: ColorScheme, overridden: boolean) => void;

/** Where the store writes `color-scheme`, if anywhere. */
export type ColorSchemeApply = 'root' | false;

export interface ColorSchemeConfig {
  /**
   * `localStorage` key holding the override. Set to `''` to disable persistence
   * entirely — the choice then lasts for the session only.
   */
  storageKey?: string;
  /**
   * Write `color-scheme` on `<html>` when the scheme changes. Off by default:
   * most applications already own a color-mode story, and silently rewriting
   * `documentElement` would fight it. Turn it on for a plain page.
   */
  apply?: ColorSchemeApply;
}

/*
 * Defaults live as module-level bindings, not class fields, so that
 * `luxen-ui/vite-plugin` can bake a project's `luxen.config.mjs` values in at
 * build time by rewriting these two initialisers — the same mechanism it uses
 * for `_elementPrefix` / `_cssPrefix` in `registry.ts`. `configure()` stays the
 * runtime path for anything the build cannot know.
 */
let _storageKey = 'luxen-color-scheme';
let _apply: ColorSchemeApply = false;

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** The OS-level preference. `light` when the query is unsupported. */
function osScheme(): ColorScheme {
  return globalThis.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

function readStored(key: string): ColorScheme | null {
  if (!key) return null;
  try {
    const value = localStorage.getItem(key);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    // Safari private mode, disabled storage, sandboxed iframe.
    return null;
  }
}

class ColorSchemeStore {
  /**
   * In-memory copy of the override, used when persistence is off or when the
   * browser refuses to write. Without it a blocked write would leave every
   * control unable to move at all.
   */
  #session: ColorScheme | null = null;
  #listeners = new Set<ColorSchemeListener>();
  #media: MediaQueryList | null = null;
  #last: ColorScheme | null = null;
  #lastOverridden = false;

  #onOsChange = () => this.#notify();

  #onStorageChange = (event: StorageEvent) => {
    // `key === null` means the whole store was cleared.
    if (event.key !== null && event.key !== _storageKey) return;
    // Another tab is the authority now: drop this page's session copy so a
    // release made over there is not undone by a stale local value.
    if (_storageKey) this.#session = null;
    this.#notify();
  };

  /** The scheme actually in effect: a stored override, else the OS preference. */
  get current(): ColorScheme {
    return this.#override ?? osScheme();
  }

  /** Whether an override is in place, rather than the OS preference being followed. */
  get overridden(): boolean {
    return this.#override !== null;
  }

  get #override(): ColorScheme | null {
    return readStored(_storageKey) ?? this.#session;
  }

  /**
   * Choose a scheme. Rule 1 lives here: the override is written only when it
   * disagrees with the OS, and released when it agrees.
   */
  set(next: ColorScheme): void {
    const release = next === osScheme();

    if (_storageKey) {
      try {
        if (release) localStorage.removeItem(_storageKey);
        else localStorage.setItem(_storageKey, next);
        // Storage took it, so it is the single authority — drop any session copy
        // left over from a period when it was unavailable.
        this.#session = null;
        this.#applyToRoot();
        this.#notify();
        return;
      } catch {
        // Refused — fall through to memory.
      }
    }

    this.#session = release ? null : next;
    this.#applyToRoot();
    this.#notify();
  }

  /** Flip to the other scheme. Returns the scheme now in effect. */
  toggle(): ColorScheme {
    this.set(this.current === 'dark' ? 'light' : 'dark');
    return this.current;
  }

  /**
   * Observe the effective scheme. The listener is called **immediately with the
   * current value**, then on a user change, on an OS change with no override in
   * place, and on a change made in another tab. Returns an unsubscribe function;
   * the last unsubscribe releases the listeners.
   *
   * The immediate call is deliberate. A subscriber's job is almost always to
   * mirror the scheme somewhere — an `aria-pressed`, a `checked`, a class — and
   * a change-only contract leaves that mirror wrong until the first change,
   * which is a bug nobody sees until a screen reader hits it. Callers that only
   * want transitions can ignore the first call.
   */
  subscribe(listener: ColorSchemeListener): () => void {
    this.#listeners.add(listener);
    this.#bind();
    listener(this.current, this.overridden);
    return () => {
      this.#listeners.delete(listener);
      if (this.#listeners.size === 0) this.#unbind();
    };
  }

  /** Set the storage key and whether the store writes `color-scheme` on `<html>`. */
  configure(config: ColorSchemeConfig): void {
    if (config.storageKey !== undefined) _storageKey = config.storageKey;

    if (config.apply !== undefined) {
      const wasApplying = _apply === 'root';
      _apply = config.apply;
      // Leave no trace when application is switched off.
      if (wasApplying && config.apply === false) {
        globalThis.document?.documentElement.style.removeProperty('color-scheme');
      }
    }

    this.#applyToRoot();
    this.#notify();
  }

  /**
   * With no override, writes `light dark` rather than nothing: it declares
   * support for both schemes, so the used value follows `prefers-color-scheme`
   * and "follow the system" comes from the platform instead of being simulated.
   */
  #applyToRoot(): void {
    if (_apply !== 'root') return;
    const root = globalThis.document?.documentElement;
    if (root) root.style.colorScheme = this.#override ?? 'light dark';
  }

  #notify(): void {
    const next = this.current;
    const overridden = this.overridden;
    // Both halves of the payload are compared, not just the scheme: releasing an
    // override that already agreed with the OS leaves `current` untouched while
    // `overridden` flips, and a subscriber mirroring it — a "following the
    // system" badge, a tri-state settings control — would never hear about it.
    if (next === this.#last && overridden === this.#lastOverridden) return;
    this.#last = next;
    this.#lastOverridden = overridden;
    for (const listener of this.#listeners) listener(next, overridden);
  }

  #bind(): void {
    if (this.#media) return;
    this.#media = globalThis.matchMedia?.(DARK_QUERY) ?? null;
    this.#media?.addEventListener('change', this.#onOsChange);
    globalThis.addEventListener?.('storage', this.#onStorageChange);
    this.#last = this.current;
    this.#lastOverridden = this.overridden;
    this.#applyToRoot();
  }

  #unbind(): void {
    this.#media?.removeEventListener('change', this.#onOsChange);
    this.#media = null;
    globalThis.removeEventListener?.('storage', this.#onStorageChange);
  }
}

/** The document's light/dark state. One instance per page. */
export const colorScheme = new ColorSchemeStore();
