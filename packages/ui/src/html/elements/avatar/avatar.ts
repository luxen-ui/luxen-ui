import { html, nothing, svg, unsafeCSS } from 'lit';
import { LuxenElement } from '../../shared/luxen-element.js';
import { html as staticHtml, literal } from 'lit/static-html.js';
import { property, state } from 'lit/decorators.js';
import hostStyles from '../../shared/styles/host.styles.js';
import rawStyles from './avatar.css?inline';

const styles = unsafeCSS(rawStyles);

function getInitials(name: string): string {
  return name
    .match(/(\b\S)?/g)!
    .join('')
    .match(/(^\S|\S$)?/g)!
    .join('')
    .toUpperCase();
}

const defaultIcon = svg`<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
</svg>`;

/**
 * @summary An avatar component for displaying user images, initials, or a default icon.
 * @customElement l-avatar
 *
 * @cssproperty [--size=40px] - Box size (any length). Set it inline (e.g. `style="--size: 20px"`) for an arbitrary size beyond the `size` token scale; the font then follows proportionally. The `size` attribute sets it to the matching token.
 * @cssproperty --color - Background fill color for initials and the default icon.
 * @cssproperty --text-color - Initials/icon color over `--color`. Defaults to an auto-derived readable color; set it to enforce a specific brand color (overrides the automatic choice).
 * @cssproperty --appearance - Set to `circle` for a fully circular avatar (default is a rounded square).
 *
 * @csspart base - The avatar container that paints `--color`; style it (e.g. `color`) to override the auto-derived text color.
 *
 * @cssClass .l-avatar-group - Flex wrapper that overlaps a row of stacked avatars.
 */
export class Avatar extends LuxenElement {
  static styles = [hostStyles, styles];

  /** Image URL. Falls back to initials (then the default icon) if it fails to load. */
  @property()
  src = '';

  /** Name used as the accessible label and to derive the initials fallback. */
  @property()
  name = '';

  /** Avatar size: `xs`, `sm`, `md` (default), `lg`, or `xl`. */
  @property({ reflect: true })
  size = 'md';

  /** Count shown in the corner badge. `0` hides the badge. */
  @property({ type: Number })
  badge = 0;

  /** Render as a `<button>` with focus ring and hover states. */
  @property({ type: Boolean, reflect: true })
  interactive = false;

  @state() private _hasError = false;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('src')) {
      this._hasError = false;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.interactive && !this.hasAttribute('role')) {
      this.setAttribute('role', 'img');
    }
  }

  updated() {
    // An interactive avatar renders a focusable <button>, and a role="img" node
    // must stay a leaf in the accessibility tree — so the host carries no role
    // or label and the inner button holds the accessible name (see render()).
    if (this.interactive) {
      if (this.getAttribute('role') === 'img') this.removeAttribute('role');
      this.removeAttribute('aria-label');
    } else {
      if (!this.hasAttribute('role')) this.setAttribute('role', 'img');
      if (this.name) this.setAttribute('aria-label', this.name);
    }

    const isCircle = getComputedStyle(this).getPropertyValue('--appearance').trim() === 'circle';
    this.style.borderRadius = isCircle ? '50%' : '';
  }

  private get _tag() {
    return this.interactive ? literal`button` : literal`div`;
  }

  render() {
    const content =
      this.src && !this._hasError
        ? html`<img
            src=${this.src}
            alt=${this.name || ''}
            @error=${this._onError}
          />`
        : this.name
          ? html`<span class="initials">${getInitials(this.name)}</span>`
          : html`<slot>${defaultIcon}</slot>`;

    return staticHtml`
      <${this._tag}
        class="base"
        part="base"
        type=${this.interactive ? 'button' : nothing}
        aria-label=${this.interactive && this.name ? this.name : nothing}
      >
        ${content}
      </${this._tag}>
      ${
        this.badge
          ? html`<div
              class="badge"
              aria-hidden="true"
            >
              ${this.badge}
            </div>`
          : nothing
      }
    `;
  }

  private _onError = () => {
    this._hasError = true;
  };
}
