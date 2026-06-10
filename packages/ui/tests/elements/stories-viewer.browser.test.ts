import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/stories-viewer/index.js';
import '../../src/html/elements/stories/index.js';
import '../../src/html/elements/story/index.js';
import type { LuxenStoriesViewer } from '../../src/html/elements/stories-viewer/stories-viewer.js';
import type { LuxenStory } from '../../src/html/elements/story/story.js';

// These tests characterize l-stories-viewer the way a user would experience it:
// dialog semantics, story/chapter navigation, keyboard shortcuts, and auto-advance.
// They deliberately avoid asserting internal implementation details.

let host: HTMLElement;

afterEach(() => {
  host?.remove();
  // Remove any auto-singleton viewers appended to <body>.
  document.querySelectorAll('l-stories-viewer[data-auto]').forEach((el) => el.remove());
});

async function mount(html: string): Promise<HTMLElement> {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  await customElements.whenDefined('l-stories-viewer');
  await customElements.whenDefined('l-stories');
  await customElements.whenDefined('l-story');
  await settle();
  return host;
}

async function settle() {
  const v = host.querySelector<LuxenStoriesViewer>('l-stories-viewer');
  if (v) {
    await (v as LuxenStoriesViewer & { updateComplete: Promise<unknown> }).updateComplete;
  }
  // Two macrotask passes: the first lets synchronous callbacks from _dialog.close()
  // run (e.g. _onNativeClose sets open=false which schedules a second Lit cycle);
  // the second lets that second cycle settle.
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  if (v) {
    await (v as LuxenStoriesViewer & { updateComplete: Promise<unknown> }).updateComplete;
  }
}

const viewer = () => host.querySelector<LuxenStoriesViewer>('l-stories-viewer')!;

/**
 * Open the viewer with N stories using the public openAt API.
 * Stubs video.play() to resolve immediately so the autoplay-rejection catch
 * path (`this.muted = true`) never interferes with assertions.
 * Returns a restore function the caller can invoke if it needs real play() later.
 */
async function openAt(count = 3, index = 0): Promise<() => void> {
  const v = viewer();
  // Shadow DOM must exist before spying — wait for first update.
  await (v as LuxenStoriesViewer & { updateComplete: Promise<unknown> }).updateComplete;
  const video = v.shadowRoot!.querySelector<HTMLVideoElement>('[part~="video"]')!;
  const playSpy = vi.spyOn(video, 'play').mockResolvedValue(undefined);

  const storyEls = Array.from(host.querySelectorAll<LuxenStory>('l-story'));
  v.openAt(storyEls.slice(0, count), index);
  await settle();
  return () => playSpy.mockRestore();
}

// Standard 3-story fixture with no src (no network required; exercises everything
// except actual video playback timing — those are driven by dispatching 'ended').
const FIXTURE = `
  <l-stories for="viewer">
    <l-story label="Story A"></l-story>
    <l-story label="Story B"></l-story>
    <l-story label="Story C"></l-story>
  </l-stories>
  <l-stories-viewer id="viewer"></l-stories-viewer>
`;

// ---------------------------------------------------------------------------
// Opening and closing the viewer
// ---------------------------------------------------------------------------

describe('Opening and closing the viewer', () => {
  it('clicking a thumbnail in the linked l-stories opens the viewer', async () => {
    await mount(FIXTURE);
    const trigger = host.querySelector<HTMLButtonElement>(
      'l-story:first-of-type [data-story-trigger]',
    );
    expect(trigger).not.toBeNull();
    trigger!.click();
    await settle();
    expect(viewer().open).toBe(true);
  });

  it('the open viewer exposes a dialog accessible role', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    // The <dialog> inside the shadow root uses aria-label="Stories".
    const dialogs = page.getByRole('dialog', { name: 'Stories' });
    expect(dialogs.elements().length).toBeGreaterThan(0);
  });

  it('openAt(stories, 1) opens at index 1', async () => {
    await mount(FIXTURE);
    await openAt(3, 1);
    expect(viewer().open).toBe(true);
    expect(viewer().index).toBe(1);
  });

  it('openAt clamps an out-of-range index to the last story', async () => {
    await mount(FIXTURE);
    await openAt(3, 99);
    expect(viewer().index).toBe(2);
  });

  it('openAt clamps a negative index to 0', async () => {
    await mount(FIXTURE);
    await openAt(3, -5);
    expect(viewer().index).toBe(0);
  });

  it('close() fires after-hide once the close transition completes', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    expect(viewer().open).toBe(true);

    let afterHideFired = false;
    viewer().addEventListener('after-hide', () => {
      afterHideFired = true;
    });

    viewer().close();
    await settle();
    // after-hide fires async (rAF + CSS animations via _emitAfter).
    await new Promise((r) => setTimeout(r, 300));
    expect(viewer().open).toBe(false);
    expect(afterHideFired).toBe(true);
  });

  it('a cancelable hide listener calling preventDefault keeps the viewer open', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    const cancel = (e: Event) => e.preventDefault();
    viewer().addEventListener('hide', cancel);

    viewer().close();
    await settle();
    // The hide event was cancelled — viewer stays open.
    expect(viewer().open).toBe(true);

    // Cleanup: remove listener so afterEach can clean up.
    viewer().removeEventListener('hide', cancel);
  });

  it('scroll is locked while the viewer is open and restored after close', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    // The adopted stylesheet adds overflow: hidden to <html> via [data-modal].
    expect(viewer().hasAttribute('data-modal')).toBe(true);
    const openStyle = getComputedStyle(document.documentElement).overflow;
    expect(openStyle).toBe('hidden');

    viewer().close();
    await settle();

    // Poll until data-modal is removed (up to ~500 ms) before reading overflow.
    // The attribute drives the adopted-stylesheet rule; reading getComputedStyle
    // before the attribute is gone gives a false positive in CI.
    await new Promise<void>((resolve) => {
      const deadline = Date.now() + 500;
      const check = () => {
        if (!viewer().hasAttribute('data-modal') || Date.now() >= deadline) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });

    expect(viewer().hasAttribute('data-modal')).toBe(false);
    const closedStyle = getComputedStyle(document.documentElement).overflow;
    expect(closedStyle).not.toBe('hidden');
  });
});

// ---------------------------------------------------------------------------
// Moving through stories
// ---------------------------------------------------------------------------

describe('Moving through stories', () => {
  it('nextStory() increments index and fires story-change', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);

    const events: CustomEvent[] = [];
    viewer().addEventListener('story-change', (e) => events.push(e as CustomEvent));

    viewer().nextStory();
    await settle();

    expect(viewer().index).toBe(1);
    expect(events).toHaveLength(1);
    expect(events[0].detail.index).toBe(1);
    expect(events[0].detail.story).toBeTruthy();
  });

  it('nextStory() on the last story closes the viewer', async () => {
    await mount(FIXTURE);
    await openAt(3, 2); // start at last

    viewer().nextStory();
    await settle();

    expect(viewer().open).toBe(false);
  });

  it('previousStory() on index 0 stays at 0', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);

    viewer().previousStory();
    await settle();

    expect(viewer().index).toBe(0);
  });

  it('previousStory() on index 1 moves to index 0', async () => {
    await mount(FIXTURE);
    await openAt(3, 1);

    viewer().previousStory();
    await settle();

    expect(viewer().index).toBe(0);
  });

  it('next() with single-chapter stories behaves like nextStory()', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    // Each story has one chapter (no chapters attr), so next() crosses into next story.
    viewer().next();
    await settle();
    expect(viewer().index).toBe(1);
  });

  it('clicking the mute button toggles muted and fires mute-change', async () => {
    await mount(FIXTURE);
    const restore = await openAt(3, 0);

    const events: CustomEvent[] = [];
    viewer().addEventListener('mute-change', (e) => events.push(e as CustomEvent));

    // Default is muted=true; clicking unmutes.
    const muteBtn = viewer().shadowRoot!.querySelector<HTMLButtonElement>('[part~="button-mute"]');
    expect(muteBtn).not.toBeNull();
    muteBtn!.click();
    await settle();

    expect(viewer().muted).toBe(false);
    expect(events).toHaveLength(1);
    expect(events[0].detail.muted).toBe(false);

    restore();
  });
});

// ---------------------------------------------------------------------------
// Keyboard shortcuts
// ---------------------------------------------------------------------------

describe('A keyboard user can drive the viewer', () => {
  function press(key: string, opts?: KeyboardEventInit) {
    viewer().dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        composed: true,
        cancelable: true,
        ...opts,
      }),
    );
  }

  it('ArrowRight calls next()', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    press('ArrowRight');
    await settle();
    expect(viewer().index).toBe(1);
  });

  it('ArrowLeft calls previous()', async () => {
    await mount(FIXTURE);
    await openAt(3, 1);
    press('ArrowLeft');
    await settle();
    // previous() on a story with no chapters and currentTime = 0 crosses into previous story.
    expect(viewer().index).toBe(0);
  });

  it('m toggles muted and fires mute-change', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);

    const events: CustomEvent[] = [];
    viewer().addEventListener('mute-change', (e) => events.push(e as CustomEvent));

    expect(viewer().muted).toBe(true);
    press('m');
    await settle();

    expect(viewer().muted).toBe(false);
    expect(events).toHaveLength(1);
    expect(events[0].detail.muted).toBe(false);
  });

  it('M also toggles mute (case-insensitive)', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    press('M');
    await settle();
    expect(viewer().muted).toBe(false);
  });

  it('keyboard shortcuts do nothing when the viewer is closed', async () => {
    await mount(FIXTURE);
    // Do NOT open the viewer — it is closed.
    const initialIndex = viewer().index;
    press('ArrowRight');
    await settle();
    // index should not change.
    expect(viewer().index).toBe(initialIndex);
  });

  it('Space pauses and resumes playback', async () => {
    await mount(FIXTURE);
    // openAt already stubs play(); restore it so we can set up our own spy below.
    const restore = await openAt(3, 0);
    restore();

    const video = viewer().shadowRoot!.querySelector<HTMLVideoElement>('[part~="video"]')!;

    // Stub play/pause on the video element since there is no real media source.
    const paused = { value: true };
    Object.defineProperty(video, 'paused', { get: () => paused.value, configurable: true });
    const playSpy = vi.spyOn(video, 'play').mockResolvedValue(undefined);
    const pauseSpy = vi.spyOn(video, 'pause').mockImplementation(() => {});

    // Video is paused → Space should call play().
    press(' ');
    await settle();
    expect(playSpy).toHaveBeenCalled();

    // Simulate playing state.
    paused.value = false;
    press(' ');
    await settle();
    expect(pauseSpy).toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});

// ---------------------------------------------------------------------------
// Auto-advance on ended
// ---------------------------------------------------------------------------

describe('Auto-advance', () => {
  function dispatchEnded() {
    const video = viewer().shadowRoot!.querySelector<HTMLVideoElement>('[part~="video"]')!;
    video.dispatchEvent(new Event('ended'));
  }

  it('fires story-end when the video ended event fires', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);

    const events: CustomEvent[] = [];
    viewer().addEventListener('story-end', (e) => events.push(e as CustomEvent));

    dispatchEnded();
    await settle();

    expect(events).toHaveLength(1);
    expect(events[0].detail.index).toBe(0);
  });

  it('advances to the next story on ended (auto-advance default)', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);

    dispatchEnded();
    await settle();

    expect(viewer().index).toBe(1);
  });

  it('closes the viewer when ended fires on the last story', async () => {
    await mount(FIXTURE);
    await openAt(3, 2); // last story

    dispatchEnded();
    await settle();

    expect(viewer().open).toBe(false);
  });

  it('does NOT advance when auto-advance is disabled', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    viewer().autoAdvance = false;
    await settle();

    dispatchEnded();
    await settle();

    expect(viewer().index).toBe(0);
    expect(viewer().open).toBe(true);
  });

  it('with loop: ended restarts the video instead of advancing', async () => {
    await mount(FIXTURE);
    // openAt stubs play(); restore and re-spy with a fresh mock to track the
    // loop's play() call separately.
    const restore = await openAt(3, 0);
    restore();

    viewer().loop = true;
    await settle();

    const video = viewer().shadowRoot!.querySelector<HTMLVideoElement>('[part~="video"]')!;
    const playSpy = vi.spyOn(video, 'play').mockResolvedValue(undefined);

    dispatchEnded();
    await settle();

    // Index stays 0 — did not advance.
    expect(viewer().index).toBe(0);
    expect(viewer().open).toBe(true);
    // play() was called to restart.
    expect(playSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
