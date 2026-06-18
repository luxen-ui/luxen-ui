---
outline: deep
---

<script setup>
import sliderDefault from '../.vitepress/examples/slider/SliderDefault.html?raw'
import sliderRange from '../.vitepress/examples/slider/SliderRange.html?raw'
import sliderSizes from '../.vitepress/examples/slider/SliderSizes.html?raw'
import sliderCustomColors from '../.vitepress/examples/slider/SliderCustomColors.html?raw'
import sliderTooltip from '../.vitepress/examples/slider/SliderTooltip.html?raw'
import sliderVertical from '../.vitepress/examples/slider/SliderVertical.html?raw'
import sliderDisabled from '../.vitepress/examples/slider/SliderDisabled.html?raw'
import notDefinedCss from 'luxen-ui/css/slider?raw'
</script>

# Slider <Badge type="tip">&lt;l-slider&gt;</Badge>

Sliders let users pick a numeric value — or a min–max range — by dragging a thumb along a track.

<ElementSpec element="slider" />

::: code-group

```html [HTML]
<l-slider
  label="Volume"
  min="0"
  max="100"
  value="40"
  name="volume"
></l-slider>
```

:::

## Options

### Basic

Set `value` (and optionally `min`, `max`, `step`). `label` gives the thumb its accessible name.

<ComponentWrapper :html="sliderDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/slider/SliderDefault.html [HTML]
:::

### Range

Add `range` and set `min-value` / `max-value` for a two-thumb min–max selection. The thumbs cannot cross.

<ComponentWrapper :html="sliderRange" />

::: details Code
::: code-group
<<< @/.vitepress/examples/slider/SliderRange.html [HTML]
:::

### Sizes

Set `size` to `xs`, `sm`, `md` (default), `lg`, or `xl`.

<ComponentWrapper :html="sliderSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/slider/SliderSizes.html [HTML]
:::

### Custom colors

Override `--indicator-color` (and `--track-color`, `--thumb-color`).

<ComponentWrapper :html="sliderCustomColors" />

::: details Code
::: code-group
<<< @/.vitepress/examples/slider/SliderCustomColors.html [HTML]
:::

### Vertical

Set `orientation="vertical"` for a vertical slider (it increases upward). Override `--length` to change its height.

<ComponentWrapper :html="sliderVertical" />

::: details Code
::: code-group
<<< @/.vitepress/examples/slider/SliderVertical.html [HTML]
:::

### With tooltip

Add `with-tooltip` to show the current value above a thumb while it's focused or dragged. Assign the `valueFormatter` property — `(value) => string` — to add a unit or currency (it also sets `aria-valuetext`).

<ComponentWrapper :html="sliderTooltip" />

::: details Code
::: code-group
<<< @/.vitepress/examples/slider/SliderTooltip.html [HTML]
:::

### Disabled

Native `disabled` attribute.

<ComponentWrapper :html="sliderDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/slider/SliderDisabled.html [HTML]
:::

### Not defined

Before the custom element upgrades (`:not(:defined)`), `<l-slider>` paints a static rail with a faint fill at its reserved height — so it reads as a slider at rest with no flash or layout shift on hydration. Override the shipped `l-slider:not(:defined)` rule to customize it.

<NotDefinedPreview :css="notDefinedCss" :height="80" html='<div style="width:16rem"><l-slider></l-slider></div>' />

Once upgraded, the shadow root renders the interactive track and thumbs.

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Each thumb is a `role=&quot;slider&quot;` with `aria-valuemin` / `aria-valuemax` / `aria-valuenow`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Accessible name', Description: 'Set `label`; in range mode each thumb is suffixed Minimum / Maximum', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Target size', Description: 'Each thumb exposes a ≥24×24px hit area', WCAG: '[WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)' },
  { Check: 'Focus', Description: 'Focused thumb shows a focus ring via `:focus-visible`', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
]" :rules="[
  'Always set `label` so each thumb has an accessible name',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the next thumb' },
  { Key: 'ArrowRight / ArrowUp', Description: 'Increases the value by one step' },
  { Key: 'ArrowLeft / ArrowDown', Description: 'Decreases the value by one step' },
  { Key: 'Page Up / Page Down', Description: 'Increases / decreases by a larger step' },
  { Key: 'Home / End', Description: 'Jumps to the minimum / maximum value' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/slider';
```

:::

### Attributes & Properties

<ApiTable element="slider" section="properties" />

### Events

<ApiTable element="slider" section="events" />

### CSS parts

<ApiTable element="slider" section="cssParts" />

### CSS custom properties

<ApiTable element="slider" section="cssProperties" />
