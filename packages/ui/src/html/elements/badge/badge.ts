import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element';

/**
 * @summary A badge component for displaying small status indicators.
 * @customElement l-badge
 */
export class LuxenBadge extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** Style variant: `info`, `success`, `warning`, `danger`, or `neutral` (default) */
  @property({ reflect: true }) variant?: string;

  /** Display as pill shape */
  @property({ type: Boolean, reflect: true }) pill = false;

  /** Badge size: `sm`, `lg`. Default is md. */
  @property({ reflect: true }) size?: string;

  /** Visual appearance: `filled`, `filled-outlined`, `accent`. Default is outlined. */
  @property({ reflect: true }) appearance?: string;
}
