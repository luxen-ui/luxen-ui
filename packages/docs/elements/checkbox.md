---
outline: deep
---

<script setup>
import { onMounted } from 'vue'
import statesExample from '../.vitepress/examples/checkbox/States.html?raw'
import sizingExample from '../.vitepress/examples/checkbox/Sizing.html?raw'
import withFieldExample from '../.vitepress/examples/checkbox/WithField.html?raw'
import errorExample from '../.vitepress/examples/checkbox/Error.html?raw'

// `indeterminate` is a DOM property, not an attribute — set it for the States demo.
onMounted(() => {
  const el = document.getElementById('demo-indeterminate')
  if (el) el.indeterminate = true
})
</script>

# Checkbox <Badge type="tip">&lt;input&gt;</Badge>

Checkboxes let users select one or more options, or toggle a single setting on or off.

<ElementSpec element="checkbox" />

::: code-group

```html [HTML]
<l-form-field>
  <label>Subscribe to the newsletter</label>
  <input type="checkbox" />
  <p class="l-hint">One email a month, unsubscribe anytime.</p>
</l-form-field>
```

:::

[`l-form-field`](/elements/form-field) auto-styles a bare `<input type="checkbox">` and wires the accessibility (label, hint, error, `aria-*`). Standalone, apply `.l-checkbox` to the input yourself.

For a single setting that takes effect **immediately** (no Save button), use a switch instead.

## Options

### Checked

Native `checked` attribute.

### Disabled

Native `disabled` attribute.

To disable a whole group at once, wrap it in `<fieldset disabled>` — see [Form field](./form-field.md#disabled-group).

### States

<ComponentWrapper :html="statesExample" />

::: details Code
<<< @/.vitepress/examples/checkbox/States.html [HTML]
:::

### Invalid

Styled via `:user-invalid` (after interaction) or by setting `aria-invalid="true"`. Inside `l-form-field` this is managed for you.

### Size & accent

Override `--size` for the box and `--accent` for the checked fill.

<ComponentWrapper :html="sizingExample" />

::: details Code
<<< @/.vitepress/examples/checkbox/Sizing.html [HTML]
:::

## Examples

### With a hint

`.l-hint` adds always-visible helper text, linked to the control via `aria-describedby`.

<ComponentWrapper :html="withFieldExample" />

::: details Code
<<< @/.vitepress/examples/checkbox/WithField.html [HTML]
:::

### With an error

`.l-error` holds the validation message — hidden until the field is invalid, then revealed with `aria-invalid` and announced (`role="alert"`). `invalid` on the field forces the state here for the preview.

<ComponentWrapper :html="errorExample" />

::: details Code
<<< @/.vitepress/examples/checkbox/Error.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Focus ring on keyboard focus', Description: 'A 2px outline via `:focus-visible`', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
]" :rules="[
  { Check: 'Label the field', Description: 'Wrap the input in a `<label>`, or link one with `for` / `id`', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Use a native `<input type=&quot;checkbox&quot;>`', Note: 'It brings built-in `checkbox` semantics and the `checked` / `mixed` states', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Keep the target at least 24×24px', Note: 'The label is part of the click target', WCAG: '[WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)' },
  { Check: 'Mark required fields with `required`', Description: 'Native `required` communicates a mandatory field to assistive tech', WCAG: '[WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
  { Check: 'Reserve `indeterminate` for a group’s parent', Description: 'Never offer it as a third user-selectable value' },
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Space', Description: 'Toggles the checkbox' },
  { Key: 'Tab', Description: 'Moves focus to the next focusable element' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/checkbox';
```

:::

### Attributes & Properties

<ApiTable element="checkbox" section="attributes" />

### CSS classes

<ApiTable element="checkbox" section="cssClasses" />

### CSS custom properties

<ApiTable element="checkbox" section="cssProperties" />
