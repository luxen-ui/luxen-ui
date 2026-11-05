---
'luxen-ui': patch
---

Pressing a `<l-prose-editor>` toolbar button keeps focus and the selection in the editor, so typing continues where it left off. In Firefox, focus used to stay on the button and the next keystrokes were lost; in other browsers the editor briefly blurred on every toolbar click, firing `blur`/`focusout` handlers.
