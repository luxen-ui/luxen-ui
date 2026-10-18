---
'luxen-ui': patch
---

`<l-form-field>` no longer overflows the stack when its control becomes invalid. Checking the control's validity fired `invalid`, which made the field check again, without end; the error now shows as intended, and listeners on the control no longer receive a burst of `invalid` events on every keystroke.
