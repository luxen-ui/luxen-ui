---
outline: deep
---

<script setup>
import alertBasic from '../.vitepress/examples/alert/AlertBasic.html?raw'
import alertVariants from '../.vitepress/examples/alert/AlertVariants.html?raw'
import alertTitle from '../.vitepress/examples/alert/AlertTitle.html?raw'
import alertIcon from '../.vitepress/examples/alert/AlertIcon.html?raw'
import alertDismissible from '../.vitepress/examples/alert/AlertDismissible.html?raw'
</script>

# Alert <Badge type="tip">&lt;l-alert&gt;</Badge>

Alerts display a contextual message inline, drawing attention with a semantic color and a leading icon. Commonly used for form feedback, status banners, and inline warnings.

::: code-group

```html [HTML]
<l-alert variant="info">Your changes have been saved.</l-alert>
```

:::

<ElementSpec element="alert" />

## Options

### Variants

Add `variant="info"`, `variant="success"`, `variant="warning"`, or `variant="danger"`. Each picks a default icon and tints the callout. Default is neutral.

<ComponentWrapper :html="alertVariants" />

::: details Code
::: code-group
<<< @/.vitepress/examples/alert/AlertVariants.html [HTML]
:::

### Title

Add a `.l-alert-title` element above the body content for a bold heading.

<ComponentWrapper :html="alertTitle" />

::: details Code
::: code-group
<<< @/.vitepress/examples/alert/AlertTitle.html [HTML]
:::

### Icon

Override the variant's default icon with `icon="set:name"` ([Iconify](https://icon-sets.iconify.design/) format), or hide it with `without-icon`.

<ComponentWrapper :html="alertIcon" />

::: details Code
::: code-group
<<< @/.vitepress/examples/alert/AlertIcon.html [HTML]
:::

### Dismissible

Add the `dismissible` attribute to show a close button. Clicking it emits a cancelable `hide` event, then removes the alert.

<ComponentWrapper :html="alertDismissible" />

::: details Code
::: code-group
<<< @/.vitepress/examples/alert/AlertDismissible.html [HTML]
:::

## Examples

### Title with body and action

<ComponentWrapper :html="alertBasic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/alert/AlertBasic.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Live region', Description: 'A static alert in the markup is read in normal reading order. For an alert injected dynamically, add `role=&quot;alert&quot;` (assertive) or `role=&quot;status&quot;` (polite) so screen readers announce it', WCAG: '[WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages), [RGAA 7.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.5)' },
  { Check: 'Not color alone', Description: 'Meaning is carried by the icon and text, not color alone', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [RGAA 3.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.1)' },
  { Check: 'Color contrast', Description: 'Text meets the minimum contrast ratio against the tinted background across all variants', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
  { Check: 'Decorative icon', Description: 'The leading icon is hidden with `aria-hidden=&quot;true&quot;`', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Close button name', Description: 'The dismiss button has a localized `aria-label` (`Close`)', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
]" :rules="[
  'Do not rely on variant color alone — always include a text label',
  'Add `role=&quot;alert&quot;` when the alert is inserted in response to a user action, so it is announced',
  'Use `variant=&quot;danger&quot;` for errors and `variant=&quot;warning&quot;` for cautionary messages',
  'Use a heading element for the title (e.g. `&lt;h3 class=&quot;l-alert-title&quot;&gt;`) when the alert is a section callout, so it is reachable by heading navigation',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the close button (when `dismissible`)' },
  { Key: 'Enter / Space', Description: 'Dismisses the alert when the close button is focused' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/alert';
```

```css [CSS]
@import 'luxen-ui/css/alert';
/* Only needed when using `dismissible` */
@import 'luxen-ui/css/close-button/ring';
```

:::

### Attributes & Properties

<ApiTable element="alert" section="properties" />

### Events

<ApiTable element="alert" section="events" />

### CSS classes

<ApiTable element="alert" section="cssClasses" />

### CSS custom properties

<ApiTable element="alert" section="cssProperties" />
