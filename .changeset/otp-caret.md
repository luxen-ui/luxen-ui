---
'luxen-ui': patch
---

Add a blinking caret inside the active empty cell of `<l-input-otp>` to mirror the native text-input affordance. The native caret is hidden by design (visual cells handle focus); this stand-in gives users a clear point-of-insertion cue. Honors `prefers-reduced-motion`.
