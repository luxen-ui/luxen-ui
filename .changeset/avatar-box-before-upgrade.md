---
'luxen-ui': patch
---

`<l-avatar>`, `<l-spinner>` and `<l-color-scheme-icon>` now take their final size before their script loads, so the text next to them no longer jumps sideways when they upgrade. The box follows the avatar's `size` attribute and any `--size` set on the element (inline, from a class or a utility), and ignores a `--size` inherited from a parent, as the upgraded element does. Before upgrade, an avatar with a `name` or a `src` no longer shows its children, and slotted text sits centred.

The `hidden` attribute now hides every Shadow-DOM element (`<l-dialog>`, `<l-select>`, `<l-tag>`, `<l-tree>`…), before and after it upgrades. It used to be ignored once the element had upgraded, because the element's own `display` overrode the browser's, and a hidden `<l-dropdown>` showed its trigger while its script loaded. `hidden="until-found"` keeps the browser's behaviour: the element keeps its box, and find-in-page can reveal it.
