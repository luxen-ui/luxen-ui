---
'luxen-ui': minor
---

`l-dropdown-item` accepts `type="radio"` for single-choice menus such as a sort order, a density or a theme. A radio item is announced as `menuitemradio`, shows the same check mark as a checkbox item (honouring `check-placement`), and checking it unchecks the other radio items of its group at once — the radio items between the same separators or section labels. Selecting the checked item again keeps it checked; when several radios of a group end up checked, the last one wins, as with native radios.

<kbd>Enter</kbd> on a checkbox or radio item now checks it and closes the menu, as the WAI-ARIA menu pattern expects. A click or <kbd>Space</kbd> still keeps the menu open.
