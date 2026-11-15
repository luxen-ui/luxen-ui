import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/alert/index.js';
import '../../src/html/elements/carousel/index.js';
import '../../src/html/elements/carousel-item/index.js';
import '../../src/html/elements/combobox/index.js';
import '../../src/html/elements/dialog/index.js';
import '../../src/html/elements/drawer/index.js';
import '../../src/html/elements/dropdown/index.js';
import '../../src/html/elements/dropdown-item/index.js';
import '../../src/html/elements/rating/index.js';
import '../../src/html/elements/segmented-control/index.js';
import '../../src/html/elements/select/index.js';
import '../../src/html/elements/slider/index.js';
import '../../src/html/elements/sticky-bar/index.js';
import '../../src/html/elements/tabs/index.js';
import '../../src/html/elements/tag/index.js';
import '../../src/html/elements/toast/index.js';
import '../../src/html/elements/tooltip/index.js';
import '../../src/html/elements/tree/index.js';
import '../../src/html/elements/tree-item/index.js';
import type { Carousel } from '../../src/html/elements/carousel/carousel.js';
import type { Dialog } from '../../src/html/elements/dialog/dialog.js';
import type { Drawer } from '../../src/html/elements/drawer/drawer.js';
import type { Toast } from '../../src/html/elements/toast/toast.js';
import { presets, sound, type SoundConfig, type SoundName } from '../../src/html/sound/index.js';
import { close as releaseAudio } from '../../src/html/sound/synth.js';
import { waitForEvent } from './support/events.js';
import { userEvent } from './support/user-event.js';
import { waitUntil } from './support/timing.js';

// Sound is heard, not seen, so these tests listen at the one place every sound
// passes through — the store's public `play()` — and assert what a person would
// have heard after each real interaction: which sound, and how many. Every
// interaction is a trusted `userEvent`: the coalescing of a click with the
// lifecycle event it causes only shows its flaws under a real click, where the
// browser drains microtasks between listeners.

const STORAGE_KEY = 'luxen-sound';
const ALL_SOUNDS = Object.keys(presets) as SoundName[];
const realMatchMedia = globalThis.matchMedia.bind(globalThis);
const RealAudioContext = globalThis.AudioContext;

let host: HTMLElement | undefined;
let played: SoundName[] = [];

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
  played = [];
  vi.spyOn(sound, 'play').mockImplementation((name: SoundName) => {
    played.push(name);
  });
});

afterEach(() => {
  sound.disable();
  // Back to the shipped defaults, for suites that change the configuration.
  sound.configure({ storageKey: STORAGE_KEY, volume: 0.7, events: true, clicks: false });
  // A module copy cannot be unloaded, and it keeps listening to `storage`
  // events: without a key, no later test can turn it back on.
  for (const store of freshStores.splice(0)) {
    store.disable();
    store.configure({ storageKey: '' });
  }
  // A preview made while sound is off holds its context for a moment; start
  // every test from none, so a fake context never leaks into the next.
  releaseAudio();
  vi.restoreAllMocks();
  globalThis.matchMedia = realMatchMedia;
  globalThis.AudioContext = RealAudioContext;
  host?.remove();
  host = undefined;
  localStorage.removeItem(STORAGE_KEY);
});

const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  const tags = new Set([...host.querySelectorAll('*')].map((el) => el.localName));
  await Promise.all(
    [...tags].filter((tag) => tag.includes('-')).map((tag) => customElements.whenDefined(tag)),
  );
  await settle();
  played = [];
  return host;
}

/**
 * Waits out every Lit update in the fixture, then three macrotasks: the store
 * decides two tasks after the interaction, so that a native `<details>` or
 * `<dialog>`, which queues its `toggle` and `close` a task later, is heard.
 */
async function settle() {
  const elements = [...(host?.querySelectorAll('*') ?? [])].filter(
    (el): el is Element & { updateComplete: Promise<unknown> } => 'updateComplete' in el,
  );
  await Promise.all(elements.map((el) => el.updateComplete));
  await nextTask();
  await nextTask();
  await nextTask();
}

/** What the visitor heard since the last call, once every pending sound has had its turn. */
async function heard(): Promise<SoundName[]> {
  await settle();
  const sounds = played;
  played = [];
  return sounds;
}

const $ = <T extends Element = HTMLElement>(selector: string) => host!.querySelector<T>(selector)!;

/**
 * A control that sounds under the shipped defaults: a checkbox reports a state
 * change, so it toggles even while plain clicks are off.
 */
const CHECKBOX = `<label><input type="checkbox"> Remember me</label>`;
const rememberMe = () => page.getByRole('checkbox', { name: 'Remember me' });

let loads = 0;
const freshStores: (typeof sound)[] = [];

/**
 * A fresh copy of the module, which is what a page load gives: the shipped
 * defaults, untouched by the `configure()` calls of earlier tests. Silenced
 * for good after each test.
 */
async function freshStore() {
  const url = new URL(`../../src/html/sound/index.ts?load=${++loads}`, import.meta.url).href;
  const module = (await import(
    /* @vite-ignore */ url
  )) as typeof import('../../src/html/sound/index.js');
  const sounds: SoundName[] = [];
  vi.spyOn(module.sound, 'play').mockImplementation((name: SoundName) => {
    sounds.push(name);
  });
  freshStores.push(module.sound);
  return { store: module.sound, sounds };
}

function givenReducedMotion() {
  globalThis.matchMedia = (query: string) =>
    query.includes('prefers-reduced-motion')
      ? ({
          matches: true,
          media: query,
          addEventListener() {},
          removeEventListener() {},
        } as unknown as MediaQueryList)
      : realMatchMedia(query);
}

// ---------------------------------------------------------------------------
// Opting in and out
// ---------------------------------------------------------------------------

describe('A visitor who never turned sound on', () => {
  it('hears nothing, and nothing is stored about them', async () => {
    await mount(CHECKBOX);

    await userEvent.click(rememberMe());

    expect(await heard()).toEqual([]);
    expect(sound.enabled).toBe(false);
    expect(sound.mutedBy).toBe('preference');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('cannot have sound switched on for them by the page', async () => {
    await mount(CHECKBOX);
    // A plain-JS consumer gets past the type, so the guarantee has to hold at runtime.
    sound.configure({ default: true } as unknown as SoundConfig);

    try {
      expect(sound.enabled).toBe(false);
      await userEvent.click(rememberMe());
      expect(await heard()).toEqual([]);
    } finally {
      sound.configure({ default: false } as unknown as SoundConfig);
    }
  });
});

describe('A visitor turning sound on and off', () => {
  it('stores the choice as "on" and starts hearing interactions', async () => {
    await mount(CHECKBOX);
    sound.enable();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('on');
    expect(sound.mutedBy).toBeNull();
    await userEvent.click(rememberMe());
    expect(await heard()).toEqual(['toggle']);
  });

  it('removes the choice rather than storing "off", and goes silent at once', async () => {
    await mount(CHECKBOX);
    sound.enable();
    sound.disable();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(sound.mutedBy).toBe('preference');
    await userEvent.click(rememberMe());
    expect(await heard()).toEqual([]);
  });

  it('lets audio start from the gesture, whichever method turns sound on', () => {
    globalThis.AudioContext = LockedAudioContext as unknown as typeof AudioContext;
    LockedAudioContext.last = null;

    sound.set(true);
    const context = LockedAudioContext.last as LockedAudioContext | null;

    expect(context?.resumes).toBeGreaterThan(0);
  });

  it('hands a new subscriber the current state, then each change', () => {
    const seen: boolean[] = [];
    const stop = sound.subscribe((enabled) => seen.push(enabled));
    sound.toggle();
    sound.toggle();
    stop();
    sound.toggle();

    expect(seen).toEqual([false, true, false]);
  });

  it('keeps hearing sound, despite asking the system for reduced motion', async () => {
    // Sound is already off until chosen, so a reduced-motion gate would only
    // ever overrule a visitor who switched it on themselves.
    givenReducedMotion();
    await mount(CHECKBOX);
    sound.enable();

    expect(sound.mutedBy).toBeNull();
    await userEvent.click(rememberMe());
    expect(await heard()).toEqual(['toggle']);
  });

  it('keeps the choice for the session when the browser refuses storage', async () => {
    await mount(CHECKBOX);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota', 'QuotaExceededError');
    });

    sound.enable();
    expect(sound.enabled).toBe(true);
    await userEvent.click(rememberMe());
    expect(await heard()).toEqual(['toggle']);

    sound.disable();
    expect(sound.enabled).toBe(false);
  });
});

describe('A visitor who turned sound on during an earlier visit', () => {
  it('hears it again on the next page load, without touching the control', async () => {
    localStorage.setItem(STORAGE_KEY, 'on');
    const reloaded = await freshStore();

    await mount(CHECKBOX);
    await userEvent.click(rememberMe());
    await settle();

    expect(reloaded.sounds).toEqual(['toggle']);
  });

  it('follows a change made in another tab', async () => {
    await mount(CHECKBOX);
    const seen: boolean[] = [];
    const stop = sound.subscribe((enabled) => seen.push(enabled));

    localStorage.setItem(STORAGE_KEY, 'on');
    globalThis.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: 'on' }));
    stop();

    expect(seen).toEqual([false, true]);
    await userEvent.click(rememberMe());
    expect(await heard()).toEqual(['toggle']);
  });
});

// ---------------------------------------------------------------------------
// What each interaction sounds like
// ---------------------------------------------------------------------------

describe('Plain clicks, left silent by default', () => {
  it('ships that way: a button or a link only acted, a checkbox changed state', async () => {
    const loaded = await freshStore();
    await mount(`<button>Save</button> <a href="#sound-test">Docs</a> ${CHECKBOX}`);
    loaded.store.enable();

    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    await userEvent.click(page.getByRole('link', { name: 'Docs' }));
    await userEvent.click(rememberMe());
    await settle();

    expect(loaded.sounds).toEqual(['toggle']);
  });
});

describe('With plain clicks on, controls speak their role, never their label', () => {
  beforeEach(() => {
    sound.configure({ clicks: true });
    sound.enable();
  });

  it('taps for a button and opens for a link', async () => {
    await mount(`<button>Save</button> <a href="#sound-test">Docs</a>`);

    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    expect(await heard()).toEqual(['tap']);
    await userEvent.click(page.getByRole('link', { name: 'Docs' }));
    expect(await heard()).toEqual(['open']);
  });

  it('opens for a link the page routes itself, though it cancels the click', async () => {
    await mount(`<a href="#sound-test">Docs</a>`);
    // What every client-side router does to navigate in place.
    $('a').addEventListener('click', (event) => event.preventDefault());

    await userEvent.click(page.getByRole('link', { name: 'Docs' }));

    expect(await heard()).toEqual(['open']);
  });

  it('stays silent for a checkbox whose click the page cancels, as nothing changed', async () => {
    await mount(CHECKBOX);
    $('input').addEventListener('click', (event) => event.preventDefault());

    await userEvent.click(rememberMe());

    expect(await heard()).toEqual([]);
  });

  it('plays only the preview when a Preview button is pressed', async () => {
    globalThis.AudioContext = RunningAudioContext as unknown as typeof AudioContext;
    await mount(`<button>Preview</button>`);
    $('button').addEventListener('click', () => sound.preview('notify'));

    await userEvent.click(page.getByRole('button', { name: 'Preview' }));

    expect(await heard()).toEqual([]);
  });

  it('plays only the sound the application plays itself from a click', async () => {
    globalThis.AudioContext = RunningAudioContext as unknown as typeof AudioContext;
    // The real `play()` has to run: it is what tells the store that the
    // application answered this click itself.
    vi.spyOn(sound, 'play').mockRestore();
    const play = vi.spyOn(sound, 'play');
    await mount(`<button>Delete</button>`);
    $('button').addEventListener('click', () => sound.play('error'));

    await userEvent.click(page.getByRole('button', { name: 'Delete' }));
    await settle();

    expect(play.mock.calls).toEqual([['error']]);
  });

  it('toggles once for a checkbox, though it fires both click and change', async () => {
    await mount(CHECKBOX);

    await userEvent.click(rememberMe());

    expect(await heard()).toEqual(['toggle']);
  });

  it('selects for an option', async () => {
    await mount(
      `<div role="listbox" aria-label="Size"><div role="option" tabindex="0">Small</div></div>`,
    );

    await userEvent.click(page.getByRole('option', { name: 'Small' }));

    expect(await heard()).toEqual(['select']);
  });

  it('sounds for each of two controls clicked in quick succession', async () => {
    await mount(`<button>Bold</button><button>Italic</button>`);

    await userEvent.click(page.getByRole('button', { name: 'Bold' }));
    await userEvent.click(page.getByRole('button', { name: 'Italic' }));

    expect(await heard()).toEqual(['tap', 'tap']);
  });

  it('stays silent on a control marked disabled', async () => {
    await mount(`<button aria-disabled="true">Save</button>`);

    // `force`: a person can click it; only the test runner refuses to.
    await userEvent.click(page.getByRole('button', { name: 'Save' }), { force: true });

    expect(await heard()).toEqual([]);
  });

  it('ignores the text selection that also fires `select` on a field', async () => {
    await mount(`<label>Name <input value="Jane Cooper"></label>`);

    await userEvent.click(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.keyboard('{Shift>}{Home}{/Shift}');

    expect(await heard()).toEqual([]);
  });
});

describe('An author steering sound with data-sound', () => {
  beforeEach(() => sound.enable());

  it('gives a sound to a plain control that would otherwise stay silent', async () => {
    await mount(`<button>Save</button> <button data-sound="error">Delete</button>`);

    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    await userEvent.click(page.getByRole('button', { name: 'Delete' }));

    expect(await heard()).toEqual(['error']);
  });

  it('replaces the sound a control would have made', async () => {
    await mount(`<label><input type="checkbox" data-sound="tap"> Compact rows</label>`);

    await userEvent.click(page.getByRole('checkbox', { name: 'Compact rows' }));

    expect(await heard()).toEqual(['tap']);
  });

  it('still plays a named sound when the application hears no interactions', async () => {
    // `events` and `clicks` both off: only sounds the author named remain.
    sound.configure({ events: false });
    await mount(`${CHECKBOX} <button data-sound="error">Delete</button>`);

    await userEvent.click(rememberMe());
    await userEvent.click(page.getByRole('button', { name: 'Delete' }));

    expect(await heard()).toEqual(['error']);
  });

  it.each([false, true])(
    'speaks for everything a control does, an overlay it opens included (plain clicks %s)',
    async (clicks: boolean) => {
      sound.configure({ clicks });
      await mount(`
        <button data-sound="error">Delete</button>
        <l-dialog title="Delete file?" style="--show-duration: 0ms; --hide-duration: 0ms"></l-dialog>
      `);
      const dialog = $<Dialog>('l-dialog');
      $('button').addEventListener('click', () => (dialog.open = true));

      const shown = waitForEvent(dialog, 'after-show');
      await userEvent.click(page.getByRole('button', { name: 'Delete' }));
      await shown;

      expect(await heard()).toEqual(['error']);
    },
  );

  it('silences what a summary or an invoker opens, when set on it', async () => {
    await mount(`
      <details><summary data-sound="none">Shipping</summary><p>Two days.</p></details>
      <button commandfor="sound-quiet" command="--show" data-sound="none">Settings</button>
      <l-dialog id="sound-quiet" title="Settings" style="--show-duration: 0ms"></l-dialog>
    `);

    const toggled = waitForEvent($('details'), 'toggle');
    await userEvent.click(page.getByText('Shipping'));
    await toggled;
    expect(await heard()).toEqual([]);

    const shown = waitForEvent($('l-dialog'), 'after-show');
    await userEvent.click(page.getByRole('button', { name: 'Settings' }));
    await shown;
    expect(await heard()).toEqual([]);
  });

  it('skips a value that names no sound, so a silenced ancestor still wins', async () => {
    await mount(
      `<div data-sound="none"><label><input type="checkbox" data-sound="eror"> Archived</label></div>`,
    );

    await userEvent.click(page.getByRole('checkbox', { name: 'Archived' }));

    expect(await heard()).toEqual([]);
  });

  it('silences a whole subtree, components included', async () => {
    await mount(`<div data-sound="none">${CHECKBOX}<l-tag removable>Design</l-tag></div>`);

    await userEvent.click(rememberMe());
    await userEvent.click(page.getByRole('button', { name: 'Remove' }));

    expect(await heard()).toEqual([]);
  });
});

describe('A visitor listening before turning sound on', () => {
  beforeEach(() => {
    LockedAudioContext.last = null;
  });

  it('hears the sound, and nothing about their choice changes', async () => {
    globalThis.AudioContext = RunningAudioContext as unknown as typeof AudioContext;
    await mount(`<button>Listen</button>`);
    $('button').addEventListener('click', () => sound.preview('notify'));

    await userEvent.click(page.getByRole('button', { name: 'Listen' }));
    await nextTask();

    expect(LockedAudioContext.last?.sources).toBeGreaterThan(0);
    expect(sound.enabled).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('stays silent on the next click', async () => {
    globalThis.AudioContext = RunningAudioContext as unknown as typeof AudioContext;
    await mount(`<button>Listen</button> ${CHECKBOX}`);
    $('button').addEventListener('click', () => sound.preview('notify'));

    await userEvent.click(page.getByRole('button', { name: 'Listen' }));
    await userEvent.click(rememberMe());

    expect(await heard()).toEqual([]);
  });

  it('plays nothing when asked outside a gesture, even later', async () => {
    globalThis.AudioContext = LockedAudioContext as unknown as typeof AudioContext;

    sound.preview('notify');
    // Time passing is the point here: the visitor clicks much later.
    await new Promise((resolve) => setTimeout(resolve, 400));
    LockedAudioContext.last!.unlock();
    await nextTask();

    expect(LockedAudioContext.last!.sources).toBe(0);
  });
});

// With plain clicks on, the click and the lifecycle event it causes are two
// candidates for one interaction; by default only the event speaks. Both must
// come out as exactly one sound.
describe.each([
  { clicks: false, setting: 'by default' },
  { clicks: true, setting: 'with plain clicks on' },
])('One interaction makes one sound, $setting', ({ clicks }: { clicks: boolean }) => {
  beforeEach(() => {
    sound.configure({ clicks });
    sound.enable();
  });

  const DIALOG = `
    <button id="open">Open settings</button>
    <l-dialog title="Settings" style="--show-duration: 0ms; --hide-duration: 0ms">
      <button id="close">Done</button>
    </l-dialog>
  `;

  function wire(opener: string, closer: string, overlay: Dialog | Drawer) {
    $(opener).addEventListener('click', () => (overlay.open = true));
    $(closer).addEventListener('click', () => (overlay.open = false));
  }

  it('opens, and only opens, when a button opens an l-dialog', async () => {
    await mount(DIALOG);
    const dialog = $<Dialog>('l-dialog');
    wire('#open', '#close', dialog);

    const shown = waitForEvent(dialog, 'after-show');
    await userEvent.click(page.getByRole('button', { name: 'Open settings' }));
    await shown;

    expect(await heard()).toEqual(['open']);
  });

  it('closes, and only closes, when a button closes an l-dialog', async () => {
    await mount(DIALOG);
    const dialog = $<Dialog>('l-dialog');
    wire('#open', '#close', dialog);
    const shown = waitForEvent(dialog, 'after-show');
    await userEvent.click(page.getByRole('button', { name: 'Open settings' }));
    await shown;
    await heard();

    const hidden = waitForEvent(dialog, 'after-hide');
    await userEvent.click(page.getByRole('button', { name: 'Done' }));
    await hidden;

    expect(await heard()).toEqual(['close']);
  });

  it('closes once when Escape dismisses an l-dialog', async () => {
    await mount(DIALOG);
    const dialog = $<Dialog>('l-dialog');
    wire('#open', '#close', dialog);
    const shown = waitForEvent(dialog, 'after-show');
    await userEvent.click(page.getByRole('button', { name: 'Open settings' }));
    await shown;
    await heard();

    const hidden = waitForEvent(dialog, 'after-hide');
    await userEvent.keyboard('{Escape}');
    await hidden;

    expect(await heard()).toEqual(['close']);
  });

  it('plays nothing when the page vetoes the opening', async () => {
    await mount(DIALOG);
    const dialog = $<Dialog>('l-dialog');
    wire('#open', '#close', dialog);
    dialog.addEventListener('show', (event) => event.preventDefault());

    await userEvent.click(page.getByRole('button', { name: 'Open settings' }));

    expect(await heard()).toEqual([]);
    expect(dialog.open).toBe(false);
  });

  it('opens and closes an l-drawer the same way', async () => {
    await mount(`
      <button id="open">Menu</button>
      <l-drawer title="Navigation" style="--show-duration: 0ms; --hide-duration: 0ms">
        <button id="close">Done</button>
      </l-drawer>
    `);
    const drawer = $<Drawer>('l-drawer');
    wire('#open', '#close', drawer);

    const shown = waitForEvent(drawer, 'after-show');
    await userEvent.click(page.getByRole('button', { name: 'Menu' }));
    await shown;
    expect(await heard()).toEqual(['open']);

    const hidden = waitForEvent(drawer, 'after-hide');
    await userEvent.click(page.getByRole('button', { name: 'Done' }));
    await hidden;
    expect(await heard()).toEqual(['close']);
  });

  it('opens and closes a native <dialog> opened from script', async () => {
    await mount(`
      <button id="open">Open native</button>
      <dialog aria-label="Native"><form method="dialog"><button>Close native</button></form></dialog>
    `);
    const dialog = $<HTMLDialogElement>('dialog');
    $('#open').addEventListener('click', () => dialog.showModal());

    await userEvent.click(page.getByRole('button', { name: 'Open native' }));
    expect(await heard()).toEqual(['open']);

    const closed = waitForEvent(dialog, 'close');
    await userEvent.click(page.getByRole('button', { name: 'Close native' }));
    await closed;
    expect(await heard()).toEqual(['close']);
  });

  it('opens then closes a <details> from its summary', async () => {
    await mount(`<details><summary>Shipping</summary><p>Two days.</p></details>`);
    const details = $<HTMLDetailsElement>('details');

    let toggled = waitForEvent(details, 'toggle');
    await userEvent.click(page.getByText('Shipping'));
    await toggled;
    expect(await heard()).toEqual(['open']);

    toggled = waitForEvent(details, 'toggle');
    await userEvent.click(page.getByText('Shipping'));
    await toggled;
    expect(await heard()).toEqual(['close']);
  });

  it('opens an l-dropdown, then selects — not closes — when an item is picked', async () => {
    await mount(`
      <l-dropdown style="--show-duration: 0; --hide-duration: 0">
        <button slot="trigger">Menu</button>
        <l-dropdown-item>Apple</l-dropdown-item>
        <l-dropdown-item>Banana</l-dropdown-item>
      </l-dropdown>
    `);
    const dropdown = $('l-dropdown');

    const shown = waitForEvent(dropdown, 'after-show');
    await userEvent.click(page.getByRole('button', { name: 'Menu' }));
    await shown;
    expect(await heard()).toEqual(['open']);

    const hidden = waitForEvent(dropdown, 'after-hide');
    await userEvent.click(page.getByRole('menuitem', { name: 'Apple' }));
    await hidden;
    expect(await heard()).toEqual(['select']);
  });

  it('closes an l-dropdown dismissed with Escape', async () => {
    await mount(`
      <l-dropdown style="--show-duration: 0; --hide-duration: 0">
        <button slot="trigger">Menu</button>
        <l-dropdown-item>Apple</l-dropdown-item>
      </l-dropdown>
    `);
    const dropdown = $('l-dropdown');
    const shown = waitForEvent(dropdown, 'after-show');
    await userEvent.click(page.getByRole('button', { name: 'Menu' }));
    await shown;
    await heard();

    const hidden = waitForEvent(dropdown, 'after-hide');
    await userEvent.keyboard('{Escape}');
    await hidden;

    expect(await heard()).toEqual(['close']);
  });

  it('opens an l-select, then selects — not closes — when an option is picked', async () => {
    await mount(`
      <l-select label="Country">
        <datalist>
          <option value="fr">France</option>
          <option value="de">Germany</option>
        </datalist>
      </l-select>
    `);

    await userEvent.click(page.getByRole('combobox', { name: 'Country' }));
    expect(await heard()).toEqual(['open']);

    await userEvent.click(page.getByRole('option', { name: 'France' }));
    expect(await heard()).toEqual(['select']);
  });

  it('opens an l-combobox as the visitor types, then selects the picked option', async () => {
    await mount(`
      <l-combobox label="City">
        <datalist>
          <option value="paris">Paris</option>
          <option value="lyon">Lyon</option>
        </datalist>
      </l-combobox>
    `);

    await userEvent.click(page.getByRole('combobox', { name: 'City' }));
    await userEvent.keyboard('pa');
    expect(await heard()).toEqual(['open']);

    await userEvent.click(page.getByRole('option', { name: 'Paris' }));
    expect(await heard()).toEqual(['select']);
  });

  it('toggles once when a tab, a segment or a rating is chosen', async () => {
    await mount(`
      <l-tabs>
        <div><button>Overview</button><button>Activity</button></div>
        <div>Overview panel</div>
        <div>Activity panel</div>
      </l-tabs>
      <l-segmented-control label="View" value="list">
        <button value="list">List</button>
        <button value="board">Board</button>
      </l-segmented-control>
      <l-rating edit-mode value="0" name="stars"></l-rating>
    `);

    await userEvent.click(page.getByRole('tab', { name: 'Activity' }));
    expect(await heard()).toEqual(['toggle']);

    await userEvent.click(page.getByRole('radio', { name: 'Board' }));
    expect(await heard()).toEqual(['toggle']);

    const star = $('l-rating').shadowRoot!.querySelectorAll<HTMLElement>('.icon-wrapper')[2];
    await userEvent.click(star);
    expect(await heard()).toEqual(['toggle']);
  });

  it('toggles once per step when a slider is moved from the keyboard', async () => {
    await mount(`<l-slider label="Volume" min="0" max="100" value="40"></l-slider>`);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');

    expect(await heard()).toEqual(['toggle']);
  });

  it('opens and closes an l-tree-item from its chevron', async () => {
    await mount(`
      <l-tree aria-label="Files">
        <l-tree-item id="docs">Documents<l-tree-item>notes.txt</l-tree-item></l-tree-item>
      </l-tree>
    `);
    const chevron = $('#docs').shadowRoot!.querySelector<HTMLElement>('[part="expand-button"]')!;

    await userEvent.click(chevron);
    expect(await heard()).toEqual(['open']);

    await userEvent.click(chevron);
    expect(await heard()).toEqual(['close']);
  });

  it('closes once when an l-tag is removed, and toggles when one is selected', async () => {
    await mount(`<l-tag removable>Design</l-tag> <l-tag selectable>Urgent</l-tag>`);

    await userEvent.click(page.getByRole('button', { name: 'Remove' }));
    expect(await heard()).toEqual(['close']);

    await userEvent.click(page.getByRole('button', { name: 'Urgent' }));
    expect(await heard()).toEqual(['toggle']);
  });

  it('closes once when an l-alert is dismissed', async () => {
    await mount(
      `<l-alert variant="info" dismissible style="transition-duration: 0s">Saved</l-alert>`,
    );
    const hidden = waitForEvent($('l-alert'), 'after-hide');

    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await hidden;

    expect(await heard()).toEqual(['close']);
  });
});

describe('The interface speaking on its own', () => {
  beforeEach(() => sound.enable());

  it('notifies once when a toast appears, and closes when the visitor dismisses it', async () => {
    await mount(`<button id="save">Save</button><l-toast duration="0"></l-toast>`);
    const toaster = $<Toast>('l-toast');
    $('#save').addEventListener('click', () => toaster.toast({ text: 'Saved' }));

    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    expect(await heard()).toEqual(['notify']);

    const hidden = waitForEvent(toaster, 'after-hide');
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await hidden;
    expect(await heard()).toEqual(['close']);
  });

  it('closes when the visitor dismisses a toast with Escape, from anywhere', async () => {
    await mount(`<button>Save</button><l-toast placement="bottom-start"></l-toast>`);
    const toaster = $<Toast>('l-toast');
    toaster.toast({ text: 'Saved', duration: 0 });
    expect(await heard()).toEqual(['notify']);

    const hidden = waitForEvent(toaster, 'after-hide', 3000);
    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    await userEvent.keyboard('{Escape}');
    await hidden;

    expect(await heard()).toEqual(['close']);
  });

  it('stays silent when a toast leaves on its own timer', async () => {
    await mount(`<p>Status</p><l-toast placement="bottom-start"></l-toast>`);
    const toaster = $<Toast>('l-toast');
    const hidden = waitForEvent(toaster, 'after-hide', 3000);
    // A toast pauses its timer under the pointer; keep the pointer off it.
    await userEvent.hover(page.getByText('Status'));

    // Longer than the window in which a sound still answers the last input.
    toaster.toast({ text: 'Saved', duration: 800 });
    expect(await heard()).toEqual(['notify']);
    await hidden;

    expect(await heard()).toEqual([]);
  });

  it('stays silent when a toast times out just after a click elsewhere', async () => {
    await mount(`<button>Save</button><l-toast placement="bottom-start"></l-toast>`);
    const toaster = $<Toast>('l-toast');
    const hidden = waitForEvent(toaster, 'after-hide', 3000);

    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    // Its timer runs out well inside the input window of that click.
    toaster.toast({ text: 'Saved', duration: 150 });
    await hidden;

    expect(await heard()).toEqual(['notify']);
  });

  it('selects when the visitor moves an l-carousel', async () => {
    await mount(`
      <l-carousel>
        <l-carousel-item>One</l-carousel-item>
        <l-carousel-item>Two</l-carousel-item>
        <l-carousel-item>Three</l-carousel-item>
      </l-carousel>
    `);
    const moved = waitForEvent($('l-carousel'), 'select', 3000);

    await userEvent.click(page.getByRole('button', { name: 'Next slide' }));
    await moved;

    expect(await heard()).toEqual(['select']);
  });

  it('stays silent when an l-carousel advances on its own, even just after a click elsewhere', async () => {
    await mount(`
      <button>Save</button>
      <l-carousel>
        <l-carousel-item>One</l-carousel-item>
        <l-carousel-item>Two</l-carousel-item>
        <l-carousel-item>Three</l-carousel-item>
      </l-carousel>
    `);
    const carousel = $<Carousel>('l-carousel');
    const advanced = waitForEvent(carousel, 'select', 3000);

    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    // What autoplay does, inside the input window of that click.
    carousel.next();
    await advanced;

    expect(await heard()).toEqual([]);
  });

  it('stays silent when an l-sticky-bar appears because the page scrolled', async () => {
    await mount(`
      <p id="intro" style="height: 80px; margin: 0">Intro</p>
      <div style="height: 4000px">Long content</div>
      <l-sticky-bar for="intro" style="--show-duration: 0ms; --hide-duration: 0ms">Buy now</l-sticky-bar>
    `);
    const bar = $('l-sticky-bar');
    const shown = waitForEvent(bar, 'after-show', 3000);

    // Keyboard scrolling is user input too, which is exactly why the bar needs
    // to be quiet by itself rather than by timing.
    await userEvent.click(page.getByText('Long content'));
    await userEvent.keyboard('{End}');
    await shown;

    expect(await heard()).toEqual([]);
    window.scrollTo(0, 0);
  });

  it('stays silent while a tooltip comes and goes on hover', async () => {
    await mount(`
      <button id="info">Info</button>
      <l-tooltip for="info" style="--show-duration: 0ms; --hide-duration: 0ms">More details</l-tooltip>
    `);

    await userEvent.hover(page.getByRole('button', { name: 'Info' }));
    await waitUntil(() => $('l-tooltip').hasAttribute('open'));

    expect($('l-tooltip').hasAttribute('open')).toBe(true);
    expect(await heard()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The audio engine
// ---------------------------------------------------------------------------

/**
 * An offline context standing in for the real one, so a sound can be rendered
 * and measured. It reports `running` (an offline context reports `suspended`
 * until it renders) and grows the `close()` that only a real context has.
 */
class RenderingAudioContext extends OfflineAudioContext {
  static last: RenderingAudioContext | null = null;

  constructor() {
    super({ numberOfChannels: 1, length: 17640, sampleRate: 44100 });
    Object.defineProperty(this, 'state', { get: () => 'running' });
    RenderingAudioContext.last = this;
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * A context the browser has not let start yet — the state of every context
 * created outside a user gesture. `unlock()` is the gesture finally arriving.
 */
class LockedAudioContext extends OfflineAudioContext {
  static last: LockedAudioContext | null = null;
  sources = 0;
  resumes = 0;
  /** The event being dispatched at each request to start, `undefined` outside one. */
  resumedDuring: (string | undefined)[] = [];
  closed = false;
  #running = false;
  #waiting: Array<() => void> = [];

  constructor() {
    super({ numberOfChannels: 1, length: 4410, sampleRate: 44100 });
    Object.defineProperty(this, 'state', { get: () => (this.#running ? 'running' : 'suspended') });
    LockedAudioContext.last = this;
  }

  override resume(): Promise<void> {
    this.resumes++;
    this.resumedDuring.push((globalThis as { event?: Event }).event?.type);
    return this.#running
      ? Promise.resolve()
      : new Promise((resolve) => this.#waiting.push(resolve));
  }

  unlock(): void {
    this.#running = true;
    for (const resolve of this.#waiting.splice(0)) resolve();
  }

  override createOscillator(): OscillatorNode {
    this.sources++;
    return super.createOscillator();
  }

  override createBufferSource(): AudioBufferSourceNode {
    this.sources++;
    return super.createBufferSource();
  }

  close(): Promise<void> {
    this.closed = true;
    return Promise.resolve();
  }
}

/** A context the browser let start at once — a click on a "listen" button. */
class RunningAudioContext extends LockedAudioContext {
  constructor() {
    super();
    this.unlock();
  }
}

/** A context that refuses to close, as one already closed does. */
class UnclosableAudioContext extends RunningAudioContext {
  override close(): Promise<void> {
    return Promise.reject(
      new DOMException('Cannot close a closed AudioContext.', 'InvalidStateError'),
    );
  }
}

/** Render one sound offline at the current volume and return its loudest sample. */
async function peakOf(name: SoundName): Promise<number> {
  globalThis.AudioContext = RenderingAudioContext as unknown as typeof AudioContext;
  RenderingAudioContext.last = null;
  releaseAudio();
  sound.play(name);
  const samples = (await RenderingAudioContext.last!.startRendering()).getChannelData(0);
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  return peak;
}

describe('The sounds themselves', () => {
  beforeEach(() => vi.restoreAllMocks());

  it.each(ALL_SOUNDS)('%s is audible, then silent', async (name: SoundName) => {
    globalThis.AudioContext = RenderingAudioContext as unknown as typeof AudioContext;
    RenderingAudioContext.last = null;
    sound.enable();
    sound.play(name);
    const context = RenderingAudioContext.last as RenderingAudioContext | null;
    expect(context).not.toBeNull();
    const samples = (await context!.startRendering()).getChannelData(0);

    let peak = 0;
    for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
    // The last quarter (100 ms) must be silent: a UI sound still ringing
    // 300 ms later is a stuck node, not a sound.
    let tail = 0;
    for (const sample of samples.subarray(Math.floor(samples.length * 0.75))) {
      tail = Math.max(tail, Math.abs(sample));
    }

    expect(peak).toBeGreaterThan(0.01);
    expect(peak).toBeLessThan(1);
    expect(tail).toBeLessThan(1e-3);
  });

  it('plays a sound as soon as the browser lets audio start', async () => {
    globalThis.AudioContext = LockedAudioContext as unknown as typeof AudioContext;
    sound.enable();

    sound.play('tap');
    LockedAudioContext.last!.unlock();
    await nextTask();

    expect(LockedAudioContext.last!.sources).toBeGreaterThan(0);
  });

  it('asks for audio at the press of a pointer, the earliest gesture a browser accepts', async () => {
    globalThis.AudioContext = LockedAudioContext as unknown as typeof AudioContext;
    sound.enable();
    await mount(`<button>Save</button>`);
    const context = LockedAudioContext.last!;

    await userEvent.click(page.getByRole('button', { name: 'Save' }));

    expect(context.resumedDuring).toContain('pointerdown');
  });

  it('gives the audio hardware back when a new configuration turns sound off', () => {
    globalThis.AudioContext = RunningAudioContext as unknown as typeof AudioContext;
    sound.enable();
    const context = LockedAudioContext.last!;

    // A key the visitor never opted in under.
    sound.configure({ storageKey: 'acme-sound' });

    expect(sound.enabled).toBe(false);
    expect(context.closed).toBe(true);
  });

  it('keeps the volume between silence and full, whatever was configured', async () => {
    sound.enable();
    sound.configure({ volume: 1 });
    const full = await peakOf('notify');
    sound.configure({ volume: 0.7 });
    const usual = await peakOf('notify');

    // A percentage typed by mistake plays at full volume, not seventy times it.
    sound.configure({ volume: 70 });
    expect(await peakOf('notify')).toBeCloseTo(full, 5);
    // Not a number at all: the default.
    sound.configure({ volume: Number.NaN });
    expect(await peakOf('notify')).toBeCloseTo(usual, 5);
  });

  it('releases the audio hardware without an error, even when closing fails', async () => {
    globalThis.AudioContext = UnclosableAudioContext as unknown as typeof AudioContext;
    const rejections: unknown[] = [];
    const record = (event: PromiseRejectionEvent) => {
      rejections.push(event.reason);
      event.preventDefault();
    };
    globalThis.addEventListener('unhandledrejection', record);
    try {
      sound.enable();
      sound.disable();
      await nextTask();
      await nextTask();
      expect(rejections).toEqual([]);
    } finally {
      globalThis.removeEventListener('unhandledrejection', record);
    }
  });

  it('drops a sound the browser held back, instead of playing it late', async () => {
    globalThis.AudioContext = LockedAudioContext as unknown as typeof AudioContext;
    sound.enable();

    // A toast on page load, before any gesture: the context cannot start.
    sound.play('notify');
    // Time passing is the point here: the visitor clicks much later.
    await new Promise((resolve) => setTimeout(resolve, 400));
    LockedAudioContext.last!.unlock();
    await nextTask();

    expect(LockedAudioContext.last!.sources).toBe(0);
  });
});
