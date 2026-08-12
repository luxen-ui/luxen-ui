---
outline: deep
---

<script setup>
import basicExample from '../.vitepress/examples/color-scheme-icon/Basic.html?raw'
import schemeExample from '../.vitepress/examples/color-scheme-icon/Scheme.html?raw'
import sizingExample from '../.vitepress/examples/color-scheme-icon/Sizing.html?raw'
import accessibleNameExample from '../.vitepress/examples/color-scheme-icon/AccessibleName.html?raw'
import inAMenuRowExample from '../.vitepress/examples/color-scheme-icon/InAMenuRow.html?raw'
</script>

# Color scheme icon <Badge type="tip">&lt;l-color-scheme-icon&gt;</Badge>

A sun that morphs into a moon.

<ElementSpec element="color-scheme-icon" />

::: code-group

```html [HTML]
<l-color-scheme-icon scheme="dark"></l-color-scheme-icon>
```

:::

The two glyphs are one shape: the disc grows, a mask slides in to carve the crescent, and the rays retract in a ripple. Nothing is added or removed, so the change reads as a single object turning rather than two icons swapping.

Its home is an icon-only button in a header — the button owns the role, the name and the pressed state; the glyph shows which scheme is in effect.

<ComponentWrapper :html="basicExample" />

::: details Code
<<< @/.vitepress/examples/color-scheme-icon/Basic.html [HTML]
:::

It is **presentational only** — it shows a scheme, it never chooses or stores one. With no `scheme` it follows [`colorScheme.current`](/overview/color-scheme), so it stays in step with every other control on the page without wiring; set `scheme` to pin it.

The example above uses inline handlers to stay readable. In an application, the click and the pressed state are what you wire — the glyph needs nothing:

```js
import { colorScheme } from 'luxen-ui/color-scheme';

const button = document.querySelector('[aria-label="Dark theme"]');

button.addEventListener('click', () => colorScheme.toggle());

// Called once with the current scheme, then on every change — no initial pass.
colorScheme.subscribe((scheme) => {
  button.setAttribute('aria-pressed', String(scheme === 'dark'));
});
```

### Which scheme does the glyph show?

The one **in effect**, not the one a click would move to: dark mode shows the moon. That is what makes it correct inside a `role="switch"` thumb or beside an `aria-pressed` button, where the state is already announced and the glyph should agree with it.

To advertise the destination instead — a sun meaning "switch to light" — pass the opposite of your current scheme. Pick one convention and hold it across the app; mixing them is how a toggle stops being readable.

## Options

### Scheme

Leave `scheme` unset and the icon follows the page's [color scheme](/overview/color-scheme) — a stored override, else the OS preference — updating itself when it changes anywhere, including in another tab.

Set `scheme` and the store is out of the picture: the glyph shows what you tell it and nothing else moves it. That is the hook for an app that already owns its light/dark state — a framework store, a class on `<html>` written by the server, a user setting fetched from an API — and also what pins a glyph in a legend or a preview.

```js
// Your state, your rules. The icon just draws it.
theme.subscribe((value) => (icon.scheme = value));
```

<ComponentWrapper :html="schemeExample" />

::: details Code
<<< @/.vitepress/examples/color-scheme-icon/Scheme.html [HTML]
:::

### Size & color

`--size` sets width and height (default `1em`, so it scales with the surrounding text). `--color` defaults to `currentColor`.

<ComponentWrapper :html="sizingExample" />

::: details Code
<<< @/.vitepress/examples/color-scheme-icon/Sizing.html [HTML]
:::

### Accessible name

The icon is decorative by default and hidden from assistive tech, which is what you want inside a row or button that already carries the name. Set `label` to make it meaningful — it then exposes `role="img"` with that name.

Both icons below look identical; the difference exists only in the accessibility tree.

<ComponentWrapper :html="accessibleNameExample" />

::: details Code
<<< @/.vitepress/examples/color-scheme-icon/AccessibleName.html [HTML]
:::

## Examples

### In a menu row

Put it in a `type="checkbox"` [dropdown item](/elements/dropdown#theme-row) and the row is the control: whole row clickable, `menuitemcheckbox` role, menu stays open. The icon stays decorative.

Add `check-placement="end"` so the check moves to the trailing edge and leaves the leading column free — the glyph then lines up with every other row's icon.

<ComponentWrapper :html="inAMenuRowExample" />

::: details Code
<<< @/.vitepress/examples/color-scheme-icon/InAMenuRow.html [HTML]
:::

Here the row carries the state, so `checked` is what you keep in step:

```js
import { colorScheme } from 'luxen-ui/color-scheme';

const item = document.querySelector('l-dropdown-item[value="theme"]');

document.querySelector('l-dropdown').addEventListener('select', (event) => {
  if (event.item === item) colorScheme.set(item.checked ? 'dark' : 'light');
});

colorScheme.subscribe((scheme) => (item.checked = scheme === 'dark'));
```

Do not put a [switch](/elements/switch) in a menu row instead: a `role="menu"` may only own `menuitem`, `menuitemcheckbox` and `menuitemradio` children, and a nested control gives the row two competing click targets.

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Decorative by default', Description: 'With no `label` the icon is `aria-hidden` — the surrounding row or button carries the accessible name, so nothing is announced twice', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.2)' },
  { Check: 'Meaningful when named', Description: 'Setting `label` exposes `role=img` with that name, for the rare case where the glyph stands alone', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Reduced motion', Description: 'The morph collapses to 0ms under `prefers-reduced-motion`; the glyph still changes, it just does not animate', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Leave the icon decorative when it sits inside a control that already has a name — a menu row, a button',
  'Never rely on the glyph alone to convey the state; pair it with a label or an `aria-checked` row',
  'Leave `scheme` unset unless the glyph must be pinned — it then follows the page and cannot disagree with it',
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/color-scheme-icon';
```

:::

### Properties

<ApiTable element="color-scheme-icon" section="properties" />

### CSS custom properties

<ApiTable element="color-scheme-icon" section="cssProperties" />

### CSS parts

<ApiTable element="color-scheme-icon" section="cssParts" />
