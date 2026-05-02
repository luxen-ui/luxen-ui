---
outline: deep
---

<script setup>
import selectExample from '../.vitepress/examples/select/Select.html?raw'

const events = [
  { Event: 'change', Description: 'Fired when the selected option changes' },
  { Event: 'input', Description: 'Fired when the selection changes (same as `change` for `<select>`)' },
]
</script>

# Select <Badge type="tip">&lt;select&gt;</Badge>

Selects are used to pick a single option from a dropdown list. Commonly used in forms for choosing categories, countries, or any predefined set of values.

<ElementSpec
  tag="select"
  type="native"
/>

## Options

<ComponentWrapper :html="selectExample" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/Select.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Uses native `<select>` — built-in `combobox`/`listbox` semantics', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Accessible name', Description: 'Must have an associated `<label>` element', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Disabled state', Description: 'Native `disabled` attribute prevents interaction and announces as disabled', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Required state', Description: 'Native `required` attribute communicates mandatory field to assistive tech', WCAG: '[WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
]" :rules="[
  'Always pair the `<select>` with a visible `<label>` element using `for`/`id`',
  'Use native `<option>` elements for choices — the browser handles all ARIA semantics',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Enter', Description: 'Opens the option list or confirms selection' },
  { Key: 'Space', Description: 'Opens the option list' },
  { Key: 'ArrowDown', Description: 'Moves to the next option' },
  { Key: 'ArrowUp', Description: 'Moves to the previous option' },
  { Key: 'Tab', Description: 'Moves focus to the next focusable element' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/select';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'disabled', Description: 'Disables the select' },
  { Attribute: 'required', Description: 'Marks the field as required' },
  { Attribute: 'multiple', Description: 'Allows multiple selections' },
]" />

### Events

<ApiTable :data="events" />

### CSS classes

<ApiTable :data="[
  { Class: '.l-select', Description: 'Base select element with `appearance: base-select`' },
  { Class: '.l-select-item', Description: 'Option styling with checkmark indicator' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--border-radius', Description: 'Border radius (default: 4px)' },
  { Name: '--border-color', Description: 'Border color (adapts to light/dark)' },
]" />
