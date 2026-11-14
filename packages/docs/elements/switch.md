---
outline: deep
---

<script setup>
import statesExample from '../.vitepress/examples/switch/States.html?raw'
import sizingExample from '../.vitepress/examples/switch/Sizing.html?raw'
import withFieldExample from '../.vitepress/examples/switch/WithField.html?raw'
import rtlExample from '../.vitepress/examples/switch/Rtl.html?raw'
</script>

# Switch <Badge type="tip">&lt;input&gt;</Badge>

Switches toggle a single setting on or off, taking effect immediately.

<ElementSpec element="switch" />

::: code-group

```html [HTML]
<l-form-field>
  <label>Email notifications</label>
  <input
    type="checkbox"
    role="switch"
    checked
  />
</l-form-field>
```

:::

A switch is a native `<input type="checkbox">` with `role="switch"` — keep the role so assistive tech announces "on/off" instead of "checked". [`l-form-field`](/elements/form-field) auto-styles a bare switch and wires the accessibility (label, hint, error, `aria-*`); standalone, apply `.l-switch` to the input yourself.

Use a switch for a setting that applies instantly (no Save step). For an option that only takes effect on form submission, prefer a [checkbox](/elements/checkbox).

## Options

### On

Native `checked` attribute.

### Disabled

Native `disabled` attribute.

### States

<ComponentWrapper :html="statesExample" />

::: details Code
<<< @/.vitepress/examples/switch/States.html [HTML]
:::

### Invalid

Styled via `:user-invalid` (after interaction) or by setting `aria-invalid="true"`. Inside `l-form-field` this is managed for you.

### Size & accent

Override `--size` for the track height (the whole control scales from it) and `--accent` for the on fill.

<ComponentWrapper :html="sizingExample" />

::: details Code
<<< @/.vitepress/examples/switch/Sizing.html [HTML]
:::

## Examples

### With a hint

`l-form-field` wires the accessibility (label, hint, `aria-*`).

<ComponentWrapper :html="withFieldExample" />

::: details Code
<<< @/.vitepress/examples/switch/WithField.html [HTML]
:::

### Right-to-left

In a `dir="rtl"` context the thumb rests at the inline-start (right) and slides to the inline-end (left) when on — no extra markup needed.

<ComponentWrapper :html="rtlExample" />

::: details Code
<<< @/.vitepress/examples/switch/Rtl.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'State not conveyed by color alone', Description: 'The thumb position and the `checked` state carry on/off', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [RGAA 3.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.1)' },
  { Check: 'Track visible in forced-colors mode', Description: 'The track gains a system-color outline, and the on state switches it to `Highlight`', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)' },
  { Check: 'Focus ring on keyboard focus', Description: 'A 2px outline via `:focus-visible`', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Reduced motion respected', Description: 'The slide and squish animations collapse to 0ms under `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  { Check: 'Label the field', Description: 'Wrap the input in a `<label>`, or link one with `for` / `id`', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Add `role=&quot;switch&quot;` to a checkbox input', Description: 'Put it on a native `<input type=&quot;checkbox&quot;>`', Note: 'It exposes the `switch` role with an on/off state, and the skin and inline field layout depend on it', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Keep the target at least 24×24px', Note: 'The label is part of the click target', WCAG: '[WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)' },
  { Check: 'Name the setting, not an action', Description: 'Write the label as the thing being turned on, such as `Email notifications`' },
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the switch' },
  { Key: 'Space', Description: 'Toggles the switch on or off' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/switch';
```

:::

### Attributes & Properties

<ApiTable element="switch" section="attributes" />

### CSS classes

<ApiTable element="switch" section="cssClasses" />

### CSS custom properties

<ApiTable element="switch" section="cssProperties" />
