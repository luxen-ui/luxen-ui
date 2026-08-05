---
'luxen-ui': patch
---

`<l-tag selectable>` now toggles when a click is dispatched on the tag itself. The chip is operated by a control inside its shadow root, which a click on the host never reached — so `tag.click()`, and any test runner resolving the chip by a `data-testid` and clicking it, silently did nothing. Test suites no longer need a custom command reaching through `.shadow()`. A click on the host never removes a removable tag; that stays the × button's gesture.
