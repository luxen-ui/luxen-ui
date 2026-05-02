---
outline: deep
---

<script setup>
import drawer from '../.vitepress/examples/drawer/Drawer.html?raw'
import drawerEnd from '../.vitepress/examples/drawer/DrawerEnd.html?raw'
import drawerBottom from '../.vitepress/examples/drawer/DrawerBottom.html?raw'
import drawerLightDismiss from '../.vitepress/examples/drawer/DrawerLightDismiss.html?raw'
import drawerNavigation from '../.vitepress/examples/drawer/DrawerNavigation.html?raw'
import drawerFilters from '../.vitepress/examples/drawer/DrawerFilters.html?raw'
</script>

# Drawer <Badge type="tip">&lt;l-drawer&gt;</Badge>

Drawers display supplementary content in a panel that slides in from a screen edge. Commonly used for navigation menus, filters, and detail views without leaving the current page.

<ElementSpec
  tag="l-drawer"
  type="shadow"
/>

## Options

### Basic

Open with `command="--show"` on a trigger button. Slides in from the left.

<ComponentWrapper :html="drawer" />

::: details Code
::: code-group
<<< @/.vitepress/examples/drawer/Drawer.html [HTML]
:::

### Placement

Set `placement` to control which edge the drawer slides from. Defaults to `start` (inline-start). Use `placement="end"` for the inline-end edge or `placement="bottom"` for the block-end edge.

#### End

<ComponentWrapper :html="drawerEnd" />

::: details Code
::: code-group
<<< @/.vitepress/examples/drawer/DrawerEnd.html [HTML]
:::

#### Bottom

<ComponentWrapper :html="drawerBottom" />

::: details Code
::: code-group
<<< @/.vitepress/examples/drawer/DrawerBottom.html [HTML]
:::

### Light dismiss

Add `light-dismiss` to close when the backdrop is clicked.

<ComponentWrapper :html="drawerLightDismiss" />

::: details Code
::: code-group
<<< @/.vitepress/examples/drawer/DrawerLightDismiss.html [HTML]
:::

## Examples

### Navigation

Mobile navigation menu with link items.

<ComponentWrapper :html="drawerNavigation" />

::: details Code
::: code-group
<<< @/.vitepress/examples/drawer/DrawerNavigation.html [HTML]
:::

### Filters

Right-side filter panel with a footer for actions.

<ComponentWrapper :html="drawerFilters" />

::: details Code
::: code-group
<<< @/.vitepress/examples/drawer/DrawerFilters.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Rendered as a native `<dialog>` in the shadow root — built-in `dialog` role and modal semantics', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Accessible name', Description: 'The `title` property is rendered as an `<h2>` inside the drawer header', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Focus management', Description: 'Focus is trapped inside the modal; moves to the first focusable element on open', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Focus restoration', Description: 'Focus returns to the trigger element when the drawer closes', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order)' },
  { Check: 'Close button', Description: 'Consumer provides the close button via `slot=&quot;close&quot;` with `aria-label=&quot;Close&quot;`', WCAG: '[WCAG 2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)' },
  { Check: 'Motion', Description: 'Slide animation respects `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Always set a meaningful `title` — it becomes the drawer heading and accessible name',
  'Put the close button in `slot=&quot;close&quot;` with `class=&quot;l-close&quot;` and `command=&quot;--hide&quot;` `commandfor=&quot;<id>&quot;`',
  'Use `command=&quot;--show&quot;` and `command=&quot;--hide&quot;` with `commandfor` pointing at the drawer id. The `--` prefix is mandatory for custom elements',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Escape', Description: 'Closes the drawer' },
  { Key: 'Tab', Description: 'Cycles focus through focusable elements inside the drawer' },
  { Key: 'Shift + Tab', Description: 'Cycles focus backward through focusable elements inside the drawer' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/drawer';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'title', Description: 'Drawer title rendered in the header as an `<h2>`' },
  { Attribute: 'open', Description: 'Whether the drawer is open. Reflects to attribute' },
  { Attribute: 'light-dismiss', Description: 'Close when the backdrop is clicked' },
  { Attribute: 'placement', Description: 'Edge the drawer slides from: `start` (default), `end`, or `bottom`' },
]" />

### Commands

Open and close the drawer by toggling its `open` property, or via the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) from any light-DOM button. Custom commands must start with `--`.

::: info
The Invoker Commands API is [✓ Baseline Newly Available (since 2025-12-12)](https://web-platform-dx.github.io/web-features-explorer/features/invoker-commands/). For older browser versions, load the [`invokers-polyfill`](https://npmx.dev/package/invokers-polyfill) once at app startup:

```js
import 'invokers-polyfill';
```

:::

<ApiTable :data="[
  { Command: '--show', Description: 'Sets `open = true`' },
  { Command: '--hide', Description: 'Sets `open = false`' },
]" />

### Events

<ApiTable :data="[
  { Event: 'show', Description: 'Fired when the drawer opens' },
  { Event: 'after-show', Description: 'Fired after the open animation completes' },
  { Event: 'hide', Description: 'Fired when the drawer is about to close. Cancelable — call `event.preventDefault()` to keep it open' },
  { Event: 'after-hide', Description: 'Fired after the close animation completes' },
]" />

### Slots

<ApiTable :data="[
  { Slot: '(default)', Description: 'Body content' },
  { Slot: 'close', Description: 'Close button (typically `<button class=&quot;l-close&quot;>`)' },
  { Slot: 'footer', Description: 'Footer actions' },
]" />

### CSS parts

<ApiTable :data="[
  { Part: 'dialog', Description: 'The native `<dialog>` element' },
  { Part: 'header', Description: 'The header wrapper containing the title and close slot' },
  { Part: 'title', Description: 'The drawer title heading' },
  { Part: 'body', Description: 'The body wrapper around the default slot' },
  { Part: 'footer', Description: 'The footer wrapper around the footer slot' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--size', Description: 'Drawer size on the axis perpendicular to its edge (width for `start`/`end`, height for `bottom`). Default `320px`' },
  { Name: '--border-radius', Description: 'Border radius on the inner edges. Default `0.75rem`' },
  { Name: '--show-duration', Description: 'Open transition duration. Default `200ms`' },
  { Name: '--hide-duration', Description: 'Close transition duration. Default `200ms`' },
  { Name: '--backdrop', Description: 'Backdrop color' },
]" />
