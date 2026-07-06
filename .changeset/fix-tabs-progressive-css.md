---
'luxen-ui': patch
---

Fix `<l-tabs>` rendering with JavaScript disabled. The tablist, tabs, and panels are now styled from the light-DOM structure (`l-tabs > div > button`) instead of the ARIA roles the element adds at runtime, so this progressive element looks correct before its script loads. Mark the initially-active tab with `aria-selected="true"` to style it as selected without JS.
