---
outline: deep
---

<script setup>
import dropdownBasic from '../.vitepress/examples/dropdown/DropdownBasic.html?raw'
import dropdownDisabledItem from '../.vitepress/examples/dropdown/DropdownDisabledItem.html?raw'
import dropdownCheckbox from '../.vitepress/examples/dropdown/DropdownCheckbox.html?raw'
import dropdownSections from '../.vitepress/examples/dropdown/DropdownSections.html?raw'
import dropdownPlacement from '../.vitepress/examples/dropdown/DropdownPlacement.html?raw'
import dropdownMinWidth from '../.vitepress/examples/dropdown/DropdownMinWidth.html?raw'
import dropdownDisabled from '../.vitepress/examples/dropdown/DropdownDisabled.html?raw'
import dropdownAccountMenu from '../.vitepress/examples/dropdown/DropdownAccountMenu.html?raw'
</script>

# Dropdown <Badge type="tip">&lt;l-dropdown&gt;</Badge>

Dropdowns are used to present a list of actions or options in a floating menu anchored to a trigger button. Commonly used for overflow menus, contextual actions, and navigation.

<ElementSpec element="dropdown" />

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

### Section labels

Add `<l-dropdown-label>` to caption a group of items. It is non-interactive — keyboard navigation and typeahead skip it. Use `<l-divider>` between sections.

<ComponentWrapper :html="dropdownSections" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownSections.html [HTML]
:::

### Placement

Set `placement` to control position. Default is `bottom-start`.

<ComponentWrapper :html="dropdownPlacement" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownPlacement.html [HTML]
:::

### Min width

Set `min-width="trigger"` to floor the panel at the trigger's width — useful for select-like triggers (a date-range or filter button). The panel still grows with its content and stays matched if the trigger resizes while open.

<ComponentWrapper :html="dropdownMinWidth" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownMinWidth.html [HTML]
:::

### Disabled

Add `disabled` to prevent opening.

<ComponentWrapper :html="dropdownDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownDisabled.html [HTML]
:::

## Examples

### Account menu

Use the `header` slot for a profile row, the `prefix` slot on each `<l-dropdown-item>` for a leading icon, and `<l-divider>` between groups for section breaks — `<l-dropdown>` tightens slotted `<l-divider>` spacing automatically.

<ComponentWrapper :html="dropdownAccountMenu" />

::: details Code
::: code-group
<<< @/.vitepress/examples/dropdown/DropdownAccountMenu.html [HTML]
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
import 'luxen-ui/dropdown-label';
```

:::

### Attributes & Properties

<ApiTable element="dropdown" section="properties" />

### Methods

<ApiTable element="dropdown" section="methods" />

### Events

<ApiTable element="dropdown" section="events" />

### Slots

<ApiTable element="dropdown" section="slots" />

### CSS custom properties

<ApiTable element="dropdown" section="cssProperties" />

### `dropdown-item` Attributes & Properties

<ApiTable element="dropdown-item" section="properties" />

### `dropdown-item` Slots

<ApiTable element="dropdown-item" section="slots" />

### `dropdown-label` Slots

<ApiTable element="dropdown-label" section="slots" />

### `dropdown-label` CSS custom properties

<ApiTable element="dropdown-label" section="cssProperties" />
