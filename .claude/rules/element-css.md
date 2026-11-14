---
paths:
  - 'packages/ui/src/css/**/*.css'
  - 'packages/ui/src/html/**/*.css'
---

# Element CSS

How to write element CSS: the light-DOM stylesheets in
`packages/ui/src/css/elements/` and the shadow-DOM stylesheets co-located with
their element in `packages/ui/src/html/` (imported `?inline`, see
`.claude/rules/element-ts.md` → "Element Styles").

Element types (`native` / `progressive` / `custom` / `shadow`) and the metadata
a CSS API change must keep in sync are in `packages/ui/AGENTS.md`.

## Principles

- **Web standards first.** Style the native element when one exists: a CSS
  class on it (`.l-button` on `<button>`, `.l-progress` on `<progress>`,
  `.l-disclosure` on `<details>`). A custom tag (`l-badge`) only when no native
  element fits. Never use JavaScript for what CSS or HTML already does.
- **CSS carries the base experience.** `:hover`, `:focus-visible`, `:active`
  and `:disabled` are handled in CSS; a light-DOM element renders correctly
  before, or without, its script.
- **Baseline target: `baseline newly available`** (root `package.json`
  `browserslist`). A feature outside it is allowed only as progressive
  enhancement: unsupported, the element still renders and works
  (`corner-shape` → falls back to `border-radius`). Gate it behind `@supports`
  when the fallback is not automatic. Check the status of a feature rather than
  recalling it — use the `modern-web-guidance` skill or
  [web.dev/baseline](https://web.dev/baseline).
- **Never `!important`.** Fix the cascade through layers, specificity or the
  choice of property.

## Cascade layers

Every light-DOM element stylesheet wraps its rules in `@layer components { … }`
(layer order is declared once in `src/css/_layers.css`). Shadow-DOM stylesheets
are not layered: the shadow root already scopes them.

## Variants, sizes and states

- **Native elements** (`.l-*` classes): `data-*` attributes, never modifier
  classes — `data-variant="primary"`, `data-size="sm"`, `data-appearance="ring"`,
  boolean flags as a bare attribute (`data-icon-only`).
- **Custom elements**: the element's own reflected attributes — `variant`,
  `size`, `appearance` (`l-alert[variant='info']`, `:scope[size='sm']`).
- A variant sets custom properties; the base rule consumes them. Sizes map to
  the shared `--l-size-control-*` tokens.
- **Hover** goes inside `@media (hover: hover)` so touch devices don't keep a
  stuck hover state, and never applies to a disabled control
  (`&:not(:disabled):not([aria-disabled='true']):hover`).
- **Disabled**: `:disabled` and `[aria-disabled='true']` read the same —
  `cursor: not-allowed; opacity: 0.4`.

## Focus

- Always `:focus-visible`, always an `outline` built from the tokens. Never
  hardcode the width, the offset or the color.

  ```css
  &:focus-visible {
    outline: var(--l-focus-ring-width) solid var(--l-focus-ring-color);
    outline-offset: var(--l-focus-ring-offset);
  }
  ```

- A ring an `overflow: hidden` ancestor would clip goes inside instead:
  `outline-offset: calc(var(--l-focus-ring-width) * -1)`.
- Never a `box-shadow` as the focus indicator — it is dropped in forced colors.
  The form-control halo (`--l-form-control-focus-halo-width`) is a `box-shadow`
  added **on top of** the indicator, never in place of it.
- Off-screen text for screen readers uses `.l-visually-hidden`
  (`src/html/shared/styles/visually-hidden.css`).

## Animation

- **Enter**: `@starting-style` holds the before-open state; the open state is
  the transition target.
- **Exit**: the element's default values are the exit state (`opacity: 0`), so
  closing transitions back to them.
- **Discrete properties** (`display`, `overlay`) need
  `transition-behavior: allow-discrete`.
- Durations are public custom properties (`--show-duration`, `--hide-duration`).
- **Reduced motion**: always a `@media (prefers-reduced-motion: reduce)` block
  setting those durations to `0ms`.

Reference: the show/hide block in `src/css/elements/toast.css`.

## Scoping light-DOM internals (`@scope` + reset guard)

A light-DOM element that **builds its own subtree of generic tags** (`<button>`,
`<input>`, `<div>`, `<span>`…) inherits the user-agent default chrome on those
tags. Wrap such an element in `@scope` plus a zero-specificity reset (live
examples: `input-stepper`, `toast`, `input-otp`, `story`): `@scope` keeps the
rules from leaking **out**, and `all: unset` strips the UA defaults so the
element styles from a clean slate.

```css
@layer components {
  @scope (l-name) {
    /* :where() keeps the reset at (0,0,0) so the rules below win over it.
       Custom properties survive `all` — design tokens still cascade through. */
    *:where(:not(img, svg, l-icon):not(svg *)),
    *::before,
    *::after {
      all: unset;
      display: revert;
    }

    :scope {
      /* host styles — :scope, never the bare `l-name` tag */
    }
    button {
      /* internal rules, re-applied above the reset */
    }
  }
}
```

**What it does not do.** The block lives in `@layer components`, so it shields
internals from UA defaults and lower-layer rules only. _Unlayered_ host-page
rules (a CSS reset, Tailwind preflight, a bare `button {}`) outrank every
cascade layer and leak straight through. The guard normalizes UA defaults; it
does not isolate the element from a hostile host. Doing that would need an
unlayered reset, which conflicts with the layer rule above — a deliberate
trade-off.

When to apply it:

- ✅ **Generates its own scaffolding and content** (`createElement` or a Lit
  template into light DOM — `toast`, `input-otp`, `story`, the `+`/`−` buttons
  and track of `input-stepper`). A wrapped native fallback it restyles end to
  end (`input-stepper`'s `<input>`) may be included in the reset. `@keyframes`
  and `::-webkit-*` pseudo-elements stay **outside** `@scope` (Safari ignores
  spin-button rules nested in it).
- ❌ **Single styled node** (`badge`, `divider`) — nothing to protect.
- ❌ **Hosts author content inside generic internals it does not fully
  restyle** — a form control whose native styling must survive (`form-field`'s
  `input` / `select` / `textarea`), tab buttons and panels carrying author
  markup (`tabs`). `all: unset` would wipe the consumer's own styling; use
  targeted class selectors instead.
- ❌ **Shadow DOM** — already encapsulated.

**Exclusions from the reset** (the `:not(…)` list): anything with intrinsic
content or sizing, and any self-contained styled sub-component nested in the
tree — `img`, `svg`, `video`, `iconify-icon` / `l-icon`, shared sub-components
such as `.l-close` (it paints its icon through `::after { mask }`, so exclude
its pseudo-elements too: `*:where(:not(.l-close))::before`).

## Dark Mode

All components must support dark mode. Global design tokens (`@luxen-ui/design-tokens`) use the `light-dark()` CSS function to define both light and dark values. Components get dark mode for free by referencing these semantic tokens — never hardcode colors for a single mode.

`light-dark()` does not reliably resolve nested relative color functions like `oklch(from ...)`. For complex color derivations, use `@media (prefers-color-scheme: dark)` instead.

### Don't switch on a mode signal when contrast depends on a public CSS variable

When a property like `background-color` is driven by a consumer-controlled custom property (e.g. `--color`), the matching text/foreground color must **not** be switched via `light-dark()` or `@media (prefers-color-scheme: dark)`. Both signals are decoupled from the actual background — the consumer's `--color` doesn't change with the document mode, but the mode-based rule will still flip the text and break contrast.

Decide on the **luminance of the actual background** instead. Prefer native
`contrast-color()` — Baseline Newly Available (2026): Safari 26+, Firefox 146+,
Chrome/Edge 147+ — which returns the guaranteed-contrast black/white. Keep a
luminance fallback for browsers predating it, and gate the native path behind
`@supports`, **not** declaration order: the value contains `var()`, so a
non-supporting browser treats `contrast-color()` as invalid-at-computed-value-time
and resets to `inherit` instead of falling back to the previous line.

For the fallback, pick black/white from an approximate relative luminance — not
from OKLCH lightness, which tracks hue rather than luminance (a saturated mid red
has high OKLCH `l` yet low luminance, so an `l`-threshold mis-picks dark text and
contrast collapses to ≈1:1). Square the sRGB channels for a cheap linearization
and flip just above the WCAG black/white crossover (~0.179):

```css
/* Fallback for pre-Baseline browsers (Chrome ≤146, Safari <26, Firefox <146):
 * luminance-thresholded black/white. sign()/calc() require whitespace around + and -. */
--_on: calc(
  255 *
    (
      1 -
        sign(
          0.2126 * (r / 255) * (r / 255) + 0.7152 * (g / 255) * (g / 255) + 0.0722 * (b / 255) *
            (b / 255) - 0.2
        )
    ) /
    2
);
color: rgb(from var(--color) var(--_on) var(--_on) var(--_on));

/* Primary: native guaranteed-contrast choice. No bg fallback inside var(--color),
 * so a bare element keeps inheriting its default text color. */
@supports (color: contrast-color(red)) {
  color: contrast-color(var(--color));
}
```

Reference implementation: `<l-avatar>` — `src/html/elements/avatar/avatar.css`.
Measured WCAG contrast of the fallback across 27 saturated + pastel backgrounds:
25/27 reach AA (4.5:1), all 27 clear the 3:1 large-text floor (worst case 4.48);
`contrast-color()` reaches the per-color optimum where supported. An
OKLCH-lightness threshold reaches only ~7/27.

## Design Tokens

### Base tokens

Primitives live in `packages/design-tokens/src/tokens/1-primitives/`. Colors, radius, type scale, font weights, tracking and leading are synced from Tailwind CSS v4's theme (`packages/design-tokens/scripts/sync-tailwind-tokens.mjs`, run after bumping `tailwindcss`); the spacing scale is Luxen-authored. Semantic aliases (`2-aliases/`) and component tokens (`3-components/`) build on top of them.

### Semantic colors, scale dimensions

Components reference design tokens (defined in `packages/design-tokens/src/tokens/`, shipped as CSS via `@luxen-ui/design-tokens` and re-exported as `luxen-ui/css/tokens`), never raw values. This ensures dark mode, theming, and future token changes propagate automatically. Which tier an element may read depends on the token family:

- **Colors** — semantic (`--l-color-text-*`, `--l-color-bg-*`, `--l-color-surface*`, …) or component tokens only, never palette primitives (`--l-color-gray-700`, `light-dark(var(--l-color-gray-100), …)`). A palette step carries no intent and has no theming reach: re-theming `--l-color-bg-fill-neutral-subtle` restyles every subtle fill, but nothing can retarget a hardcoded `gray-100`. When no semantic token fits, add one to `2-aliases/default.json` with a `$description` that says when to use it.
- **Dimension scales** — `--l-spacing-*`, `--l-radius-*`, `--l-text-*`, `--l-font-weight-*` may be read directly in element CSS. They are steps on a scale, not intents, and they are themable at their source: every spacing step is `calc(var(--l-spacing) * N)`.
- **Family knobs** — when a group of elements needs its own handle on a dimension, add a component token that points at the step (`--l-popover-padding → --l-spacing-1`) and read that instead.

### Never write fallback values for `--l-*` tokens

The design tokens stylesheet is a **required** dependency of every element — `luxen-ui/css/tokens` ships the primitives, semantic aliases, and component tokens together. So token references must be bare:

```css
/* Good */
border: 1px solid var(--l-color-border-overlay);

/* Avoid — the token always resolves; the fallback is dead code */
border: 1px solid var(--l-color-border-overlay, light-dark(#e5e7eb, #374151));
```

A fallback is worse than dead code: it silently masks a typo'd or renamed token. (Dropdown and popover panels once referenced a non-existent `--l-color-bg-surface` and rendered with their `Canvas` fallback instead of the intended `--l-color-surface-overlay` — the bug was invisible until the fallbacks were removed.) When adding a token reference, verify the name exists in `@luxen-ui/design-tokens` rather than guarding it.

Fallbacks remain correct for **public component variables**, which consumers may legitimately not set: `var(--padding, 0.25rem)`, `var(--border-radius, 6px)`.

### Never hardcode a numeric `font-weight`

Weights come from the scale — `var(--l-font-weight-medium)`, `-semibold`, … —
never as a literal `500` or `600`. The two render identically at the default
token values, so a literal looks correct right up until a consumer recalibrates
the scale (two families at the same nominal weight do not carry the same ink);
then that one declaration stays behind while the rest of the page follows.

Keywords are fine: `inherit`, `normal` and `bold` are relative or inherited
rather than a point on the scale.

`tests/font-weight-tokens.test.ts` enforces this across every `.css` and `.ts`
under `src/` — inline `style="font-weight:…"` in a template included.

### Naming convention

| Scope                      | Prefix           | Example                                  | Where defined                                                |
| -------------------------- | ---------------- | ---------------------------------------- | ------------------------------------------------------------ |
| Global semantic token      | `--l-`           | `--l-color-text-primary`, `--l-backdrop` | `packages/design-tokens` (via `@luxen-ui/design-tokens/css`) |
| Private component variable | `--_`            | `--_ring-thickness`, `--_button-size-md` | Element CSS file                                             |
| Public local variable      | `--` (no prefix) | `--width`, `--size`, `--icon-color`      | Element CSS file                                             |

### Public local variable naming

Public local variables are the component's API — the knobs consumers tweak. Keep names **simple and DX-friendly**:

- **Good**: `--width`, `--size`, `--color`, `--icon-size`, `--border-radius`
- **Avoid**: `--background-color`, `--padding-inline`, `--font-size` (too implementation-specific — unless the property is genuinely the main thing consumers need to control)

The test: if a name reads like a CSS property, it's probably too low-level. Prefer semantic names that describe _what_ the consumer is adjusting.

### Token descriptions

Every global token (`$description` in the `packages/design-tokens` JSON sources, emitted as a CSS comment) must describe its intended usage. The description should be comprehensive enough for an AI agent to decide when to use it.

## Internal CSS Class Naming

Light-DOM elements (`type="custom"` or `type="progressive"`) emit internal classes for their inner markup (e.g. `<l-story>` renders `.l-story-trigger`, `.l-story-thumb`, `.l-story-label`). Use **flat kebab-case**: `l-{tag}-{child}`.

```html
<!-- Good -->
<span class="l-story-thumb">…</span>
<button class="l-toast-action">…</button>

<!-- Avoid (BEM) -->
<span class="l-story__thumb">…</span>
<button class="l-toast__action l-toast__action--primary">…</button>
```

**Why no BEM**: the custom element prefix (`l-{tag}`) already encodes the "block" — adding `__` between block and element duplicates information already carried by the prefix. Modifiers go through `data-*` attributes (`data-variant="primary"`, `data-appearance="ring"`), not class suffixes — so BEM's `--modifier` channel is unused. Shadow-DOM elements skip internal classes entirely (use `::part()` instead), keeping the surface where this rule applies small.

For state and variants, prefer **`data-*` attributes** + attribute selectors (e.g. `.l-toast[data-tone="success"]`) over modifier classes — the codebase is uniform on this and it composes better with HTML-first authoring.

## Element CSS Appearances

Some elements support multiple **appearances** — different visual themes for the same structural element. The user picks one appearance and imports a single CSS file.

### File structure

Elements with appearances use a directory instead of a flat file:

```
src/css/elements/
  close-button/              ← element with appearances
    _base.css                ← structural CSS only (layout, sizing, icon, states)
    ring.css                 ← @import './_base.css'; + ring visual skin
    square.css               ← @import './_base.css'; + square visual skin
    circle.css               ← @import './_base.css'; + circle visual skin
  button.css                 ← element without appearances (flat file)
```

### How it works

- **`_base.css`** contains structural/behavioral CSS: layout, sizing, transitions, accessibility, icon rendering. Prefixed with `_` so the build glob `[^_]*.css` excludes it from direct output.
- **Appearance files** (e.g. `ring.css`) use `@import './_base.css'` (inlined by `postcss-import`) + visual skin. Each output is self-contained.
- Appearance is selected via `data-appearance` attribute: `<button class="l-close" data-appearance="ring">`.
- CSS selector pattern: `.l-close:not([data-appearance]), .l-close[data-appearance="ring"]` — applies both when the attribute matches AND when no `data-appearance` is set (so the imported appearance acts as the default).

### Consumer import

```css
@import 'luxen-ui/css/close-button/ring'; /* ring appearance */
@import 'luxen-ui/css/close-button/square'; /* or square */
```

### When to use appearances vs flat files

- Use a **flat file** for elements with a single visual style (most elements).
- Use an **appearance directory** when an element has fundamentally different visual treatments (not just color variants — those stay as `data-variant` selectors inside the same file). Don't split early: keep the treatments in one file until they diverge structurally.

## Writing Element CSS

### Derive state colors instead of hardcoding them

Use `color-mix()` or CSS relative color syntax to compute hover, active, and disabled colors from a base token — don't define separate hardcoded values for each state.

```css
/* Good — derived from base color */
&:hover {
  background-color: color-mix(in oklab, var(--color), white 10%);
}
&:active {
  background-color: oklch(from var(--color) calc(l - 0.05) c h);
}

/* Avoid — hardcoded state colors */
&:hover {
  background-color: #c53d1a;
}
```

This keeps state colors consistent, reduces token sprawl, and adapts automatically when the base color changes.

### Icons: chevrons are CSS masks, content icons are `<l-icon>`

Never write inline `<svg>` / `<path>` markup in an element template. Pick the technique by what the icon is:

- **Indicator chrome the element draws itself** — chevrons, carets, disclosure arrows, submenu indicators, the check and clear (×) glyphs of a picker: a masked box painted with `currentColor`. A consumer recolors it with plain `color` and re-skins it by swapping the mask URL.

  ```css
  .chevron {
    inline-size: 1em;
    block-size: 1em;
    background-color: currentColor;
    mask: var(--l-icon-chevron-down) center / contain no-repeat;
  }
  ```

  **The URL is a system icon token, never a local copy.** `--l-icon-chevron-down`, `-chevron-right`, `-check`, `-close`, `-clear`, `-increment`, `-decrement` (`packages/design-tokens/src/tokens/2-aliases/icons.json`) are the one source: a brand re-skins one on `:root` and every element follows, shadow DOM included (custom properties inherit across the boundary). A public per-element glyph property defaults to the token (`--chevron-icon: var(--l-icon-chevron-down)`). Need a glyph the set lacks and that two elements share? Add a token rather than a second data URI. A single-use glyph (the input calendar, the table sort arrows) may stay local. `tests/elements/icon-tokens-style.browser.test.ts` checks that each site reads its token.

  Drive the color through `color`, never through `background-color: var(--some-color)`. When the element exposes a public color knob, map it onto `color` (`color: var(--caret-color)`) so both work. Reference: `.submenu-indicator` in `dropdown-item.css`.

  When the glyph sits on a **clickable action at the end of a form control** (a picker's clear and chevron, a native date/search action), the box is the hit area and the glyph moves to a `::before` (or the native pseudo-element's own mask size): the box is a square of the control height inside its borders, the glyph is sized by `--l-form-control-icon-size`, and its URL is a **public** custom property (`--chevron-icon`, `--clear-icon`, `--calendar-icon`) so consumers re-skin it without styling the box. References: `.chevron` / `.clear-button` in `shared/styles/picker-core.css` (l-select, l-combobox), the native pickers in `src/css/elements/input.css`.

- **Content icons** — media controls, actions, anything that reads as content rather than as the element's own affordance: `<l-icon name="set:icon">` from an Iconify collection, rendered through the registry tag (see `stories-viewer`), sized with `font-size` and colored with `color`.

Not migrated yet: `l-carousel` arrows (inline `<svg>` carrying `part="button-icon"`, which consumers may style with `fill`); the checkbox and radio marks (baked-white `background-image`, not a mask); the native `.l-select` `::picker-icon` and the `l-disclosure` marker (masks painted through `--caret-color` / `--marker-color` instead of `currentColor`).
