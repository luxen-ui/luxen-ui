---
outline: deep
---

<script setup>
import drawerPlacement from '../.vitepress/examples/drawer/DrawerPlacement.html?raw'
import drawerInset from '../.vitepress/examples/drawer/DrawerInset.html?raw'
import drawerLightDismiss from '../.vitepress/examples/drawer/DrawerLightDismiss.html?raw'
import drawerNavigation from '../.vitepress/examples/drawer/DrawerNavigation.html?raw'
import drawerFilters from '../.vitepress/examples/drawer/DrawerFilters.html?raw'
</script>

# Drawer <Badge type="tip">&lt;l-drawer&gt;</Badge>

Drawers display supplementary content in a panel that slides in from a screen edge. Commonly used for navigation menus, filters, and detail views without leaving the current page.

<ElementSpec element="drawer" />

## Options

### Placement

Set `placement` to the edge the drawer slides from — `start` (default, inline-start), `end` (inline-end), `top` (block-start), or `bottom` (block-end). Open with `command="--show"` on a trigger button; the buttons below open one drawer per edge.

<ComponentWrapper :html="drawerPlacement" />

::: details Code
::: code-group

```html [HTML]
<button
  type="button"
  class="l-button"
  command="--show"
  commandfor="drawer-end"
>
  <l-icon name="lucide:panel-right"></l-icon>
  End
</button>

<l-drawer
  id="drawer-end"
  title="Drawer"
  placement="end"
>
  <button
    slot="close"
    type="button"
    class="l-close"
    data-appearance="ring"
    aria-label="Close"
    command="--hide"
    commandfor="drawer-end"
  ></button>
  <p>This drawer slides in from the end.</p>
</l-drawer>
```

:::

### Inset

Add `inset` to float the drawer away from the viewport edges with a uniform gap and rounded corners. Tune the gap with the `--inset-gap` CSS custom property. Works with every `placement` — the buttons below open one drawer per edge.

<ComponentWrapper :html="drawerInset" />

::: details Code
::: code-group

```html [HTML]
<button
  type="button"
  class="l-button"
  command="--show"
  commandfor="drawer-inset"
>
  <l-icon name="lucide:panel-right"></l-icon>
  End
</button>

<l-drawer
  id="drawer-inset"
  title="Drawer"
  placement="end"
  inset
>
  <button
    slot="close"
    type="button"
    class="l-close"
    data-appearance="ring"
    aria-label="Close"
    command="--hide"
    commandfor="drawer-inset"
  ></button>
  <p>This drawer floats away from the edges with rounded corners.</p>
</l-drawer>
```

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

End-side filter panel with a footer for actions.

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

<ApiTable element="drawer" section="properties" />

### Commands

Open and close the drawer by toggling its `open` property, or via the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) from any light-DOM button. Custom commands must start with `--`.

::: info
The Invoker Commands API is [✓ Baseline Newly Available (since 2025-12-12)](https://web-platform-dx.github.io/web-features-explorer/features/invoker-commands/). For older browser versions, load the [`invokers-polyfill`](https://npmx.dev/package/invokers-polyfill) once at app startup:

```js
import 'invokers-polyfill';
```

:::

<ApiTable element="drawer" section="commands" />

### Events

<ApiTable element="drawer" section="events" />

### Slots

<ApiTable element="drawer" section="slots" />

### CSS parts

<ApiTable element="drawer" section="cssParts" />

### CSS custom properties

<ApiTable element="drawer" section="cssProperties" />
