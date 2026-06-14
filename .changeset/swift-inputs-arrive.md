---
'luxen-ui': minor
---

Add a text input and its adornment wrapper, and polish the shared form-control look.

- **`.l-input`** styles a native `<input>` across every text-like type (text, search, number, password, email, url, tel, date, time) with consistent border, focus, disabled and invalid states. Date/time inputs get custom picker icons and search a custom clear button — all with zero JavaScript. Inside `l-form-field` or `l-input-group` a bare text input is auto-styled.
- **`<l-input-group>`** (progressive) wraps an input with leading/trailing adornments in DOM order — an `<l-icon>` before, a unit `<span>` or `<button>` after, no classes needed. Its `password-toggle` attribute injects an accessible show/hide button at upgrade time (localized label, `aria-pressed`, eye icon swap); without JavaScript the field stays a plain password input.
- **Size**: `data-size` (native `.l-input` / `.l-select`) and `size` (`l-input-group`) map the control height to the shared `--l-size-control-*` scale (xs–xl), affecting only the height — not the label or hint/error.
- **States**: on focus the border takes the focus-ring color with a soft halo; invalid adds a red border plus a faint danger wash; disabled now renders a solid greyed fill (new `--l-form-control-disabled-*` tokens) instead of fading the control with opacity. `.l-select` gains size and disabled support too.
- Form-field labels are now `14px` / medium weight with a tighter label-to-control gap.

Import `luxen-ui/css/input` (+ `luxen-ui/css/select`) for the styles and `luxen-ui/input-group` for the password-toggle behavior.
