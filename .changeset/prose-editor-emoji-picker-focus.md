---
'luxen-ui': patch
---

`<l-prose-editor>`: opening the emoji picker, by click or with Enter/Space on the Emoji button, now moves focus into the picker's search field, so keyboard and screen-reader users land inside it. Closing it without picking an emoji (Escape, or Emoji again) returns focus to where it was before: the editor, caret intact, or the toolbar control you were in, or the Emoji button if you opened it from the toolbar with the keyboard. Tabbing out of the picker closes it and continues from the Emoji button (Shift+Tab goes back to the button, Tab moves on to the editor) instead of jumping to the end of the page. Picking an emoji returns focus to the editor, an outside click leaves focus where you clicked, and Escape while composing with an IME no longer closes the picker. Pressing the Emoji button no longer takes focus away from the editor.
