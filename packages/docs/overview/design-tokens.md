---
outline: false
aside: false
---

# Design Tokens

Luxen declares every token on `:root` inside `@layer theme`, the layer Tailwind v4 uses for its own theme variables. A theme you write on `:root` outside any layer overrides them wherever it loads, before or after Luxen's CSS, with no extra specificity:

```css
:root {
  --l-color-bg-fill-brand: light-dark(var(--l-color-rose-600), var(--l-color-rose-400));
}
```

A theme inside a layer wins too when that layer comes after `theme`. Luxen's CSS opens with `@layer theme, base, components;` and Tailwind's with the same order plus `utilities`, so `base`, `components` and `utilities` all do, provided Luxen or Tailwind loads before your first layered rule.

<TokenNav />

<!-- Each section hides itself when the filter leaves it without a token row.
     The two groups also tell TokenNav where to draw its separator. -->

<div class="not-has-[[data-viz]]:hidden" data-token-group="semantic">

<div class="mt-8 -mb-8 text-sm font-semibold tracking-wider text-(--vp-c-brand-1) uppercase">Semantic tokens</div>

<section class="not-has-[[data-viz]]:hidden">

## Color

<section class="not-has-[[data-viz]]:hidden">

### Text

<DesignTokens category="text" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Surface

<DesignTokens category="surface" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Border

<DesignTokens category="border" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Fill

Three-tier status scale ordered by visual weight: **soft** (palest tint),
**subtle** (clearly tinted), **strong** (full-intensity solid).

<DesignTokens category="fill" />

</section>

</section>

<section class="not-has-[[data-viz]]:hidden">

## Shadow

Elevation scale for floating surfaces, ordered by how far they lift off the page: **sm** (resting cards), **md** (overlays anchored to a trigger), **lg** (detached floating panels). Each shadow's color uses `light-dark()` so it deepens in dark mode, where a faint black cast would otherwise disappear.

<DesignTokens category="shadow" />

</section>

<section class="not-has-[[data-viz]]:hidden">

## Focus

The focus indicator, in one color and two shapes: a ring around most controls, a thicker border in the focus color on text fields (its tokens are under [Field focus](#field-focus)). Usage, theming and accessibility: [Focus guide](/foundations/focus).

<DesignTokens category="focus" />

</section>

<section class="not-has-[[data-viz]]:hidden">

## Sizing

Standard interactive control heights.

<DesignTokens category="sizing" />

</section>

<section class="not-has-[[data-viz]]:hidden">

## Spacing

Single-source scale: `--l-spacing` is the unit, every step is derived via `calc(var(--l-spacing) * N)`. Override `--l-spacing` to scale the whole UI's rhythm without touching individual steps.

<DesignTokens category="spacing" />

</section>

</div>

<div class="not-has-[[data-viz]]:hidden" data-token-group="component">

<div class="mt-20 -mb-8 text-sm font-semibold tracking-wider text-(--vp-c-brand-1) uppercase">Component tokens</div>

<section class="not-has-[[data-viz]]:hidden">

## Form controls

Shared by every form control and the `l-form-field` wrapper. Each token is shown on a live control at its **default**, then with **only that token** forced to a violet highlight — revealing exactly what it **touches**.

<section class="not-has-[[data-viz]]:hidden">

### All controls

Shared by text fields and the checkbox and radio box (the invalid border also rings the switch).

<DesignTokens category="form" group="control" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Text fields

Input, textarea and select only — toggles are sized by `--l-form-control-toggle-size`.

<DesignTokens category="form" group="field" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Field focus

Text fields: input, textarea, select, `l-input-group`, `l-select`, `l-combobox` and `l-prose-editor`. The ring around other controls is under [Focus](#focus).

<DesignTokens category="form" group="focus" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Toggles

Checkbox, radio and switch.

<DesignTokens category="form" group="toggle" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Disabled state

Shared by every control: text fields, checkbox, radio and switch.

<DesignTokens category="form" group="disabled" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Labels & messages

Parts of an `l-form-field`.

<DesignTokens category="form" group="labels" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Field layout

<DesignTokens category="form" group="layout" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Search match

Highlighted query match in `l-combobox` and searchable `l-select` options.

<DesignTokens category="form" group="match" />

</section>

</section>

<section class="not-has-[[data-viz]]:hidden">

## Components

Component tokens for the elements outside form controls, one family per section.

<section class="not-has-[[data-viz]]:hidden">

### Button

Every `.l-button`, including `l-button-group` segments, button-style `.l-radio-group` options and `l-alert-dialog` actions. Defaults to the form-control radius and border width, so a button matches the field beside it.

<DesignTokens category="button" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Popover & menus

Panels anchored to a trigger (`l-dropdown`, `l-popover`, the `l-select` / `l-combobox` listbox, the native `.l-select` picker) and the rows inside them.

<DesignTokens category="popover" />

</section>

<section class="not-has-[[data-viz]]:hidden">

### Tooltip

<DesignTokens category="tooltip" />

</section>

</section>

</div>
