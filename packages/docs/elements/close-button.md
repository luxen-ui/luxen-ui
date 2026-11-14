---
outline: deep
---

<script setup>
import closeButton from '../.vitepress/examples/close-button/CloseButton.html?raw'
import closeButtonRing from '../.vitepress/examples/close-button/CloseButtonRing.html?raw'
import closeButtonSquare from '../.vitepress/examples/close-button/CloseButtonSquare.html?raw'
import closeButtonCircle from '../.vitepress/examples/close-button/CloseButtonCircle.html?raw'
</script>

# Close button <Badge type="tip">&lt;button&gt;</Badge>

Close buttons are used to dismiss overlays such as dialogs, drawers, toasts, and popovers. They render a close icon without any visible label.

<ElementSpec element="close-button" />

## Options

### Appearance

Pick a visual style via `data-appearance`. Each appearance has its own CSS import.

#### Ring

<ComponentWrapper :html="closeButtonRing" />

::: code-group

<<< @/.vitepress/examples/close-button/CloseButtonRing.html [HTML]

```css [CSS]
@import 'luxen-ui/css/close-button/ring';
```

:::

#### Square

<ComponentWrapper :html="closeButtonSquare" />

::: code-group

<<< @/.vitepress/examples/close-button/CloseButtonSquare.html [HTML]

```css [CSS]
@import 'luxen-ui/css/close-button/square';
```

:::

#### Circle

<ComponentWrapper :html="closeButtonCircle" />

::: code-group

<<< @/.vitepress/examples/close-button/CloseButtonCircle.html [HTML]

```css [CSS]
@import 'luxen-ui/css/close-button/circle';
```

:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Focus ring on keyboard focus', Description: 'A visible ring for keyboard users', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Icon contrast passes', Description: 'Icon and background colors meet AA ratios', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
  { Check: '24px minimum target', Description: 'At least 24×24px, larger for touch contexts', WCAG: '[WCAG 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced), [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)' },
  { Check: 'Icon is decorative', Description: 'The accessible name comes from the button’s `aria-label`', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1), [RGAA 1.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.3)' },
  { Check: 'Disabled buttons not focusable', Description: 'With `disabled`, they also appear inactive' },
  { Check: 'Visual change on hover', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus)' },
  { Check: 'Visual feedback on press', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)' },
]" :rules="[
  { Check: 'Label the close button', Description: 'Add `aria-label=&quot;Close&quot;`, or a context-specific label like `aria-label=&quot;Close dialog&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1), [RGAA 11.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.2)' },
  { Check: 'Use a native `<button>`', Description: 'Never a `<div>` or `<span>`', Note: 'No extra ARIA role is needed', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Enter', Description: 'Activates the close button' },
  { Key: 'Space', Description: 'Activates the close button' },
  { Key: 'Tab', Description: 'Moves focus to the next focusable element' },
  { Key: 'Shift + Tab', Description: 'Moves focus to the previous focusable element' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/close-button/ring';
```

:::

### Attributes & Properties

<ApiTable element="close-button" section="attributes" />

### CSS classes

<ApiTable element="close-button" section="cssClasses" />

### CSS custom properties

<ApiTable element="close-button" section="cssProperties" />
