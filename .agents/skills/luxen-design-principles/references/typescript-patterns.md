# TypeScript Patterns Reference

Implementation templates for each component complexity tier. Read this when creating or modifying Lit elements.

## Table of Contents

- [Base classes](#base-classes)
- [Tier 1: CSS-only (no TypeScript)](#tier-1-css-only)
- [Tier 2: Empty LitElement](#tier-2-empty-litelement)
- [Tier 3: Light DOM LitElement](#tier-3-light-dom-litelement)
- [Tier 4: ShadowDOM LitElement](#tier-4-shadowdom-litelement)
- [Tier 5: Form-Associated LitElement](#tier-5-form-associated-litelement)
- [File structure conventions](#file-structure-conventions)
- [Registration and define](#registration-and-define)
- [JSDoc tags for manifest](#jsdoc-tags-for-manifest)
- [Property decorators](#property-decorators)
- [Lifecycle hooks](#lifecycle-hooks)
- [Event patterns](#event-patterns)
- [Dynamic tag rendering](#dynamic-tag-rendering)
- [PopoverController](#popovercontroller)

## Base classes

All Luxen custom elements extend one of two base classes — never `LitElement` directly.

### LuxenElement

Located at `src/html/shared/luxen-element.ts`. Provides the `emit()` helper:

```typescript
import { LuxenElement } from '../../shared/luxen-element';

// Dispatch a custom event. Returns true if not cancelled.
this.emit('show', { detail: { toast }, cancelable: true });
this.emit('after-show', { detail: { toast } }); // not cancelable by default
```

Defaults: `bubbles: true`, `composed: true`, `cancelable: false`.

### LuxenFormAssociatedElement

Located at `src/html/shared/luxen-form-associated-element.ts`. Extends `LuxenElement` with:
- `static formAssociated = true` and `ElementInternals` via `attachInternals()`
- Built-in properties: `name`, `disabled`, `required` (all reflected)
- Form value: `_syncFormValue(value)` to update submission value
- Validity API: `setCustomValidity()`, `reportValidity()`, `checkValidity()`
- Custom states: `:state(valid)`, `:state(invalid)`, `:state(user-valid)`, `:state(user-invalid)`, `:state(required)`, `:state(optional)`
- Form lifecycle: `formResetCallback()`, `formStateRestoreCallback()`
- Interaction tracking: `hasInteracted` flag for post-interaction validation UI

## Tier 1: CSS-only

No TypeScript file needed. The element is a native HTML element with a CSS class:

```html
<button class="l-button" data-variant="primary">Save</button>
<select class="l-select">...</select>
```

All styling lives in `packages/ui/src/css/elements/<name>.css`.

## Tier 2: Empty LitElement

For autonomous custom elements that need no JS logic. Registration only.

```typescript
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element';

/**
 * @cssproperty --variant - Style variant: `info`, `success`, `warning`, `danger`, or `neutral` (default)
 * @cssproperty --pill - Display as pill shape when set to true
 */
export class LuxenBadge extends LuxenElement {
  @property({ reflect: true })
  variant = 'neutral';

  @property({ type: Boolean, reflect: true })
  pill = false;
}
```

No `render()`, no `static styles`. All styling in the CSS package. LitElement without `render()` uses light DOM by default (slotted content renders as-is).

## Tier 3: Light DOM LitElement

For components needing JS behavior but styled entirely from the CSS package.

```typescript
import { property } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element';

/**
 * @event show - Emitted when the component begins to show. Cancelable.
 * @event hide - Emitted when the component begins to hide. Cancelable.
 * @cssproperty --gap - Gap between items.
 * @cssproperty --width - Width of the container.
 */
export class LuxenToast extends LuxenElement {
  @property({ reflect: true })
  placement = 'bottom-end';

  override createRenderRoot() {
    return this;
  }

  // JS behavior: event handling, timers, DOM manipulation
  // No static styles -- all styling from CSS package
}
```

Key: `createRenderRoot() { return this; }` disables ShadowDOM. No `static styles` property.

## Tier 4: ShadowDOM LitElement

Full encapsulation for components with internal structure. Styles in a separate `.styles.ts` file.

**avatar.styles.ts:**
```typescript
import { css } from 'lit';

export const styles = css`
  :host {
    --_size: 40px;
    display: inline-flex;
    width: var(--_size);
    height: var(--_size);
  }

  :host([size='lg']) {
    --_size: 48px;
  }

  .base {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border-radius: var(--radius-full);
    background-color: var(--color, var(--l-color-status-neutral-weak));
  }
`;
```

**avatar.ts:**
```typescript
import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LuxenElement } from '../../shared/luxen-element';
import { styles } from './avatar.styles';

/**
 * @cssproperty --size - Width and height of the avatar.
 * @cssproperty --color - Background color.
 */
export class LuxenAvatar extends LuxenElement {
  static styles = styles;

  @property()
  src = '';

  @property()
  name = '';

  @property({ reflect: true })
  size = 'md';

  @state()
  private _hasError = false;

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
  }

  override render() {
    return html`
      <div class="base">
        ${this.src && !this._hasError
          ? html`<img src=${this.src} alt="" @error=${this._onError} />`
          : html`<span>${this._initials}</span>`}
      </div>
    `;
  }

  private _onError() {
    this._hasError = true;
  }

  private get _initials() {
    return this.name?.charAt(0).toUpperCase() ?? '';
  }
}
```

## Tier 5: Form-Associated LitElement

For components that participate in HTML forms. Extends `LuxenFormAssociatedElement`.

```typescript
import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { LuxenFormAssociatedElement } from '../../shared/luxen-form-associated-element';
import { styles } from './input-stepper.styles';

/**
 * @cssproperty --size - Control height.
 * @event change - Emitted when value changes. Detail: { value: number }
 */
export class LuxenInputStepper extends LuxenFormAssociatedElement {
  static styles = styles;

  @property({ type: Number, reflect: true })
  accessor value = 0;

  @property({ type: Number })
  accessor min = -Infinity;

  @property({ type: Number })
  accessor max = Infinity;

  @property({ type: Number })
  accessor step = 1;

  /** Stored on first connect so formResetCallback can restore it. */
  protected _defaultFormValue = '0';

  connectedCallback() {
    super.connectedCallback();
    this._defaultFormValue = String(this.value);
    this._syncFormValue(String(this.value));
  }

  increment() {
    this.value = Math.min(this.value + this.step, this.max);
    this._syncFormValue(String(this.value));
    this.emit('change', { detail: { value: this.value } });
  }

  decrement() {
    this.value = Math.max(this.value - this.step, this.min);
    this._syncFormValue(String(this.value));
    this.emit('change', { detail: { value: this.value } });
  }

  override render() {
    return html`
      <button @click=${this.decrement} ?disabled=${this.disabled}>−</button>
      <input type="number" .value=${String(this.value)} />
      <button @click=${this.increment} ?disabled=${this.disabled}>+</button>
    `;
  }
}
```

Key patterns:
- `_syncFormValue()` whenever value changes to keep form submission data in sync
- `_defaultFormValue` stored on connect for `formResetCallback()`
- Custom states (`:state(user-invalid)`) are managed automatically by the base class

## File structure conventions

```
elements/
  avatar/                    ← ShadowDOM element
    avatar.ts                ← component class (no @customElement decorator)
    avatar.styles.ts         ← export const styles = css`...`
    index.ts                 ← imports, calls define(), exports type
  badge/                     ← empty LitElement (no .styles.ts)
    badge.ts
    index.ts
  skeleton/                  ← light DOM (no .styles.ts)
    skeleton.ts
    index.ts
```

## Registration and define

Components are NOT decorated with `@customElement()`. Instead, `index.ts` calls `define()`:

```typescript
// elements/avatar/index.ts
import { define } from '../../define';
import { LuxenAvatar } from './avatar';

define('avatar', LuxenAvatar);

export type { LuxenAvatar };

declare global {
  interface HTMLElementTagNameMap {
    'l-avatar': LuxenAvatar;
  }
}
```

The `define()` utility (from `src/html/define.ts`) auto-prefixes with `l-` and safely skips if already registered. The `tagName()`, `cls()`, and `uniqueId()` helpers in `src/html/registry.ts` provide consistent naming.

## JSDoc tags for manifest

The Custom Elements Manifest (`custom-elements.json`) is generated by `cem analyze --litelement`. Document all public CSS properties and events:

```typescript
/**
 * A toast notification container.
 *
 * @cssproperty --gap - Gap between stacked toast items.
 * @cssproperty --width - Width of the toast stack.
 * @cssproperty --show-duration - Duration of the show animation.
 * @cssproperty --hide-duration - Duration of the hide animation.
 *
 * @event show - Emitted when a toast begins to show. Cancelable.
 * @event after-show - Emitted after the show animation completes.
 * @event hide - Emitted when a toast begins to hide. Cancelable.
 * @event after-hide - Emitted after the hide animation completes.
 */
```

Event names are unprefixed (the `emit()` method handles dispatch). Use "Cancelable." when `event.preventDefault()` can stop the action.

## Property decorators

```typescript
// Reflected attribute (appears in HTML, useful for CSS selectors)
@property({ reflect: true })
size = 'md';

// Type-enforced (string by default, specify for non-string)
@property({ type: Number })
badge = 0;

@property({ type: Boolean, reflect: true })
interactive = false;

// Private reactive state (no HTML attribute)
@state()
private _hasError = false;
```

Use `reflect: true` when:
- CSS needs to select on the attribute (`:host([size='lg'])`)
- The attribute should be visible in the DOM for debugging or external queries

## Lifecycle hooks

```typescript
connectedCallback() {
  super.connectedCallback(); // Always call super
  // Set default ARIA attributes
  if (!this.hasAttribute('role')) {
    this.setAttribute('role', 'img');
  }
  // Register global listeners
  document.addEventListener('keydown', this._onKeyDown);
}

disconnectedCallback() {
  super.disconnectedCallback(); // Always call super
  // Clean up global listeners
  document.removeEventListener('keydown', this._onKeyDown);
}

willUpdate(changed: Map<string, unknown>) {
  // Runs before render. Reset derived state.
  if (changed.has('src')) {
    this._hasError = false;
  }
}

updated() {
  // Runs after render. Update ARIA labels from current state.
  if (this.name) {
    this.setAttribute('aria-label', this.name);
  }
}
```

## Event patterns

### Dispatching with emit()

All components use the inherited `emit()` method from `LuxenElement`:

```typescript
// Non-cancelable (default)
this.emit('after-show', { detail: { toast } });

// Cancelable — check return value
if (!this.emit('show', { detail: { toast }, cancelable: true })) return;
```

### Custom detail payloads

```typescript
// Dropdown select
this.emit('select', { detail: { item } });

// Rating change
this.emit('change', { detail: { name: this.name, value: this.value } });
```

### WeakMap for per-element state

When tracking state for dynamically created child elements:

```typescript
private _timers = new WeakMap<HTMLElement, TimerState>();
```

WeakMap prevents memory leaks — entries are garbage collected when the element is removed.

## Dynamic tag rendering

When a component needs to render as different HTML elements based on props:

```typescript
import { html as staticHtml, literal } from 'lit/static-html.js';

private get _tag() {
  return this.interactive ? literal`button` : literal`div`;
}

render() {
  return staticHtml`
    <${this._tag} class="base" type=${this.interactive ? 'button' : nothing}>
      <slot></slot>
    </${this._tag}>
  `;
}
```

Use `lit/static-html.js` with `literal` for dynamic tag names. Import `nothing` from `lit` to omit attributes conditionally.

## PopoverController

Shared reactive controller at `src/html/shared/controllers/popover.ts`, used by tooltip, popover, and dropdown. Handles:

- **Floating-ui positioning** with middleware (offset, flip, shift, arrow)
- **Trigger event listeners**: hover, focus, click — attached/removed via `addTriggerListeners()` / `removeTriggerListeners()`
- **Web Animations API**: `animateShow()` / `animateHide()` with reduced motion support
- **Safe polygon**: hover detection that prevents premature close when cursor moves between trigger and floating element
- **Auto-update**: position recalculation on scroll/resize via `autoUpdate()`

Usage in a component:

```typescript
import { PopoverController } from '../../shared/controllers/popover';

export class LuxenTooltip extends LuxenElement {
  private _popover = new PopoverController(this, {
    onPlacementChange: (placement) => {
      this._body.dataset.placement = placement;
    },
  });

  show() {
    this._popover.startPositioning();
    this._popover.animateShow(this._body);
  }

  hide() {
    this._popover.animateHide(this._body);
    this._popover.stopPositioning();
  }
}
```

Components using Popover API set `popover="manual"` (tooltip — no light dismiss) or `popover="auto"` (dropdown, popover — light dismiss closes on outside click).
