import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';

/**
 * @summary A single story declaration inside an `<l-stories>` row.
 *
 * Renders the clickable thumbnail (poster image + centered play overlay).
 * The viewer reads `src`, `poster`, `label`, `handle`, `duration`, and
 * `tracks` to play this story when opened.
 *
 * @slot cta - Overlay surfaced by the viewer when this story is active (e.g. product card, link).
 * @slot header - Header overlay (e.g. avatar + author).
 *
 * @customElement l-story
 */
export class LuxenStory extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** Video URL. */
  @property({ reflect: true })
  src = '';

  /** Thumbnail poster image. Falls back to the first video frame. */
  @property({ reflect: true })
  poster = '';

  /** Optional short looping preview video (URL of a small dedicated MP4, typically 2-3s, 480p, no audio). When set, the thumbnail renders this video muted+looped+autoplayed in place of `poster`. Gated by an `IntersectionObserver` so off-screen previews don't play. */
  @property({ reflect: true })
  preview = '';

  /** Caption shown below the thumbnail (or overlaid, depending on appearance) and used as the trigger `aria-label`. */
  @property({ reflect: true })
  label = '';

  /** Override the progress duration in seconds. Defaults to the video's metadata duration. */
  @property({ type: Number })
  duration = 0;

  /** Mark this story as already viewed (faded ring). Reflected. */
  @property({ type: Boolean, reflect: true })
  seen = false;

  /** Pulse the thumbnail with an animated halo + a subtle scale tap to draw attention. Reflected. */
  @property({ type: Boolean, reflect: true })
  pulse = false;

  /** Chapter start times within the video, comma-separated seconds (e.g. `0,5,12,20`). `0` is implicit if omitted. Empty = single chapter spanning the full video. */
  @property()
  chapters = '';

  /** Comma-separated VTT track URLs for captions. */
  @property()
  tracks = '';

  /** Parsed chapter start times. Always begins with `0`, sorted, deduplicated. Empty `chapters` returns `[0]`. */
  getChapterStarts(): number[] {
    const raw = this.chapters
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => Number.isFinite(n) && n >= 0);
    const set = new Set<number>([0, ...raw]);
    const list = Array.from(set);
    list.sort((a, b) => a - b);
    return list;
  }

  @query('video[data-preview]') private _previewVideo?: HTMLVideoElement;

  private _io?: IntersectionObserver;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'listitem');
    }
  }

  override updated(changed: Map<string, unknown>) {
    // Set up / tear down the IntersectionObserver when the preview URL toggles.
    if (changed.has('preview')) {
      this._io?.disconnect();
      this._io = undefined;
      if (this.preview && this._previewVideo) {
        this._io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const v = entry.target as HTMLVideoElement;
              if (entry.isIntersecting) {
                if (v.paused) v.play().catch(() => {});
              } else if (!v.paused) {
                v.pause();
              }
            }
          },
          { threshold: 0.1 },
        );
        this._io.observe(this._previewVideo);
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._io?.disconnect();
    this._io = undefined;
  }
  override render() {
    return html`
      <button
        type="button"
        class="l-story-trigger"
        aria-label=${this.label || 'Open story'}
        data-story-trigger
      >
        <span class="l-story-thumb">
          ${this.preview
            ? html`<video
                data-preview
                src=${this.preview}
                poster=${this.poster || nothing}
                muted
                loop
                playsinline
                autoplay
                preload="auto"
                aria-hidden="true"
              ></video>`
            : this.poster
              ? html`<img
                  src=${this.poster}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />`
              : nothing}
          <span
            class="l-story-play"
            aria-hidden="true"
          >
            <l-icon name="mdi:play"></l-icon>
          </span>
        </span>
        ${this.label ? html`<span class="l-story-label">${this.label}</span>` : nothing}
      </button>
    `;
  }
}
