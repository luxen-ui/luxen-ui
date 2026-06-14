---
outline: deep
---

<script setup>
import statesExample from '../.vitepress/examples/radio/States.html?raw'
import groupExample from '../.vitepress/examples/radio/Group.html?raw'
import sizingExample from '../.vitepress/examples/radio/Sizing.html?raw'
import withFieldExample from '../.vitepress/examples/radio/WithField.html?raw'
</script>

# Radio <Badge type="tip">&lt;input&gt;</Badge>

Radios let users pick a single option from a set of mutually exclusive choices.

<ElementSpec element="radio" />

::: code-group

```html [HTML]
<fieldset>
  <legend>Plan</legend>
  <l-form-field>
    <label>Free</label>
    <input
      type="radio"
      name="plan"
      value="free"
      checked
    />
  </l-form-field>
  <l-form-field>
    <label>Pro</label>
    <input
      type="radio"
      name="plan"
      value="pro"
    />
  </l-form-field>
</fieldset>
```

:::

[`l-form-field`](/elements/form-field) auto-styles a bare `<input type="radio">` and wires the accessibility (label, hint, error, `aria-*`); standalone, apply `.l-radio` to the input yourself. Radios that share a `name` form a group — selecting one deselects the others, and arrow keys move between them. Wrap the group in a `<fieldset>` with a `<legend>` for the shared question.

For two opposite options where neither is a sensible default, prefer a single checkbox or a switch. For more than ~5 options, prefer a [select](/elements/select).

## Options

### Selected

Native `checked` attribute. Only one radio per `name` group can be selected.

### Disabled

Native `disabled` attribute.

### States

<ComponentWrapper :html="statesExample" />

::: details Code
<<< @/.vitepress/examples/radio/States.html [HTML]
:::

### Invalid

Styled via `:user-invalid` (after interaction) or by setting `aria-invalid="true"`. Inside `l-form-field` this is managed for you.

### Size & accent

Override `--size` for the box and `--accent` for the selected fill.

<ComponentWrapper :html="sizingExample" />

::: details Code
<<< @/.vitepress/examples/radio/Sizing.html [HTML]
:::

## Examples

### Group

Wrap the group in a `<fieldset>` with a `<legend>` so assistive tech announces the shared question.

<ComponentWrapper :html="groupExample" />

::: details Code
<<< @/.vitepress/examples/radio/Group.html [HTML]
:::

### With a hint

`l-form-field` wires the accessibility (label, hint, `aria-*`). Each option is its own field; group them inside a `<fieldset>`.

<ComponentWrapper :html="withFieldExample" />

::: details Code
<<< @/.vitepress/examples/radio/WithField.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Uses native `<input type=radio>` — built-in `radio` semantics, grouped into a `radiogroup` by a shared `name` inside a `fieldset`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Group name', Description: 'Wrap the group in `<fieldset>` with a `<legend>` so the shared question is announced', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.5)' },
  { Check: 'Accessible name', Description: 'Each radio must have an associated `<label>` (wrap the input or use `for`/`id`)', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Target size', Description: 'The label is part of the click target; keep the interactive area at least 24×24px', WCAG: '[WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)' },
  { Check: 'Focus visible', Description: 'Keyboard focus shows a 2px outline via `:focus-visible`', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Required state', Description: 'Native `required` on the group communicates a mandatory choice to assistive tech', WCAG: '[WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
]" :rules="[
  'Always pair each radio with a `<label>` — wrap the input or link with `for`/`id`',
  'Group related radios with a shared `name` and wrap them in `<fieldset>` + `<legend>`',
  'Pre-select a sensible default unless the choice must be deliberate',
  'For a single on/off setting, use a checkbox or a switch — not one radio',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus into the group (to the selected radio, or the first if none is selected)' },
  { Key: 'Arrow keys', Description: 'Moves between radios in the group and selects the focused one' },
  { Key: 'Space', Description: 'Selects the focused radio' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/radio';
```

:::

### Attributes & Properties

<ApiTable element="radio" section="attributes" />

### CSS classes

<ApiTable element="radio" section="cssClasses" />

### CSS custom properties

<ApiTable element="radio" section="cssProperties" />
