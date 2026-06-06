---
outline: deep
---

# Tree item <Badge type="tip">&lt;l-tree-item&gt;</Badge>

A single node inside [`<l-tree>`](/elements/tree). Nested `<l-tree-item>` children become sub-nodes. See [Tree](/elements/tree) for examples, selection modes, and keyboard behaviour.

The `role` is exposed as a DOM attribute (`[role="treeitem"]` matches), but ARIA states are set via `ElementInternals` — select by the reflected `selected`/`expanded`/`disabled` attributes, not `[aria-*]`. See [Tree › Selectors & testing](/elements/tree#selectors-testing).

<ElementSpec element="tree-item" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/tree-item';
```

:::

### Attributes & Properties

<ApiTable element="tree-item" section="properties" />

### Methods

<ApiTable element="tree-item" section="methods" />

### Events

<ApiTable element="tree-item" section="events" />

### Slots

<ApiTable element="tree-item" section="slots" />

### CSS parts

<ApiTable element="tree-item" section="cssParts" />

### CSS custom properties

All layout tokens (`--row-height`, `--row-padding-inline`, `--chevron-size`, `--item-gap`, `--indent-*`) are declared on `<l-tree>` and cascade to every item. See [Tree › CSS custom properties](/elements/tree#css-custom-properties).
