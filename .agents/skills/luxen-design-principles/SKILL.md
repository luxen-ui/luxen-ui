---
name: luxen-design-principles
description: Enforces Luxen UI design principles when creating or modifying element CSS in packages/ui/src/css/elements/ or TypeScript in packages/ui/src/html/elements/. Checks web standards first, Baseline compatibility, progressive enhancement, minimal ShadowDOM usage, CSS custom property naming, design tokens, animation patterns, data-attribute variants, appearance directories, form-associated elements, and accessibility conventions. Use this skill whenever working on Luxen UI components, even for small CSS tweaks, adding new elements, or reviewing existing ones.
---

# Luxen UI Design Principles

Follow these principles when creating or modifying any element CSS or TypeScript. Also read `packages/ui/CLAUDE.md` for additional low-level guidance on dark mode, token descriptions, and modern CSS features.

## 1. Web Standards First

Use native HTML elements when they exist. Apply a CSS class on the native element (`.l-button` on `<button>`, `.l-dialog` on `<dialog>`, `.l-select` on `<select>`, `.l-progress` on `<progress>`, `.l-disclosure` on `<details>`). Only use an autonomous custom element tag selector (`l-badge`) when no native equivalent exists. For unknown elements, infer the native equivalent (e.g., `tabs` → `role="tablist"`, `tooltip` → `popover`, `accordion` → `<details>`). Never use JavaScript for behavior that CSS or native HTML already provides.

## 2. Baseline Compatibility

The project targets `"baseline newly available"`. Non-Baseline features must not break core functionality when unsupported. Always provide `var()` fallbacks for properties driven by `if()` conditionals.

See [references/baseline-features.md](references/baseline-features.md) for the full categorized feature list.

## 3. Progressive Web Components

CSS provides the base experience. Interaction states (`:hover`, `:focus-visible`, `:active`, `:disabled`) must be handled in CSS. JavaScript (Lit elements) enhances behavior on top — never required for basic rendering.

## 4. Component Complexity Tiers

Choose the simplest tier that satisfies the component's needs:

1. **CSS-only** — `.l-name` class on a native HTML element. No JS. Used by: button, dialog, drawer, select, progress, disclosure, close-button, avatar-group, kbd.
2. **Empty LitElement** — `l-name` autonomous custom element extending `LuxenElement` with no `render()` or `static styles`. All styling lives in the CSS package. Used by: badge, divider.
3. **Light DOM LitElement** — Overrides `createRenderRoot() { return this; }`. JS handles behavior while CSS package handles styling. Used by: toast, skeleton.
4. **ShadowDOM LitElement** — Full encapsulation with `static styles` (in a `.styles.ts` file) and `render()`. For components with internal structure that needs protection. Used by: avatar, spinner, carousel, dropdown, tooltip, popover.
5. **Form-Associated LitElement** — Extends `LuxenFormAssociatedElement` which adds `ElementInternals` for form participation, validation, and custom `:state()` selectors. Used by: rating, input-stepper.

See [references/typescript-patterns.md](references/typescript-patterns.md) for implementation examples of each tier.

## 5. CSS Custom Property Naming

Three-tier naming convention:

| Scope                | Prefix | Example                                  | Purpose                                      |
| -------------------- | ------ | ---------------------------------------- | -------------------------------------------- |
| Global semantic      | `--l-` | `--l-color-text-primary`, `--l-size-md`  | Design tokens from `@luxen-ui/design-tokens` |
| Public component API | none   | `--size`, `--width`, `--icon-color`      | Consumers override these                     |
| Private internal     | `--_`  | `--_button-size-md`, `--_ring-thickness` | Implementation details, not for consumers    |

Public variables use semantic names (`--size`, `--icon-color`, `--width`) rather than CSS-property-like names (`--padding-inline`, `--font-size`). The test: if a name reads like a CSS property, it's probably too low-level. Only expose what consumers genuinely need to adjust.

## 6. Design Token Usage

Always use semantic tokens (defined in `packages/design-tokens`, shipped via `@luxen-ui/design-tokens` / `luxen-ui/css/tokens`). Never reference raw Tailwind palette values (like `var(--color-gray-700)`) directly in element CSS — those belong only inside the token definitions.

- **No fallbacks on `--l-*` tokens**: the tokens stylesheet is a required dependency, so write `var(--l-color-border-overlay)`, never `var(--l-color-border-overlay, light-dark(...))`. A fallback is dead code that silently masks a typo'd or renamed token — verify the token name exists instead. Fallbacks stay correct for public component variables only (`var(--padding, 0.25rem)`).
- **Theming**: Use `light-dark(light-value, dark-value)` on all semantic tokens. For complex color derivations (e.g., `oklch(from ...)`), use `@media (prefers-color-scheme: dark)` instead since `light-dark()` doesn't reliably resolve nested relative color functions.
- **State colors**: Derive hover/active variants with `color-mix()` instead of defining separate tokens
- **Contrast**: Use `contrast-color()` for automatic text color on colored backgrounds
- **Size tokens**: Reference global size tokens (`--l-size-xs` through `--l-size-xl`) for predefined sizes

See [references/css-patterns.md](references/css-patterns.md) for color derivation examples.

## 7. Progressive Enhancement CSS

Cutting-edge CSS is encouraged when it degrades gracefully:

- **Acceptable**: `corner-shape` → `border-radius`, `text-box` → ignored, `::picker(select)` → native select
- **Problematic**: `if()` without `var()` fallback → property becomes `initial`

Always check: if the feature is unsupported, does the component still render and function? See `packages/ui/CLAUDE.md` for the full modern CSS feature reference list.

## 8. Variant, Size & Appearance Patterns

CSS-only elements use **`data-` attributes** for variants and sizes — not BEM modifier classes:

```css
.l-button[data-variant='primary'] {
  --background-color: var(--l-color-bg-fill-brand);
}
.l-button[data-size='sm'] {
  --height: var(--_button-size-sm);
}
.l-button[data-icon-only] {
  width: var(--height);
}
```

```html
<button
  class="l-button"
  data-variant="primary"
  data-size="lg"
>
  Save
</button>
```

For autonomous custom elements with JS, use reflected `@property` attributes (`variant="info"`, `size="lg"`). For autonomous custom elements without JS, use CSS `if(style(--variant: value))` conditionals driven by inline styles.

**Appearance directories** — some elements have fundamentally different visual treatments:

```
close-button/
  _base.css          ← structural CSS (layout, sizing, states)
  ring.css           ← @import './_base.css'; + ring visual skin
  square.css         ← @import './_base.css'; + square visual skin
```

Selected via `data-appearance` attribute. CSS pattern: `.l-close:not([data-appearance]), .l-close[data-appearance="ring"]` — applies both when attribute matches AND when no attribute is set (imported appearance acts as default).

Size systems use private variables for predefined sizes and a public variable for the active size:

```css
--_button-size-sm: var(--l-size-sm); /* references global size token */
--height: var(--_button-size-md); /* public API */
.l-button[data-size='sm'] {
  --height: var(--_button-size-sm);
}
```

Proportional border-radius scales with size: `border-radius: calc(var(--height) / 8)`.

## 9. Animation Patterns

- **Entry animations**: `@starting-style` defines the before-open state, then transition to the open state
- **Exit animations**: Default CSS values serve as the exit state (e.g., `opacity: 0`)
- **Discrete transitions**: Use `transition-behavior: allow-discrete` for properties like `display` and `overlay`
- **Continuous animations**: `@keyframes` for looping effects (progress bars, skeleton shimmer)
- **Reduced motion**: Always include `@media (prefers-reduced-motion: reduce)` setting durations to `0ms`

See [references/css-patterns.md](references/css-patterns.md) for the entry/exit animation template.

## 10. Accessibility Conventions

- **Focus**: `:focus-visible` with `outline: 2px solid var(--l-focus-ring); outline-offset: 2px;`
- **Hover**: Wrap hover styles in `@media (hover: hover)` for touch devices
- **Screen readers**: Use `.l-visually-hidden` utility class for off-screen text
- **Disabled**: `:disabled` with `cursor: not-allowed; opacity: 0.4;`
- **ARIA**: Set default roles and labels in `connectedCallback()`, update labels in `updated()`

## 11. CSS Architecture

All element styles must be wrapped in `@layer components { ... }`. This keeps specificity predictable across the cascade.

### Scoping light-DOM internals (`@scope` + reset guard)

A light-DOM element that **builds its own subtree of generic tags** (`<button>`, `<input>`, `<div>`, `<span>`…) inherits the user-agent default chrome on those tags (button borders/backgrounds, input styling). Wrap such elements in the `@scope` + zero-specificity reset pattern (see `input-stepper`, `toast`, `input-otp`, `story` for live examples): `@scope` keeps the rules from leaking **out**, and the `all: unset` reset strips UA defaults off the generated internals so the component styles from a clean slate.

```css
@layer components {
  @scope (l-name) {
    /* :where() keeps the reset at (0,0,0) so the component rules below win over it.
       Custom properties survive `all` — design tokens still cascade through. */
    *:where(:not(img, svg, l-icon):not(svg *)),
    *::before,
    *::after {
      all: unset;
      display: revert;
    }

    :scope { /* host styles — :scope, never the bare `l-name` tag */ }
    button { /* internal rules, re-applied above the reset */ }
  }
}
```

> **What this does NOT do — don't oversell it.** Because the block lives in `@layer components`, it shields internals from UA defaults and *lower-layer* rules only. *Unlayered* host-page rules (a CSS reset, Tailwind preflight, a naked `button {}`) outrank **every** cascade layer — they are checked before specificity and before `@scope` proximity — so they leak straight through this guard. Verified: the same hostile unlayered `button {}` breaks both a guarded and an unguarded element identically. The guard's real value is UA-default normalization + a clean styling slate, not isolation from a hostile host. Achieving the latter would require the reset to be **unlayered**, which conflicts with the "all element CSS in `@layer components`" rule — a deliberate trade-off, not an oversight.

**Apply it when the element generates internal generic markup whose content it fully owns and re-styles.** Decision rule:

- ✅ **Generates its own scaffolding and content** (`createElement` / Lit template into light DOM — `toast`, `input-otp`, `story`, and the `+`/`−` buttons + track of `input-stepper`) → add the guard. A wrapped native fallback it re-styles end-to-end (progressive, e.g. `input-stepper`'s `<input>`) is fine to include in the reset. The host selector becomes `:scope` / `:scope[attr]`; `@keyframes` and `::-webkit-*` pseudos stay **outside** `@scope` (Safari ignores spin-button rules nested in `@scope`).
- ❌ **Single styled node** (e.g. `badge`, `divider`) → nothing to protect, skip it.
- ❌ **Hosts author-provided content inside generic internals it does not fully restyle** — a form control whose native/shared styling must survive (`form-field`'s `input`/`select`/`textarea`), or tab buttons/panels carrying author markup (`tabs`) → **never** add it; `all: unset` would wipe the consumer's own styling. Isolate via targeted class selectors instead.
- ❌ **Shadow DOM** element → native encapsulation already isolates it.

**Exclusions from the reset** (the `:not(...)` list): keep out anything with intrinsic content/sizing or any self-contained styled sub-component nested in the tree — `img`, `svg`, `video`, `iconify-icon`/`l-icon`, and shared sub-components like `.l-close` (it paints its icon via `::after { mask }`, so exclude its pseudos too: `*:where(:not(.l-close))::before`).

Common structural patterns:

- **Centering**: `display: grid; place-items: center;`
- **Ring effects**: `box-shadow: 0 0 0 var(--thickness) var(--color)` (not `border`)
- **Responsive sizing**: `max-inline-size: min(90vw, var(--width))`
- **Overlay positioning**: `position: fixed; inset: 0; margin: auto;`
- **Icon embedding**: SVG as inline data URL in `mask` property with `background-color: currentColor`
- **Preventing overflow**: `flex: 1; min-width: 0;` on flexible text containers

See [references/css-patterns.md](references/css-patterns.md) for detailed examples of each pattern.

## 12. TypeScript Conventions

- Components extend `LuxenElement` (base class with `emit()` helper) — never `LitElement` directly
- Form-participating components extend `LuxenFormAssociatedElement` (adds `ElementInternals`)
- Always declare `HTMLElementTagNameMap` for type safety
- Document CSS custom properties with `@cssproperty` JSDoc tags
- Document events with `@event` JSDoc tags
- Use `@property({ reflect: true })` for attributes that should appear in HTML
- Use `@state()` for private internal state
- Clean up listeners in `disconnectedCallback()`

### File Structure

ShadowDOM elements use separate files for styles:

```
elements/
  avatar/
    avatar.ts          ← component class
    avatar.styles.ts   ← static styles = css`...`
    index.ts           ← imports, defines, exports type mapping
```

Simpler elements (badge, divider, skeleton) have just `name.ts` + `index.ts`.

### Registration

Use the `define()` utility from `src/html/define.ts` in `index.ts`:

```typescript
import { define } from '../../define';
import { Avatar } from './avatar';
define('avatar', Avatar);
export type { Avatar };
```

See [references/typescript-patterns.md](references/typescript-patterns.md) for implementation templates.
