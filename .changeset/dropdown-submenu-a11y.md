---
'luxen-ui': patch
---

Dropdown accessibility hardening: keyboard focus now shows a focus ring distinct from hover, `Tab` closes the menu (and any open submenus) as documented, and the trigger exposes `aria-haspopup="menu"` plus an initial `aria-expanded`. Every `role="menu"` panel now has an accessible name (the root menu after its trigger, each submenu after its parent item), submenu parents link their panel via `aria-controls`, and item hosts carry `role="none"` so the menu owns its menuitems directly. Focus is no longer lost when a submenu collapses while focused, and roving within a level now closes a sibling's open submenu.
