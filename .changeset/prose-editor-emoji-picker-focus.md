---
'luxen-ui': patch
---

`<l-prose-editor>`: opening the emoji picker, by click or with Enter/Space on the Emoji button, now moves focus into the picker's search field, so keyboard and screen-reader users land inside it. Closing it without picking an emoji (Escape, or Emoji again) returns focus to where it was before: the editor, caret intact, if you were typing, or the Emoji button if you opened it from the toolbar with the keyboard. Picking an emoji returns focus to the editor, and an outside click leaves focus where you clicked. Pressing the Emoji button no longer takes focus away from the editor.
