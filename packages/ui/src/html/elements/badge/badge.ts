import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';

export type BadgeVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeAppearance = 'outlined' | 'filled' | 'filled-outlined' | 'accent';

/**
 * @summary A badge component for displaying small status indicators.
 * @customElement l-badge
 */
export class Badge extends LuxenElement {
  override createRenderRoot() {
    return this;
  }

  /** Style variant: `info`, `success`, `warning`, `danger`, or `neutral` (default) */
  @property({ reflect: true }) variant?: BadgeVariant;

  /** Display as pill shape */
  @property({ type: Boolean, reflect: true }) pill = false;

  /** Badge size: `sm`, `lg`. Default is md. */
  @property({ reflect: true }) size?: BadgeSize;

  /** Visual appearance: `filled`, `filled-outlined`, `accent`. Default is outlined. */
  @property({ reflect: true }) appearance?: BadgeAppearance;
}
