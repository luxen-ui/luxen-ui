import type { ReactiveController, ReactiveControllerHost } from 'lit';
import en from '../translations/en.js';

/**
 * In-house localization for the built-in UI strings the elements ship (button
 * labels, "Loading", toolbar names…). Deliberately tiny and dependency-free:
 *
 * - A `Map` registry of translations keyed by lowercased `$code`.
 * - A pure `resolveTerm()` (no DOM) so the registry/fallback logic is unit-
 *   testable in plain Node — this is also what guarantees SSR safety: importing
 *   this module, or any element, never touches `document`/`window` at module
 *   scope, and `resolveTerm` returns correct English with no DOM present.
 * - A `LocalizeController` (Lit ReactiveController) that resolves the active
 *   language from the closest `[lang]` ancestor and re-renders connected
 *   elements when `<html lang>`/`<html dir>` changes, via ONE lazily-created
 *   MutationObserver (created in `hostConnected`, which only runs in a browser).
 *
 * Consumers activate a locale with a side-effect import, e.g.
 * `import 'luxen-ui/translations/fr'`. English is always bundled as the fallback.
 *
 * Precedence: an explicit consumer-provided label (host `aria-label`, a prop)
 * always wins — elements only fall back to a localized default when nothing was
 * supplied.
 */

/** Direction of a locale's script. */
export type Direction = 'ltr' | 'rtl';

/**
 * The full term catalog. New terms added later MUST be optional (`?`) so existing
 * community locales keep working and fall back to English per-term. Plurals and
 * interpolation are plain functions per locale (no ICU/MessageFormat).
 */
export interface LuxenTranslation {
  /** BCP-47 code, e.g. `en`, `fr`, `fr-CA`. */
  $code: string;
  /** Human-readable name, e.g. `English`, `Français`. */
  $name: string;
  /** Script direction. */
  $dir: Direction;

  // Shared
  loading: string;
  close: string;

  // carousel
  previousSlide: string;
  nextSlide: string;
  toggleFullscreen: string;
  goToSlide: (n: number) => string;

  // input-group
  showPassword?: string;

  // input-stepper
  increaseValue: string;
  decreaseValue: string;

  // slider
  rangeMinimum?: string;
  rangeMaximum?: string;

  // combobox
  clear?: string;
  noResults?: string;
  selectOption?: string;
  suggestions?: string;

  // select
  search?: string;

  // tag
  remove?: string;

  // prose-editor
  richTextEditor: string;
  formatting: string;
  heading1: string;
  heading2: string;
  heading3: string;
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  highlight: string;
  bulletList: string;
  orderedList: string;
  blockquote: string;
  codeBlock: string;
  horizontalRule: string;
  link: string;
  emoji: string;
  attachFile: string;
  undo: string;
  redo: string;

  // stories-viewer
  stories: string;
  storyProgress: string;
  previousStory: string;
  nextStory: string;
  mute: string;
  unmute: string;
}

/** A localizable term key — every `LuxenTranslation` field except the metadata ones. */
export type TermKey = keyof Omit<LuxenTranslation, '$code' | '$name' | '$dir'>;

const registry = new Map<string, LuxenTranslation>();

/** Register (or replace) a locale. Idempotent; keyed by lowercased `$code`. */
export function registerTranslation(...translations: LuxenTranslation[]): void {
  for (const t of translations) registry.set(t.$code.toLowerCase(), t);
}

// English is always available as the ultimate fallback. Registered eagerly at
// module load (pure Map write — SSR-safe).
registerTranslation(en);

/** Resolve a locale: exact (`fr-ca`) → primary subtag (`fr`) → English. */
export function getTranslation(lang: string): LuxenTranslation {
  const code = lang.toLowerCase();
  return registry.get(code) ?? registry.get(code.split('-')[0]) ?? en;
}

/**
 * Pure term resolution — no DOM, safe to call in Node. Per-term fallback to
 * English when a registered locale omits an (optional) term.
 */
export function resolveTerm<K extends TermKey>(
  lang: string,
  key: K,
  ...args: LuxenTranslation[K] extends (...a: infer A) => string ? A : []
): string {
  const translation = getTranslation(lang);
  const value = (translation[key] ?? en[key]) as LuxenTranslation[K];
  // `?? ''` only triggers if English itself omits an optional term — a bug, but
  // an empty label degrades better than a runtime `undefined`.
  return typeof value === 'function'
    ? (value as (...a: unknown[]) => string)(...args)
    : (value ?? '');
}

// --- DOM controller (browser only) -----------------------------------------

type LocalizeHost = ReactiveControllerHost & HTMLElement;

const connectedHosts = new Set<LocalizeHost>();
let observer: MutationObserver | undefined;

/** Lazily start the single document-level observer (browser only, once). */
function ensureObserver(): void {
  if (observer || typeof MutationObserver === 'undefined' || !globalThis.document) return;
  observer = new MutationObserver(() => {
    for (const host of connectedHosts) host.requestUpdate();
  });
  observer.observe(globalThis.document.documentElement, {
    attributes: true,
    attributeFilter: ['lang', 'dir'],
  });
}

/**
 * Attach to a Lit element to read localized terms. Re-renders the host when the
 * document language/direction changes.
 *
 * ```ts
 * private _localize = new LocalizeController(this);
 * // …in render():
 * html`<button aria-label=${this._localize.term('nextSlide')}>…`
 * ```
 *
 * Limitation: language is resolved from the closest `[lang]` ancestor in the
 * same tree (`Element.closest`), which does not cross shadow boundaries. An
 * element nested inside another component's shadow root resolves against the
 * document, not an intermediate shadow host's `lang`.
 */
export class LocalizeController implements ReactiveController {
  private host: LocalizeHost;

  constructor(host: LocalizeHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    connectedHosts.add(this.host);
    ensureObserver();
  }

  hostDisconnected(): void {
    connectedHosts.delete(this.host);
  }

  /** The active BCP-47 language for this host (closest `[lang]` → `<html lang>` → `en`). */
  lang(): string {
    const doc = globalThis.document;
    if (!doc) return 'en'; // SSR / Node
    // `getAttribute` (not `.lang`) so no `Element`→`HTMLElement` cast is needed.
    const scoped = this.host.closest?.('[lang]')?.getAttribute('lang');
    return scoped || doc.documentElement.lang || 'en';
  }

  /** The active script direction for this host's language. */
  dir(): Direction {
    return getTranslation(this.lang()).$dir;
  }

  /** Resolve a localized term for the host's active language. */
  term<K extends TermKey>(
    key: K,
    ...args: LuxenTranslation[K] extends (...a: infer A) => string ? A : []
  ): string {
    return resolveTerm(this.lang(), key, ...args);
  }
}
