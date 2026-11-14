---
outline: deep
---

<script setup>
import defaultAppearance from '../.vitepress/examples/radio-group/Default.html?raw'
import button from '../.vitepress/examples/radio-group/Button.html?raw'
import vertical from '../.vitepress/examples/radio-group/Vertical.html?raw'
import sizes from '../.vitepress/examples/radio-group/Sizes.html?raw'
import disabled from '../.vitepress/examples/radio-group/Disabled.html?raw'
</script>

# Radio group <Badge type="tip">&lt;fieldset&gt;</Badge>

A set of native radios, shown as the classic dot or as joined buttons — the form counterpart of a [segmented control](./segmented-control.md).

<ElementSpec element="radio-group" />

::: code-group

```html [HTML]
<fieldset class="l-radio-group">
  <legend>View</legend>
  <label>
    <input
      type="radio"
      class="l-radio"
      name="view"
      value="list"
      checked
    />
    List
  </label>
  <label>
    <input
      type="radio"
      class="l-radio"
      name="view"
      value="board"
    />
    Board
  </label>
</fieldset>
```

:::

The group is a `<fieldset>` captioned by its `<legend>`, and each item is a `<label>` wrapping one `<input type="radio">`. That is the platform's own way to group and name a set of radios, so there is no ARIA to add and no `for`/`id` pair to keep in sync. There is **no JavaScript** either: radios sharing a `name` already give single selection, arrow-key navigation, form submission, reset and validation — this is a stylesheet, not a component.

That is the difference with [segmented control](./segmented-control.md): use this when the value is submitted with a form, and the segmented control when the choice takes effect immediately.

## Options

### Appearance

#### Default

The radio primitive: put `.l-radio` on each input.

<ComponentWrapper :html="defaultAppearance" />

::: details Code
::: code-group
<<< @/.vitepress/examples/radio-group/Default.html [HTML]
:::

#### Button

Add `data-appearance="button"` on the group and `.l-button` on each label. The items are joined into a single unit and the selected one keeps the button's active fill.

<ComponentWrapper :html="button" />

::: details Code
::: code-group
<<< @/.vitepress/examples/radio-group/Button.html [HTML]
:::

### Naming the group

The `<legend>` names the group — the technique [WCAG H71](https://www.w3.org/WAI/WCAG22/Techniques/html/H71) and [RGAA 11.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.6) ask for. When no visible caption fits, a view switcher in a toolbar for instance, drop the `<legend>` and name the `<fieldset>` with `aria-label` instead.

```html
<fieldset
  class="l-radio-group"
  data-appearance="button"
  aria-label="View"
>
  <label class="l-button">…</label>
</fieldset>
```

### Orientation

Add `data-orientation="vertical"` to stack the items. Works in both appearances.

<ComponentWrapper :html="vertical" />

::: details Code
::: code-group
<<< @/.vitepress/examples/radio-group/Vertical.html [HTML]
:::

### Sizes

In the button appearance, set `data-size` on every label so the group stays even. Any `.l-button` size works.

<ComponentWrapper :html="sizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/radio-group/Sizes.html [HTML]
:::

### Disabled segment

Add `disabled` to a segment's input. Arrow keys skip it, and it drops out of the tab order — both from the browser, not from us.

<ComponentWrapper :html="disabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/radio-group/Disabled.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'One Tab stop for the group', Description: 'Arrow keys move and select through the group', Note: 'Browser behaviour, not scripted', WCAG: '[WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [RGAA 7.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.3)' },
  { Check: 'Focus ring on keyboard focus', Description: 'In the button appearance the ring is mirrored onto the label and raised above the joined borders', Note: 'The input there is transparent but focusable', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)' },
  { Check: '24px minimum target', Description: 'In the button appearance a segment is a full `.l-button`, so it clears the 24px minimum at every size', WCAG: '[WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)' },
]" :rules="[
  { Check: 'Group radios in a named `<fieldset>`', Description: 'Name it with a `<legend>` first child, or with `aria-label` when no visible caption fits', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.5](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.5)' },
  { Check: 'Label the field', Description: 'Wrap each input in a `<label>`; no `for` / `id` pair needed', Note: 'The label text becomes the accessible name, and the label the click target', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Don’t hide the input', Description: 'Never use `display: none` or `visibility: hidden` on it', Note: 'Either would remove it from the accessibility tree and the tab order' },
  { Check: 'Share one `name` across the group' },
  { Check: 'Use a native `<input type=&quot;radio&quot;>`', Note: 'Native radios expose `radio` and their checked state without any ARIA', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus into the group, onto the checked segment' },
  { Key: 'ArrowRight', Description: 'Selects and focuses the next segment; wraps at the end in Chrome and Firefox, stops there in Safari (the browser’s own radio behaviour)' },
  { Key: 'ArrowLeft', Description: 'Selects and focuses the previous segment; wraps at the start in Chrome and Firefox, stops there in Safari' },
  { Key: 'ArrowDown', Description: 'Same as ArrowRight' },
  { Key: 'ArrowUp', Description: 'Same as ArrowLeft' },
  { Key: 'Space', Description: 'Selects the focused segment when none was selected' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/radio-group';
```

:::

The segments are `.l-button` elements, so `luxen-ui/css/button` is required too.

### Attributes & Properties

<ApiTable element="radio-group" section="attributes" />

### CSS classes

<ApiTable element="radio-group" section="cssClasses" />
