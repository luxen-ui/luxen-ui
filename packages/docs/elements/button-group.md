---
outline: deep
---

<script setup>
import basic from '../.vitepress/examples/button-group/Basic.html?raw'
import vertical from '../.vitepress/examples/button-group/Vertical.html?raw'
import iconOnly from '../.vitepress/examples/button-group/IconOnly.html?raw'
import sizes from '../.vitepress/examples/button-group/Sizes.html?raw'
import splitButton from '../.vitepress/examples/button-group/SplitButton.html?raw'
</script>

# Button group <Badge type="tip">&lt;l-button-group&gt;</Badge>

Joins related `.l-button` elements into a single segmented control with shared borders.

<ElementSpec element="button-group" />

::: code-group

```html [HTML]
<l-button-group label="Alignment">
  <button class="l-button">Left</button>
  <button class="l-button">Center</button>
  <button class="l-button">Right</button>
</l-button-group>
```

:::

## Options

### Label

Add `label` to give the group an accessible name announced by screen readers.

<ComponentWrapper :html="basic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/Basic.html [HTML]
:::

### Orientation

Add `orientation="vertical"` to stack the buttons.

<ComponentWrapper :html="vertical" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/Vertical.html [HTML]
:::

### Sizes

Set `data-size` on every button so the group stays even.

<ComponentWrapper :html="sizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/Sizes.html [HTML]
:::

## Examples

### Icon toolbar

Group icon-only buttons into a compact toolbar.

<ComponentWrapper :html="iconOnly" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/IconOnly.html [HTML]
:::

### Split button

Pair a primary action with an `<l-dropdown>` of related actions. The group rounds the corners of the dropdown trigger automatically.

<ComponentWrapper :html="splitButton" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/SplitButton.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Host gets `role=&quot;group&quot;` to expose the buttons as a set', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 9.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.3)' },
  { Check: 'Accessible name', Description: '`label` sets `aria-label` so assistive tech announces the group purpose', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Orientation', Description: '`aria-orientation` reflects the `orientation` attribute', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)' },
  { Check: 'Focus order', Description: 'Each button is an independent `Tab` stop; the focus ring is raised above neighbours so it is never clipped', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Icon-only buttons', Description: 'Each icon-only button needs its own `aria-label`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
]" :rules="[
  'Always add a `label` describing the group purpose',
  'Children must be native `&lt;button class=&quot;l-button&quot;&gt;` elements (optionally wrapped in `l-dropdown` for split buttons)',
  'Give each icon-only button its own `aria-label`',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the next button in the group' },
  { Key: 'Shift + Tab', Description: 'Moves focus to the previous button' },
  { Key: 'Enter', Description: 'Activates the focused button' },
  { Key: 'Space', Description: 'Activates the focused button' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/button-group';
```

```css [CSS]
@import 'luxen-ui/css/button-group';
```

:::

### Attributes & Properties

<ApiTable element="button-group" section="properties" />
