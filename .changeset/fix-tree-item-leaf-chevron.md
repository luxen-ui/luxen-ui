---
'luxen-ui': patch
---

Fix issues in `<l-tree>` / `<l-tree-item>` and align its multi-selection checkbox with the Luxen checkbox:

- Leaf items no longer render an expand/collapse chevron. The CSS hide rule was targeting `.expand > svg`, but the fallback SVG lives inside a `<slot>`, so the rule never matched. Selector is now `.expand > slot > svg`. Slotted icons (e.g. avatars) on leaves stay visible.
- `<l-tree>` no longer throws `item.getChildrenItems is not a function` when its first render runs before `<l-tree-item>` is upgraded (e.g. when modules are imported in async chunks). `_syncAll` now force-upgrades pending descendants and retries via `whenDefined` if needed.
- In `selection="multiple"`, tree-item checkboxes now use the shared `.l-checkbox` appearance (matching the standalone Luxen checkbox) instead of a bare `accent-color` native checkbox.
