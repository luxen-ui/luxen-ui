---
outline: deep
---

# Tree item <Badge type="tip">&lt;l-tree-item&gt;</Badge>

A single node inside [`<l-tree>`](/elements/tree). Nested `<l-tree-item>` children become sub-nodes. See [Tree](/elements/tree) for examples, selection modes, and keyboard behaviour.

<ElementSpec
  tag="l-tree-item"
  type="shadow"
/>

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/tree-item';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'expanded', Description: 'Whether the item is open' },
  { Attribute: 'selected', Description: 'Whether the item is selected' },
  { Attribute: 'indeterminate', Description: 'Forces the checkbox to the indeterminate state (normally managed by the tree in cascade mode)' },
  { Attribute: 'disabled', Description: 'Prevents interaction and selection' },
  { Attribute: 'lazy', Description: 'Marks a branch as having children that will be loaded on first expand' },
  { Attribute: 'loading', Description: 'Shows a spinner in place of the chevron' },
]" />

### Methods

<ApiTable :data="[
  { Method: 'toggle()', Description: 'Toggles `expanded`. Emits `lazy-load` the first time a lazy branch opens' },
  { Method: 'getChildrenItems()', Description: 'Returns the direct `<l-tree-item>` children' },
  { Method: 'isLeaf()', Description: 'Returns `true` when the item has no children and is not lazy' },
  { Method: 'getTextLabel()', Description: 'Returns the trimmed text label of the item' },
]" />

### Events

<ApiTable :data="[
  { Event: 'expand', Description: 'Fired when the item opens' },
  { Event: 'collapse', Description: 'Fired when the item closes' },
  { Event: 'lazy-load', Description: 'Fired when a lazy item is expanded for the first time. Append children and clear the lazy attribute.' },
]" />

### Slots

<ApiTable :data="[
  { Slot: '(default)', Description: 'Label content (kept to a single row)' },
  { Slot: 'prefix', Description: 'Leading content (e.g. icon)' },
  { Slot: 'suffix', Description: 'Trailing content' },
  { Slot: 'expand-icon', Description: 'Icon shown when the item is collapsed' },
  { Slot: 'collapse-icon', Description: 'Icon shown when the item is expanded' },
  { Slot: 'content', Description: 'Block content that belongs to the item but not to its header row (e.g. comment body, action bar). Hidden when a branch is collapsed.' },
]" />

### CSS parts

<ApiTable :data="[
  { Part: 'base', Description: 'The item row' },
  { Part: 'expand-button', Description: 'The chevron toggle area' },
  { Part: 'checkbox', Description: 'The native checkbox input' },
  { Part: 'label', Description: 'The label container' },
  { Part: 'branch', Description: 'Wrapper around the content and children; carries the indent guide' },
  { Part: 'content', Description: 'The content slot wrapper (block area between the row and the children)' },
  { Part: 'children', Description: 'The nested items container' },
]" />

### CSS custom properties

All layout tokens (`--row-height`, `--row-padding-inline`, `--chevron-size`, `--item-gap`, `--indent-*`) are declared on `<l-tree>` and cascade to every item. See [Tree › CSS custom properties](/elements/tree#css-custom-properties).
