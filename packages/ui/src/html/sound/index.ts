/**
 * Optional sound feedback for the whole page — off until the visitor turns it
 * on, and off again the moment they turn it off.
 *
 * Like `luxen-ui/color-scheme`, this is deliberately not an element: sound is
 * one setting per document, several controls may change it, and every one of
 * them has to agree.
 *
 * ## Opt-in, and only opt-in
 *
 * Nothing makes a sound until the visitor asks for it through a control the
 * application provides. There is no option to ship sound on: the only way to
 * start it is {@linkcode SoundStore.enable} (or `toggle()`, `set(true)`), called
 * from that control. The choice is stored as `on`; turning sound off removes
 * it, so storage never holds anything for a visitor who has not opted in.
 *
 * Importing the module opens no `AudioContext`. It only reads that stored
 * choice, so a visitor who opted in on an earlier visit hears sound again
 * without touching the control. The module is side-effect-free for bundlers: an
 * application that never imports it carries none of it.
 *
 * There is no reduced-motion gate either. Sound is already off until chosen, so
 * such a gate would only ever overrule a visitor who switched it on themselves
 * — often one who relies on it.
 *
 * ```js
 * import { sound } from 'luxen-ui/sound';
 *
 * // In a settings control — the click is the gesture that lets audio start:
 * soundToggle.addEventListener('click', () => sound.toggle());
 *
 * // Mirror the state anywhere it is shown:
 * sound.subscribe((enabled) => soundToggle.setAttribute('aria-pressed', String(enabled)));
 * ```
 *
 * ## What makes a sound
 *
 * Once enabled the store listens — in the capture phase, on `document` — for
 * the lifecycle events Luxen elements already emit, plus the native ones that
 * mean the same thing (`toggle` from `<details>` and popovers, `close` and
 * `cancel` from `<dialog>`). Nothing about a component changes to gain sound,
 * and the mapping is *semantic*: an `l-dialog` that hides plays `close` because
 * it hid, not because a button happened to be labelled "Close".
 *
 * That distinction is the reason this is not a port of the label-sniffing
 * approach you see elsewhere. Matching `/close|dismiss|cancel/` against a
 * button's text works exactly once — in English. Luxen ships translations.
 *
 * Every sound answers something the visitor just did — a click, a key, a tap —
 * except `notify`, which is the interface speaking on its own. A toast that
 * leaves on its own timer, or a bar revealed by scrolling, stays silent.
 *
 * Silence a subtree, or override one element, with `data-sound`. On a control,
 * it covers everything the click does, a dialog it opens included:
 *
 * ```html
 * <tbody data-sound="none">…</tbody>   <!-- a table of selectable rows -->
 * <button data-sound="error">Delete</button>
 * ```
 *
 * SSR-safe: every access to `window`, `document` or `localStorage` is guarded.
 */

import { getPrefix, tagName } from '../registry.js';
import { presets as defaultPresets, type SoundName } from './presets.js';
import { close as closeContext, play as playRecipe, type SoundRecipe, unlock } from './synth.js';

/** The default recipes, exported so a brand can retune one and keep the rest. */
export { presets } from './presets.js';
export type { SoundName } from './presets.js';
export type { SoundRecipe, SoundLayer, SoundFrequency } from './synth.js';

/** Called whenever the preference changes, from any source including another tab. */
export type SoundListener = (enabled: boolean) => void;

export interface SoundConfig {
  /**
   * `localStorage` key holding the preference. Set to `''` to disable
   * persistence — the choice then lasts for the session only.
   */
  storageKey?: string;
  /** Master volume, 0–1. A value outside is clamped. */
  volume?: number;
  /** React to component and native lifecycle events. On by default. */
  events?: boolean;
  /**
   * Also react to bare clicks on plain controls — a button or a link that is
   * not a Luxen component, which only acted. Off by default: a mouse or a key
   * already gives that click its feedback, and a sound on every one tires
   * quickly. State changes are heard either way (a checkbox's `change`, a
   * dialog's `show`), and a control with an explicit `data-sound` name always
   * plays it.
   */
  clicks?: boolean;
  /** Replace any of the seven recipes with your own. */
  presets?: Partial<Record<SoundName, SoundRecipe>>;
}

/*
 * Defaults are module-level bindings rather than class fields so that
 * `luxen-ui/vite-plugin` can bake a project's `luxen.config.mjs` values in at
 * build time by rewriting these initialisers — the same mechanism used for
 * `_storageKey` in `color-scheme.ts` and the prefixes in `registry.ts`.
 */
let _storageKey = 'luxen-sound';
let _volume = 0.7;
const DEFAULT_VOLUME = 0.7;
let _events = true;
let _clicks = false;
/** The project's own recipes only: a sound left out plays its default. */
let _presets: SoundPresets = {};

/*
 * A one-word alias, so the vite-plugin's initialiser pattern still reads the
 * annotation of `_presets` in the TypeScript source: a comma ends it.
 */
type SoundPresets = Partial<Record<SoundName, SoundRecipe>>;

function recipeFor(name: SoundName): SoundRecipe | undefined {
  return _presets[name] ?? defaultPresets[name];
}

/** The only value ever written. Off is the absence of a value. */
const STORED_ON = 'on';

/** Lifecycle events worth a sound, Luxen's own and the platform's alike. */
const WATCHED_EVENTS = [
  'show',
  'hide',
  'toggle',
  'close',
  'cancel',
  'expand',
  'collapse',
  'select',
  'confirm',
  'remove',
  'change',
] as const;

/** What a visitor does. A sound must answer one of these, recently. */
const INPUT_EVENTS = ['pointerdown', 'pointerup', 'keydown'] as const;

/**
 * How long after an input a sound still reads as its answer. Opening a dialog
 * or a listbox lands within a few milliseconds of the click; a dialog closing
 * after a slow save, or a toast timing out, has stopped being an answer.
 */
const INPUT_WINDOW_MS = 500;

/** Things a click alone should acknowledge, when no lifecycle event follows. */
const CLICKABLE = [
  'button',
  'a[href]',
  'summary',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  'input[type="button"]',
  'input[type="reset"]',
].join(',');

/** Clickables that report a state rather than an action. */
const CHECKABLE =
  '[role="switch"],[role="checkbox"],[role="radio"],[role="tab"],' +
  '[role="menuitemcheckbox"],[role="menuitemradio"],' +
  'input[type="checkbox"],input[type="radio"],[aria-pressed]';

/** Clickables that pick one of several offered values. */
const CHOOSABLE = '[role="option"],[role="menuitem"]';

/**
 * Controls whose click is followed by a lifecycle event *in a later task* —
 * `<summary>`, the invoker attributes and a dialog form's submit button all
 * queue their `toggle` rather than firing it inline. The task-scoped coalescing
 * below cannot merge across that gap, so these are left entirely to the
 * lifecycle listener: acknowledging the click too would play two sounds for one
 * interaction.
 */
const DEFERS_TO_LIFECYCLE =
  'summary,[popovertarget],[commandfor],[command],' +
  'form[method="dialog"] button:not([formmethod]),[formmethod="dialog"]';

/**
 * How long one meaning stays spoken for one element. A single dismissal of a
 * native `<dialog>` fires `toggle`, `close` and possibly `cancel` on it, each in
 * its own task — three correct readings of one act, which must not become three
 * sounds. Two different controls are two acts, however fast.
 */
const REPEAT_WINDOW_MS = 80;

/**
 * How long a preview keeps the audio hardware while sound is off: the longest
 * sound, plus the time a context may take to start.
 */
const RELEASE_AFTER_PREVIEW_MS = 1000;

/** Native controls whose `change` is a discrete landing, not a stream. */
const DISCRETE = 'input[type="checkbox"],input[type="radio"],select';

/** Native controls whose state `preventDefault()` on their click reverts. */
const REVERTED_BY_CANCEL = 'input[type="checkbox"],input[type="radio"]';

const SOUND_NAMES = new Set<string>(Object.keys(defaultPresets));

/** What an author can write in `data-sound`: a sound, or silence. */
type Authored = SoundName | 'none';

/**
 * The master volume, held between silence and full whatever was configured —
 * a `70` meant as a percentage must not play seventy times too loud. Anything
 * but a number plays at the default.
 */
function masterVolume(): number {
  const volume: unknown = _volume;
  if (typeof volume !== 'number' || Number.isNaN(volume)) return DEFAULT_VOLUME;
  return Math.min(Math.max(volume, 0), 1);
}

function isLuxen(element: Element): boolean {
  return element.localName.startsWith(`${getPrefix().element}-`);
}

/** Luxen elements whose `change` means "picked one of several", like a native `<select>`. */
function isPicker(element: Element): boolean {
  return (
    element.localName === 'select' ||
    element.localName === tagName('select') ||
    element.localName === tagName('combobox')
  );
}

/**
 * Elements whose `show`/`hide` follow the page rather than the visitor:
 * `l-sticky-bar` reveals itself when its target scrolls away — keyboard
 * scrolling included, so the input window alone cannot keep it quiet.
 */
function isAmbient(element: Element): boolean {
  return element.localName === tagName('sticky-bar');
}

/**
 * Elements that also change on their own: a toast leaves when its timer runs
 * out, a carousel advances on autoplay. Just after a click elsewhere, the input
 * window alone cannot tell that from the visitor's act, so these speak only
 * when the latest input landed inside them — or was Escape, which dismisses a
 * toast from anywhere.
 */
function isSelfDriven(event: Event, element: Element): boolean {
  return (
    (event.type === 'hide' && element.localName === tagName('toast')) ||
    (event.type === 'select' && element.localName === tagName('carousel'))
  );
}

/** The deepest element the interaction actually touched, shadow roots included. */
function deepTarget(event: Event): Element | null {
  const first = event.composedPath()[0];
  if (first instanceof Element) return first;
  return event.target instanceof Element ? event.target : null;
}

/**
 * Nearest `data-sound` along the composed path that says something: a sound
 * name or `none`. Walking the path rather than calling `closest()` is what lets
 * a `data-sound="none"` in the light DOM silence a control that lives inside a
 * component's shadow root. A value that names nothing — empty, or a typo — is
 * passed over, so it cannot undo a silenced ancestor.
 */
function authoredSound(event: Event): Authored | null {
  for (const node of event.composedPath()) {
    if (!(node instanceof Element)) continue;
    const value = node.getAttribute('data-sound');
    if (value === 'none' || (value !== null && SOUND_NAMES.has(value))) {
      return value as Authored;
    }
  }
  return null;
}

function isDisabled(element: Element): boolean {
  return element.matches(':disabled, [aria-disabled="true"]');
}

/** Map a lifecycle event onto a meaning. `null` means "not ours". */
function soundForEvent(event: Event, target: Element): SoundName | null {
  const luxen = isLuxen(target);

  switch (event.type) {
    // Toast subclasses ShowEvent, so it arrives here as a `show` — but the
    // interface spoke on its own, which is a different thing to say.
    case 'show':
      if (isAmbient(target)) return null;
      return target.localName === tagName('toast') ? 'notify' : 'open';

    case 'hide':
      return isAmbient(target) ? null : 'close';

    // Native `<details>` and the popover API. `newState` is the whole payload.
    // A Luxen host that is itself a popover (`l-toast`, `l-sticky-bar`) has
    // already said what happened with `show`/`hide`; its `toggle` is plumbing.
    case 'toggle': {
      if (luxen) return null;
      const state = (event as Event & { newState?: string }).newState;
      if (state === 'open') return 'open';
      if (state === 'closed') return 'close';
      return null;
    }

    // Native `<dialog>`: `close` on any dismissal, `cancel` on Escape.
    case 'close':
    case 'cancel':
      return 'close';

    case 'expand':
      return luxen ? 'open' : null;

    case 'collapse':
    case 'remove':
      return luxen ? 'close' : null;

    // `select` is also a native text-selection event on inputs and textareas,
    // which fires on every drag across a field. Only trust our own.
    case 'select':
    case 'confirm':
      return luxen ? 'select' : null;

    case 'change':
      if (isPicker(target)) return 'select';
      return target.matches(DISCRETE) || luxen ? 'toggle' : null;

    default:
      return null;
  }
}

/** Map a bare click onto a meaning, from role and shape only — never from text. */
function soundForClick(element: Element): SoundName {
  if (element.matches(CHECKABLE)) return 'toggle';
  if (element.matches(CHOOSABLE)) return 'select';
  if (element.matches('a[href]')) return 'open';
  return 'tap';
}

/**
 * A click on a close button fires `click` *and* `hide`. Both are correct
 * readings of one interaction, and playing both is the difference between a
 * product that feels crafted and one that feels broken. So candidates are
 * collected for the duration of the task and the most specific one wins; among
 * lifecycle events, the first — `select` comes before the `hide` it causes.
 * Above both, the sound an author named on the control that was clicked.
 */
const PRIORITY = { click: 1, lifecycle: 2, authored: 3 } as const;

interface Candidate {
  /** `none`: the author silenced this interaction, whatever else speaks in it. */
  name: Authored;
  priority: number;
  /** Held so the flush can drop a sound whose event was cancelled after us. */
  event: Event;
  /** The element that spoke, so a repeat is told apart from a second control. */
  target: Element;
}

/**
 * Whether the page cancelled what the sound would announce. A cancelled `show`
 * or `hide` never happened. A cancelled click still did what its handler did —
 * a router link navigates in place — except on a native checkbox or radio,
 * whose state `preventDefault()` reverts.
 */
function wasCancelled({ event, target }: Candidate): boolean {
  if (!event.defaultPrevented) return false;
  return event.type !== 'click' || target.matches(REVERTED_BY_CANCEL);
}

class SoundStore {
  /**
   * In-memory copy of the preference, used when persistence is off or the
   * browser refuses to write. Without it a blocked write would leave a sound
   * toggle unable to move at all.
   */
  #session = false;
  #listeners = new Set<SoundListener>();
  #pending: Candidate | null = null;
  #last: { name: SoundName; target: Element; at: number } | null = null;
  #lastInputAt = Number.NEGATIVE_INFINITY;
  /** Where the latest input landed, shadow roots included, and its key if any. */
  #lastInputPath: readonly EventTarget[] = [];
  #lastInputKey: string | null = null;
  #release: ReturnType<typeof setTimeout> | undefined;
  #bound = false;
  #storageBound = false;
  #notified: boolean | null = null;

  constructor() {
    // Restore an earlier visit's choice. Reads storage and nothing else unless
    // the visitor had opted in.
    if (typeof document !== 'undefined') {
      this.#bindStorage();
      this.#sync();
    }
  }

  /** Whether the visitor has sound on. Not whether a sound would actually play. */
  get enabled(): boolean {
    return this.#stored || this.#session;
  }

  /**
   * Why nothing is playing, if nothing is. `null` when sound is working.
   * Worth surfacing next to a toggle: a control that flips but stays silent is
   * a bug report waiting to happen.
   */
  get mutedBy(): 'preference' | 'unsupported' | null {
    if (!this.enabled) return 'preference';
    if (typeof AudioContext === 'undefined') return 'unsupported';
    return null;
  }

  get #stored(): boolean {
    // No document, no visitor: a server has no choice to read, and on Node 26
    // merely touching `localStorage` prints a warning into its logs.
    if (!_storageKey || typeof document === 'undefined') return false;
    try {
      return localStorage.getItem(_storageKey) === STORED_ON;
    } catch {
      // Safari private mode, disabled storage, sandboxed iframe.
      return false;
    }
  }

  /**
   * Turn sound on. Call it from the visitor's own gesture — a click on a sound
   * control — which is also what lets the browser start audio.
   */
  enable(): void {
    this.set(true);
  }

  /** Turn sound off, release the audio hardware and detach every listener. */
  disable(): void {
    this.set(false);
  }

  /** Flip the preference. Returns the state now in effect. */
  toggle(): boolean {
    if (this.enabled) this.disable();
    else this.enable();
    return this.enabled;
  }

  /**
   * Set the preference: `on` is stored, off removes it. Like `enable()`, call
   * it from the visitor's own gesture when it turns sound on.
   */
  set(next: boolean): void {
    this.#write(next);
    this.#sync();
    // Turned on from the visitor's control: the gesture that lets audio start.
    if (next && this.mutedBy === null) unlock();
  }

  #write(next: boolean): void {
    if (_storageKey) {
      try {
        if (next) localStorage.setItem(_storageKey, STORED_ON);
        else localStorage.removeItem(_storageKey);
        // Storage took it, so it is the single authority — drop any session
        // copy left over from a period when it was unavailable.
        this.#session = false;
        return;
      } catch {
        // Refused — fall through to memory.
      }
    }
    this.#session = next;
  }

  /**
   * Observe the preference. The listener is called **immediately** with the
   * current value, then on every change including one made in another tab.
   * Returns an unsubscribe function.
   *
   * The immediate call is deliberate, for the same reason as in `color-scheme`:
   * a subscriber's job is almost always to mirror the state into an
   * `aria-pressed` or a `checked`, and a change-only contract leaves that mirror
   * wrong until the first change — a bug nobody notices until a screen reader
   * hits it.
   */
  subscribe(listener: SoundListener): () => void {
    this.#listeners.add(listener);
    this.#bindStorage();
    listener(this.enabled);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  /**
   * Play one sound by name, regardless of what the visitor just did — for a
   * sound of the application's own. Respects the preference: nothing plays
   * while sound is off. Called from an interaction's handler, it is that
   * interaction's sound: the one the store would have chosen is dropped.
   */
  play(name: SoundName): void {
    this.#pending = null;
    if (this.mutedBy !== null) return;
    const recipe = recipeFor(name);
    if (recipe) playRecipe(recipe, masterVolume());
  }

  /**
   * Play one sound on request, **even while sound is off** — for a "listen"
   * button beside the sound control, so a visitor hears what they would opt
   * into. Changes nothing: no preference, no storage, no listeners.
   *
   * Call it from that button's click. Outside a gesture the browser keeps
   * audio locked and the sound is dropped, so it cannot make noise on its own.
   */
  preview(name: SoundName): void {
    // The preview is the answer to the click that asked for it.
    this.#pending = null;
    const recipe = recipeFor(name);
    if (!recipe || typeof AudioContext === 'undefined') return;
    unlock();
    playRecipe(recipe, masterVolume());

    // While sound is off, give the audio hardware back once the sound is over.
    // One timer for a run of previews, so a second one is never cut short.
    clearTimeout(this.#release);
    if (!this.enabled) {
      this.#release = setTimeout(() => {
        if (!this.enabled) closeContext();
      }, RELEASE_AFTER_PREVIEW_MS);
    }
  }

  /** Configure the storage key, volume, recipes and which interactions are heard. */
  configure(config: SoundConfig): void {
    if (config.storageKey !== undefined) _storageKey = config.storageKey;
    if (config.volume !== undefined) _volume = config.volume;
    if (config.events !== undefined) _events = config.events;
    if (config.clicks !== undefined) _clicks = config.clicks;
    if (config.presets) _presets = { ..._presets, ...config.presets };

    this.#bindStorage();
    // Re-attach from scratch: `events` decides which listeners exist. Detaching
    // first hides from `#sync` that sound may have just gone off — a new key the
    // visitor never opted in under — so give the audio hardware back here.
    const wasBound = this.#bound;
    this.#detach();
    this.#sync();
    if (wasBound && !this.#bound) closeContext();
  }

  /* ── Interaction listeners ─────────────────────────────────────────────── */

  /** Inputs only date the interaction; they never make a sound themselves. */
  #onInput = (event: Event) => {
    if (event.isTrusted) this.#noteInput(event);
  };

  #noteInput(event: Event): void {
    this.#lastInputAt = event.timeStamp;
    this.#lastInputPath = event.composedPath();
    this.#lastInputKey = event instanceof KeyboardEvent ? event.key : null;
    // Each of these can be the gesture a browser lets audio start in — a mouse
    // press, a touch release, a key, a bare click — and only inside it.
    unlock();
  }

  #onLifecycle = (event: Event) => {
    const target = deepTarget(event);
    if (!target || isDisabled(target)) return;
    if (
      isSelfDriven(event, target) &&
      this.#lastInputKey !== 'Escape' &&
      !this.#lastInputPath.includes(target)
    ) {
      return;
    }
    const authored = authoredSound(event);
    if (authored === 'none') return;
    const name = authored ?? soundForEvent(event, target);
    if (name) this.#request({ name, priority: PRIORITY.lifecycle, event, target });
  };

  #onClick = (event: Event) => {
    // Assistive technology activates with a bare click — no pointer, no key.
    if (event.isTrusted) this.#noteInput(event);
    const deep = deepTarget(event);
    const target = deep?.closest(CLICKABLE);
    if (!deep || !target || isDisabled(target)) return;

    // The author named the sound of this control: it answers everything the
    // click does, `clicks` off or not, including an overlay it opens or closes,
    // whose own event carries no trace of the control.
    const authored = authoredSound(event);
    if (authored !== null) {
      this.#request({ name: authored, priority: PRIORITY.authored, event, target });
      return;
    }

    if (!_clicks || deep.closest(DEFERS_TO_LIFECYCLE)) return;
    this.#request({ name: soundForClick(target), priority: PRIORITY.click, event, target });
  };

  #request(candidate: Candidate): void {
    // Already holding something at least as specific for this task.
    if (this.#pending && this.#pending.priority >= candidate.priority) return;

    const alreadyScheduled = this.#pending !== null;
    this.#pending = candidate;

    // Tasks, not a microtask: on a real click the browser drains microtasks
    // between listeners, so a microtask flush would play the click before the
    // button's own handler had opened anything. Two hops rather than one: a
    // native `<dialog>` or popover opened by that handler queues its `toggle`
    // as a task of its own, behind the first hop but ahead of the second. By
    // then a cancelable `show` has been prevented or not, and Lit has run the
    // `updated()` that dispatches it.
    if (!alreadyScheduled) setTimeout(() => setTimeout(this.#flush, 0), 0);
  }

  #flush = () => {
    const candidate = this.#pending;
    this.#pending = null;
    if (!candidate || wasCancelled(candidate)) return;

    const { name, event, target } = candidate;
    if (name === 'none') return;
    const at = event.timeStamp;

    // A trusted `change` on the control the visitor is on is input by
    // definition — it can follow the pointer by seconds, after a pick in the
    // OS's own picker. Autofill fires one too, on fields they never touched.
    const native = event.type === 'change' && event.isTrusted && target.matches(':focus');
    if (name !== 'notify' && !native && at - this.#lastInputAt > INPUT_WINDOW_MS) return;

    const last = this.#last;
    if (last && last.name === name && last.target === target && at - last.at < REPEAT_WINDOW_MS) {
      return;
    }
    this.#last = { name, target, at };

    this.play(name);
  };

  /* ── Wiring ────────────────────────────────────────────────────────────── */

  #onStorageChange = (event: StorageEvent) => {
    // `key === null` means the whole store was cleared.
    if (event.key !== null && event.key !== _storageKey) return;
    // Another tab is the authority now: drop this page's session copy so a
    // choice made over there is not undone by a stale local value.
    if (_storageKey) this.#session = false;
    this.#sync();
  };

  #bindStorage(): void {
    if (this.#storageBound) return;
    this.#storageBound = true;
    globalThis.addEventListener?.('storage', this.#onStorageChange);
  }

  /** Attach or detach the interaction listeners to match the current state. */
  #sync(): void {
    // Even with `events` and `clicks` both off: a `data-sound` name still plays.
    const wanted = this.enabled && this.mutedBy === null;

    if (wanted && !this.#bound) this.#attach();
    else if (!wanted && this.#bound) {
      this.#detach();
      // Give the audio hardware back. Holding an idle context open costs
      // battery on every platform, and a visitor who just turned sound off is
      // the last person who should pay for it.
      closeContext();
    }

    this.#notify();
  }

  #attach(): void {
    if (typeof document === 'undefined') return;
    this.#bound = true;
    // Capture, because Luxen's lifecycle events deliberately do not bubble: the
    // capture phase reaches `document` for every event regardless, which is the
    // same trick that makes delegated `focus` and `error` work.
    for (const type of INPUT_EVENTS) document.addEventListener(type, this.#onInput, true);
    // Always listened to, even with `clicks` off: a click is still the gesture
    // that dates an interaction and lets audio start, and a `data-sound` name
    // on a plain control is heard through it.
    document.addEventListener('click', this.#onClick, true);
    if (_events) {
      for (const type of WATCHED_EVENTS) document.addEventListener(type, this.#onLifecycle, true);
    }
  }

  #detach(): void {
    if (!this.#bound) return;
    this.#bound = false;
    for (const type of INPUT_EVENTS) document.removeEventListener(type, this.#onInput, true);
    document.removeEventListener('click', this.#onClick, true);
    for (const type of WATCHED_EVENTS) document.removeEventListener(type, this.#onLifecycle, true);
    this.#pending = null;
  }

  #notify(): void {
    const next = this.enabled;
    if (next === this.#notified) return;
    this.#notified = next;
    for (const listener of this.#listeners) listener(next);
  }
}

/** The document's sound preference. One instance per page. */
export const sound = new SoundStore();
