---
'luxen-ui': patch
---

Fix scoped elements (`l-toast`, `l-story`, `l-input-otp`, `l-input-stepper`) rendering completely unstyled when a custom `elementPrefix` is configured. Their CSS wraps rules in an `@scope (l-…)` block, and the prelude was left un-rewritten — so the scope root matched nothing and the whole block went inert. The `@scope` prelude is now rewritten to the configured prefix like every other selector.
