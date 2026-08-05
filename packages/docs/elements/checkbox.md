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
  { Check: 'Role', Description: 'Uses native `<input type=checkbox>` — built-in `checkbox` semantics and `checked`/`mixed` states', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Accessible name', Description: 'Must have an associated `<label>` (wrap the input or use `for`/`id`)', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Target size', Description: 'The label is part of the click target; keep the interactive area at least 24×24px', WCAG: '[WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)' },
  { Check: 'Focus visible', Description: 'Keyboard focus shows a 2px outline via `:focus-visible`', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Required state', Description: 'Native `required` communicates a mandatory field to assistive tech', WCAG: '[WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
]" :rules="[
  'Always pair the checkbox with a `<label>` — wrap the input or link with `for`/`id`',
  'Use `indeterminate` only for the parent of a group, never as a third user-selectable value',
  'For a single setting applied immediately, use a switch instead of a checkbox',
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
