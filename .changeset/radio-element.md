---
'luxen-ui': minor
---

Add a radio form control — `.l-radio` on a native `<input type="radio">`.

- **`.l-radio`** styles a native radio with a round box and a centered dot for the selected state, sharing the same `--l-form-control-*` look as the checkbox (border, hover, focus ring, disabled and invalid states). Native `name` grouping handles single selection and arrow-key navigation, so there is no JavaScript.
- Inside `l-form-field` a bare `<input type="radio">` is auto-styled (the class is optional there), and the field switches to its inline toggle layout.
- **Size & accent**: override `--size` for the box and `--accent` for the selected fill; override `--dot` to swap the selected icon.

Import `luxen-ui/css/radio` for the styles.
