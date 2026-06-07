---
outline: deep
---

<script setup>
import avatarImage from '../.vitepress/examples/avatar/AvatarImage.html?raw'
import avatarInitials from '../.vitepress/examples/avatar/AvatarInitials.html?raw'
import avatarSizes from '../.vitepress/examples/avatar/AvatarSizes.html?raw'
import avatarCustomSize from '../.vitepress/examples/avatar/AvatarCustomSize.html?raw'
import avatarBadge from '../.vitepress/examples/avatar/AvatarBadge.html?raw'
import avatarCircle from '../.vitepress/examples/avatar/AvatarCircle.html?raw'
import avatarInteractive from '../.vitepress/examples/avatar/AvatarInteractive.html?raw'
import avatarGroup from '../.vitepress/examples/avatar/AvatarGroup.html?raw'
import avatarColors from '../.vitepress/examples/avatar/AvatarColors.html?raw'
</script>

# Avatar <Badge type="tip">&lt;l-avatar&gt;</Badge>

Avatars are used to represent a user or entity with a profile image, initials, or icon fallback. Commonly used in headers, comments, contact lists, and user cards.

<ElementSpec element="avatar" />

## Options

### Image

Set `src` and `name` attributes. Falls back to initials if the image fails to load.

<ComponentWrapper :html="avatarImage" />

::: details Code
::: code-group
<<< @/.vitepress/examples/avatar/AvatarImage.html [HTML]
:::

### Initials

Set `name` to auto-extract initials, or slot custom text content.

<ComponentWrapper :html="avatarInitials" />

::: details Code
::: code-group
<<< @/.vitepress/examples/avatar/AvatarInitials.html [HTML]
:::

### Custom colors

Set `--color` to a base color. The text color is auto-derived from its luminance, staying readable on both pastel and saturated backgrounds.

<ComponentWrapper :html="avatarColors" />

::: details Code
::: code-group
<<< @/.vitepress/examples/avatar/AvatarColors.html [HTML]
:::

### Sizes

Add the `size` attribute: `xs`, `sm`, `md` (default), `lg`, or `xl`.

<ComponentWrapper :html="avatarSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/avatar/AvatarSizes.html [HTML]
:::

### Custom size

Set `--size` to any length for an arbitrary pixel size. It overrides the `size` scale and the font follows proportionally. Use it alone — not combined with a `size` token.

<ComponentWrapper :html="avatarCustomSize" />

::: details Code
::: code-group
<<< @/.vitepress/examples/avatar/AvatarCustomSize.html [HTML]
:::

### Circle

Set `--appearance: circle` for a fully circular shape. Default is a rounded square.

<ComponentWrapper :html="avatarCircle" />

::: details Code
::: code-group
<<< @/.vitepress/examples/avatar/AvatarCircle.html [HTML]
:::

### Badge

Set `badge` to a number to show a count indicator at the bottom-right corner.

<ComponentWrapper :html="avatarBadge" />

::: details Code
::: code-group
<<< @/.vitepress/examples/avatar/AvatarBadge.html [HTML]
:::

### Interactive

Add the `interactive` attribute to render the avatar as a `<button>`. Includes focus ring and hover state.

<ComponentWrapper :html="avatarInteractive" />

::: details Code
::: code-group
<<< @/.vitepress/examples/avatar/AvatarInteractive.html [HTML]
:::

### Group

Wrap avatars in `.l-avatar-group` for an overlapping stack with a surface-colored ring.

<ComponentWrapper :html="avatarGroup" />

::: details Code
::: code-group
<<< @/.vitepress/examples/avatar/AvatarGroup.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Default `role=&quot;img&quot;` communicates the avatar as an image', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Accessible name', Description: '`aria-label` is set automatically from the `name` attribute', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Interactive mode', Description: 'When `interactive` is set, renders as a `<button>` with focus ring and hover states', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Decorative elements', Description: 'Badge count is hidden from assistive tech with `aria-hidden=&quot;true&quot;`', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content)' },
  { Check: 'Image fallback', Description: 'Falls back to initials (then default icon) if image fails to load', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content)' },
]" :rules="[
  'Always provide the `name` attribute — it drives both `aria-label` and the initials fallback',
  'Add `interactive` only when the avatar triggers an action (e.g., opens a profile menu)',
]" />

### Keyboard interactions

When `interactive` is set:

<KeyboardTable :data="[
  { Key: 'Enter', Description: 'Activates the avatar button' },
  { Key: 'Space', Description: 'Activates the avatar button' },
  { Key: 'Tab', Description: 'Moves focus to the next focusable element' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/avatar';
```

:::

### Attributes & Properties

<ApiTable element="avatar" section="properties" />

### CSS classes

<ApiTable element="avatar" section="cssClasses" />

### CSS custom properties

<ApiTable element="avatar" section="cssProperties" />

### CSS parts

<ApiTable element="avatar" section="cssParts" />
