---
outline: deep
---

<script setup>
import stepperDefault from '../.vitepress/examples/input-stepper/InputStepperDefault.html?raw'
import stepperMinMax from '../.vitepress/examples/input-stepper/InputStepperMinMax.html?raw'
import stepperDisabled from '../.vitepress/examples/input-stepper/InputStepperDisabled.html?raw'
import stepperRounded from '../.vitepress/examples/input-stepper/InputStepperRounded.html?raw'
import stepperPill from '../.vitepress/examples/input-stepper/InputStepperPill.html?raw'
import stepperSizes from '../.vitepress/examples/input-stepper/InputStepperSizes.html?raw'
import stepperRoller from '../.vitepress/examples/input-stepper/InputStepperRoller.html?raw'
import stepperNotDefined from '../.vitepress/examples/input-stepper/InputStepperNotDefined.html?raw'
import defaultRawCss from 'luxen-ui/css/input-stepper/default?raw'
import roundedRawCss from 'luxen-ui/css/input-stepper/rounded?raw'
import pillRawCss from 'luxen-ui/css/input-stepper/pill?raw'

// The preview renders inside an isolated iframe with no Tailwind, so the column
// layout has to travel with the stylesheet rather than as utility classes.
const notDefinedCss = [
  defaultRawCss,
  roundedRawCss,
  pillRawCss,
  `.cols { display: flex; gap: 24px; align-items: flex-start; }
   .col { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }`,
].join('\n')
</script>

# Input stepper <Badge type="tip">&lt;l-input-stepper&gt;</Badge>

A stepper control that enhances a native `<input type="number">` with decrement/increment buttons and an animated number track.

<ElementSpec element="input-stepper" />

## Options

### Appearance

Pick a visual style via `appearance`. Each appearance has its own CSS import.

#### Default

Bordered box with inline buttons.

<ComponentWrapper :html="stepperDefault" />

::: code-group

```css [CSS]
@import 'luxen-ui/css/input-stepper/default';
```

<<< @/.vitepress/examples/input-stepper/InputStepperDefault.html [HTML]

:::

#### Rounded

Circular standalone buttons with no container border — Airbnb-style.

<ComponentWrapper :html="stepperRounded" />

::: code-group

```css [CSS]
@import 'luxen-ui/css/input-stepper/rounded';
```

<<< @/.vitepress/examples/input-stepper/InputStepperRounded.html [HTML]

:::

#### Pill

Circular buttons inset into a filled capsule track — iOS-style quantity picker.

<ComponentWrapper :html="stepperPill" />

::: code-group

```css [CSS]
@import 'luxen-ui/css/input-stepper/pill';
```

<<< @/.vitepress/examples/input-stepper/InputStepperPill.html [HTML]

:::

### Size

Set the `size` attribute: `xs`, `sm`, `md` (default), `lg`, `xl`. All three appearances scale from the same control-height tokens, so their buttons match a button or input of the same size. `pill` then adds its inset around that row, which makes the capsule itself 8px taller than the other two at every size — give it its own line rather than a shared one when you put it in a row of form controls.

<ComponentWrapper :html="stepperSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-stepper/InputStepperSizes.html [HTML]
:::

### Not defined

Before JS loads (`:not(:defined)`), CSS provides a styled fallback with zero layout shift.

<NotDefinedPreview
  :css="notDefinedCss"
  :html="stepperNotDefined"
  :height="360"
/>

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
/* or */
@import 'luxen-ui/css/input-stepper/pill';
```

:::

### Attributes & Properties

<ApiTable element="input-stepper" section="properties" />

### Events

<ApiTable element="input-stepper" section="events" />

### CSS custom properties

<ApiTable element="input-stepper" section="cssProperties" />
