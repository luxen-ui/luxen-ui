---
outline: deep
---

<script setup>
import treeBasic from '../.vitepress/examples/tree/TreeBasic.html?raw'
import treeMultiple from '../.vitepress/examples/tree/TreeMultiple.html?raw'
import treeIndependent from '../.vitepress/examples/tree/TreeIndependent.html?raw'
import treeLeaf from '../.vitepress/examples/tree/TreeLeaf.html?raw'
import treeDisabled from '../.vitepress/examples/tree/TreeDisabled.html?raw'
import treeIcons from '../.vitepress/examples/tree/TreeIcons.html?raw'
import treeExpandIcons from '../.vitepress/examples/tree/TreeExpandIcons.html?raw'
</script>

# Tree <Badge type="tip">&lt;l-tree&gt;</Badge>

Tree views present hierarchical data like file explorers, navigation menus, and taxonomies. Each node expands/collapses to reveal nested items and can be selected in several ways.

<ElementSpec element="tree" />

## Options

### Basic

Wrap `<l-tree-item>` nodes inside `<l-tree>`. Nested `<l-tree-item>` children become sub-nodes automatically.

<ComponentWrapper vertical :html="treeBasic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tree/TreeBasic.html [HTML]
:::

### Custom icons

Place any element in the `prefix` slot to render a leading icon before the label. Icons inherit the current text color.

<ComponentWrapper vertical :html="treeIcons" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tree/TreeIcons.html [HTML]
:::

### Custom expand icons

Override the `expand-icon` and `collapse-icon` slots to show a different icon per state — e.g. a closed folder when the branch is collapsed and an open folder when expanded. Leaves keep the `prefix` slot for their own icon.

<ComponentWrapper vertical :html="treeExpandIcons" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tree/TreeExpandIcons.html [HTML]
:::

### Multiple selection

Set `selection="multiple"` to render a native checkbox on every item. Toggling a parent cascades the selection to its descendants and sets the indeterminate state when only some children are selected.

<ComponentWrapper vertical :html="treeMultiple" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tree/TreeMultiple.html [HTML]
:::

### Independent selection

Add `independent` to decouple parents and children: a parent can be selected without ticking any of its descendants and vice-versa. Useful when nodes represent independent concepts (categories, tags, permissions) rather than aggregations.

<ComponentWrapper vertical :html="treeIndependent" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tree/TreeIndependent.html [HTML]
:::

### Leaf-only selection

Set `selection="leaf"` when only terminal nodes represent selectable values. Clicking a branch only toggles its expansion.

<ComponentWrapper vertical :html="treeLeaf" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tree/TreeLeaf.html [HTML]
:::

### Disabled items

Add `disabled` to any item to prevent selection and interaction. The item remains visible and part of the structure.

<ComponentWrapper vertical :html="treeDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tree/TreeDisabled.html [HTML]
:::

### Lazy loading

Add `lazy` to an item whose children will be fetched on first expand. The component emits `lazy-load`; set `loading` to render a spinner in place of the chevron, then append children and remove `lazy`.

<TreeLazyDemo />

::: details Code
::: code-group
<<< @/.vitepress/components/TreeLazyDemo.vue [TreeLazyDemo.vue]
:::

## Examples

### Row actions

Place any interactive element inside a `<l-tree-item>` to expose per-row actions (e.g. an `<l-dropdown>` menu, a button, a link). Clicks on `<button>`, `<a>`, `<input>` and elements with `role="button"` or `role="menuitem"` never toggle the row's selection or expansion.

This demo is controlled from Vue state: the yellow `…` trigger is rendered only on the selected row via `v-if`, so clicking another row moves the button there without duplicating it in the DOM.

<TreeActionsDemo />

::: details Code
::: code-group
<<< @/.vitepress/components/TreeActionsDemo.vue [TreeActionsDemo.vue]
<<< @/.vitepress/components/TreeActionsNode.vue [TreeActionsNode.vue]
:::

### Project roadmap

A roadmap of phases and tasks, where collapsing folds away phase details for a high-level overview. Demonstrates the `prefix` slot (per-row icon), the default slot (title), and the `content` slot (block-level description below the row — visible for leaves, hidden when a branch is collapsed). The `::part(base)` and `::part(label)` are overridden to top-align rows and let descriptions wrap.

<TreeRoadmapDemo />

::: details Code
::: code-group
<<< @/.vitepress/components/TreeRoadmapDemo.vue [TreeRoadmapDemo.vue]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Container has `role=&quot;tree&quot;`, items have `role=&quot;treeitem&quot;`, groups have `role=&quot;group&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Expanded state', Description: 'Branches expose `aria-expanded` reflecting open state. Leaf nodes omit the attribute.', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Selected state', Description: 'Selected items expose `aria-selected=&quot;true&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Multi-selectable', Description: 'Container sets `aria-multiselectable=&quot;true&quot;` when `selection=&quot;multiple&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Disabled state', Description: 'Disabled items expose `aria-disabled=&quot;true&quot;` and stay in the DOM for discoverability', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Focus management', Description: 'Roving tabindex: only one item is in the tab order at a time; arrow keys move focus within the tree', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Motion', Description: 'Chevron rotation and spinner respect `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Every item needs visible text content for its accessible name',
  'Use `selection=&quot;leaf&quot;` when branches are never valid values — this prevents keyboard users from accidentally selecting aggregations',
  'Prefer `selection=&quot;multiple&quot; independent` for forms where parent selection is a distinct choice from the children',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'ArrowDown', Description: 'Moves focus to the next visible item' },
  { Key: 'ArrowUp', Description: 'Moves focus to the previous visible item' },
  { Key: 'ArrowRight', Description: 'Expands a collapsed branch, or moves to the first child when already expanded' },
  { Key: 'ArrowLeft', Description: 'Collapses an expanded branch, or moves to the parent item' },
  { Key: 'Home', Description: 'Moves focus to the first visible item' },
  { Key: 'End', Description: 'Moves focus to the last visible item' },
  { Key: 'Enter', Description: 'Activates the item (selects or toggles expansion depending on mode)' },
  { Key: 'Space', Description: 'Activates the item (selects or toggles expansion depending on mode)' },
  { Key: '*', Description: 'Expands all sibling branches of the focused item' },
]" />

### Selectors & testing

Roles and ARIA states are set on `ElementInternals` (the accessibility-tree source) **and** mirrored to DOM attributes, so both `[role]` and `[aria-*]` selectors keep matching in CSS, `querySelector`, and Cypress/Playwright. Selection state is additionally exposed as the reflected `selected`/`expanded`/`disabled`/`indeterminate` boolean attributes (the component's own API).

```js
document.querySelectorAll('[role="treeitem"]'); // ✅ role is mirrored to an attribute
document.querySelectorAll('[aria-selected="true"]'); // ✅ ARIA state is mirrored too
tree.querySelectorAll('l-tree-item[selected]'); // ✅ reflected boolean attribute
screen.getByRole('treeitem', { selected: true, expanded: true }); // ✅ name + state
```

```css
/* Style by ARIA state or the reflected boolean attribute — both work. */
l-tree-item[aria-selected='true']::part(base) {
  background: var(--l-color-bg-fill-brand-subtle);
}
```

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/tree';
import 'luxen-ui/tree-item';
```

:::

### Attributes & Properties

<ApiTable element="tree" section="properties" />

### Methods

<ApiTable element="tree" section="methods" />

### Events

<ApiTable element="tree" section="events" />

### CSS custom properties

<ApiTable element="tree" section="cssProperties" />

See [`<l-tree-item>`](/elements/tree-item) for the per-item API.
