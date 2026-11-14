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
  { Check: 'Static alerts read in reading order', Description: 'An alert present in the markup is read in normal reading order', WCAG: '[WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages), [RGAA 7.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.5)' },
  { Check: 'Icon and text carry the meaning', Description: 'Variants never rely on color alone', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [RGAA 3.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.1)' },
  { Check: 'Text contrast passes', Description: 'Text meets the minimum ratio against the tinted background in every variant', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
  { Check: 'Decorative icon hidden', Description: 'The leading icon carries `aria-hidden=&quot;true&quot;`', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Close button labelled', Description: 'The dismiss button has a localized `aria-label` (`Close`)', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
]" :rules="[
  { Check: 'Announce injected alerts', Description: 'Add `role=&quot;alert&quot;` (assertive) or `role=&quot;status&quot;` (polite) to an alert inserted dynamically', Note: 'An alert inserted in response to a user action takes `role=&quot;alert&quot;`', WCAG: '[WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages), [RGAA 7.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.5)' },
  { Check: 'Add visible text', Description: 'Include a text label; the variant color alone never carries the meaning', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [RGAA 3.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.1)' },
  { Check: 'Use a heading for section callouts', Description: 'Mark the title up as a heading, e.g. `&lt;h3 class=&quot;l-alert-title&quot;&gt;`', Note: 'It is then reachable by heading navigation' },
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
