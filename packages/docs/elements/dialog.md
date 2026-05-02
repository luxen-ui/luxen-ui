---
outline: deep
---

<script setup>
import dialogExample from '../.vitepress/examples/dialog/Dialog.html?raw'
import dialogLightDismiss from '../.vitepress/examples/dialog/DialogLightDismiss.html?raw'
import dialogScrollableContent from '../.vitepress/examples/dialog/DialogScrollableContent.html?raw'
import dialogBlurredBackdrop from '../.vitepress/examples/dialog/DialogBlurredBackdrop.html?raw'
import dialogForm from '../.vitepress/examples/dialog/DialogForm.html?raw'
import dialogWithoutHeader from '../.vitepress/examples/dialog/DialogWithoutHeader.html?raw'
</script>

# Dialog <Badge type="tip">&lt;l-dialog&gt;</Badge>

Dialogs display critical information or request user input in a modal overlay that blocks interaction with the rest of the page. Commonly used for confirmations, forms, and alerts.

<ElementSpec
  tag="l-dialog"
  type="shadow"
/>

## Options

### Basic

Open with `command="--show"` on a trigger button. Any descendant with `command="--hide"` closes the dialog. Note the `--` prefix — it's required by the native [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) for custom elements.

<ComponentWrapper :html="dialogExample" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dialog/Dialog.html [HTML]
:::

### Light dismiss

Add `light-dismiss` to close when the backdrop is clicked.

<ComponentWrapper :html="dialogLightDismiss" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dialog/DialogLightDismiss.html [HTML]
:::

### Scrollable content

Long content can scroll while the header stays in view.

<ComponentWrapper :html="dialogScrollableContent" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dialog/DialogScrollableContent.html [HTML]
:::

### Blurred backdrop

Set `--backdrop-blur` to any CSS length to frost the page behind the dialog. Defaults to `0` (no blur).

<ComponentWrapper :html="dialogBlurredBackdrop" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dialog/DialogBlurredBackdrop.html [HTML]
:::

### Form with autofocus

Add `autofocus` to any focusable element inside the dialog to focus it automatically on open.

<ComponentWrapper :html="dialogForm" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dialog/DialogForm.html [HTML]
:::

### Without header

Add `without-header` to drop the header row entirely (title and close slot). Useful for confirmation prompts where the body already carries the heading. Provide an accessible heading inside the body and rely on `Escape` or a footer action to close.

<ComponentWrapper :html="dialogWithoutHeader" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dialog/DialogWithoutHeader.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Rendered as a native `<dialog>` in the shadow root — built-in `dialog` role and modal semantics', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Accessible name', Description: 'The `title` property renders as an `<h2>` in the header, or provide a custom heading via `slot=&quot;title&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Focus management', Description: 'Focus is trapped inside the modal; moves to the first focusable element on open', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Focus restoration', Description: 'Focus returns to the trigger element when the dialog closes', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order)' },
  { Check: 'Close button', Description: 'Consumer provides the close button via `slot=&quot;close&quot;` with `aria-label=&quot;Close&quot;`', WCAG: '[WCAG 2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)' },
  { Check: 'Motion', Description: 'Respects `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Always set a meaningful `title` — it becomes the dialog heading and accessible name',
  'Put the close button in `slot=&quot;close&quot;` with `class=&quot;l-close&quot;` and `command=&quot;--hide&quot;` `commandfor=&quot;<id>&quot;`',
  'Use `command=&quot;--show&quot;` and `command=&quot;--hide&quot;` with `commandfor` pointing at the dialog id. The `--` prefix is mandatory for custom elements',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Escape', Description: 'Closes the dialog' },
  { Key: 'Tab', Description: 'Cycles focus through focusable elements inside the dialog' },
  { Key: 'Shift + Tab', Description: 'Cycles focus backward through focusable elements inside the dialog' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/dialog';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'title', Description: 'Dialog title rendered in the header as an `<h2>`' },
  { Attribute: 'open', Description: 'Whether the dialog is open. Reflects to attribute' },
  { Attribute: 'light-dismiss', Description: 'Close when the backdrop is clicked' },
  { Attribute: 'without-header', Description: 'Hide the header entirely (title and close slot)' },
]" />

### Commands

Open and close the dialog by toggling its `open` property, or via the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) from any light-DOM button. Custom commands must start with `--`.

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
  { Event: 'show', Description: 'Fired when the dialog opens' },
  { Event: 'after-show', Description: 'Fired after the open animation completes' },
  { Event: 'hide', Description: 'Fired when the dialog is about to close. Cancelable — call `event.preventDefault()` to keep it open' },
  { Event: 'after-hide', Description: 'Fired after the close animation completes' },
]" />

### Slots

<ApiTable :data="[
  { Slot: '(default)', Description: 'Body content' },
  { Slot: 'title', Description: 'Custom heading element. Overrides the default `<h2>` rendered from the `title` property' },
  { Slot: 'close', Description: 'Close button (typically `<button class=&quot;l-close&quot;>`)' },
  { Slot: 'footer', Description: 'Footer actions' },
]" />

### CSS parts

<ApiTable :data="[
  { Part: 'dialog', Description: 'The native `<dialog>` element' },
  { Part: 'header', Description: 'The header wrapper containing the title and close slot' },
  { Part: 'title', Description: 'The dialog title heading' },
  { Part: 'body', Description: 'The body wrapper around the default slot' },
  { Part: 'footer', Description: 'The footer wrapper around the footer slot' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--width', Description: 'Dialog width. Default `31rem`' },
  { Name: '--border-radius', Description: 'Border radius. Default `6px`' },
  { Name: '--show-duration', Description: 'Open transition duration. Default `200ms`' },
  { Name: '--hide-duration', Description: 'Close transition duration. Default `200ms`' },
  { Name: '--backdrop', Description: 'Backdrop color' },
  { Name: '--backdrop-blur', Description: 'Backdrop blur amount (any CSS length). Default `0`' },
]" />
