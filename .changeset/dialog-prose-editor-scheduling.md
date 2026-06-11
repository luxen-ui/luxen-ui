---
'luxen-ui': patch
---

`<l-dialog>` (vetoed close) and `<l-prose-editor>` (first render) no longer
schedule redundant re-renders from inside their update cycles, removing Lit
dev-mode warnings and an extra render pass each.
