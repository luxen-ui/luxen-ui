---
outline: deep
---

<script setup>
import stepperDefault from '../.vitepress/examples/input-stepper/InputStepperDefault.html?raw'
import stepperMinMax from '../.vitepress/examples/input-stepper/InputStepperMinMax.html?raw'
import stepperDisabled from '../.vitepress/examples/input-stepper/InputStepperDisabled.html?raw'
import stepperRounded from '../.vitepress/examples/input-stepper/InputStepperRounded.html?raw'
import stepperSizes from '../.vitepress/examples/input-stepper/InputStepperSizes.html?raw'
import stepperRoller from '../.vitepress/examples/input-stepper/InputStepperRoller.html?raw'
import notDefinedCss from 'luxen-ui/css/input-stepper/default?raw'
</script>

# Input stepper <Badge type="tip">&lt;l-input-stepper&gt;</Badge>

A stepper control that enhances a native `<input type="number">` with decrement/increment buttons and an animated number track.

<ElementSpec element="input-stepper" />

## Options

<ComponentWrapper :html="stepperDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-stepper/InputStepperDefault.html [HTML]
:::

### Appearance

Pick a visual style via `appearance`. Each appearance has its own CSS import.

#### Default

Bordered box with inline buttons.

<ComponentWrapper :html="stepperDefault" />

::: code-group

```css [CSS]
@import 'luxen-ui/css/input-stepper/default';
```

:::

#### Rounded

Circular standalone buttons with no container border — Airbnb-style.

<ComponentWrapper :html="stepperRounded" />

::: code-group

```css [CSS]
@import 'luxen-ui/css/input-stepper/rounded';
```

:::

### Size

Set the `size` attribute: `xs`, `sm`, `md` (default), `lg`, `xl`.

<ComponentWrapper :html="stepperSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-stepper/InputStepperSizes.html [HTML]
:::

### Not defined

Before JS loads (`:not(:defined)`), CSS provides a styled fallback with zero layout shift.

<NotDefinedPreview :css="notDefinedCss" html='<l-input-stepper size="xs"><input type="number" value="1" /></l-input-stepper><l-input-stepper size="sm"><input type="number" value="1" /></l-input-stepper><l-input-stepper><input type="number" value="1" /></l-input-stepper><l-input-stepper size="lg"><input type="number" value="1" /></l-input-stepper><l-input-stepper size="xl"><input type="number" value="1" /></l-input-stepper>' />

::: details Code
::: code-group

```html [HTML]
<l-input-stepper>
  <input
    type="number"
    value="1"
  />
</l-input-stepper>
```

:::

The CSS reserves space for the stepper buttons via `padding-inline` and matches the exact dimensions of the hydrated component. Once defined, the custom element replaces the padding with its own buttons.

### Min / Max

Constrain the value range via `min` and `max` on the `<input>`.

<ComponentWrapper :html="stepperMinMax" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-stepper/InputStepperMinMax.html [HTML]
:::

### Disabled

Native `disabled` attribute on the `<input>`.

<ComponentWrapper :html="stepperDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-stepper/InputStepperDisabled.html [HTML]
:::

### Roller

Enable the animated number roller overlay with `with-roller`.

<ComponentWrapper :html="stepperRoller" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-stepper/InputStepperRoller.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Uses native `<input type=&quot;number&quot;>` and native `<button>` elements — built-in semantics', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Accessible name', Description: 'The input must have an associated label via `<label>` or `aria-label`', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Disabled state', Description: 'Buttons disabled at min/max bounds; entire stepper disabled via `disabled` on the input', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Form integration', Description: 'Native `<input>` participates in form submission and validation directly', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
]" :rules="[
  'Wrap the stepper with a visible `<label>` or provide `aria-label` on the input element',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'ArrowUp', Description: 'Increments the value (native number input behavior)' },
  { Key: 'ArrowDown', Description: 'Decrements the value (native number input behavior)' },
  { Key: 'Tab', Description: 'Moves focus between the decrement button, input, and increment button' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/input-stepper';
```

```css [CSS]
@import 'luxen-ui/css/input-stepper/default';
/* or */
@import 'luxen-ui/css/input-stepper/rounded';
```

:::

### Attributes & Properties

<ApiTable element="input-stepper" section="properties" />

### Events

<ApiTable element="input-stepper" section="events" />

### CSS custom properties

<ApiTable element="input-stepper" section="cssProperties" />
