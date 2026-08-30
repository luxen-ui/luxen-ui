import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';

export type BadgeVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeAppearance = 'outlined' | 'filled' | 'filled-outlined' | 'accent';

/**
 * A small, non-interactive label for a status, a count, or a category. Light
 * DOM and pure CSS, so a badge renders correctly before — or without — its
 * script.
 *
 * `variant` is the interface-state axis and stays the library's: `info`,
 * `success`, `warning`, `danger`. When the colour instead says *what kind of
 * thing* this is — a site, a department, an asset class — give the badge your
 * own class and set the hooks below. They win over `variant`, `appearance` and
 * `pill` rather than competing with them, so a tinted badge keeps its tint
 * through an appearance change.
 *
 * ```css
 * l-badge.chip-site {
 *   --text-color: var(--brand-site-ink);
 *   --background-color: var(--brand-site-soft);
 * }
 * ```
 *
 * Size stays on the `size` attribute — there is no hook for height, label size
 * or padding, and none is wanted: three steps are the design, not a default to
 * dial past.
 *
 * @summary A badge component for displaying small status indicators.
 * @customElement l-badge
 *
 * @example
 * ```html
 * <l-badge variant="success">Active</l-badge>
 * <l-badge class="chip-site">
 *   <l-icon name="mdi:map-marker-outline"></l-icon>
 *   Lyon branch
 * </l-badge>
 * ```
 *
 * @cssproperty [--text-color] - Label color. The border is a tint of it, so this alone repaints an outlined badge. Defaults to the `variant` step.
 * @cssproperty [--background-color] - Badge fill. Defaults to the `appearance` step — transparent when outlined.
 * @cssproperty [--border-color] - Badge border. Defaults to a 30% tint of `--text-color`; setting it replaces that derivation and holds through `appearance="filled"`, whose default line is transparent.
 * @cssproperty [--border-radius] - Corner radius. The corner stays a squircle; `pill` is what trades it for a true arc. Defaults to `--l-radius-md`.
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
