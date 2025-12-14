---
outline: deep
---

<script setup>
import toastBasic from '../.vitepress/examples/toast/ToastBasic.html?raw'
import toastVariants from '../.vitepress/examples/toast/ToastVariants.html?raw'
import toastDuration from '../.vitepress/examples/toast/ToastDuration.html?raw'
import toastHeading from '../.vitepress/examples/toast/ToastHeading.html?raw'
import toastIcon from '../.vitepress/examples/toast/ToastIcon.html?raw'
import toastPlacement from '../.vitepress/examples/toast/ToastPlacement.html?raw'
</script>

# Toast <Badge type="tip">&lt;l-toast&gt;</Badge>

Toasts are used to display brief, non-blocking notifications that auto-dismiss. Commonly used to confirm actions, report errors, or surface system messages without interrupting the user's workflow.

<ElementSpec
  tag="l-toast"
  type="custom"
/>

## Options

### Basic

Place a single `<l-toast>` element anywhere inside the `<body>`. Call `toast()` to display notifications.

<ComponentWrapper :html="toastBasic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/toast/ToastBasic.html [HTML]
:::

### Variants

Pass `variant` in the options to apply accent colors: `info`, `success`, `warning`, `danger`.

<ComponentWrapper :html="toastVariants" />

::: details Code
::: code-group
<<< @/.vitepress/examples/toast/ToastVariants.html [HTML]
:::

### Heading

Pass `heading` in the options to display a title above the message.

<ComponentWrapper :html="toastHeading" />

::: details Code
::: code-group
<<< @/.vitepress/examples/toast/ToastHeading.html [HTML]
:::

### Icon

Pass `icon` with an Iconify icon name to replace the accent bar with an icon, colored by variant.

<ComponentWrapper :html="toastIcon" />

::: details Code
::: code-group
<<< @/.vitepress/examples/toast/ToastIcon.html [HTML]
:::

### Duration

Control how long the toast stays visible. Set to `0` for persistent notifications that must be manually dismissed.

<ComponentWrapper :html="toastDuration" />

::: details Code
::: code-group
<<< @/.vitepress/examples/toast/ToastDuration.html [HTML]
:::

### Placement

Position the toast stack using the `placement` attribute.

<ComponentWrapper :html="toastPlacement" />

::: details Code
::: code-group
<<< @/.vitepress/examples/toast/ToastPlacement.html [HTML]
:::

### Programmatic API

```js
import { toast } from 'luxen-ui/toast';

// Basic
toast({ text: 'Saved successfully!' });

// With variant
toast({ text: 'File uploaded', variant: 'success' });

// With heading and custom duration
toast({
  text: 'Undo this action?',
  heading: 'Warning',
  variant: 'warning',
  duration: 0,
});
```

### Features

- **Function-based API** — call `toast({ text: '...' })` from anywhere, no component wiring needed
- **Timer pausing on hover & focus** — countdown pauses when hovered or focused, resumes when the pointer or focus leaves
- **Timer pausing on hidden tab** — countdown pauses when the browser tab loses visibility, resumes with the remaining time when the user returns
- **Swipe to dismiss** — drag a toast horizontally to dismiss it; works with mouse, touch, and pen input
- **`@starting-style` enter animations** — smooth CSS entry transitions using the `@starting-style` at-rule
- **Keyboard dismiss** — press <kbd>Escape</kbd> to dismiss the most recent toast
- **FLIP reorder animations** — remaining toasts animate smoothly into their new positions when one is dismissed

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Live region', Description: 'Container uses `role=&quot;log&quot;` with `aria-live=&quot;polite&quot;` for screen reader announcements', WCAG: '[WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages), [RGAA 7.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.5)' },
  { Check: 'Role', Description: 'Items use `role=&quot;status&quot;` (`role=&quot;alert&quot;` for `danger` variant)', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Accessible name', Description: 'Heading and message linked via `aria-labelledby` / `aria-describedby`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Decorative elements', Description: 'Icons, accent bar, and timer bar are hidden with `aria-hidden=&quot;true&quot;`', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Timer pausing', Description: 'Timer pauses on hover and focus, providing keyboard parity', WCAG: '[WCAG 2.2.1](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable)' },
  { Check: 'Motion', Description: 'Respects `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Keep messages short and readable within the auto-dismiss duration',
  'Set `duration` to `5000` or longer for readability',
  'Use `variant=&quot;danger&quot;` for critical alerts — it promotes the toast to `role=&quot;alert&quot;`',
  'Ensure any actions in toasts are also available elsewhere on the page',
  'Use dialogs instead of toasts for information that requires user action',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Escape', Description: 'Dismisses the most recent toast' },
  { Key: 'Tab', Description: 'Moves focus into the toast (pauses the auto-dismiss timer)' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
// Side-effect import (registers <l-toast> element)
import 'luxen-ui/toast';

// Or import the standalone function (auto-creates <l-toast>)
import { toast } from 'luxen-ui/toast';
toast({ text: 'Hello!' });
```

```css [CSS]
@import 'luxen-ui/css/toast';
@import 'luxen-ui/css/close-button';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'placement', Description: 'Position of the toast stack: `top-start`, `top-center`, `top-end` (default), `bottom-start`, `bottom-center`, `bottom-end`' },
  { Attribute: 'duration', Description: 'Default auto-dismiss delay in ms. Default `5000`. Set to `0` or `Infinity` to keep open until dismissed' },
  { Attribute: 'variant', Description: 'Default variant for toast items: `info`, `success`, `warning`, `danger`' },
]" />

### Methods

<ApiTable :data="[
  { Method: 'toast()', Arguments: '`options: ToastOptions`', Returns: '`HTMLElement`', Description: 'Creates and shows a toast notification' },
]" />

### ToastOptions

<ApiTable :data="[
  { Property: 'text', Type: '`string`', Default: '—', Description: 'The message text to display. Required unless `html` is provided' },
  { Property: 'html', Type: '`string`', Default: '—', Description: 'HTML content for the message, sanitized via the [Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API). Ignored if `text` is provided' },
  { Property: 'heading', Type: '`string`', Default: '—', Description: 'Heading text displayed above the message' },
  { Property: 'icon', Type: '`string`', Default: '—', Description: 'Iconify icon name (e.g. `lucide:check`). Replaces the accent bar, colored by variant' },
  { Property: 'variant', Type: '`string`', Default: 'Element\'s `variant`', Description: 'Override variant for this toast' },
  { Property: 'duration', Type: '`number`', Default: 'Element\'s `duration`', Description: 'Override auto-dismiss delay in ms. `0` or `Infinity` to keep open until dismissed' },
  { Property: 'timer', Type: '`boolean`', Default: '`false`', Description: 'Show a countdown progress bar at the bottom' },
]" />

### Events

<ApiTable :data="[
  { Event: 'l-show', Detail: '`{ toast }`', Description: 'Emitted when a toast begins to show. Cancelable' },
  { Event: 'l-after-show', Detail: '`{ toast }`', Description: 'Emitted after the show animation completes' },
  { Event: 'l-hide', Detail: '`{ toast }`', Description: 'Emitted when a toast begins to hide. Cancelable' },
  { Event: 'l-after-hide', Detail: '`{ toast }`', Description: 'Emitted after the hide animation completes and toast is removed' },
]" />

### CSS classes

<ApiTable :data="[
  { Class: 'l-toast-item', Description: 'Toast item custom element (generated internally)' },
  { Class: '.l-toast-accent', Description: 'Left accent bar, colored by variant' },
  { Class: '.l-toast-content', Description: 'Content area' },
  { Class: '.l-toast-heading', Description: 'Heading text' },
  { Class: '.l-toast-message', Description: 'Message text' },
  { Class: '.l-toast-timer', Description: 'Countdown progress bar (auto-added for timed toasts)' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Property: '--gap', Description: 'Gap between stacked items. Default `0.5rem`' },
  { Property: '--width', Description: 'Width of the toast stack. Default `28rem`' },
  { Property: '--show-duration', Description: 'Show animation duration. Default `200ms`' },
  { Property: '--hide-duration', Description: 'Hide animation duration. Default `200ms`' },
]" />
