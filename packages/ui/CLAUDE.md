# AGENTS.md

## Element Types

Luxen elements fall into four buckets. Pick one at creation time — it drives the render strategy and the `<ElementSpec type="…">` value in the doc.

| Type            | Render strategy                                                                                                           | When to pick                                                                                                                       | `ElementSpec`        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Native**      | CSS only, no TS file                                                                                                      | Styling a standard HTML element with CSS (e.g. `<button>`, `<details>`, `<progress>`)                                              | `type="native"`      |
| **Progressive** | Lit + `createRenderRoot() { return this }` + `querySelector` on a native child (`<input>`, `<button>`…) usable without JS | Upgrading a native element with richer behavior while keeping an HTML-first fallback (e.g. `<l-input-stepper>`, `<l-tabs>`)        | `type="progressive"` |
| **Custom**      | Lit + `createRenderRoot() { return this }`, no native element wrapped                                                     | New custom tag in light DOM holding text or imperative children — no native upgrade (e.g. `<l-badge>`, `<l-divider>`, `<l-toast>`) | `type="custom"`      |
| **Shadow DOM**  | Lit with default Shadow DOM                                                                                               | Encapsulated rendering for UI patterns where SSR isn't required (e.g. `<l-dialog>`, `<l-tooltip>`)                                 | `type="shadow"`      |

**Rule of thumb**: if the element queries a native child it wraps, it's `progressive`. If it's light-DOM without wrapping a native element, it's `custom`. Otherwise, it's `shadow`.

When adding a new element, also update the table in `README.md` and the `<ElementTypeGrid />` data in `packages/docs/.vitepress/components/ElementTypeGrid.vue`.

## Element Styles (Shadow DOM)

Shadow-DOM elements load their styles from real `.css` files imported via Vite's `?inline` query, not from Lit `css\`...\``templates. This lets the consumer's`luxen-ui/vite-plugin`rewrite`--l-\*` tokens at build time — there is no runtime token-prefix mechanism.

Two patterns, picked by reuse:

**Element-private CSS** — the file is imported by exactly one element. Inline the `unsafeCSS()` call in the element file:

```ts
// popover.ts
import { unsafeCSS } from 'lit';
import hostStyles from '../../shared/styles/host.styles';
import rawStyles from './popover.css?inline';

const styles = unsafeCSS(rawStyles);

export class LuxenPopover extends LuxenElement {
  static override styles = [hostStyles, styles];
}
```

**Shared CSS** — the file is imported by 2+ elements (e.g. `host.css`, `dialog.css` shared by `dialog` + `drawer`). Wrap it in a `*.styles.ts` module that calls `unsafeCSS()` once, so all importers share the same `CSSResult` (one constructed `CSSStyleSheet`, not one per importer — avoids [WebAwesome #1812](https://github.com/shoelace-style/webawesome/issues/1812)):

```ts
// dialog.styles.ts
import { unsafeCSS } from 'lit';
import raw from './dialog.css?inline';
export default unsafeCSS(raw);
```

Rule: never call `unsafeCSS()` at the consumption site for a shared CSS file. Always wrap shared CSS in a single module. Element-private CSS is fine to inline because there is only ever one consumer.

## Dark Mode

All components must support dark mode. Global design tokens in `_tokens.css` use the `light-dark()` CSS function to define both light and dark values. Components get dark mode for free by referencing these semantic tokens — never hardcode colors for a single mode.

`light-dark()` does not reliably resolve nested relative color functions like `oklch(from ...)`. For complex color derivations, use `@media (prefers-color-scheme: dark)` instead.

## Design Tokens

### Base tokens

Base tokens for colors, radius, spacing, transitions, etc. come from Tailwind CSS v4 (`node_modules/tailwindcss/index.css`). Luxen semantic tokens build on top of these base values.

### Semantic tokens only

Components must always reference semantic design tokens from `src/css/design-tokens/_tokens.css` — never use Tailwind palette colors (e.g. `var(--color-gray-700)`) directly. This ensures dark mode, theming, and future token changes propagate automatically.

### Naming convention

| Scope                      | Prefix           | Example                                  | Where defined                       |
| -------------------------- | ---------------- | ---------------------------------------- | ----------------------------------- |
| Global semantic token      | `--l-`           | `--l-color-text-primary`, `--l-backdrop` | `src/css/design-tokens/_tokens.css` |
| Private component variable | `--_`            | `--_ring-tickness`, `--_button-size-md`  | Element CSS file                    |
| Public local variable      | `--` (no prefix) | `--width`, `--size`, `--icon-color`      | Element CSS file                    |

### Public local variable naming

Public local variables are the component's API — the knobs consumers tweak. Keep names **simple and DX-friendly**:

- **Good**: `--width`, `--size`, `--color`, `--icon-size`, `--border-radius`
- **Avoid**: `--background-color`, `--padding-inline`, `--font-size` (too implementation-specific — unless the property is genuinely the main thing consumers need to control)

The test: if a name reads like a CSS property, it's probably too low-level. Prefer semantic names that describe _what_ the consumer is adjusting.

### Token descriptions

Every global token in `_tokens.css` must have a CSS comment above it describing its intended usage. The description should be comprehensive enough for an AI agent to decide when to use it.

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
- Use an **appearance directory** when an element has fundamentally different visual treatments (not just color variants — those stay as modifier classes inside the same file).

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

### Use modern CSS features

Prefer modern CSS when applicable and Baseline available. Reference list:

- **At-Rules**: `@container`, `@else`, `@function`, `@keyframes`, `@layer`, `@mixin`, `@position-try`, `@property`, `@scope`, `@starting-style`, `@supports`, `@view-transition`, `@when`
- **Functions**: `anchor()`, `attr()`, `circle()`, `clamp()`, `color(from)`, `color-mix()`, `contrast-color()`, `cos()`, `env()`, `fit-content()`, `if()`, `image-set()`, `inherit()`, `light-dark()`, `linear()`, `max()`, `min()`, `polygon()`, `random()`, `repeat()`, `scroll()`, `sibling-count()`, `sibling-index()`, `sin()`, `tan()`, `var()`, `view()`
- **Properties**: `accent-color`, `animation-composition`, `animation-range`, `animation-timeline`, `aspect-ratio`, `color-scheme`, `contain-intrinsic-size`, `container-type`, `content-visibility`, `font-palette`, `forced-color-adjust`, `interpolate-size`, `reading-flow`, `scroll-behavior`, `scrollbar-gutter`, `text-wrap`
- **Pseudo-elements**: `::backdrop`, `::checkmark`, `::column`, `::details-content`, `::grammar-error`, `::highlight()`, `::part()`, `::picker()`, `::picker-icon`, `::scroll-button()`, `::scroll-marker()`, `::slotted()`, `::spelling-error`, `::target-text`, `::view-transition-group()`, `::view-transition-image-pair()`, `::view-transition-new()`, `::view-transition-old()`
- **Selectors**: `:active-view-transition`, `:active-view-transition-type()`, `:focus-visible`, `:has()`, `:heading`, `:heading()`, `:is()`, `:popover-open`, `:scope`, `:state()`, `:target-current`, `:user-invalid`, `:user-valid`, `:where()`
