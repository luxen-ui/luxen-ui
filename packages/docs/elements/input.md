---
outline: deep
---

<script setup>
import typesExample from '../.vitepress/examples/input/Types.html?raw'
import adornmentsExample from '../.vitepress/examples/input/Adornments.html?raw'
import passwordExample from '../.vitepress/examples/input/Password.html?raw'
import statesExample from '../.vitepress/examples/input/States.html?raw'
import withFieldExample from '../.vitepress/examples/input/WithField.html?raw'
</script>

# Input <Badge type="tip">&lt;input&gt;</Badge>

Inputs let users enter and edit text, numbers, dates, and other single-line values.

<ElementSpec element="input" />

::: code-group

```html [HTML]
<l-form-field>
  <label>Email</label>
  <input
    type="email"
    placeholder="jane@acme.com"
  />
  <p class="l-hint">We'll never share it.</p>
</l-form-field>
```

:::

[`l-form-field`](/elements/form-field) auto-styles a bare text `<input>` and wires the accessibility (label, hint, error, `aria-*`). Standalone, apply `.l-input` to the input yourself.

## Options

### Type

`.l-input` styles every text-like type. `date` and `time` get a custom picker icon; `search` gets a custom clear button — all with zero JavaScript.

<ComponentWrapper :html="typesExample" />

::: details Code
<<< @/.vitepress/examples/input/Types.html [HTML]
:::

### States

Native `disabled` and `readonly`. Invalid is styled via `:user-invalid` (after interaction) or by setting `aria-invalid="true"` — inside `l-form-field` this is managed for you. To disable a group of fields at once, wrap them in `<fieldset disabled>` — see [Form field](./form-field.md#disabled-group).

<ComponentWrapper :html="statesExample" />

::: details Code
<<< @/.vitepress/examples/input/States.html [HTML]
:::

### Size & radius

Override `--height` for the control height and `--border-radius` for the corners.

### Password toggle

Add `password-toggle` on `l-input-group` — a show/hide button is injected when JavaScript loads (`aria-pressed`, localized label, `Eye`/`EyeOff` icon). Without JavaScript the field stays a plain password input.

<ComponentWrapper :html="passwordExample" />

::: details Code
<<< @/.vitepress/examples/input/Password.html [HTML]
:::

## Examples

### Icons & units

A replaced `<input>` can't hold children, so wrap it in `l-input-group`: the group draws the border and the inner input becomes borderless — no class needed. Children render in DOM order, so an `<l-icon>` before the input is a leading adornment, a `<span>` after it is a trailing one.

<ComponentWrapper :html="adornmentsExample" />

::: details Code
<<< @/.vitepress/examples/input/Adornments.html [HTML]
:::

### With a hint

`.l-hint` adds always-visible helper text, linked to the control via `aria-describedby`.

<ComponentWrapper :html="withFieldExample" />

::: details Code
<<< @/.vitepress/examples/input/WithField.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Accessible name', Description: 'Must have an associated `<label>` (wrap the input or use `for`/`id`)', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Input purpose', Description: 'Set `type` and `autocomplete` so the field communicates its purpose and benefits from autofill', WCAG: '[WCAG 1.3.5](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose), [RGAA 11.13](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.13)' },
  { Check: 'Focus visible', Description: 'Keyboard focus shows a 2px outline via `:focus-visible`', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Errors identified', Description: '`aria-invalid` marks the field; pair it with a visible message linked via `aria-describedby`', WCAG: '[WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
  { Check: 'Required state', Description: 'Native `required` communicates a mandatory field to assistive tech', WCAG: '[WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions), [RGAA 11.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.10)' },
]" :rules="[
  'Always pair the input with a `<label>` — wrap the input or link with `for`/`id`',
  'Never rely on `placeholder` as the label — it disappears on input and fails contrast',
  'Set the most specific `type` (`email`, `tel`, `url`, `number`, `search`, `date`, `time`) for the right keyboard and validation',
  'Adornment icons inside `l-input-group` are decorative — never put the field label in one; authored adornment buttons need an `aria-label` (the injected password toggle handles its own)',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the input' },
  { Key: 'Esc', Description: 'On `type=search`, clears the field (native)' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/input';
```

```js [JS (input group)]
import 'luxen-ui/input-group';
```

:::

The CSS covers everything except the password toggle; the JS import upgrades `l-input-group` with its behavior.

### Attributes & Properties

<ApiTable element="input" section="attributes" />

### CSS classes

<ApiTable element="input" section="cssClasses" />

### CSS custom properties

<ApiTable element="input" section="cssProperties" />

### Input group

<ApiTable element="input-group" section="properties" />

<ApiTable element="input-group" section="cssClasses" />
