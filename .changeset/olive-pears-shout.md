---
'luxen-ui': patch
---

Disabled controls now follow one rule, applied consistently across the form system: a mark painted on an accent fill fades with `opacity`; everything else greys out through the `--l-form-control-disabled-*` tokens.

Before, the two were mixed arbitrarily. Several controls applied `opacity` **on top of** a colour that had already been chosen for the disabled state, diluting it to 40% of its intended value — the OTP digits, the stepper icons and an input group's adornment icon all landed near 1.5:1 against the page instead of the value they were given. The stepper did it twice over, with one appearance setting a disabled border token that the base then faded again. Those now use their tokens undiluted.

A disabled `<input>`, `<select>`, `<textarea>`, OTP cell, stepper and unchecked checkbox in the same form now resolve to exactly the same greys, and a consumer's `--l-form-control-disabled-*` override reaches all of them — an opacity fade used to run on top of those colours and ignore them.

Checked checkboxes, selected radios, on switches and the slider keep fading. They paint a mark on an accent fill, and the fade reads as "inactive" more immediately than a neutral repaint, which reads as a styled but still-live control. The mark gets fainter as a result; WCAG 1.4.11 exempts inactive components, and the residual accent tint is what tells you the control is on.

`l-form-field` now greys a disabled field's label, hint and required marker — previously a greyed-out control sat under a full-strength label and the field still read as available. A native `<fieldset disabled>`, the standard way to disable a radio group, does the same for its legend, its option labels and its hint.

`--l-form-control-disabled-background` and `--l-form-control-disabled-border` become translucent rather than solid, so a disabled field composites onto its backdrop. On the default page surface it looks unchanged; inside a tinted card — where the old opaque fill could resolve to the card's own colour and make the field vanish — it now stays visible.

Adds `--l-form-control-disabled-mark-color` for the off switch's thumb, the one mark that sits on a token-greyed fill rather than an accent one.

`.l-button`, `l-disclosure` and `l-rating` are unchanged.
