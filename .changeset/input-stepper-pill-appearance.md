---
'luxen-ui': minor
---

New `pill` appearance for `<l-input-stepper>`: the two round buttons sit inside a filled capsule instead of a bordered box — the quantity picker a cart row or a booking widget asks for. Select it with `appearance="pill"` and import `luxen-ui/css/input-stepper/pill`.

`rounded` gets a softer hover and press, and its buttons now shrink when pressed. Three fixes land with it: its button borders no longer disappear when a page imports another input-stepper appearance after it, it no longer jumps 12px on hydration, and its animated roller no longer paints a rectangle behind the value.
