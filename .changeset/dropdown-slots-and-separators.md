---
'luxen-ui': minor
---

`<l-dropdown>` gains `header` and `footer` named slots for content above and below the menu items, plus a `--padding` CSS custom property to control the panel's inner spacing. Slotted `<l-divider>` and `<hr>` elements are styled as compact section separators that bleed to the panel edges. Pressing Space or Enter on the trigger now focuses the first item, matching the documented keyboard contract.

```html
<l-dropdown>
  <l-avatar
    slot="trigger"
    interactive
    name="Jane Cooper"
  ></l-avatar>
  <div slot="header">…profile row…</div>
  <l-divider></l-divider>
  <l-dropdown-item>…</l-dropdown-item>
  <div slot="footer">…version label…</div>
</l-dropdown>
```
