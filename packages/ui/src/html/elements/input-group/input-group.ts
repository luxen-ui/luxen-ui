import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element.js';
import { LocalizeController } from '../../shared/localize.js';
import { cls, tagName } from '../../registry.js';

/**
 * @summary Groups a text input with leading or trailing adornments — icons, units, buttons — inside one bordered field.
 *
 * Layout is pure CSS: children render in DOM order, so an `<l-icon>` placed
 * before the `<input>` is a leading adornment and a `<span>` after it is a
 * trailing one. JavaScript only layers behavior on top: `password-toggle`
 * injects a show/hide button at upgrade time (without JS the field stays a
 * plain password input — no dead button), and clicking the group's empty area
 * focuses the input.
 *
 * @example
 * ```html
 * <l-input-group password-toggle>
 *   <input type="password" autocomplete="current-password" />
 * </l-input-group>
 * ```
 *
 * @cssClass .l-input-group-toggle - The injected show/hide password button.
 *
 * @cssproperty [--height=var(--l-form-control-height)] - Control height.
 * @cssproperty [--border-radius=var(--l-form-control-border-radius)] - Corner radius.
 *
 * @customElement l-input-group
 */
export class InputGroup extends LuxenElement {
  private _localize = new LocalizeController(this);

  override createRenderRoot() {
    return this;
  }

  /** Inject a show/hide toggle button after the inner `input[type="password"]`. */
  @property({ type: Boolean, reflect: true, attribute: 'password-toggle' })
  passwordToggle = false;

  /** Control size — maps the height to the shared `--l-size-control-*` scale (default `md`). */
  @property({ reflect: true })
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  private _input: HTMLInputElement | null = null;
  private _toggleBtn: HTMLButtonElement | null = null;
  private _toggleIcon: HTMLElement | null = null;
  private _revealed = false;
  private _setupTimer = 0;
  private _observer: MutationObserver | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._onGroupClick);
    // Children may not be parsed yet when the element upgrades mid-parse: try
    // synchronously, then retry once on a macrotask. setTimeout, not rAF — rAF
    // is suspended in hidden documents, so the element would stay inert there.
    if (!this._trySetup()) {
      this._setupTimer = window.setTimeout(() => this._trySetup(), 0);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onGroupClick);
    clearTimeout(this._setupTimer);
    this._teardownToggle();
    this._input = null;
  }

  /** @returns true when setup ran or was already done; false to schedule a retry. */
  private _trySetup(): boolean {
    if (!this.isConnected) return true;
    this._input = this.querySelector('input');
    if (!this._input) return false;
    this._syncToggle();
    return true;
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('passwordToggle')) this._syncToggle();
    // The label is set imperatively (outside any render), so re-apply it on
    // every update to track a language change (the localize controller calls
    // requestUpdate when <html lang> changes).
    this._toggleBtn?.setAttribute('aria-label', this._localize.term('showPassword'));
  }

  // --- Password toggle ---

  /** Create or remove the toggle button to match `password-toggle` + the input type. */
  private _syncToggle() {
    const wantsToggle =
      this.passwordToggle && this._input?.matches('input[type="password"], input[type="text"]');

    if (wantsToggle && !this._toggleBtn && this._input) {
      this._toggleBtn = this._createToggleButton();
      this._input.after(this._toggleBtn);
      this._observer = new MutationObserver(() => this._syncDisabled());
      this._observer.observe(this._input, { attributes: true, attributeFilter: ['disabled'] });
      this._syncDisabled();
    } else if (!wantsToggle) {
      this._teardownToggle();
    }
  }

  private _createToggleButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = cls('input-group-toggle');
    // APG toggle-button pattern: a fixed label, state conveyed by aria-pressed.
    btn.setAttribute('aria-label', this._localize.term('showPassword'));
    btn.setAttribute('aria-pressed', 'false');
    this._toggleIcon = document.createElement(tagName('icon'));
    this._toggleIcon.setAttribute('name', 'lucide:eye');
    btn.append(this._toggleIcon);
    btn.addEventListener('click', this._onToggle);
    return btn;
  }

  private _teardownToggle() {
    this._observer?.disconnect();
    this._observer = null;
    if (this._toggleBtn) {
      this._toggleBtn.removeEventListener('click', this._onToggle);
      this._toggleBtn.remove();
      this._toggleBtn = null;
      this._toggleIcon = null;
    }
    // Never leave a revealed password behind the toggle's removal.
    if (this._revealed && this._input) this._input.type = 'password';
    this._revealed = false;
  }

  private _syncDisabled() {
    if (this._toggleBtn && this._input) this._toggleBtn.disabled = this._input.disabled;
  }

  private _onToggle = () => {
    if (!this._input || !this._toggleBtn) return;
    this._revealed = !this._revealed;
    this._input.type = this._revealed ? 'text' : 'password';
    this._toggleBtn.setAttribute('aria-pressed', String(this._revealed));
    this._toggleIcon?.setAttribute('name', this._revealed ? 'lucide:eye-off' : 'lucide:eye');
  };

  // --- Click-to-focus ---

  /** The border + padding belong to the group, so clicks there should focus
      the input, like clicking a native input's own padding. */
  private _onGroupClick = (event: MouseEvent) => {
    if (event.target === this) this._input?.focus();
  };
}
