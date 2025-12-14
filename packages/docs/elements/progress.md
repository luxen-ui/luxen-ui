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

<ElementSpec
  tag="progress"
  type="native"
/>

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
  { Check: 'Role', Description: 'Uses native `<progress>` — implicit `progressbar` role', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Accessible name', Description: 'Must have an associated `<label>` or `aria-label`', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Color', Description: 'Indicator and track colors meet non-text contrast ratio', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)' },
  { Check: 'Motion', Description: 'Indeterminate animation respects `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Always pair the `<progress>` element with a visible `<label>` or `aria-label`',
  'Set `value` for determinate progress; omit for indeterminate',
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/progress';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'value', Description: 'Current progress between `0` and `1` (omit for indeterminate)' },
  { Attribute: 'data-orientation=&quot;vertical&quot;', Description: 'Vertical orientation' },
]" />

### CSS classes

<ApiTable :data="[
  { Class: '.l-progress', Description: 'Base progress bar style' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--size', Description: 'Bar thickness (default: 4px)' },
  { Name: '--track-color', Description: 'Track background color' },
  { Name: '--indicator-color', Description: 'Fill/indicator color' },
  { Name: '--indeterminate-animation', Description: 'Animation name for indeterminate state' },
]" />
