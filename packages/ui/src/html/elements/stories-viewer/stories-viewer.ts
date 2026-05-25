import { html, nothing, unsafeCSS, type CSSResultGroup, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import hostStyles from '../../shared/styles/host.styles.js';
import type { LuxenStories } from '../stories/stories.js';
import type { LuxenStory } from '../story/story.js';
import rawStyles from './stories-viewer.css?inline';

const styles = unsafeCSS(rawStyles);

const SCROLL_LOCK_SHEET = Symbol.for('luxen-stories-viewer-scroll-lock');
if (typeof document !== 'undefined' && !(SCROLL_LOCK_SHEET in document)) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(
    `html:has(l-stories-viewer[data-modal]) { overflow: hidden; scrollbar-gutter: stable; }`,
  );
  document.adoptedStyleSheets.push(sheet);
  Object.defineProperty(document, SCROLL_LOCK_SHEET, { value: sheet });
}

/**
 * @summary Fullscreen modal that plays a sequence of `<l-story>` videos with an
 * Instagram-style segmented progress bar, previous/next navigation, mute toggle,
 * and auto-advance.
 *
 * Linked to one or more `<l-stories>` rows via matching `id` ↔ `for`. Open
 * programmatically via `open()` or by clicking a thumbnail in a linked row.
 *
 * @slot cta - Default CTA overlay (e.g. shoppable card). Per-story `slot="cta"` inside `<l-story>` overrides this when that story is active.
 * @slot header - Default header overlay (e.g. avatar + author). Per-story override available the same way.
 * @slot close - Override the default close button.
 *
 * @csspart dialog - The native `<dialog>` element.
 * @csspart frame - The aspect-ratio video frame.
 * @csspart progress - The progress bar wrapper.
 * @csspart progress-segment - A single progress segment.
 * @csspart progress-fill - The fill element inside an active segment.
 * @csspart video - The `<video>` element.
 * @csspart overlay - The overlay wrapper that hosts CTA/header slots.
 * @csspart header - The top-left header area (story thumbnail + label fallback, or consumer-supplied content via the `header` slot).
 * @csspart header-label - The default story label inside the header.
 * @csspart actions - The top-right vertical button stack (close, play/pause, mute).
 * @csspart button-close - The close button.
 * @csspart button-pause - The play/pause toggle.
 * @csspart button-mute - The mute toggle.
 * @csspart button-previous - The previous story button.
 * @csspart button-next - The next story button.
 * @csspart spinner - The loading spinner shown while the current video is buffering.
 *
 * @cssproperty --width - Frame width. Default `min(420px, 100vw)`.
 * @cssproperty --progress-color - Active progress fill color. Default `white`.
 * @cssproperty --progress-bg - Inactive progress segment background. Default `rgb(255 255 255 / 35%)`.
 * @cssproperty --progress-gap - Gap between segments. Default `4px`.
 * @cssproperty --show-duration - Open transition duration. Default `200ms`.
 * @cssproperty --hide-duration - Close transition duration. Default `200ms`.
 * @cssproperty --backdrop - Backdrop color. Default `var(--l-backdrop-strong)` — darker than `--l-backdrop` to focus attention on the immersive frame, but still translucent so the page stays perceptible.
 *
 * @event show - Fired when the viewer opens.
 * @event after-show - Fired after the open transition completes.
 * @event hide - Fired when the viewer is about to close. Cancelable.
 * @event after-hide - Fired after the close transition completes.
 * @event story-change - Fired when the active story changes. Detail: `{ index: number, story: LuxenStory }`.
 * @event story-end - Fired when the active story finishes playback. Detail: `{ index: number }`.
 * @event chapter-change - Fired when the active chapter (within a story) changes. Detail: `{ chapter: number, story: LuxenStory }`.
 * @event mute-change - Fired when the mute state changes. Detail: `{ muted: boolean }`.
 *
 * @customElement l-stories-viewer
 */
export class LuxenStoriesViewer extends LuxenElement {
  static override styles: CSSResultGroup = [hostStyles, styles];

  /** Whether the viewer is open. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Active story index (0-based). */
  @property({ type: Number, reflect: true })
  index = 0;

  /** Whether playback is muted. Defaults to `true` so autoplay always succeeds across browsers. The user can unmute via the dedicated button or the `m` keyboard shortcut. */
  @property({ type: Boolean, reflect: true })
  muted = true;

  /** Loop the active story instead of advancing. */
  @property({ type: Boolean, reflect: true })
  loop = false;

  /** Move to the next story when the current one ends; close after the last story. */
  @property({ type: Boolean, reflect: true, attribute: 'auto-advance' })
  autoAdvance = true;

  /** Close when the backdrop is clicked. */
  @property({ type: Boolean, reflect: true, attribute: 'light-dismiss' })
  lightDismiss = true;

  /** Active chapter index within the current story. Reflected. */
  @property({ type: Number, reflect: true })
  chapter = 0;

  /** Internal: the playlist set by the source `<l-stories>`. */
  stories: LuxenStory[] = [];

  /** Internal: the source `<l-stories>` element that opened the viewer. */
  source: LuxenStories | null = null;

  @query('dialog') private _dialog!: HTMLDialogElement;
  @query('video') private _video!: HTMLVideoElement;

  /** Tracks the underlying `<video>` paused state so the play/pause button stays in sync. */
  @state() private _paused = false;

  /** True while the video is buffering / waiting for data. Drives the loading spinner. */
  @state() private _loading = false;

  private _raf = 0;
  private _holdTimer = 0;
  private _pointerStart: { x: number; y: number; t: number } | null = null;
  private _segments: HTMLElement[] = [];
  private _chapterStarts: number[] = [0];
  /** Tracks the URL we've already injected a prefetch hint for so we don't duplicate. */
  private _prefetchedSrc: string | null = null;

  // --- Lifecycle ---

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKeyDown);
    cancelAnimationFrame(this._raf);
    clearTimeout(this._holdTimer);
    this._clearPrefetchHints();
  }

  override firstUpdated() {
    this._dialog.addEventListener('cancel', (e) => this._onCancel(e));
    this._dialog.addEventListener('close', () => this._onNativeClose());
    this._dialog.addEventListener('click', (e) => this._onDialogClick(e));
    this._video.addEventListener('ended', () => this._onEnded());
    this._video.addEventListener('loadedmetadata', () => this._tick());
    this._video.addEventListener('play', () => (this._paused = false));
    this._video.addEventListener('pause', () => (this._paused = true));
    // Loading spinner state — shown during initial buffer and any subsequent stalls,
    // hidden as soon as the video is actually painting frames.
    this._video.addEventListener('loadstart', () => (this._loading = true));
    this._video.addEventListener('waiting', () => (this._loading = true));
    this._video.addEventListener('playing', () => (this._loading = false));
    this._video.addEventListener('canplay', () => (this._loading = false));
    this._video.addEventListener('error', () => (this._loading = false));
    // Prefetch the next story's video once the current one is past 50% so the
    // transition feels instantaneous. Idempotent via `_prefetchedSrc`.
    this._video.addEventListener('timeupdate', () => this._maybePrefetchNext());
  }

  override updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      if (this.open && !this._dialog.open) {
        this.emit('show');
        this.toggleAttribute('data-modal', true);
        this._dialog.showModal();
        this._loadCurrent();
        void this._emitAfter('after-show');
      } else if (!this.open && this._dialog.open) {
        if (!this.emit('hide', { cancelable: true })) {
          this.open = true;
          return;
        }
        this._dialog.close();
      }
    }

    // Story change → reload current story (refreshes chapters, segments, slots, video).
    if (changed.has('index') && this.open) {
      this._loadCurrent();
      const story = this.stories[this.index];
      if (story) this.emit('story-change', { detail: { index: this.index, story } });
    }

    // Chapter change within the current story → seek + refresh segment fills.
    if (changed.has('chapter') && this.open && !changed.has('index')) {
      this._applyChapterSeek();
    }

    if (changed.has('muted') && this._video) {
      this._video.muted = this.muted;
    }
  }

  // --- Dialog event handlers ---

  private _onCancel(e: Event) {
    if (!this.emit('hide', { cancelable: true })) {
      e.preventDefault();
    }
  }

  private _onNativeClose() {
    cancelAnimationFrame(this._raf);
    this._video.pause();
    this._video.removeAttribute('src');
    this._video.load();
    this._clearPrefetchHints();
    // Mark all stories up to and including this.index as seen.
    for (let i = 0; i <= this.index && i < this.stories.length; i++) {
      this.stories[i].seen = true;
    }
    this._restoreFocus();
    this.open = false;
    this.removeAttribute('data-modal');
    void this._emitAfter('after-hide');
  }

  private _onDialogClick(e: MouseEvent) {
    if (!this.lightDismiss) return;
    // Backdrop click: target is the <dialog>, not a child.
    if (e.target === this._dialog) {
      this.open = false;
    }
  }

  // --- Keyboard ---

  private _onKeyDown = (e: KeyboardEvent) => {
    if (!this.open) return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.previous();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.next();
        break;
      case ' ':
        e.preventDefault();
        if (this._video.paused) this.play();
        else this.pause();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        this.muted = !this.muted;
        this.emit('mute-change', { detail: { muted: this.muted } });
        break;
    }
  };

  // --- Pointer / touch (long-press to pause, tap-to-advance, swipe to close) ---

  private _onFramePointerDown = (e: PointerEvent) => {
    // Skip buttons, links, and explicitly-marked no-gesture areas.
    if ((e.target as HTMLElement).closest('button, a, [data-no-gesture]')) return;
    this._pointerStart = { x: e.clientX, y: e.clientY, t: performance.now() };
    this._holdTimer = window.setTimeout(() => this.pause(), 200);
  };

  private _onFramePointerUp = (e: PointerEvent) => {
    clearTimeout(this._holdTimer);
    const start = this._pointerStart;
    this._pointerStart = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const elapsed = performance.now() - start.t;
    const isTap = elapsed < 200 && Math.abs(dx) < 10 && Math.abs(dy) < 10;
    const wasLongPress = elapsed >= 200 && Math.abs(dx) < 10 && Math.abs(dy) < 10;
    const SWIPE = 50;

    if (wasLongPress) {
      if (this._video.paused) this.play();
      return;
    }

    if (isTap) {
      // Tap zones: chapter-aware nav. Left ~30% = previous chapter (or previous
      // story at the chapter boundary), anywhere else = next chapter (or next
      // story at the last chapter). Chevron buttons remain story-to-story.
      const tap = (e.target as HTMLElement).closest<HTMLElement>('[data-tap]');
      if (tap?.dataset.tap === 'previous') this.previous();
      else this.next();
      return;
    }

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE) {
      if (dx < 0) this.nextStory();
      else this.previousStory();
    } else if (dy > SWIPE) {
      this.close();
    }
  };

  // --- Segments / progress (chapter-based) ---

  private _refreshSegmentRefs() {
    this._segments = Array.from(
      this.shadowRoot!.querySelectorAll<HTMLElement>('[part~="progress-fill"]'),
    );
  }

  private _resetSegmentFills() {
    this._refreshSegmentRefs();
    for (let i = 0; i < this._segments.length; i++) {
      const p = i < this.chapter ? 1 : 0;
      this._segments[i].style.setProperty('--p', String(p));
    }
  }

  private _loadCurrent() {
    const story = this.stories[this.index];
    if (!story) return;
    cancelAnimationFrame(this._raf);
    // Reset the prefetch tracker when the active story changes — the next
    // candidate has shifted and may need its own preload hint.
    this._prefetchedSrc = null;
    this._chapterStarts = story.getChapterStarts();
    this.chapter = 0;
    this._syncSlots(story);
    this._video.muted = this.muted;
    this._video.loop = this.loop;
    if (this._video.src !== story.src) {
      this._video.src = story.src;
    } else {
      this._video.currentTime = 0;
    }
    // Wait one frame for the new segment DOM to render before resetting fills.
    requestAnimationFrame(() => this._resetSegmentFills());
    this._video.play().catch(() => {
      // Autoplay-with-sound rejection: force muted, retry.
      this.muted = true;
      this._video.muted = true;
      this._video.play().catch(() => {});
    });
  }

  /**
   * Inject a `<link rel="preload" as="video">` for the next story once the
   * current video crosses 50% playback. Idempotent: tracked by `_prefetchedSrc`,
   * cleaned up on viewer close.
   */
  private _maybePrefetchNext() {
    const v = this._video;
    if (!v.duration || v.currentTime / v.duration < 0.5) return;
    const nextStory = this.stories[this.index + 1];
    if (!nextStory?.src) return;
    if (this._prefetchedSrc === nextStory.src) return;
    this._prefetchedSrc = nextStory.src;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = nextStory.src;
    link.crossOrigin = 'anonymous';
    link.dataset.luxenStoriesPrefetch = '';
    document.head.appendChild(link);
  }

  /** Remove every prefetch hint we've injected. Called when the viewer closes. */
  private _clearPrefetchHints() {
    const links = document.head.querySelectorAll<HTMLLinkElement>(
      'link[data-luxen-stories-prefetch]',
    );
    for (const link of links) link.remove();
    this._prefetchedSrc = null;
  }

  private _applyChapterSeek() {
    const target = this._chapterStarts[this.chapter] ?? 0;
    this._video.currentTime = target;
    this._resetSegmentFills();
    const story = this.stories[this.index];
    if (story) this.emit('chapter-change', { detail: { chapter: this.chapter, story } });
  }

  private get _lastChapter() {
    return Math.max(0, this._chapterStarts.length - 1);
  }

  // Clone the active story's slot-marked children (cta, header) into the
  // viewer's own light DOM so the shadow root's `<slot name="cta">` and
  // `<slot name="header">` project them. Originals stay attached to the
  // story (hidden via CSS) and are reused on every `index` change.
  private _syncSlots(story: LuxenStory) {
    for (const node of Array.from(this.children)) {
      if ((node as HTMLElement).dataset.storySlot !== undefined) node.remove();
    }
    for (const child of Array.from(story.children)) {
      const slotName = (child as HTMLElement).getAttribute?.('slot');
      if (!slotName) continue;
      const clone = child.cloneNode(true) as HTMLElement;
      clone.dataset.storySlot = '';
      this.appendChild(clone);
    }
  }

  private _tick = () => {
    if (!this.open) return;
    const v = this._video;
    const seg = this._segments[this.chapter];
    if (v && seg) {
      const start = this._chapterStarts[this.chapter] ?? 0;
      const end = this._chapterStarts[this.chapter + 1] ?? v.duration;
      const span = Math.max(0, end - start);
      const p = span ? Math.max(0, Math.min((v.currentTime - start) / span, 1)) : 0;
      seg.style.setProperty('--p', String(p));
      // Auto-advance chapter when its segment is full and there's a next chapter in this story.
      // (The video element's `ended` event handles the last chapter via `_onEnded`.)
      if (p >= 1 && this.chapter < this._lastChapter) {
        this._advance(1);
      }
    }
    this._raf = requestAnimationFrame(this._tick);
  };

  private _onEnded() {
    // Last chapter of the current story finished.
    const story = this.stories[this.index];
    if (story) this.emit('story-end', { detail: { index: this.index } });
    if (this.loop) {
      this._video.currentTime = this._chapterStarts[0] ?? 0;
      this.chapter = 0;
      this._video.play().catch(() => {});
      return;
    }
    if (!this.autoAdvance) return;
    if (this.index < this.stories.length - 1) {
      this.index = this.index + 1;
    } else {
      this.close();
    }
  }

  /** chapter-then-story navigation. */
  private _advance(direction: 1 | -1) {
    if (direction === 1) {
      if (this.chapter < this._lastChapter) {
        this.chapter = this.chapter + 1;
      } else if (this.index < this.stories.length - 1) {
        this.index = this.index + 1;
      } else {
        this.close();
      }
      return;
    }
    // direction === -1: Instagram pattern — restart the current chapter if past 1s in.
    const start = this._chapterStarts[this.chapter] ?? 0;
    if (this._video.currentTime > start + 1) {
      this._video.currentTime = start;
      this._resetSegmentFills();
      return;
    }
    if (this.chapter > 0) {
      this.chapter = this.chapter - 1;
    } else if (this.index > 0) {
      // Crossing into the previous story: load it, then jump to its last chapter.
      const previousStory = this.stories[this.index - 1];
      const previousLast = Math.max(0, previousStory.getChapterStarts().length - 1);
      this.index = this.index - 1;
      // After `index` updates, `_loadCurrent()` runs and resets `chapter` to 0.
      // Set `chapter` to the previous story's last chapter on the next microtask.
      queueMicrotask(() => {
        this.chapter = previousLast;
      });
    }
  }

  // --- Public API ---

  /** Open the viewer at the given index with an explicit playlist. */
  openAt(stories: LuxenStory[], index = 0, source: LuxenStories | null = null) {
    this.stories = stories;
    this.source = source;
    this.index = Math.max(0, Math.min(index, stories.length - 1));
    this.open = true;
  }

  close() {
    this.open = false;
  }

  /** Advance one chapter, or to the next story at the chapter boundary. */
  next() {
    this._advance(1);
  }

  /** Retreat one chapter, restart the current chapter past 1s in, or cross into the previous story. */
  previous() {
    this._advance(-1);
  }

  /** Jump to the next story, skipping any remaining chapters in the current story. */
  nextStory() {
    if (this.index < this.stories.length - 1) {
      this.index = this.index + 1;
    } else {
      this.close();
    }
  }

  /** Jump to the previous story regardless of current chapter. Lands on chapter 0 of the previous story. */
  previousStory() {
    if (this.index > 0) {
      this.index = this.index - 1;
    }
  }

  play() {
    this._video?.play().catch(() => {});
    this._raf = requestAnimationFrame(this._tick);
  }

  pause() {
    this._video?.pause();
    cancelAnimationFrame(this._raf);
  }

  // --- Helpers ---

  private async _emitAfter(name: 'after-show' | 'after-hide') {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const anims = this._dialog.getAnimations({ subtree: false });
    await Promise.all(anims.map((a) => a.finished.catch(() => {})));
    if ((name === 'after-show') !== this.open) return;
    this.emit(name);
    if (name === 'after-show') {
      this._raf = requestAnimationFrame(this._tick);
    }
  }

  private _restoreFocus() {
    const stories = this.source?.stories() ?? this.stories;
    const story = stories[this.index];
    const trigger = story?.querySelector<HTMLButtonElement>('button[data-story-trigger]');
    trigger?.focus({ preventScroll: false });
  }

  override render() {
    const total = this.stories.length;
    const currentStory = this.stories[this.index];
    // Chevrons navigate story-to-story, so visibility depends on `index` only (not chapter).
    const isFirstStory = this.index === 0;
    const isLastStory = this.index >= total - 1;
    // Render one segment per chapter of the CURRENT story. Use `_chapterStarts` if present
    // (set after `_loadCurrent`), or fall back to the current story's parsed chapters.
    const chapterStarts = this._chapterStarts.length
      ? this._chapterStarts
      : (currentStory?.getChapterStarts() ?? [0]);

    return html`
      <dialog
        part="dialog"
        aria-label="Stories"
      >
        <div
          part="frame"
          class="frame"
          @pointerdown=${this._onFramePointerDown}
          @pointerup=${this._onFramePointerUp}
          @pointercancel=${this._onFramePointerUp}
        >
          <div
            part="progress"
            class="progress"
            role="progressbar"
            aria-valuenow=${this.chapter + 1}
            aria-valuemin="1"
            aria-valuemax=${chapterStarts.length || 1}
          >
            ${map(
              chapterStarts,
              (_, i) => html`
                <span
                  part="progress-segment"
                  class="progress-segment"
                  data-state=${i < this.chapter ? 'past' : i === this.chapter ? 'active' : 'future'}
                >
                  <span
                    part="progress-fill"
                    class="progress-fill"
                  ></span>
                </span>
              `,
            )}
          </div>

          <header
            part="header"
            class="header"
            data-no-gesture
          >
            <slot name="header">
              ${currentStory?.poster
                ? html`<img
                    class="header-thumb"
                    src=${currentStory.poster}
                    alt=""
                  />`
                : nothing}
              ${currentStory?.label
                ? html`<div class="header-text">
                    <div
                      part="header-label"
                      class="header-label"
                    >
                      ${currentStory.label}
                    </div>
                  </div>`
                : nothing}
            </slot>
          </header>

          <div
            part="actions"
            class="actions"
            data-no-gesture
          >
            <slot name="close">
              <button
                type="button"
                part="button-close"
                class="btn btn-close"
                aria-label="Close"
                @click=${() => this.close()}
              >
                <l-icon name="mdi:close"></l-icon>
              </button>
            </slot>
            <button
              type="button"
              part="button-pause"
              class="btn btn-pause"
              aria-label=${this._paused ? 'Play' : 'Pause'}
              aria-pressed=${this._paused ? 'true' : 'false'}
              @click=${() => (this._paused ? this.play() : this.pause())}
            >
              <l-icon name=${this._paused ? 'mdi:play' : 'mdi:pause'}></l-icon>
            </button>
            <button
              type="button"
              part="button-mute"
              class="btn btn-mute"
              aria-label=${this.muted ? 'Unmute' : 'Mute'}
              aria-pressed=${this.muted ? 'false' : 'true'}
              @click=${() => {
                this.muted = !this.muted;
                this.emit('mute-change', { detail: { muted: this.muted } });
              }}
            >
              <l-icon name=${this.muted ? 'mdi:volume-off' : 'mdi:volume-high'}></l-icon>
            </button>
          </div>

          <video
            part="video"
            class="video"
            playsinline
            preload="metadata"
            ?muted=${this.muted}
          ></video>

          <l-spinner
            part="spinner"
            class="spinner"
            aria-label="Loading"
            data-no-gesture
            data-state=${this._loading ? 'loading' : 'idle'}
          ></l-spinner>

          <!-- Tap zones: invisible overlays that translate clicks into previous/next.
               Sit BELOW header / overlay / chevron buttons in z-order, above the video. -->
          <div
            class="tap-zone tap-previous"
            data-tap="previous"
            aria-hidden="true"
          ></div>
          <div
            class="tap-zone tap-next"
            data-tap="next"
            aria-hidden="true"
          ></div>

          <div
            part="overlay"
            class="overlay"
            data-no-gesture
          >
            <slot name="cta"></slot>
          </div>

          <div
            class="sr-only"
            aria-live="polite"
          >
            ${total
              ? `Story ${this.index + 1} of ${total}${
                  this.stories[this.index]?.label ? ` — ${this.stories[this.index].label}` : ''
                }${chapterStarts.length > 1 ? ` — chapter ${this.chapter + 1} of ${chapterStarts.length}` : ''}`
              : ''}
          </div>
        </div>

        ${isFirstStory
          ? nothing
          : html`<button
              type="button"
              part="button-previous"
              class="btn btn-nav btn-previous"
              aria-label="Previous story"
              @click=${() => this.previousStory()}
            >
              <l-icon name="mdi:chevron-left"></l-icon>
            </button>`}
        ${isLastStory
          ? nothing
          : html`<button
              type="button"
              part="button-next"
              class="btn btn-nav btn-next"
              aria-label="Next story"
              @click=${() => this.nextStory()}
            >
              <l-icon name="mdi:chevron-right"></l-icon>
            </button>`}
      </dialog>
    `;
  }
}
