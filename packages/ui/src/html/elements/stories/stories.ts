import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element';
import type { LuxenStory } from '../story/story';

export type StoriesAppearance = 'rounded' | 'squared' | 'portrait' | 'landscape';

/**
 * @summary A horizontal row of `<l-story>` thumbnails. Click opens the linked
 * `<l-stories-viewer>` (matched by `for` → `id`). If `for` is omitted and no
 * viewer exists, a singleton viewer is appended to `<body>` on first click.
 *
 * @example
 * ```html
 * <l-stories for="brand">
 *   <l-story src="…video.mp4" poster="…jpg" label="Notre concept"></l-story>
 *   <l-story src="…video2.mp4" label="Collant Essentiel"></l-story>
 * </l-stories>
 * <l-stories-viewer id="brand"></l-stories-viewer>
 * ```
 *
 * @event story-open - Fired when the viewer opens. Detail: `{ index: number, story: LuxenStory }`.
 *
 * @cssproperty --size - Thumbnail size (width). Default per appearance.
 * @cssproperty --radius - Thumbnail border radius. Default per appearance (`--radius-full` for rounded, `1rem` for portrait).
 * @cssproperty --gap - Gap between thumbnails. Default `1rem`.
 * @cssproperty --ring-color - Ring color around fresh thumbnails.
 * @cssproperty --ring-color-seen - Ring color for `[seen]` thumbnails.
 * @cssproperty --ring-width - Ring width. Default `2px`.
 * @cssproperty --label-color - Label text color.
 *
 * @customElement l-stories
 */
export class LuxenStories extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** ID of the linked `<l-stories-viewer>`. */
  @property({ reflect: true })
  for = '';

  /** Visual appearance of the thumbnails. */
  @property({ reflect: true })
  appearance: StoriesAppearance = 'rounded';

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'list');
    }
    this.addEventListener('click', this._onClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onClick);
  }

  /** Open the linked viewer at the given index. */
  open(index = 0) {
    const stories = this.stories();
    if (!stories.length) return;
    const viewer = this._resolveViewer();
    if (!viewer) return;
    viewer.stories = stories;
    viewer.source = this;
    viewer.index = Math.max(0, Math.min(index, stories.length - 1));
    viewer.open = true;
    this.emit('story-open', { detail: { index, story: stories[index] } });
  }

  /** All `<l-story>` children. */
  stories(): LuxenStory[] {
    return Array.from(this.querySelectorAll<LuxenStory>(':scope > l-story'));
  }

  private _onClick = (e: MouseEvent) => {
    const trigger = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-story-trigger]');
    if (!trigger) return;
    const story = trigger.closest<LuxenStory>('l-story');
    if (!story) return;
    const index = this.stories().indexOf(story);
    if (index < 0) return;
    e.preventDefault();
    this.open(index);
  };

  private _resolveViewer(): LuxenStoriesViewerLike | null {
    if (this.for) {
      const root = this.getRootNode() as Document | ShadowRoot;
      const el = (root as Document).getElementById?.(this.for);
      if (el && _isViewer(el)) return el;
    }
    // Auto-singleton fallback.
    let auto = document.querySelector<LuxenStoriesViewerLike>('l-stories-viewer[data-auto]');
    if (!auto) {
      auto = document.createElement('l-stories-viewer') as LuxenStoriesViewerLike;
      auto.setAttribute('data-auto', '');
      document.body.appendChild(auto);
    }
    return auto;
  }
}

interface LuxenStoriesViewerLike extends HTMLElement {
  open: boolean;
  index: number;
  stories: LuxenStory[];
  source: LuxenStories | null;
}

function _isViewer(el: Element): el is LuxenStoriesViewerLike {
  return el.tagName === 'L-STORIES-VIEWER';
}

declare global {
  interface HTMLElementTagNameMap {
    'l-stories': LuxenStories;
  }
}
