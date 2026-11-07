---
outline: false
aside: false
---

<script setup>
import focusStrokeExample from '../.vitepress/examples/form-tokens/FocusStroke.html?raw'
</script>

# Design Tokens

<TokenNav />

<!-- Each section hides itself when the filter leaves it without a token row. -->

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

## Sizing

Standard interactive control heights.

<DesignTokens category="sizing" />

</section>

<section class="not-has-[[data-viz]]:hidden">

## Spacing

Single-source scale: `--l-spacing` is the unit, every step is derived via `calc(var(--l-spacing) * N)`. Override `--l-spacing` to scale the whole UI's rhythm without touching individual steps.

<DesignTokens category="spacing" />

</section>

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

### Focus

The focused text field — input, textarea, select, `l-input-group`, `l-select`, `l-combobox` and `l-prose-editor` — in the `--l-focus-ring` color (the invalid color on an invalid field). A stroke wider than the resting border is drawn inward, over the border: the control keeps its size and its text does not move.

<DesignTokens category="form" group="focus" />

#### Crisp stroke, no halo

A 2px stroke and no halo, from tokens alone. Tab through the fields:

```css
:root {
  --l-form-control-focus-border-width: 2px;
  --l-form-control-focus-halo-width: 0;
}
```

<ComponentWrapper :html="focusStrokeExample" />

::: details Code
<<< @/.vitepress/examples/form-tokens/FocusStroke.html [HTML]
:::

To give text fields the same thickness as the focus ring of buttons and toggles, point the stroke at `--l-focus-ring-width`:

```css
:root {
  --l-focus-ring-width: 2px;
  --l-form-control-focus-border-width: var(--l-focus-ring-width);
  --l-form-control-focus-halo-width: 0;
}
```

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
