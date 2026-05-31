import { LuxenElement } from '../../shared/luxen-element.js';

/**
 * @summary A skeleton loading placeholder.
 * @customElement l-skeleton
 *
 * @attribute shape - circle | text — Placeholder shape. Default is a block.
 * @attribute animation - pulse | wave — Loading animation. Default is `pulse`.
 *
 * @cssproperty --width - Width of the skeleton
 * @cssproperty --height - Height of the skeleton
 */
export class Skeleton extends LuxenElement {
  override createRenderRoot() {
    return this;
  }
}
