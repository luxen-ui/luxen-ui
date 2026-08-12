import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';
import { colorScheme } from '../../src/html/color-scheme.js';

// The store is where the two-state / three-value model lives, so these tests are
// mostly about the two rules that make it work: an override is written only when
// it disagrees with the OS, and an OS change never revokes one. Everything else
// — persistence, cross-tab sync, applying to the document — is checked from the
// outside too: what lands in localStorage, what lands on <html>.

const STORAGE_KEY = 'luxen-color-scheme';

class FakeMediaQueryList extends EventTarget {
  matches: boolean;
  media = '(prefers-color-scheme: dark)';

  constructor(matches: boolean) {
    super();
    this.matches = matches;
  }
}

let fakeMedia: FakeMediaQueryList;
const realMatchMedia = globalThis.matchMedia.bind(globalThis);

function givenOsPrefers(scheme: 'light' | 'dark') {
  fakeMedia.matches = scheme === 'dark';
}

function osSwitchesTo(scheme: 'light' | 'dark') {
  fakeMedia.matches = scheme === 'dark';
  fakeMedia.dispatchEvent(new Event('change'));
}

/** Subscribing is what binds the store's listeners; every test needs one. */
let release: () => void;
let seen: Array<{ scheme: string; overridden: boolean }>;

beforeEach(() => {
  fakeMedia = new FakeMediaQueryList(false);
  globalThis.matchMedia = ((query: string) =>
    query.includes('prefers-color-scheme: dark')
      ? (fakeMedia as unknown as MediaQueryList)
      : realMatchMedia(query)) as typeof globalThis.matchMedia;
  localStorage.removeItem(STORAGE_KEY);
  document.documentElement.style.removeProperty('color-scheme');
  colorScheme.configure({ storageKey: STORAGE_KEY, apply: false });
  seen = [];
  release = colorScheme.subscribe((scheme, overridden) => seen.push({ scheme, overridden }));
  // `subscribe` delivers the current value straight away; the suites below are
  // about what happens *after* that, so drop it.
  seen = [];
});

afterEach(() => {
  release();
  // Leave the singleton clean for the next file: release any override through
  // the public API rather than reaching into it.
  givenOsPrefers('light');
  colorScheme.set('light');
  colorScheme.configure({ storageKey: STORAGE_KEY, apply: false });
  globalThis.matchMedia = realMatchMedia;
  localStorage.removeItem(STORAGE_KEY);
  document.documentElement.style.removeProperty('color-scheme');
});

describe('A visitor choosing a scheme', () => {
  it('starts on whatever the operating system reports', () => {
    givenOsPrefers('dark');
    expect(colorScheme.current).toBe('dark');
    expect(colorScheme.overridden).toBe(false);
  });

  it('stores an override when the choice differs from the system', () => {
    givenOsPrefers('light');
    colorScheme.set('dark');

    expect(colorScheme.current).toBe('dark');
    expect(colorScheme.overridden).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('releases the override when the choice matches the system again', () => {
    givenOsPrefers('light');
    colorScheme.set('dark');
    colorScheme.set('light');

    // Back to following the system rather than pinned to light.
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(colorScheme.overridden).toBe(false);
  });

  it('reports the scheme and whether an override is in place', () => {
    givenOsPrefers('light');
    colorScheme.toggle();
    colorScheme.toggle();

    expect(seen).toEqual([
      { scheme: 'dark', overridden: true },
      { scheme: 'light', overridden: false },
    ]);
  });

  it('hands a new subscriber the current scheme straight away', () => {
    givenOsPrefers('dark');
    const delivered: Array<{ scheme: string; overridden: boolean }> = [];

    const stop = colorScheme.subscribe((scheme, overridden) =>
      delivered.push({ scheme, overridden }),
    );
    stop();

    // Without this, every subscriber's mirror — an aria-pressed, a checked —
    // stays wrong until the first change, which nobody notices until a screen
    // reader does.
    expect(delivered).toEqual([{ scheme: 'dark', overridden: false }]);
  });

  it('returns the scheme now in effect when toggling', () => {
    givenOsPrefers('light');
    expect(colorScheme.toggle()).toBe('dark');
    expect(colorScheme.toggle()).toBe('light');
  });
});

describe('A visitor whose system preference changes under them', () => {
  it('follows the system when they never chose', () => {
    givenOsPrefers('light');
    osSwitchesTo('dark');

    expect(colorScheme.current).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(seen[seen.length - 1]).toEqual({ scheme: 'dark', overridden: false });
  });

  it('keeps the choice they made, even once the system agrees with the opposite', () => {
    givenOsPrefers('dark');
    colorScheme.set('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');

    osSwitchesTo('light');

    // The stored value is evaluated only when the user acts: an OS change must
    // not silently revoke a preference they expressed.
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    expect(colorScheme.current).toBe('light');
  });
});

describe('An app deciding who applies the scheme', () => {
  it('leaves the document untouched by default', () => {
    givenOsPrefers('light');
    colorScheme.set('dark');

    // The contract the default rests on: the app applies, not the library.
    expect(document.documentElement.style.colorScheme).toBe('');
  });

  it('writes the override on the document when asked to', () => {
    givenOsPrefers('light');
    colorScheme.configure({ apply: 'root' });
    colorScheme.set('dark');

    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('declares support for both schemes while following the system', () => {
    givenOsPrefers('light');
    colorScheme.configure({ apply: 'root' });

    // Not empty: `light dark` is what makes the used value follow the OS.
    expect(document.documentElement.style.colorScheme).toBe('light dark');
  });

  it('leaves no trace once application is switched off', () => {
    givenOsPrefers('light');
    colorScheme.configure({ apply: 'root' });
    colorScheme.set('dark');

    colorScheme.configure({ apply: false });

    expect(document.documentElement.style.colorScheme).toBe('');
  });
});

describe('A visitor with several tabs, or none available', () => {
  it('picks up a change made in another tab', () => {
    givenOsPrefers('light');
    localStorage.setItem(STORAGE_KEY, 'dark');
    globalThis.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: 'dark' }));

    expect(colorScheme.current).toBe('dark');
    expect(seen[seen.length - 1]).toEqual({ scheme: 'dark', overridden: true });
  });

  it('still works for the session when the browser refuses storage', () => {
    givenOsPrefers('light');
    // oxlint-disable-next-line typescript/unbound-method -- held only to put the original back; never called.
    const realSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException('denied', 'SecurityError');
    };

    try {
      colorScheme.set('dark');
      expect(colorScheme.current).toBe('dark');
    } finally {
      Storage.prototype.setItem = realSetItem;
    }

    // And once storage is back, releasing the choice works as it always does.
    colorScheme.set('light');
    expect(colorScheme.current).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('keeps the choice in memory when persistence is switched off', () => {
    givenOsPrefers('light');
    colorScheme.configure({ storageKey: '' });

    colorScheme.set('dark');

    expect(colorScheme.current).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    colorScheme.set('light');
    colorScheme.configure({ storageKey: STORAGE_KEY });
  });
});
