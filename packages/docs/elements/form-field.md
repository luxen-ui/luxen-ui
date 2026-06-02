---
outline: deep
---

<script setup>
import formFieldExample from '../.vitepress/examples/form-field/FormField.html?raw'
import stackedExample from '../.vitepress/examples/form-field/Stacked.html?raw'
</script>

# Form Field <Badge type="tip">&lt;l-form-field&gt;</Badge>

Wraps a label, a control, and optional messages — wiring the accessibility plumbing (`id`/`for`, `aria-describedby`, `aria-invalid`, required marker) and choosing an inline or stacked layout from the control type.

<ElementSpec element="form-field" />

::: code-group

```html [HTML]
<l-form-field>
  <label>I accept the terms and conditions</label>
  <input
    type="checkbox"
    required
  />
  <p class="l-hint">Read them before checking this box.</p>
  <p class="l-error">You must accept the terms to continue.</p>
</l-form-field>
```

:::

Children may appear in any order — the field finds the `<label>`, the control (`input` / `select` / `textarea`), `.l-hint`, and `.l-error` by selector.

## Options

### Layout

Set automatically from the control: toggle controls (checkbox, radio, switch) get an inline layout (control then label); other controls stack (label above).

<ComponentWrapper :html="formFieldExample" />

::: details Code
<<< @/.vitepress/examples/form-field/FormField.html [HTML]
:::

### Stacked

`select`, `input`, and `textarea` stack the label above the control.

<ComponentWrapper :html="stackedExample" />

::: details Code
<<< @/.vitepress/examples/form-field/Stacked.html [HTML]
:::

### Required

Add native `required` to the control. The field reflects `required` and appends the marker to the label.

### Hint

Add a `<p class="l-hint">` for always-visible helper text. The field links it to the control with `aria-describedby`.

### Error

Add a `<p class="l-error">` for the validation message. It stays hidden until the control is invalid after interaction, then the field reveals it, sets `aria-invalid`, adds it to `aria-describedby`, and gives it `role="alert"` so it is announced.

### Unstyled

Add `unstyled` to keep the accessibility wiring while opting out of auto-styling the control — useful for a third-party control or your own styling.

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Label association', Description: 'Links `<label for>` to the control `id`, generating an `id` when missing', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Description', Description: 'Links `.l-hint` and the visible `.l-error` to the control via `aria-describedby`', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
  { Check: 'Error identification', Description: 'Sets `aria-invalid` and announces `.l-error` (`role=alert`) once invalid after interaction', WCAG: '[WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
]" :rules="[
  'Put exactly one control (input / select / textarea) per `l-form-field`',
  'Provide a `<label>`; use `.l-hint` for guidance and `.l-error` for the validation message',
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/form-field';
```

```js [JS]
import 'luxen-ui/form-field';
```

:::

### Attributes & Properties

<ApiTable element="form-field" section="properties" />

### Slots

<ApiTable element="form-field" section="slots" />

### CSS classes

<ApiTable element="form-field" section="cssClasses" />
