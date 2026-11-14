---
outline: deep
---

<script setup>
import formFieldExample from '../.vitepress/examples/form-field/FormField.html?raw'
import stackedExample from '../.vitepress/examples/form-field/Stacked.html?raw'
</script>

# Form Field <Badge type="tip">&lt;l-form-field&gt;</Badge>

Wraps a label, a control, and optional messages — wiring the accessibility plumbing (`id`/`for`, `aria-describedby`, `aria-invalid`, required indicator) and choosing an inline or stacked layout from the control type.

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

### Disabled

Add native `disabled` to the control. The field greys its label, hint and required indicator to match.

### Disabled group

Wrap the fields in `<fieldset disabled>` to disable a whole group at once — the platform's own mechanism, and the usual shape for a radio group, where the `<legend>` is the group's label. Every control inside is disabled and excluded from submission; the legend, option labels and hint grey out with them.

```html
<fieldset disabled>
  <legend>Notification preference</legend>

  <l-form-field>
    <label>All new messages</label>
    <input
      type="radio"
      name="notify"
      checked
    />
  </l-form-field>

  <l-form-field>
    <label>Direct messages only</label>
    <input
      type="radio"
      name="notify"
    />
  </l-form-field>

  <p class="l-hint">You can change this later.</p>
</fieldset>
```

### Unstyled

Add `unstyled` to keep the accessibility wiring while opting out of auto-styling the control — useful for a third-party control or your own styling.

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Label associated with the control', Description: 'Links `<label for>` to the control `id`, generating an `id` when missing', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Hint and error linked to the control', Description: 'Links `.l-hint` and the visible `.l-error` via `aria-describedby`', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
  { Check: 'Errors announced after interaction', Description: 'Sets `aria-invalid` and announces `.l-error` (`role=&quot;alert&quot;`) once the control is invalid', WCAG: '[WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
]" :rules="[
  { Check: 'Label the field', Description: 'Put a `<label>` in the `l-form-field`' },
  { Check: 'Wrap exactly one control', Description: 'One input, select or textarea per `l-form-field`' },
  { Check: 'Use `.l-hint` and `.l-error` for messages', Description: '`.l-hint` for guidance, `.l-error` for the validation message' },
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
