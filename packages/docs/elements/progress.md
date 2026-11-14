---
outline: deep
---

<script setup>
import progressBar from '../.vitepress/examples/progress/ProgressBar.html?raw'
import progressBarIndeterminate from '../.vitepress/examples/progress/ProgressBarIndeterminate.html?raw'
import progressBarVertical from '../.vitepress/examples/progress/ProgressBarVertical.html?raw'
</script>

# Progress <Badge type="tip">&lt;progress&gt;</Badge>

Progress bars are used to indicate the completion status of a task. Commonly used for file uploads, multi-step processes, and loading indicators with a known duration.

<ElementSpec element="progress" />

## Options

### With value

Set the `value` attribute between `0` and `1`.

<ComponentWrapper :html="progressBar" class="w-full" />

::: details Code
::: code-group
<<< @/.vitepress/examples/progress/ProgressBar.html [HTML]
:::

### Indeterminate

Omit the `value` attribute for an indeterminate animation.

<ComponentWrapper :html="progressBarIndeterminate" class="w-full" />

::: details Code
::: code-group
<<< @/.vitepress/examples/progress/ProgressBarIndeterminate.html [HTML]
:::

### Vertical

Add `data-orientation="vertical"` attribute.

<ComponentWrapper :html="progressBarVertical" class="w-full" />

::: details Code
::: code-group
<<< @/.vitepress/examples/progress/ProgressBarVertical.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Indicator contrast passes', Description: 'Indicator and track colors meet the non-text minimum', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)' },
  { Check: 'Reduced motion respected', Description: 'The indeterminate animation follows `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  { Check: 'Label the progress bar', Description: 'Pair the `<progress>` with a visible `<label>` or an `aria-label`', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Use a native `<progress>`', Description: 'It has the implicit `progressbar` role', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Omit `value` for indeterminate progress', Description: 'Set it for determinate progress' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/progress';
```

:::

### Attributes & Properties

<ApiTable element="progress" section="attributes" />

### CSS classes

<ApiTable element="progress" section="cssClasses" />

### CSS custom properties

<ApiTable element="progress" section="cssProperties" />
