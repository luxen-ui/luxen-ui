---
'luxen-ui': patch
---

`<l-dropdown>` no longer throws `item.closeSubmenu is not a function` when it is defined before `<l-dropdown-item>` — for instance when the two modules load as separate CDN scripts or parallel dynamic imports. A dropdown that has never been opened also stops firing a stray `after-hide` event when it mounts.
