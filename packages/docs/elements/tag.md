---
outline: deep
---

<script setup>
import tagDefault from '../.vitepress/examples/tag/TagDefault.html?raw'
import tagSizes from '../.vitepress/examples/tag/TagSizes.html?raw'
import tagPrefix from '../.vitepress/examples/tag/TagPrefix.html?raw'
import tagSelectable from '../.vitepress/examples/tag/TagSelectable.html?raw'
import tagCheckbox from '../.vitepress/examples/tag/TagCheckbox.html?raw'
import tagDisabled from '../.vitepress/examples/tag/TagDisabled.html?raw'
import tagFilterPanel from '../.vitepress/examples/tag/TagFilterPanel.html?raw'
import tagTheming from '../.vitepress/examples/tag/TagTheming.html?raw'
</script>

# Tag <Badge type="tip">&lt;l-tag&gt;</Badge>

Tags are compact chips for tokens, filters, and selected values, with an optional remove button.

::: code-group

```html [HTML]
<l-tag removable>Design</l-tag>
```

:::

<ElementSpec element="tag" />

## Options

### Removable

Add `removable` for a × button. The user can also press `Backspace` or `Delete` while it is focused. Each removal fires a cancelable `remove` event; if nothing calls `preventDefault()`, the tag removes itself from the DOM.

<ComponentWrapper :html="tagDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagDefault.html [HTML]
:::

### Sizes

Add `size="sm"` or `size="lg"`. Default is md. A removable tag is always at least 24px tall to keep its remove target accessible.

<ComponentWrapper :html="tagSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagSizes.html [HTML]
:::

### Leading and trailing content

Put an icon or avatar in the `prefix` slot, and a count or trailing glyph in the `suffix` slot. Both get the chip's own gutter, so they need no margin.

<ComponentWrapper :html="tagPrefix" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagPrefix.html [HTML]
:::

### Selectable

Add `selectable` to turn the chip into a filter control. The tag becomes a toggle button, and re-activating a selected tag deselects it — so a facet always has a way back to "all". Each toggle fires a `change` event carrying the new `selected` state.

<ComponentWrapper :html="tagSelectable" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagSelectable.html [HTML]
:::

### Checkbox

Add `control="checkbox"` for a multi-select facet: the library's checkbox rides inside and the chip becomes its label, so clicking anywhere on the chip toggles it. Implies `selectable`.

<ComponentWrapper :html="tagCheckbox" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagCheckbox.html [HTML]
:::

### Disabled

Add `disabled` to block removal. The label stays legible — disabled is conveyed by the dimmed × button and the `not-allowed` cursor, not by washing out the text.

<ComponentWrapper :html="tagDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagDisabled.html [HTML]
:::

## Examples

### Filter panel

One tag per facet value: a checkbox for a multi-select axis, the count in the `suffix` slot. Listen for `change` on the container — the event bubbles and carries `selected`.

<ComponentWrapper :html="tagFilterPanel" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagFilterPanel.html [HTML]
:::

### Theming the selected state

`--selected-color` sets the text, border, and checkbox accent at once, and the background is derived from it. Add `--selected-background` for a different fill, and `--border-radius` to trade the pill for a softer rectangle. Every custom property inherits, so setting them on the group themes each chip inside.

A dense filter drawer usually wants a step between `md` and `lg`: `--height` and `--font-size` (and `--padding-inline` if needed) land anywhere between them, so `::part(base)` stays out of it. The example below sits at 26px / 13px.

Pair a semantic text token with its matching `-soft` fill — those two are designed to clear 4.5:1 together in both light and dark. A `--selected-color` on its own must clear that bar against the tint the chip derives from it.

<ComponentWrapper :html="tagTheming" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagTheming.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Accessible name', Description: 'The remove button exposes a localized `Remove` label', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Target size', Description: 'The remove button keeps a minimum 24×24px hit target, and a selectable chip is taller than a display one', WCAG: '[WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [RGAA 13.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.10)' },
  { Check: 'Keyboard', Description: 'The remove button is reachable with Tab and removes the tag with Backspace / Delete; a selectable tag toggles with Enter or Space', WCAG: '[WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [RGAA 12.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.9)' },
  { Check: 'State', Description: 'A selectable tag exposes `aria-pressed`, or the checked state of its checkbox with `control=checkbox`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Color contrast', Description: 'The label keeps the minimum contrast ratio over the chip background in every state, including selected and disabled', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
  { Check: 'Not colour alone', Description: 'With `control=checkbox` the checkmark conveys selection alongside the tint', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [RGAA 3.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.1)' },
]" :rules="[
  'Always give a removable tag a visible text label so its remove button has context',
  'Group related selectable tags under a visible heading, and give the group a role of `group` with an `aria-label` when the heading is not adjacent',
  'Use `control=checkbox` for a multi-select axis and the default toggle for a single-value one — never radios, which cannot be released once checked',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the tag (when selectable), then to the remove button (when removable)' },
  { Key: 'Enter / Space', Description: 'Toggles a focused selectable tag, or activates the focused remove button' },
  { Key: 'Backspace / Delete', Description: 'Removes the tag while it is focused' },
]" />

### Selectors & testing

Selection state lives on the reflected `selected` attribute of the host — that is the one to query. `aria-pressed` sits on the toggle button and `control="checkbox"` renders its `<input>`, both **inside the shadow DOM**, so a descendant selector from the light DOM never matches them. Role queries do work: the accessibility tree is unaffected by the shadow boundary.

```js
document.querySelectorAll('l-tag[selected]'); // ✅ reflected boolean attribute
screen.getByRole('button', { pressed: true }); // ✅ selectable tag
screen.getByRole('checkbox', { checked: true }); // ✅ control="checkbox"

tag.querySelector('input'); // ❌ null — the checkbox is in the shadow root
tag.getAttribute('aria-pressed'); // ❌ null — it is on the inner button
```

```css
/* Style by the reflected attribute; ::part() reaches the inner nodes. */
l-tag[selected]::part(base) {
  outline: 1px dashed var(--l-color-border);
}
```

### Controlled usage

The chip is uncontrolled: it applies the new state, then fires `change`. To veto a toggle — a "max 3 filters" rule, an async guard — set `selected` back in the listener. The revert lands in the same render, so nothing is painted in between.

```js
panel.addEventListener('change', (event) => {
  const tag = event.target;
  if (tag.selected && selectedCount() > 3) tag.selected = false;
});
```

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/tag';
```

:::

### Attributes & Properties

<ApiTable element="tag" section="properties" />

### Events

<ApiTable element="tag" section="events" />

### Slots

<ApiTable element="tag" section="slots" />

### CSS parts

<ApiTable element="tag" section="cssParts" />

### CSS custom properties

<ApiTable element="tag" section="cssProperties" />
