---
'luxen-ui': patch
---

The Vite plugin's `emitTypes` option now writes declarations for every element the library defines. Eleven were missing from the generated file — `l-color-scheme-icon`, `l-alert-dialog`, `l-button-group`, `l-combobox`, `l-dropdown-label`, `l-form-field`, `l-input-group`, `l-prose-editor`, `l-segmented-control`, `l-select` and `l-tag` — so they stayed untyped in templates (an error under Vue's `strictTemplates`) with nothing logged to say why. The file also no longer imports a type for `l-toast-item`, an internal element with no module to import from: that line resolved to nothing whenever declaration files were type-checked.

The `target: 'vue'` flavour also stops emitting read-only members as settable props. Elements built on the form-associated base (`l-select`, `l-combobox`, `l-segmented-control`, `l-prose-editor`) were exposing `_internals`, `validity`, `willValidate`, `form`, `formLabels`, `validationTarget` and `validationMessage` as things a template could bind, which `strictTemplates` then accepted; only genuinely settable props remain.

The plugin still writes the file only when it is absent, so delete your generated declaration file and restart the dev server to pick this up.
