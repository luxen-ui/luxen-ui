---
'luxen-ui': patch
---

Screen readers now announce the value chosen in a single `<l-select>`, not just its label. The trigger now has `role="combobox"`, like the `multiple` variant, so it is read as "Country, France" instead of only "Country". Tests that found the trigger with `getByRole('button', …)` should now use `getByRole('combobox', …)`.
