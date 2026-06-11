---
'luxen-ui': patch
---

`<l-input-otp>` now keeps its native input visible and usable before the element
upgrades (or if JavaScript never loads), instead of hiding it until hydration.
The pre-upgrade field is styled with the cell tokens and the Luxen focus ring.
