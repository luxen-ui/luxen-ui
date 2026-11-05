---
'luxen-ui': patch
---

`<l-form-field>` no longer fires a burst of `invalid` events at its control. Checking whether the control was valid fired `invalid`, which made the field check again, dozens of times per keystroke. Listeners on the control now receive `invalid` only when the browser reports it, such as on form submit.
