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

## Element Reference Metadata (keep it in sync with the code)

The reference data shown in the docs (`<ApiTable element="…" section="…" />`, `<ElementSpec element="…" />`) and shipped to AI consumers via the `luxen-ui/metadata` export is **generated from the element source**, not hand-written. The pipeline is `cem analyze` (config: `custom-elements-manifest.config.js`, plugins: `scripts/cem-plugins/*`) → `scripts/normalize-metadata.mjs` → `dist/metadata/*.json`, validated by `scripts/check-metadata.mjs` (runs in `build`; fails the build on gaps). Regenerate locally with `pnpm run metadata`.

**This means every element's public API must be described in its source.** When you add or modify an element, update its metadata in the same change:

### Custom elements (`progressive` / `custom` / `shadow`)

Maintain the JSDoc block above the `export class …` declaration. The class **must** carry a `@customElement l-<name>` tag (or decorator) — without it the analyzer treats the class as plain and extracts **nothing**. Document the full public surface with these tags:

- `@summary` — one-line description (required for `inSkill` elements)
- `@cssproperty [--name=default] - description` — public CSS custom property (bracket-default syntax; never document `--_private` ones)
- `@event name - description` — every event the element emits (write "Not cancelable" / "Cancelable" — the word is parsed)
- `@slot name - description`, `@csspart name - description`
- `@attribute name - a | b — description` — public `data-*` or HTML attributes (reactive `@property` fields are picked up automatically; use `@attribute` only for non-property attributes)
- `@cssClass .l-<name>-<child> - description` — internal light-DOM classes (custom/progressive only)
- `@command --name - description` — Invoker commands (e.g. dialog/drawer)

### Native elements (`native` — CSS only, no Lit class)

A CSS-only native element has no class for the analyzer to read, so it **must** ship a sidecar `src/html/elements/<name>/<name>.meta.ts` — a JSDoc-only class. **When you create a new native element, create its `.meta.ts`. When you change a native element's CSS API, update its `.meta.ts`.** For `inSkill` native elements this is enforced: `check-metadata.mjs` fails the build if the sidecar is missing. See `src/html/elements/button/button.meta.ts` for the template:

```ts
/**
 * @summary Buttons trigger actions such as submitting forms or navigating.
 * @nativeElement button          // host HTML tag → marks the element native
 * @selector .l-button            // consumer-facing selector
 * @attribute data-variant - primary | destructive — Visual variant.
 * @cssproperty [--height=32px] - Button height.
 * @cssClass .l-button - Base button style.
 */
// oxlint-disable-next-line typescript/no-extraneous-class -- JSDoc-only metadata carrier.
export class ButtonMeta {}
```

Keep the `.meta.ts` in sync with the element's `.css` file (the CSS custom properties, `data-*` selectors, and classes you actually expose).

### Registry

Every element has an entry in `elements.json` with a `type` field (`native` | `progressive` | `custom` | `shadow`) — add it for new elements; it drives metadata extraction and the `<ElementSpec>` banner.

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

export class Popover extends LuxenElement {
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
