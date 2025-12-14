# CSS Patterns Reference

Concrete examples from the Luxen UI codebase. Read this when implementing or modifying element CSS.

## Table of Contents

- [Layer wrapper](#layer-wrapper)
- [Color derivation](#color-derivation)
- [Size systems](#size-systems)
- [Variant and size selectors](#variant-and-size-selectors)
- [Appearance directories](#appearance-directories)
- [State selectors](#state-selectors)
- [Entry/exit animations](#entryexit-animations)
- [Ring effects](#ring-effects)
- [Responsive sizing](#responsive-sizing)
- [SVG masks](#svg-masks)
- [Overlay patterns](#overlay-patterns)
- [Popover patterns](#popover-patterns)
- [Variant pattern with CSS if()](#variant-pattern-with-css-if)
- [Cross-element composition](#cross-element-composition)

## Layer wrapper

Every element CSS file wraps styles in `@layer components`:

```css
@layer components {
  .l-button {
    /* all styles here */
  }
}
```

## Color derivation

### Theming with light-dark()

All semantic tokens use `light-dark()` for automatic dark mode:

```css
--l-color-text-primary: light-dark(var(--color-gray-900), var(--color-gray-100));
--l-color-surface: light-dark(var(--color-white), var(--color-gray-950));
```

Note: `light-dark()` doesn't reliably resolve nested relative color functions like `oklch(from ...)`. For those, use `@media (prefers-color-scheme: dark)` instead.

### Deriving state colors with color-mix()

Hover and active colors are derived from the base color, not defined as separate tokens:

```css
.l-button[data-variant='destructive'] {
  --background-color: var(--l-color-bg-fill-danger-soft);
  --background-color-hover: color-mix(
    in oklab, var(--l-color-bg-fill-danger-soft) 80%, var(--l-color-text-danger)
  );
}
```

Border colors derived from text color:

```css
l-badge {
  --border-color: color-mix(in oklab, var(--color) 30%, transparent);
}
```

Shadow colors from accent color:

```css
--_shadow-color: color-mix(in oklab, var(--_accent-color) 8%, transparent);
```

### Auto contrast text

```css
color: contrast-color(var(--_accent-color));
```

## Size systems

Private predefined sizes reference global tokens + public active size variable:

```css
.l-button {
  --_button-size-xs: var(--l-size-xs); /* 24px */
  --_button-size-sm: var(--l-size-sm); /* 28px */
  --_button-size-md: var(--l-size-md); /* 32px */
  --_button-size-lg: var(--l-size-lg); /* 36px */
  --_button-size-xl: var(--l-size-xl); /* 40px */

  --height: var(--_button-size-md);
  border-radius: calc(var(--height) / 8);
}

.l-button[data-size='sm'] {
  --height: var(--_button-size-sm);
  --padding-inline: 0.5rem;
  --font-size: var(--text-sm);
}
.l-button[data-size='lg'] { --height: var(--_button-size-lg); }
.l-button[data-size='xl'] { --height: var(--_button-size-xl); }
```

Icon-only buttons use square dimensions:

```css
.l-button[data-icon-only] {
  width: var(--height);
  font-size: var(--icon-only-size, 1.25em);
}
```

## Variant and size selectors

CSS-only elements use `data-` attributes for variants and sizes — not BEM modifier classes:

```css
/* Variants via data-variant */
.l-button[data-variant='primary'] {
  --background-color: var(--l-color-bg-fill-brand);
  --text-color: var(--l-color-text-on-fill-brand);
  --border-color: transparent;
}

/* Sizes via data-size */
.l-button[data-size='sm'] { --height: var(--_button-size-sm); }
.l-button[data-size='lg'] { --height: var(--_button-size-lg); }

/* Boolean flags via data attributes (no value needed) */
.l-button[data-icon-only] { width: var(--height); }
.l-button[data-active-effect]:active { scale: 0.98; translate: 0 1px; }
```

Consumer HTML:
```html
<button class="l-button" data-variant="primary" data-size="lg">Save</button>
<button class="l-button" data-icon-only>×</button>
```

## Appearance directories

For elements with fundamentally different visual treatments (e.g., close-button):

**_base.css** — structural CSS only:
```css
@layer components {
  .l-close {
    /* Layout, sizing, icon mask, transitions, states */
    --size: 32px;
    display: grid;
    place-items: center;
    width: var(--size);
    height: var(--size);
  }
}
```

**ring.css** — imports base + adds visual skin:
```css
@import './_base.css';

@layer components {
  .l-close:not([data-appearance]),
  .l-close[data-appearance="ring"] {
    --_ring-thickness: 0;
    box-shadow: 0 0 0 var(--_ring-thickness) var(--_ring-color);

    &:hover { --_ring-thickness: var(--ring-thickness); }
  }
}
```

The selector `.l-close:not([data-appearance])` makes the imported appearance act as default when no attribute is set.

## State selectors

### Interactive states on CSS-only elements

```css
.l-button {
  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &:not(:disabled):hover {
    background-color: var(--background-color-hover);
    border-color: var(--border-color-hover);
  }

  &:not(:disabled):active {
    background-color: var(--background-color-active);
  }

  &:focus-visible {
    outline: 2px solid var(--l-focus-ring);
    outline-offset: 2px;
  }
}
```

### Open/closed states

```css
/* Native dialog */
.l-dialog[open] { opacity: 1; }

/* Native select */
.l-select:open::picker(select) { opacity: 1; transform: scale(1); }

/* Popover API */
l-toast:popover-open { display: flex; }
l-toast:not(:popover-open) { display: none; }

/* Custom showing attribute (JS-managed) */
l-toast-item[showing] { opacity: 1; translate: 0 0; }
```

### Touch-aware hover

```css
@media (hover: hover) {
  .l-select-item:hover {
    background-color: var(--color-blue-50);
  }
}
```

## Entry/exit animations

The three-state pattern used by dialogs, drawers, and toasts:

```css
.l-dialog {
  /* EXIT STATE (default) */
  opacity: 0;
  transition-property: opacity, display, overlay;
  transition-duration: var(--hide-duration);
  transition-behavior: allow-discrete;

  /* OPEN STATE */
  &[open] {
    opacity: 1;
    transition-duration: var(--show-duration);
  }

  /* BEFORE-OPEN STATE (entry animation start) */
  @starting-style {
    &[open] {
      opacity: 0;
    }
  }
}

/* Drawer uses translate instead of opacity */
.l-drawer {
  translate: -100% 0;
  &[open] { translate: 0 0; }
  @starting-style { &[open] { translate: -100% 0; } }
}
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .l-dialog, .l-drawer {
    --show-duration: 0ms;
    --hide-duration: 0ms;
  }
}
```

### Continuous animations

```css
@keyframes l-skeleton-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

l-skeleton:not([animation]),
l-skeleton[animation="pulse"] {
  animation: l-skeleton-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) 0.5s infinite;
}
```

## Ring effects

Use `box-shadow` for ring/outline effects that don't affect layout:

```css
.l-close {
  --_ring-thickness: 0;
  box-shadow: 0 0 0 var(--_ring-thickness) var(--_ring-color);

  &:hover {
    --_ring-thickness: var(--ring-thickness);
  }
}
```

Avatar group separation ring:

```css
.l-avatar-group > * {
  box-shadow: 0 0 0 2px var(--l-color-surface);
}
```

## Responsive sizing

Constrain to viewport without breaking layout:

```css
.l-dialog {
  width: var(--width);
  max-inline-size: min(90vw, var(--width));
  max-block-size: min(80dvb, 100%);
}
```

## SVG masks

Embed SVG icons as data URLs in mask properties:

```css
.l-close::after {
  content: '';
  display: block;
  width: var(--icon-size);
  height: var(--icon-size);
  background-color: currentColor;
  mask: url('data:image/svg+xml;utf8,<svg>...</svg>');
  mask-size: contain;
}
```

The `background-color: currentColor` + `mask` pattern allows the icon to inherit text color.

## Overlay patterns

### Dialog/drawer centering and backdrop

```css
.l-dialog {
  position: fixed;
  inset: 0;
  margin: auto;

  &::backdrop {
    background: var(--l-backdrop);
  }
}
```

### Structural parts

```css
.l-dialog > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.l-dialog > footer {
  display: flex;
  place-content: end;
  gap: 0.5rem;
}
```

## Popover patterns

### Placement via margin auto

```css
l-toast[placement="top-start"] { margin: 0 auto auto 0; }
l-toast[placement="top-center"] { margin: 0 auto auto; }
l-toast[placement="bottom-center"] { margin: auto auto 0; }
l-toast[placement="bottom-end"] { margin: auto 0 0 auto; }
```

### Reverse stacking for bottom placements

```css
l-toast[placement*="bottom"] {
  flex-direction: column-reverse;
}
```

## Variant pattern with CSS if()

For autonomous custom elements without JS logic (badge pattern). Note: `if()` is NOT in Baseline — always provide a `var()` fallback:

```css
l-badge {
  --color: if(
    style(--variant: info): var(--l-color-text-info);
    else: var(--l-color-text-neutral)
  );
  --background-color: if(
    style(--variant: info): var(--l-color-status-info-weak);
    else: var(--l-color-status-neutral-weak)
  );
}
```

Consumer usage: `<l-badge style="--variant: info">New</l-badge>`

## Cross-element composition

Components can override child component custom properties:

```css
/* Toast overrides close button size */
l-toast-item > .l-close {
  --size: 28px;
  --icon-size: 14px;
  --ring-color: color-mix(in oklab, var(--_accent-color) 20%, transparent);
}
```
