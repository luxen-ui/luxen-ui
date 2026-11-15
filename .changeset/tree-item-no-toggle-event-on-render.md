---
'luxen-ui': patch
---

`l-tree-item` no longer fires `collapse` (or `expand`, for an item authored `expanded`) when it first renders. The two events now fire only when an item actually opens or closes, so listeners that log, persist or react to them no longer get one event per item on page load. An item authored `expanded lazy` still fires `lazy-load` on first render, so its children are still fetched.
