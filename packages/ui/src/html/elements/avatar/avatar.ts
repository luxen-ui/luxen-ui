import { html, nothing, svg, unsafeCSS } from 'lit';
import { LuxenElement } from '../../shared/luxen-element';
import { html as staticHtml, literal } from 'lit/static-html.js';
import { property, state } from 'lit/decorators.js';
import hostStyles from '../../shared/styles/host.styles';
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
 */
export class Avatar extends LuxenElement {
  static styles = [hostStyles, styles];

  @property()
  src = '';

  @property()
  name = '';

  @property({ reflect: true })
  size = 'md';

  @property({ type: Number })
  badge = 0;

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
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'img');
    }
  }

  updated() {
    if (this.name) {
      this.setAttribute('aria-label', this.name);
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
      <${this._tag} class="base" type=${this.interactive ? 'button' : nothing}>
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
