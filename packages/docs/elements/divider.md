---
outline: deep
---

<script setup>
import dividerBasic from '../.vitepress/examples/divider/DividerBasic.html?raw'
import dividerVertical from '../.vitepress/examples/divider/DividerVertical.html?raw'
import dividerCustom from '../.vitepress/examples/divider/DividerCustom.html?raw'
import dividerWithText from '../.vitepress/examples/divider/DividerWithText.html?raw'
</script>

# Divider <Badge type="tip">&lt;l-divider&gt;</Badge>

Dividers are used to visually separate groups of content with a horizontal or vertical line. They can include an optional text label.

<ElementSpec element="divider" />

## Options

### Horizontal

Default orientation. Spans the full width of its container.

<ComponentWrapper :html="dividerBasic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/divider/DividerBasic.html [HTML]
:::

### Vertical

Set `orientation="vertical"`. The divider inherits the height of its parent container.

<ComponentWrapper :html="dividerVertical" />

::: details Code
::: code-group
<<< @/.vitepress/examples/divider/DividerVertical.html [HTML]
:::

### Thickness

Set `--thickness` to control thickness. Default is `1px`.

<ComponentWrapper :html="dividerCustom" />

::: details Code
::: code-group
<<< @/.vitepress/examples/divider/DividerCustom.html [HTML]
:::

### With text

Add a `label` attribute. The text renders over the divider line.

<ComponentWrapper :html="dividerWithText" />

::: details Code
::: code-group
<<< @/.vitepress/examples/divider/DividerWithText.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Automatically sets role=separator in connectedCallback', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 9.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.1)' },
  { Check: 'Orientation', Description: 'Automatically sets aria-orientation=vertical when orientation is vertical', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)' },
  { Check: 'Color', Description: 'Divider color meets non-text contrast minimum against adjacent surfaces', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/divider';
```

```js [JS]
import 'luxen-ui/divider';
```

:::

### Attributes & Properties

<ApiTable element="divider" section="properties" />

### CSS custom properties

<ApiTable element="divider" section="cssProperties" />
