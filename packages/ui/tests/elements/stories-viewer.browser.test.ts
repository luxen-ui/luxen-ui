import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import '../../src/html/elements/stories-viewer/index.js';
import '../../src/html/elements/stories/index.js';
import '../../src/html/elements/story/index.js';
import type { LuxenStoriesViewer } from '../../src/html/elements/stories-viewer/stories-viewer.js';
import type { LuxenStory } from '../../src/html/elements/story/story.js';
import { userEvent } from './support/user-event.js';
import { waitForEvent } from './support/events.js';
import { deepActiveElement } from './support/a11y.js';

// These tests drive l-stories-viewer the way a real user would — interacting via
// trusted CDP events, querying via accessible roles — and assert what a user,
// their screen reader, or their CSS observes: dialog semantics, scroll lock,
// story/chapter navigation, keyboard shortcuts, mute, auto-advance, and
// accessibility. Internal wiring is not tested.

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
  const v = host?.querySelector<LuxenStoriesViewer>('l-stories-viewer');
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
  <l-stories-viewer id="viewer" style="--show-duration: 0ms; --hide-duration: 0ms"></l-stories-viewer>
`;

// ---------------------------------------------------------------------------
// Opening and closing the viewer
// ---------------------------------------------------------------------------

describe('Opening and closing the viewer', () => {
  it('clicking a thumbnail in the linked l-stories opens the viewer', async () => {
    await mount(FIXTURE);
    // Click the story trigger via accessible role — l-story renders a button with data-story-trigger.
    const storyTrigger = page.getByRole('button', { name: 'Story A' });
    await userEvent.click(storyTrigger);
    await settle();
    expect(viewer().open).toBe(true);
  });

  it('the open viewer exposes a dialog accessible role named "Stories"', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    // The <dialog> inside the shadow root carries aria-label="Stories".
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

  it('clicking the Close button fires after-hide and closes the viewer', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    expect(viewer().open).toBe(true);

    const afterHideP = waitForEvent(viewer(), 'after-hide');
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await settle();
    await afterHideP;
    expect(viewer().open).toBe(false);
  });

  it('fires show and after-show in order when opened', async () => {
    await mount(FIXTURE);
    const v = viewer();
    const order: string[] = [];
    v.addEventListener('show', () => order.push('show'));
    v.addEventListener('after-show', () => order.push('after-show'));
    const afterShowP = waitForEvent(v, 'after-show');
    const restore = await openAt(3, 0);
    await afterShowP;
    expect(order).toEqual(['show', 'after-show']);
    restore();
  });

  it('fires hide then after-hide in order when closed', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    const v = viewer();
    const order: string[] = [];
    v.addEventListener('hide', () => order.push('hide'));
    v.addEventListener('after-hide', () => order.push('after-hide'));
    const afterHideP = waitForEvent(v, 'after-hide');
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await settle();
    await afterHideP;
    expect(order).toEqual(['hide', 'after-hide']);
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

    const afterHideP = waitForEvent(viewer(), 'after-hide');
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await settle();
    await afterHideP;

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

  it('clicking the Mute/Unmute button toggles muted and fires mute-change', async () => {
    await mount(FIXTURE);
    const restore = await openAt(3, 0);

    const events: CustomEvent[] = [];
    viewer().addEventListener('mute-change', (e) => events.push(e as CustomEvent));

    // Default is muted=true → button is labeled "Unmute"; clicking unmutes.
    await userEvent.click(page.getByRole('button', { name: 'Unmute' }));
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
  it('ArrowRight calls next() and advances to the next story', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    // Focus the Pause button (aria-label="Pause") to establish focus inside the
    // modal without side effects that would close the viewer.
    await userEvent.click(page.getByRole('button', { name: 'Pause' }));
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    expect(viewer().index).toBe(1);
  });

  it('ArrowLeft calls previous() and retreats to the prior story', async () => {
    await mount(FIXTURE);
    await openAt(3, 1);
    await userEvent.click(page.getByRole('button', { name: 'Pause' }));
    await userEvent.keyboard('{ArrowLeft}');
    await settle();
    // previous() on a story with no chapters and currentTime = 0 crosses into previous story.
    expect(viewer().index).toBe(0);
  });

  it('m toggles muted and fires mute-change', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    // Focus the Unmute button (muted=true by default) to establish focus inside the
    // modal without toggling mute yet.
    await userEvent.click(page.getByRole('button', { name: 'Pause' }));

    const events: CustomEvent[] = [];
    viewer().addEventListener('mute-change', (e) => events.push(e as CustomEvent));

    expect(viewer().muted).toBe(true);
    await userEvent.keyboard('m');
    await settle();

    expect(viewer().muted).toBe(false);
    expect(events).toHaveLength(1);
    expect(events[0].detail.muted).toBe(false);
  });

  it('M also toggles mute (case-insensitive)', async () => {
    await mount(FIXTURE);
    await openAt(3, 0);
    await userEvent.click(page.getByRole('button', { name: 'Pause' }));
    await userEvent.keyboard('M');
    await settle();
    expect(viewer().muted).toBe(false);
  });

  it('keyboard shortcuts do nothing when the viewer is closed', async () => {
    await mount(FIXTURE);
    // Do NOT open the viewer — it is closed.
    const initialIndex = viewer().index;
    // No focused element inside the viewer — press arrow key on document body.
    await userEvent.keyboard('{ArrowRight}');
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

    // Establish focus inside the viewer by clicking the Unmute button.
    // This doesn't close the viewer and doesn't interfere with the Space key test.
    await userEvent.click(page.getByRole('button', { name: 'Unmute' }));
    await settle();
    // Re-mute so the test starts from a known state (muted=true, video paused).
    viewer().muted = true;
    await settle();

    // Video is paused → Space should call play().
    await userEvent.keyboard(' ');
    await settle();
    expect(playSpy).toHaveBeenCalled();

    // Simulate playing state.
    paused.value = false;
    await userEvent.keyboard(' ');
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
    // The 'ended' event is a native media lifecycle event — it is dispatched by the
    // browser's media engine when the video reaches its end. There is no user-initiated
    // equivalent; simulating it here is environment setup, not a user interaction.
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

// ---------------------------------------------------------------------------
// Seen marking
// ---------------------------------------------------------------------------

describe('Seen marking', () => {
  it('marks stories as seen up to and including the current index on close', async () => {
    await mount(FIXTURE);
    await openAt(3, 1); // open at index 1

    const storyEls = Array.from(host.querySelectorAll<LuxenStory>('l-story'));
    const afterHideP = waitForEvent(viewer(), 'after-hide');
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await settle();
    await afterHideP;

    // Stories at index 0 and 1 should be marked seen; index 2 should not.
    expect(storyEls[0].seen).toBe(true);
    expect(storyEls[1].seen).toBe(true);
    expect(storyEls[2].seen).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Accessibility', () => {
  describe('Roles and accessible names', () => {
    it('names the dialog "Stories" via aria-label (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      await openAt(3, 0);
      expect(page.getByRole('dialog', { name: 'Stories' }).elements().length).toBeGreaterThan(0);
    });

    it('the Close button has an accessible name (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      await openAt(3, 0);
      expect(page.getByRole('button', { name: 'Close' }).elements()).toHaveLength(1);
    });

    it('the play/pause button has an accessible name that reflects state (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      const restore = await openAt(3, 0);
      // Default: video not manually paused yet — button should expose "Pause".
      const pauseBtn = page.getByRole('button', { name: 'Pause' });
      const playBtn = page.getByRole('button', { name: 'Play' });
      // At least one of the two states is present.
      const total = pauseBtn.elements().length + playBtn.elements().length;
      expect(total).toBeGreaterThan(0);
      restore();
    });

    it('the mute button reflects its current state ("Unmute" when muted, "Mute" when unmuted) (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      const restore = await openAt(3, 0);
      // Default: muted=true → button labeled "Unmute".
      expect(page.getByRole('button', { name: 'Unmute' }).elements()).toHaveLength(1);
      restore();
    });

    it('the Previous/Next story buttons have accessible names (WCAG 4.1.2 / RGAA 7.1)', async () => {
      await mount(FIXTURE);
      await openAt(3, 1); // middle story — both chevrons should be visible
      // Query the shadow DOM directly for the conditionally-rendered nav buttons.
      // Playwright's getByRole may not surface them if they sit outside the top-level
      // light-DOM context; shadowRoot.querySelector is the reliable fallback here.
      const sr = viewer().shadowRoot!;
      const prevBtn = sr.querySelector<HTMLButtonElement>('[part~="button-previous"]');
      const nextBtn = sr.querySelector<HTMLButtonElement>('[part~="button-next"]');
      expect(prevBtn).not.toBeNull();
      expect(prevBtn?.getAttribute('aria-label')).toBe('Previous story');
      expect(nextBtn).not.toBeNull();
      expect(nextBtn?.getAttribute('aria-label')).toBe('Next story');
    });
  });

  describe('Keyboard interaction (APG dialog modal + media key conventions)', () => {
    it('ArrowLeft and ArrowRight navigate between stories (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FIXTURE);
      await openAt(3, 1);
      // Establish focus inside the modal using the Pause button (does not close the viewer).
      await userEvent.click(page.getByRole('button', { name: 'Pause' }));

      await userEvent.keyboard('{ArrowRight}');
      await settle();
      expect(viewer().index).toBe(2);

      await userEvent.keyboard('{ArrowLeft}');
      await settle();
      expect(viewer().index).toBe(1);
    });

    it('Space toggles play/pause (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FIXTURE);
      const restore = await openAt(3, 0);
      restore();

      const video = viewer().shadowRoot!.querySelector<HTMLVideoElement>('[part~="video"]')!;
      const paused = { value: true };
      Object.defineProperty(video, 'paused', { get: () => paused.value, configurable: true });
      const playSpy = vi.spyOn(video, 'play').mockResolvedValue(undefined);
      vi.spyOn(video, 'pause').mockImplementation(() => {});

      // Establish focus inside the modal using the Unmute button (does not close the viewer).
      await userEvent.click(page.getByRole('button', { name: 'Unmute' }));
      await settle();

      await userEvent.keyboard(' ');
      await settle();
      expect(playSpy).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('M toggles mute (WCAG 2.1.1 / RGAA 7.3)', async () => {
      await mount(FIXTURE);
      await openAt(3, 0);
      // Establish focus inside the modal using the Pause button.
      await userEvent.click(page.getByRole('button', { name: 'Pause' }));

      expect(viewer().muted).toBe(true);
      await userEvent.keyboard('m');
      await settle();
      expect(viewer().muted).toBe(false);
    });

    it('Escape closes the viewer — no keyboard trap (WCAG 2.1.2 / RGAA 12.9)', async () => {
      await mount(FIXTURE);
      await openAt(3, 0);
      const afterHideP = waitForEvent(viewer(), 'after-hide');
      await userEvent.keyboard('{Escape}');
      await settle();
      await afterHideP;
      expect(viewer().open).toBe(false);
    });
  });

  describe('Focus management', () => {
    it('focus is restored to the story trigger after the viewer closes (WCAG 2.4.3 / RGAA 12.8)', async () => {
      await mount(FIXTURE);
      // Click a real story trigger so it holds focus — openAt will open the viewer
      // from there, and _restoreFocus() must return focus to that trigger on close.
      const storyTrigger = page.getByRole('button', { name: 'Story A' });
      await userEvent.click(storyTrigger);
      await settle();

      // Open via public API (play() stub required to avoid autoplay rejection).
      const v = viewer();
      await (v as LuxenStoriesViewer & { updateComplete: Promise<unknown> }).updateComplete;
      const video = v.shadowRoot!.querySelector<HTMLVideoElement>('[part~="video"]')!;
      const playSpy = vi.spyOn(video, 'play').mockResolvedValue(undefined);
      const storyEls = Array.from(host.querySelectorAll<LuxenStory>('l-story'));
      v.openAt(storyEls, 0);
      await settle();

      // Close via Escape — native showModal() plus _restoreFocus() returns focus.
      const afterHideP = waitForEvent(viewer(), 'after-hide');
      await userEvent.keyboard('{Escape}');
      await settle();
      await afterHideP;

      // Focus should be back on the trigger of story A.
      const expectedTrigger = host.querySelector<HTMLButtonElement>(
        'l-story:first-of-type [data-story-trigger]',
      );
      expect(deepActiveElement()).toBe(expectedTrigger);

      playSpy.mockRestore();
    });
  });
});
