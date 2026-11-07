---
'luxen-ui': patch
---

`<l-input-otp>` cells now take their look from the shared text-field tokens, like `input`, `textarea` and `select`: corner radius from `--l-form-control-border-radius`, border from `--l-form-control-border-color` and `--l-form-control-border-width`, digits from `--l-form-control-value-color`, and their faint tinted fill over `--l-form-control-background-color`. A form whose fields are themed now restyles its OTP cells to match. The default look is unchanged, and the `--cell-*` properties still set the cells on their own.
