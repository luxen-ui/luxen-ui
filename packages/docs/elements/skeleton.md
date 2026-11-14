---
outline: deep
---

<script setup>
import skeletonShapes from '../.vitepress/examples/skeleton/SkeletonShapes.html?raw'
import skeletonAnimations from '../.vitepress/examples/skeleton/SkeletonAnimations.html?raw'
import skeletonCard from '../.vitepress/examples/skeleton/SkeletonCardExample.html?raw'
</script>

# Skeleton <Badge type="tip">&lt;l-skeleton&gt;</Badge>

Skeletons are used as animated placeholders that mimic the shape of content while it loads. Commonly used to reduce perceived loading time in lists, cards, and dashboards.

<ElementSpec element="skeleton" />

## Options

### Shapes

Set `shape` to `circle`, `rect`, or `text` (default).

<ComponentWrapper :html="skeletonShapes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/skeleton/SkeletonShapes.html [HTML]
:::

### Animations

Set `animation` to `pulse` (default) or `wave`.

<ComponentWrapper :html="skeletonAnimations" />

::: details Code
::: code-group
<<< @/.vitepress/examples/skeleton/SkeletonAnimations.html [HTML]
:::

## Examples

### Card placeholder

<ComponentWrapper :html="skeletonCard" />

::: details Code
::: code-group
<<< @/.vitepress/examples/skeleton/SkeletonCardExample.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Reduced motion respected', Description: 'The animation follows `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  { Check: 'Mark the loading region busy', Description: 'Wrap the placeholders in a container with `aria-busy=&quot;true&quot;` while content loads, and remove it when done', WCAG: '[WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)' },
  { Check: 'Name the loading container', Description: 'Add `aria-label=&quot;Loading&quot;` to it', Note: 'It gives screen readers context', WCAG: '[WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/skeleton';
```

```css [CSS]
@import 'luxen-ui/css/skeleton';
```

:::

### Attributes & Properties

<ApiTable element="skeleton" section="attributes" />

### CSS custom properties

<ApiTable element="skeleton" section="cssProperties" />
