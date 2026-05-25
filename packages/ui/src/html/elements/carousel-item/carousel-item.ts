import { html, unsafeCSS, type CSSResultGroup } from 'lit';
import { LuxenElement } from '../../shared/luxen-element.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './carousel-item.css?inline';

const styles = unsafeCSS(rawStyles);

/**
 * A single slide inside an `<l-carousel>`.
 *
 * @cssproperty --aspect-ratio - Aspect ratio of the slide.
 */
export class CarouselItem extends LuxenElement {
  static override styles: CSSResultGroup = [hostStyles, styles];

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'group');
  }

  override render() {
    return html` <slot></slot> `;
  }
}
