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

Auto-detected when containing a single `<svg>`, `<l-icon>`, or `<iconify-icon>`.

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
  { Check: 'Color', Description: 'Text and background colors meet AA contrast ratios across all variants', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
  { Check: 'Focus state', Description: 'Visible 2px focus ring for keyboard users', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Hover state', Description: 'Clear visual change on hover', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)' },
  { Check: 'Active state', Description: 'Visual feedback on press', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)' },
  { Check: 'Disabled state', Description: 'Reduced opacity, `cursor: not-allowed`, not focusable when disabled', WCAG: '[WCAG 2.5.2](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation)' },
  { Check: 'Icon-only', Description: 'Icon-only buttons must have `aria-label` for an accessible name', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Role', Description: 'Uses native `<button>` or `<a>` — no extra ARIA role needed', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
]" :rules="[
  'Use a native `<button>` element — never a `<div>` or `<span>`',
  'Always add `aria-label` to icon-only buttons',
  'Include `type=&quot;button&quot;` to prevent form submission (except for submit buttons)',
  'When using `<a>` as a link button, add `role=&quot;button&quot;` only if it triggers an action rather than navigating',
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
