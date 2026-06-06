---
'luxen-ui': patch
---

Fix the `<l-prose-editor>` emoji picker being hard to dismiss — clicking outside it or clicking the emoji toolbar button again often left it open, especially inside a modal `<l-dialog>` or any rich-editor/framework context that stops click propagation. The picker now uses the platform's native popover light-dismiss, so outside-clicks and re-clicking the toolbar button close it reliably, and `Escape` dismisses only the picker (leaving the dialog open).
