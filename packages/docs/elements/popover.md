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

<ElementSpec
  tag="l-popover"
  type="shadow"
/>

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
  { Check: 'Expanded state', Description: 'Trigger receives `aria-expanded` and `aria-controls` pointing to the popover', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Dismissible', Description: 'Closes on `Escape` and click outside (light-dismiss via `popover=&quot;auto&quot;`)', WCAG: '[WCAG 3.2.2](https://www.w3.org/WAI/WCAG22/Understanding/on-input)' },
  { Check: 'Hover bridge', Description: 'Safe polygon prevents flickering when moving cursor from trigger to popover', WCAG: '[WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus)' },
  { Check: 'Focus state', Description: 'Visible focus ring on trigger for keyboard users', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Motion', Description: 'Respects `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Use a `<button>` element as the trigger — the component links it via `aria-controls` automatically',
  'If the popover contains interactive content, ensure a logical focus order inside it',
  'Add an accessible label to the popover content when it functions as a distinct region',
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

<ApiTable :data="[
  { Attribute: 'for', Description: 'ID of the trigger element' },
  { Attribute: 'placement', Description: 'Preferred placement: `bottom` (default), `bottom-start`, `bottom-end`, `top`, `top-start`, `top-end`, `left`, `left-start`, `left-end`, `right`, `right-start`, `right-end`' },
  { Attribute: 'distance', Description: 'Offset from trigger in px. Default `8`' },
  { Attribute: 'open', Description: 'Whether popover is visible. Reflects to attribute' },
  { Attribute: 'without-arrow', Description: 'Hide the directional arrow' },
  { Attribute: 'full-width', Description: 'Stretch the popover to the viewport width. Useful for mega menus — typically combined with `without-arrow`' },
  { Attribute: 'trigger', Description: 'Space-separated trigger modes: `click` (default), `hover`, `focus`, `manual`' },
]" />

### Methods

<ApiTable :data="[
  { Method: 'show()', Description: 'Shows the popover' },
  { Method: 'hide()', Description: 'Hides the popover' },
  { Method: 'toggle()', Description: 'Toggles the popover' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--background', Description: 'Background color. Default: `Canvas`' },
  { Name: '--color', Description: 'Text color. Default: inherited' },
  { Name: '--border-radius', Description: 'Border radius. Default `8px`' },
  { Name: '--max-width', Description: 'Maximum width. Default `320px`' },
  { Name: '--shadow', Description: 'Box shadow' },
  { Name: '--arrow-size', Description: 'Arrow size. Default `8px`' },
  { Name: '--show-duration', Description: 'Show animation duration. Default `150ms`' },
  { Name: '--hide-duration', Description: 'Hide animation duration. Default `150ms`' },
]" />
