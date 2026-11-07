---
aside: false
outline: deep
---

<script setup>
import FormsOverview from '../.vitepress/components/FormsOverview.vue'
import focusStrokeExample from '../.vitepress/examples/forms/FocusStroke.html?raw'
</script>

# Forms overview <Badge type="tip">Visual tests</Badge>

Flip a state and every form control updates at once — a quick way to check that labels, hints, errors, required indicators, disabled and invalid styling stay consistent across the whole form system.

<FormsOverview />

## Focus

A focused text field takes the `--l-focus-ring` color on its border, plus a soft halo. Reshape it with two tokens: `--l-form-control-focus-border-width` for the stroke, drawn inward so the field never changes size, and `--l-form-control-focus-halo-width` for the halo. A crisp 2px stroke with no halo — tab through the fields:

```css
:root {
  --l-form-control-focus-border-width: 2px;
  --l-form-control-focus-halo-width: 0;
}
```

<ComponentWrapper :html="focusStrokeExample" />

::: details Code
<<< @/.vitepress/examples/forms/FocusStroke.html [HTML]
:::

Checkboxes, radios, switches and buttons draw a ring around themselves instead, sized by `--l-focus-ring-width`. For one focus thickness everywhere, point the text-field stroke at it:

```css
:root {
  --l-focus-ring-width: 2px;
  --l-form-control-focus-border-width: var(--l-focus-ring-width);
  --l-form-control-focus-halo-width: 0;
}
```
