import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * @summary A badge component for displaying small status indicators.
 * @customElement l-badge
 *
 * @cssproperty --variant - Style variant: `info`, `success`, `warning`, `danger`, or `neutral` (default)
 * @cssproperty --pill - Display as pill shape when set to true
 * @cssproperty --with-dot - Display a dot indicator when set to true
 */
@customElement('l-badge')
export class LuxenBadge extends LitElement {}

declare global {
  interface HTMLElementTagNameMap {
    'l-badge': LuxenBadge;
  }
}
