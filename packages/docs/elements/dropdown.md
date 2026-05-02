---
outline: deep
---

<script setup>
import dropdownBasic from '../.vitepress/examples/dropdown/DropdownBasic.html?raw'
import dropdownDisabledItem from '../.vitepress/examples/dropdown/DropdownDisabledItem.html?raw'
import dropdownCheckbox from '../.vitepress/examples/dropdown/DropdownCheckbox.html?raw'
import dropdownPlacement from '../.vitepress/examples/dropdown/DropdownPlacement.html?raw'
import dropdownDisabled from '../.vitepress/examples/dropdown/DropdownDisabled.html?raw'
</script>

# Dropdown <Badge type="tip">&lt;l-dropdown&gt;</Badge>

Dropdowns are used to present a list of actions or options in a floating menu anchored to a trigger button. Commonly used for overflow menus, contextual actions, and navigation.

<ElementSpec
  tag="l-dropdown"
  type="shadow"
/>

## Options

### Basic

Click the trigger to open the menu. Click outside or press <kbd>Escape</kbd> to close.

<ComponentWrapper :html="dropdownBasic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownBasic.html [HTML]
:::

### Disabled items

Add `disabled` to individual items to prevent selection.

<ComponentWrapper :html="dropdownDisabledItem" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownDisabledItem.html [HTML]
:::

### Checkbox items

Set `type="checkbox"` for toggleable items. The dropdown stays open when checking items.

<ComponentWrapper :html="dropdownCheckbox" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownCheckbox.html [HTML]
:::

### Placement

Set `placement` to control position. Default is `bottom-start`.

<ComponentWrapper :html="dropdownPlacement" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownPlacement.html [HTML]
:::

### Disabled

Add `disabled` to prevent opening.

<ComponentWrapper :html="dropdownDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownDisabled.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Panel has `role=&quot;menu&quot;`, items have `role=&quot;menuitem&quot;` or `role=&quot;menuitemcheckbox&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Expanded state', Description: 'Trigger receives `aria-expanded` reflecting open state', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Checked state', Description: 'Checkbox items use `aria-checked` to communicate toggle state', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Disabled state', Description: 'Disabled items use `aria-disabled`, remaining in the DOM for discoverability', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Focus management', Description: 'Focus moves into menu on open and returns to trigger on close', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Motion', Description: 'Respects `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Use a `<button>` element for the trigger in the `trigger` slot',
  'Every item must have visible text content for its accessible name',
  'For checkbox items, set `type=&quot;checkbox&quot;` — the component handles `aria-checked` automatically',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Enter', Description: 'Opens menu and focuses first item; or selects the focused item' },
  { Key: 'Space', Description: 'Opens menu and focuses first item; or selects the focused item' },
  { Key: 'ArrowDown', Description: 'Opens menu and focuses first item; or moves focus to the next item (wraps)' },
  { Key: 'ArrowUp', Description: 'Opens menu and focuses last item; or moves focus to the previous item (wraps)' },
  { Key: 'Home', Description: 'Moves focus to the first item' },
  { Key: 'End', Description: 'Moves focus to the last item' },
  { Key: 'Escape', Description: 'Closes menu and returns focus to the trigger' },
  { Key: 'Tab', Description: 'Closes menu and moves focus to the next focusable element' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/dropdown';
import 'luxen-ui/dropdown-item';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'open', Description: 'Whether the dropdown is visible. Reflects to attribute' },
  { Attribute: 'placement', Description: 'Preferred placement: `bottom-start` (default), `bottom`, `bottom-end`, `top-start`, `top`, `top-end`, `right-start`, `right`, `right-end`, `left-start`, `left`, `left-end`' },
  { Attribute: 'distance', Description: 'Offset from trigger in px. Default `4`' },
  { Attribute: 'disabled', Description: 'Prevents the dropdown from opening' },
]" />

### Methods

<ApiTable :data="[
  { Method: 'show()', Description: 'Opens the dropdown' },
  { Method: 'hide()', Description: 'Closes the dropdown' },
  { Method: 'toggle()', Description: 'Toggles the dropdown' },
]" />

### Events

<ApiTable :data="[
  { Event: 'show', Description: 'Fired before the dropdown opens. Cancelable' },
  { Event: 'after-show', Description: 'Fired after the open animation completes' },
  { Event: 'hide', Description: 'Fired before the dropdown closes. Cancelable' },
  { Event: 'after-hide', Description: 'Fired after the close animation completes' },
  { Event: 'select', Description: 'Fired when an item is selected. Detail: `{ item }`' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--background', Description: 'Panel background color. Default: `Canvas`' },
  { Name: '--border-radius', Description: 'Panel border radius. Default `8px`' },
  { Name: '--shadow', Description: 'Panel box shadow' },
  { Name: '--show-duration', Description: 'Show animation duration in ms. Default `150`' },
  { Name: '--hide-duration', Description: 'Hide animation duration in ms. Default `150`' },
]" />

### `dropdown-item` Attributes & Properties

<ApiTable :data="[
  { Attribute: 'value', Description: 'The value associated with this item' },
  { Attribute: 'disabled', Description: 'Disables the item' },
  { Attribute: 'type', Description: 'Item type: `normal` (default) or `checkbox`' },
  { Attribute: 'checked', Description: 'Whether a checkbox item is checked' },
]" />

### `dropdown-item` Slots

<ApiTable :data="[
  { Slot: '(default)', Description: 'Item label text' },
  { Slot: 'prefix', Description: 'Leading content (e.g. icon)' },
  { Slot: 'suffix', Description: 'Trailing content' },
]" />
