---
'luxen-ui': patch
---

Fix `<l-drawer>` edge-attached placements being offset from the viewport edge by the scrollbar-gutter width (~15px) when opened on a page with an active vertical scrollbar. The scroll-lock stylesheet now reserves the gutter only for centered `<l-dialog>` (where it prevents horizontal page shift) and skips it for `<l-drawer>` (which sits flush to the edge).
