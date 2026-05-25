import { LuxenElement } from '../../shared/luxen-element.js';

/**
 * @summary A skeleton loading placeholder.
 * @customElement l-skeleton
 *
 * @cssproperty --width - Width of the skeleton
 * @cssproperty --height - Height of the skeleton
 */
export class Skeleton extends LuxenElement {
  override createRenderRoot() {
    return this;
  }
}
