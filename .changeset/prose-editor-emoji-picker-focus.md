---
'luxen-ui': patch
---

`<l-prose-editor>`: opening the emoji picker, by click or with Enter/Space on the Emoji button, now moves focus into the picker's search field, so keyboard and screen-reader users land inside it. Escape closes the picker and returns focus to the Emoji button, picking an emoji returns focus to the editor, and an outside click leaves focus where you clicked.
