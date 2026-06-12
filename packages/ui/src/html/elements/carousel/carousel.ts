import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import EmblaCarousel from 'embla-carousel';

type AxisOptionType = 'x' | 'y';
type AlignmentOptionType =
  | 'start'
  | 'center'
  | 'end'
  | ((viewSize: number, snapSize: number, index: number) => number);
type SlidesToScrollOptionType = 'auto' | number;
type ScrollContainOptionType = 'trimSnaps' | 'keepSnaps' | false;
import Autoplay from 'embla-carousel-autoplay';
import { html, nothing, unsafeCSS, type PropertyValues, type CSSResultGroup } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './carousel.css?inline';

const styles = unsafeCSS(rawStyles);

/** Fired when the active slide changes. Bubbles; not composed. */
export class CarouselSelectEvent extends Event {
  readonly index: number;
  constructor(index: number) {
    super('select', { bubbles: true, composed: false, cancelable: false });
    this.index = index;
  }
}

/** Fired when the set of slides in view changes. */
export class SlidesInViewEvent extends Event {
  readonly indexes: number[];
  constructor(indexes: number[]) {
    super('slides-in-view', { bubbles: false, composed: false, cancelable: false });
    this.indexes = indexes;
  }
}

/** Fired when the fullscreen button is activated. */
export class FullscreenToggleEvent extends Event {
  constructor() {
    super('fullscreen', { bubbles: false, composed: false, cancelable: false });
  }
}

interface CarouselEventMap {
  select: CarouselSelectEvent;
}

declare global {
  interface GlobalEventHandlersEventMap {
    'slides-in-view': SlidesInViewEvent;
    fullscreen: FullscreenToggleEvent;
  }
}

/**
 * Carousel custom element based on Embla Carousel.
 *
 * @csspart viewport - The carousel viewport container.
 * @csspart container - The slides container slot.
 * @csspart scroll-buttons - The scroll buttons wrapper.
 * @csspart button - Any navigation button.
 * @csspart button-previous - The previous slide navigation button.
 * @csspart button-next - The next slide navigation button.
 * @csspart button-dot - Any dot navigation button.
 * @csspart dots - The dots navigation wrapper.
 * @csspart button-fullscreen - The fullscreen button.
 * @csspart button-icon - Any button icon SVG.
 *
 * @cssproperty --slide-height - Height of slides in vertical axis mode.
 * @cssproperty --slide-size - Width of each slide (e.g. `100%`, `calc(100% / 3)`).
 * @cssproperty --slide-gap - Gap between slides.
 * @cssproperty --button-size - Size of navigation buttons.
 * @cssproperty --button-arrow-size - Size of arrow icons inside buttons.
 * @cssproperty --button-arrow-color - Color of arrow icons.
 * @cssproperty --button-offset - Offset of inside-positioned buttons from edges.
 * @cssproperty --button-border-color - Border color of buttons.
 * @cssproperty --button-border-radius - Border radius of buttons.
 * @cssproperty --button-bg - Background color of buttons.
 * @cssproperty --button-color - Text/icon color of buttons.
 * @cssproperty --dot-color - Color of inactive dots.
 * @cssproperty --dot-color-active - Color of active dot.
 * @cssproperty --dot-margin - Margin around dots container.
 * @cssproperty --dot-edge-scale - Scale factor applied to edge dots that signal more dots exist beyond the visible window (default `0.5`).
 *
 * @event select - Fired when the active slide changes. Bubbles. Properties: `index: number`.
 * @event slides-in-view - Fired when the set of slides in view changes. Properties: `indexes: number[]`.
 * @event fullscreen - Fired when the fullscreen button is activated.
 *
 * @customElement l-carousel
 */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- typed addEventListener overloads merged below; no uninitialized properties.
export class Carousel extends LuxenElement {
  static override styles: CSSResultGroup = [hostStyles, styles];

  embla!: EmblaCarouselType;

  /**
   * Choose a delay between transitions in milliseconds (default: 4000).
   */
  @property({ type: Number, reflect: true })
  accessor autoplay = 0;

  /**
   * Configure autoplay options.
   *
   * @link https://www.embla-carousel.com/plugins/autoplay/#options
   */
  @property({ type: Object, attribute: 'autoplay-options' })
  accessor autoplayOptions: any;

  /**
   * Choose scroll axis between x and y.
   *
   * @link https://www.embla-carousel.com/api/options/#axis
   */
  @property()
  accessor axis: AxisOptionType = 'x';

  /**
   * Align the slides relative to the carousel viewport.
   *
   * @link https://www.embla-carousel.com/api/options/#align
   */
  @property()
  accessor align: AlignmentOptionType = 'start';

  /**
   * Breakpoint overrides for options.
   */
  @property({ type: Object, reflect: true })
  accessor breakpoints: any = {};

  /**
   * Enables infinite looping.
   *
   * @link https://www.embla-carousel.com/api/options/#loop
   */
  @property({ type: Boolean })
  accessor loop = false;

  /**
   * Enables momentum scrolling (drag free).
   *
   * @link https://www.embla-carousel.com/api/options/#dragfree
   */
  @property({ type: Boolean, attribute: 'drag-free' })
  accessor dragFree = false;

  /**
   * Set scroll duration when triggered by API methods.
   *
   * @link https://www.embla-carousel.com/api/options/#duration
   */
  @property({ type: Number })
  accessor duration = 20;

  /**
   * Allow skipping scroll snaps on vigorous drag.
   *
   * @link https://www.embla-carousel.com/api/options/#skipsnaps
   */
  @property({ type: Boolean, attribute: 'skip-snaps' })
  accessor skipSnaps = false;

  /**
   * Group slides together for navigation.
   *
   * @link https://www.embla-carousel.com/api/options/#slidestoscroll
   */
  @property({ attribute: 'slides-to-scroll' })
  accessor slidesToScroll: SlidesToScrollOptionType = 1;

  /**
   * Set the initial scroll snap index.
   *
   * @link https://www.embla-carousel.com/api/options/#startindex
   */
  @property({ type: Number, attribute: 'start-index' })
  accessor startIndex = 0;

  /**
   * Clear leading and trailing empty space.
   *
   * @link https://www.embla-carousel.com/api/options/#containscroll
   */
  @property({ attribute: 'contain-scroll' })
  accessor containScroll: ScrollContainOptionType = 'trimSnaps';

  @property({ type: Boolean })
  accessor single = false;

  @property({ type: Boolean, attribute: 'with-dots' })
  accessor withDots = false;

  @property({ type: Boolean, attribute: 'with-scrollbar' })
  accessor withScrollbar = false;

  @property({ type: Boolean, attribute: 'with-fullscreen' })
  accessor withFullscreen = false;

  @property({ type: String, attribute: 'dot-appearance' })
  accessor dotAppearance: 'circle' | 'bar' = 'bar';

  /**
   * Maximum number of dots rendered at once. When the snap count exceeds this,
   * a sliding window keeps the active dot in view and shrinks the edge dot(s)
   * on the side where dots are hidden. `0` (default) renders all dots.
   */
  @property({ type: Number, attribute: 'max-visible-dots' })
  accessor maxVisibleDots = 0;

  @property({ type: String, attribute: 'scroll-buttons-position' })
  accessor scrollButtonsPosition: 'inside' | 'outside' = 'inside';

  @state() private accessor _selectedSnap = 0;

  @query('.scroll-buttons') scrollButtons!: HTMLElement;
  @query('.button-previous') previousBtn!: HTMLButtonElement;
  @query('.button-next') nextBtn!: HTMLButtonElement;
  @query('.container') container!: HTMLSlotElement;

  override connectedCallback(): void {
    super.connectedCallback();
    this.createEmbla();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.embla) {
      this.embla.destroy();
    }
  }

  protected override firstUpdated(): void {
    this.attachEventListeners();
  }

  protected createEmbla() {
    this.embla = EmblaCarousel(this, this.options());
    this.embla
      .on('init', this.onInit)
      .on('reInit', this.onReInit)
      .on('resize', this.onResize)
      .on('slidesInView', this.onSlidesInView)
      .on('select', this.onSelect)
      .on('destroy', this.detachEventListeners);
  }

  protected onSlidesInView = () => {
    this.dispatchEvent(new SlidesInViewEvent(this.embla.slidesInView()));
  };

  protected onInit = () => {
    this.updateNavigation();
  };

  protected onReInit = () => {
    this.updateNavigation();
    this.requestUpdate();
  };

  protected onSelect = () => {
    this.dispatchEvent(new CarouselSelectEvent(this.embla.selectedScrollSnap()));
    this.updateNavigation();
  };

  protected onResize = () => {
    this.requestUpdate();
  };

  protected attachEventListeners() {
    this.previousBtn.addEventListener('click', this.previous);
    this.nextBtn.addEventListener('click', this.next);
  }

  protected detachEventListeners = () => {
    this.previousBtn.removeEventListener('click', this.previous);
    this.nextBtn.removeEventListener('click', this.next);
  };

  protected updateNavigation() {
    const canScroll = this.embla.canScrollPrev() || this.embla.canScrollNext();

    this.previousBtn.toggleAttribute('disabled', !this.embla.canScrollPrev());
    this.nextBtn.toggleAttribute('disabled', !this.embla.canScrollNext());
    this.scrollButtons.classList.toggle('scroll-buttons--disabled', !canScroll);

    this._selectedSnap = this.embla.selectedScrollSnap();
  }

  override async updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('autoplay') && this.autoplay) {
      this.initAutoplay();
    }
  }

  private initAutoplay() {
    this.embla.reInit(this.options(), [Autoplay(this.autoplayOptions || { delay: this.autoplay })]);
  }

  private handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    if (slot.assignedElements().length > 0) {
      this.embla.reInit(this.options());
    }
  };

  private handleDotClick = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    this.goToSlide(Number(button.dataset.index));
  };

  options(): EmblaOptionsType {
    const container = this.shadowRoot!.querySelector('slot')!;

    if (!container) {
      return {
        container: this,
        slides: [],
      };
    }

    return {
      container: container,
      slides: container.assignedElements() as HTMLElement[],
      containScroll: this.containScroll,
      breakpoints: this.breakpoints,
      axis: this.axis,
      align: this.align,
      dragFree: this.dragFree,
      duration: this.duration,
      loop: this.loop,
      slidesToScroll: this.slidesToScroll,
      skipSnaps: this.skipSnaps,
      startIndex: this.startIndex,
    };
  }

  next = () => {
    this.embla.scrollNext();
  };

  previous = () => {
    this.embla.scrollPrev();
  };

  goToSlide(index: number, jump?: boolean) {
    this.embla.scrollTo(index, jump);
  }

  slideNodes() {
    this.embla.slideNodes();
  }

  slidesInView() {
    this.embla.slidesInView();
  }

  isActive() {
    return this.embla?.internalEngine().options.active;
  }

  renderFullscreenButton() {
    return html`<button
      type="button"
      part="button button-fullscreen"
      class="button button-fullscreen"
      @click=${() => this.dispatchEvent(new FullscreenToggleEvent())}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        fill="currentColor"
        part="button-icon button-icon-fullscreen"
      >
        <path
          d="M295 183c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l135-135 0 86.1c0 13.3 10.7 24 24 24s24-10.7 24-24l0-144c0-13.3-10.7-24-24-24L344 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l86.1 0-135 135zM217 329c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L48 430.1 48 344c0-13.3-10.7-24-24-24S0 330.7 0 344L0 488c0 13.3 10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-86.1 0 135-135z"
        />
      </svg>
    </button>`;
  }

  renderNextPreviousButtons() {
    return html`<div
      class="scroll-buttons scroll-buttons--${this.scrollButtonsPosition}"
      part="scroll-buttons"
    >
      <button
        part="button button-previous"
        class="button button-previous"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          part="button-icon button-icon-previous"
        >
          <path
            d="M7 239c-9.4 9.4-9.4 24.6 0 33.9L175 441c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L81.9 280 488 280c13.3 0 24-10.7 24-24s-10.7-24-24-24L81.9 232 209 105c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7 239z"
          />
        </svg>
      </button>

      <button
        part="button button-next"
        class="button button-next"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          part="button-icon button-icon-next"
        >
          <path
            d="M505 273c9.4-9.4 9.4-24.6 0-33.9L337 71c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l127 127-406.1 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l406.1 0-127 127c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0L505 273z"
          />
        </svg>
      </button>
    </div>`;
  }

  private renderDots() {
    if (!this.embla) return nothing;
    const snaps = this.embla.scrollSnapList();
    const total = snaps.length;
    if (total === 0) return nothing;

    const selected = this._selectedSnap;
    const max = this.maxVisibleDots;

    let start = 0;
    let end = total;
    if (max > 0 && max < total) {
      const half = Math.floor((max - 1) / 2);
      start = Math.max(0, selected - half);
      end = Math.min(total, start + max);
      if (end - start < max) start = Math.max(0, end - max);
    }
    const edgeStart = start > 0;
    const edgeEnd = end < total;

    return html`<div
      class="dots"
      part="dots"
      role="tablist"
    >
      ${map(snaps.slice(start, end), (_, i) => {
        const index = start + i;
        const isFirst = i === 0;
        const isLast = i === end - start - 1;
        const isSelected = index === selected;
        const isEdge = !isSelected && ((isFirst && edgeStart) || (isLast && edgeEnd));
        return html`<button
          part="button-dot"
          type="button"
          role="tab"
          class="dot dot--${this.dotAppearance} ${isSelected ? 'dot--selected' : ''}"
          aria-label="Go to slide ${index + 1}"
          aria-selected=${isSelected ? 'true' : nothing}
          data-index="${index}"
          data-edge=${isEdge ? '' : nothing}
          @click=${this.handleDotClick}
        >
          <i></i>
        </button>`;
      })}
    </div>`;
  }

  override render() {
    return html`
      <div class="wrapper ${this.isActive() ? '' : 'inactive'}">
        <div
          part="viewport"
          class="viewport"
        >
          <slot
            part="container"
            class="container"
            @slotchange=${this.handleSlotChange}
          ></slot>
        </div>
        ${this.withFullscreen ? this.renderFullscreenButton() : ''}
        ${this.renderNextPreviousButtons()} ${this.withDots ? this.renderDots() : ''}
      </div>
    `;
  }
}

// Types `addEventListener('select', …)` as `CarouselSelectEvent` on this element
// (the global event map can't be augmented for the colliding name `select`).
// See the Tabs interface in tabs.ts for the full rationale and the gotchas.
export interface Carousel {
  addEventListener<K extends keyof CarouselEventMap>(
    type: K,
    listener: (this: Carousel, ev: CarouselEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof CarouselEventMap>(
    type: K,
    listener: (this: Carousel, ev: CarouselEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}
