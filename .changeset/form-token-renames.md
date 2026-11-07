---
'luxen-ui': minor
---

Eight form tokens are renamed so their names say what they style and put the state last, like `--l-form-control-border-color-hover`. All form tokens now share the `--l-form-control-*` prefix, including the spacing of `l-form-field`.

| Before                                 | After                                        |
| -------------------------------------- | -------------------------------------------- |
| `--l-form-field-gap`                   | `--l-form-control-label-gap`                 |
| `--l-form-field-choice-gap`            | `--l-form-control-choice-label-gap`          |
| `--l-form-control-error-color`         | `--l-form-control-error-message-color`       |
| `--l-form-control-disabled-background` | `--l-form-control-background-color-disabled` |
| `--l-form-control-disabled-border`     | `--l-form-control-border-color-disabled`     |
| `--l-form-control-disabled-color`      | `--l-form-control-text-color-disabled`       |
| `--l-form-control-disabled-mark-color` | `--l-form-control-mark-color-disabled`       |
| `--l-form-control-track-off-color`     | `--l-form-control-track-color-off`           |

`--l-form-control-label-gap` is the space between the parts inside one field (label, control, hint, error), not between two fields. `--l-form-control-choice-label-gap` is the space between a checkbox, radio or switch and its label. `--l-form-control-error-message-color` colors the error text only; the invalid border stays `--l-form-control-border-color-invalid`. `--l-form-control-text-color-disabled` covers all the text of a disabled control and its field: value, placeholder, label, hint and required indicator.

**Migration.** Rename any override of the old tokens. The old names are not kept as aliases, so an override left on an old name is silently ignored and the control falls back to the default value.
