---
'luxen-ui': patch
---

`l-tree-item` no longer fires `collapse` (or `expand`, for an item authored `expanded`) when it first renders. The two events now fire only when an item actually opens or closes, so listeners that log, persist or react to them no longer get one event per item on page load. An item authored `expanded lazy` still fires `lazy-load` on first render, so its children are still fetched.

A framework binding that sets `expanded` to `undefined` (React 19's `expanded={open || undefined}`, for instance) is now treated as closed: setting it on a closed item no longer fires `collapse`, reopening from it fires `expand`, and the item reports `aria-expanded="false"` instead of the invalid `"undefined"`.
