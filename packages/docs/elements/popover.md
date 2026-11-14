---
outline: deep
---

<script setup>
import popoverBasic from '../.vitepress/examples/popover/PopoverBasic.html?raw'
import popoverPlacement from '../.vitepress/examples/popover/PopoverPlacement.html?raw'
import popoverWithoutArrow from '../.vitepress/examples/popover/PopoverWithoutArrow.html?raw'
import popoverHover from '../.vitepress/examples/popover/PopoverHover.html?raw'
import popoverMegaMenu from '../.vitepress/examples/popover/PopoverMegaMenu.html?raw'
</script>

# Popover <Badge type="tip">&lt;l-popover&gt;</Badge>

Popovers are used to display rich interactive content in a floating panel anchored to a trigger element. Commonly used for mini forms, additional details, and contextual controls. Dismissed by clicking outside.

<ElementSpec element="popover" />

## Options

### Basic

Reference a trigger element by ID using the `for` attribute. Clicks toggle the popover; clicking outside closes it. The popover does not apply any padding — wrap the slotted content in a container with the spacing you want.

<ComponentWrapper :html="popoverBasic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/popover/PopoverBasic.html [HTML]
:::

### Placement

Set `placement` to control position: `bottom` (default), `top`, `left`, `right`.

<ComponentWrapper :html="popoverPlacement" />

::: details Code
::: code-group
<<< @/.vitepress/examples/popover/PopoverPlacement.html [HTML]
:::

### Without arrow

Add `without-arrow` to hide the directional arrow.

<ComponentWrapper :html="popoverWithoutArrow" />

::: details Code
::: code-group
<<< @/.vitepress/examples/popover/PopoverWithoutArrow.html [HTML]
:::

### Hover trigger

Set `trigger="hover"` to open on pointer enter. A safe polygon hover bridge prevents flickering when moving between trigger and popover.

<ComponentWrapper :html="popoverHover" />

::: details Code
::: code-group
<<< @/.vitepress/examples/popover/PopoverHover.html [HTML]
:::

## Examples

### Safe triangle visualization

Hover the button and move your cursor toward the popover. The safe polygon keeps the popover open while your cursor travels across the gap.

<PopoverSafeTriangleDemo />

### Mega menu

E-commerce style mega menu: `full-width` stretches the popover to the viewport, `--show-duration: 0ms` makes it appear instantly on hover.

<ComponentWrapper :html="popoverMegaMenu" vertical />

::: details Code
::: code-group
<<< @/.vitepress/examples/popover/PopoverMegaMenu.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Open state exposed', Description: 'The trigger gets `aria-expanded` and `aria-controls` pointing to the popover', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Closes on `Escape` and outside click', Description: 'Light dismiss via `popover=&quot;auto&quot;`', WCAG: '[WCAG 3.2.2](https://www.w3.org/WAI/WCAG22/Understanding/on-input)' },
  { Check: 'Hover bridge prevents flicker', Description: 'A safe polygon keeps the popover open while the cursor moves from trigger to popover', WCAG: '[WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus)' },
  { Check: 'Focus ring on keyboard focus', Description: 'The trigger shows a visible focus ring for keyboard users', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Reduced motion respected', Description: 'Animations follow `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  { Check: 'Use a `<button>` as the trigger', Note: 'The element links it to the popover via `aria-controls` automatically' },
  { Check: 'Name popovers that act as regions', Description: 'Give the popover content an accessible label when it works as a distinct region' },
  { Check: 'Keep focus order logical inside', Description: 'Applies when the popover holds interactive content' },
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Enter', Description: 'Toggles the popover (click trigger)' },
  { Key: 'Space', Description: 'Toggles the popover (click trigger)' },
  { Key: 'Escape', Description: 'Closes the popover' },
  { Key: 'Tab', Description: 'Moves focus through focusable elements inside the popover, then out' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/popover';
```

:::

### Attributes & Properties

<ApiTable element="popover" section="properties" />

### Methods

<ApiTable element="popover" section="methods" />

### CSS custom properties

<ApiTable element="popover" section="cssProperties" />
