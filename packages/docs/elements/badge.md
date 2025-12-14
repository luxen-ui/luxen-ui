---
outline: deep
---

<script setup>
import badgeAppearance from '../.vitepress/examples/badge/BadgeAppearance.html?raw'
import badgeSize from '../.vitepress/examples/badge/BadgeSize.html?raw'
import badgeVariant from '../.vitepress/examples/badge/BadgeVariant.html?raw'
import badgePill from '../.vitepress/examples/badge/BadgePill.html?raw'
</script>

# Badge <Badge type="tip">&lt;l-badge&gt;</Badge>

Badges are used to draw attention and display statuses or counts. Commonly used in tabular data, lists, and navigation to indicate state or category.

<ElementSpec
  tag="l-badge"
  type="custom"
/>

## Options

### Appearance

Add `appearance="filled"` (tinted background, no border), `appearance="filled-outlined"` (tinted background with border), or `appearance="accent"` (strong background, contrast text). Default is outlined (border, no background).

<ComponentWrapper :html="badgeAppearance" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgeAppearance.html [HTML]
:::

### Pill

Add the `pill` attribute for a fully rounded shape.

<ComponentWrapper :html="badgePill" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgePill.html [HTML]
:::

### Sizes

Add `size="sm"` or `size="lg"`. Default is md.

<ComponentWrapper :html="badgeSize" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgeSize.html [HTML]
:::

### Variants

Add `variant="info"`, `variant="success"`, `variant="warning"`, or `variant="danger"`. Default is neutral.

<ComponentWrapper :html="badgeVariant" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgeVariant.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Color contrast', Description: 'Text and background meet minimum contrast ratio across all appearances and variants', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
  { Check: 'Non-text contrast', Description: 'Badge borders meet non-text contrast minimum against adjacent surfaces', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [RGAA 3.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.3)' },
  { Check: 'Not color alone', Description: 'Do not rely on badge color alone to convey status — always include a text label', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [RGAA 3.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.1)' },
]" :rules="[
  'Always include visible text inside the badge — do not use color alone to convey meaning',
  'When a badge conveys dynamic status, wrap it in a `role=&quot;status&quot;` container so screen readers announce changes',
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/badge';
```

```css [CSS]
@import 'luxen-ui/css/badge';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'size', Description: 'Badge size (`sm`, `lg`). Default is md.' },
  { Attribute: 'appearance', Description: 'Visual appearance (`filled`, `filled-outlined`, `accent`). Default is outlined.' },
  { Attribute: 'variant', Description: 'Style variant (`info`, `success`, `warning`, `danger`). Default is neutral.' },
  { Attribute: 'pill', Description: 'Fully rounded pill shape' },
]" />
