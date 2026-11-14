---
outline: deep
---

<script setup>
import buttonVariant from '../.vitepress/examples/button/ButtonVariant.html?raw'
import buttonPrimary from '../.vitepress/examples/button/ButtonPrimary.html?raw'
import buttonIcon from '../.vitepress/examples/button/ButtonIcon.html?raw'
import buttonDisabled from '../.vitepress/examples/button/ButtonDisabled.html?raw'
import buttonLink from '../.vitepress/examples/button/ButtonLink.html?raw'
import buttonPressEffect from '../.vitepress/examples/button/ButtonPressEffect.html?raw'
import buttonWithIconText from '../.vitepress/examples/button/ButtonWithIconText.html?raw'
import buttonGroup from '../.vitepress/examples/button/ButtonGroup.html?raw'
import buttonFormActions from '../.vitepress/examples/button/ButtonFormActions.html?raw'
import buttonDestructive from '../.vitepress/examples/button/ButtonDestructive.html?raw'
import buttonLoading from '../.vitepress/examples/button/ButtonLoading.html?raw'
</script>

# Button <Badge type="tip">&lt;button&gt;</Badge>

Buttons are used to trigger actions such as submitting forms, confirming dialogs, or navigating. They are the primary interactive control in any interface.

<ElementSpec element="button" />

## Options

### Sizes

Add `data-size="sm"`, `data-size="lg"`, or `data-size="xl"`. Default is md. Only height and padding scale — the label stays 14px so a taller button reads as a larger touch target, not a louder label. For a larger label, override `--font-size`.

<ComponentWrapper :html="buttonVariant" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonVariant.html [HTML]
:::

### Primary

Add `data-variant="primary"`.

<ComponentWrapper :html="buttonPrimary" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonPrimary.html [HTML]
:::

### Destructive

Add `data-variant="destructive"`.

<ComponentWrapper :html="buttonDestructive" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonDestructive.html [HTML]
:::

### Icon-only

Add `data-icon-only` and an `aria-label`.

<ComponentWrapper :html="buttonIcon" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonIcon.html [HTML]
:::

### Disabled

Native `disabled` attribute.

<ComponentWrapper :html="buttonDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonDisabled.html [HTML]
:::

### As link

Use an `<a>` element instead of `<button>`.

<ComponentWrapper :html="buttonLink" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonLink.html [HTML]
:::

### Press effect

Add `data-press-effect` attribute.

<ComponentWrapper :html="buttonPressEffect" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonPressEffect.html [HTML]
:::

### Loading

Add an `<l-spinner>` inside the button. The spinner inherits the button's text color.

<ComponentWrapper :html="buttonLoading" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonLoading.html [HTML]
:::

## Examples

### With icon and text

<ComponentWrapper :html="buttonWithIconText" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonWithIconText.html [HTML]
:::

### Button group

Wrap related buttons in [`<l-button-group>`](./button-group) to join them into a single unit.

<ComponentWrapper :html="buttonGroup" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonGroup.html [HTML]
:::

### Form actions

<ComponentWrapper :html="buttonFormActions" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button/ButtonFormActions.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Focus ring on keyboard focus', Description: 'A visible 2px ring for keyboard users', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Text contrast passes', Description: 'Text and background colors meet AA ratios across all variants', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
  { Check: 'Disabled buttons not focusable', Description: 'With `disabled`, they also get reduced opacity and `cursor: not-allowed`' },
  { Check: 'Visual change on hover', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)' },
  { Check: 'Visual feedback on press', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)' },
]" :rules="[
  { Check: 'Use a native `<button>`', Description: 'Or an `<a>` for a link button, never a `<div>` or `<span>`', Note: 'No extra ARIA role is needed', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Label icon-only buttons', Description: 'Give each one an `aria-label` as its accessible name', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Add `role=&quot;button&quot;` to action links', Description: 'Only on an `<a>` link button that triggers an action rather than navigating' },
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Enter', Description: 'Activates the button' },
  { Key: 'Space', Description: 'Activates the button' },
  { Key: 'Tab', Description: 'Moves focus to the next focusable element' },
  { Key: 'Shift + Tab', Description: 'Moves focus to the previous focusable element' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/button';
```

:::

### Attributes & Properties

<ApiTable element="button" section="attributes" />

### CSS classes

<ApiTable element="button" section="cssClasses" />

### CSS custom properties

<ApiTable element="button" section="cssProperties" />
