---
outline: deep
---

<script setup>
import basic from '../.vitepress/examples/button-group/Basic.html?raw'
import vertical from '../.vitepress/examples/button-group/Vertical.html?raw'
import toolbar from '../.vitepress/examples/button-group/Toolbar.html?raw'
import splitButton from '../.vitepress/examples/button-group/SplitButton.html?raw'
import sizes from '../.vitepress/examples/button-group/Sizes.html?raw'
</script>

# Button group <Badge type="tip">&lt;l-button-group&gt;</Badge>

A wrapper for multiple related buttons, joined into a single unit with shared borders. Buttons keep their own state; the group never manages the selection — for a single-choice control that owns a value and submits it with a form, see [segmented control](./segmented-control.md).

<ElementSpec element="button-group" />

::: code-group

```html [HTML]
<l-button-group label="Record actions">
  <button class="l-button">Edit</button>
  <button class="l-button">Duplicate</button>
  <button class="l-button">Archive</button>
</l-button-group>
```

:::

## Options

### Label

Add `label` to give the group an accessible name announced by screen readers.

<ComponentWrapper :html="basic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/Basic.html [HTML]
:::

### Orientation

Add `orientation="vertical"` to stack the buttons.

<ComponentWrapper :html="vertical" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/Vertical.html [HTML]
:::

### Sizes

Set `data-size` on every button of a group so it stays even. The sizes below are `sm`, the default `md`, `lg`, and `xl`.

<ComponentWrapper :html="sizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/Sizes.html [HTML]
:::

## Examples

### Toolbar

Sit several groups side by side to build a toolbar. Each group keeps its own `label`, so assistive tech announces which set a button belongs to, and each group decides whether it carries state:

- **History** — plain actions, no state.
- **Text formatting** — independent toggles; several can be pressed at once.
- **Text alignment** — a single choice; exactly one stays pressed.

<ComponentWrapper :html="toolbar" />

Buttons that carry state expose it with `aria-pressed`, and a pressed button keeps its active fill in every variant. The group never manages the selection — your application owns it. Independent toggles flip their own state:

```js
formatting.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const pressed = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', String(!pressed));
});
```

A single choice presses one button and releases the others:

```js
alignment.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  for (const b of alignment.querySelectorAll('button')) {
    b.setAttribute('aria-pressed', String(b === button));
  }
});
```

Add `data-icon-only` to a button with no visible text to square it, and give it an `aria-label`.

The wrapper is a plain element, not `role="toolbar"`: that role expects arrow-key navigation across the whole bar, which the groups do not implement — each button stays a `Tab` stop.

For a single-choice control that owns a `value` and submits it with a form, use [segmented control](./segmented-control.md) instead.

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/Toolbar.html [HTML]
:::

### Split button

Pair an action with an `<l-dropdown>` of related ones. The group rounds the corners of the dropdown trigger automatically.

<ComponentWrapper :html="splitButton" />

::: details Code
::: code-group
<<< @/.vitepress/examples/button-group/SplitButton.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Host gets `role=&quot;group&quot;` to expose the buttons as a set', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 9.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.3)' },
  { Check: 'Accessible name', Description: '`label` sets `aria-label` so assistive tech announces the group purpose', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Orientation', Description: '`orientation` is visual only. ARIA 1.2 does not allow `aria-orientation` on `role=&quot;group&quot;`, so no ARIA attribute is set', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)' },
  { Check: 'Focus order', Description: 'Each button is an independent `Tab` stop; the focus ring is raised above neighbours so it is never clipped', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Toggle state', Description: 'Buttons that carry state expose it with `aria-pressed`; the group never sets it', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Icon-only buttons', Description: 'Each icon-only button needs its own `aria-label`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
]" :rules="[
  'Always add a `label` describing the group purpose',
  'Children must be native `&lt;button class=&quot;l-button&quot;&gt;` elements (optionally wrapped in `l-dropdown` for split buttons)',
  'Give each icon-only button its own `aria-label`',
  'For toggle buttons, set `aria-pressed` on every button of the group, not only the pressed one',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the next button in the group' },
  { Key: 'Shift + Tab', Description: 'Moves focus to the previous button' },
  { Key: 'Enter', Description: 'Activates the focused button' },
  { Key: 'Space', Description: 'Activates the focused button' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/button-group';
```

```css [CSS]
@import 'luxen-ui/css/button-group';
```

:::

### Attributes & Properties

<ApiTable element="button-group" section="properties" />
