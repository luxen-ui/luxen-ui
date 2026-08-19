---
'luxen-ui': minor
---

`.l-button` now has a pressed state for toggle buttons. Set `aria-pressed="true"` and the button keeps its active fill for as long as it is on, so a formatting or alignment toolbar reads correctly at a glance instead of looking identical whether it is enabled or not. It works in every variant: the secondary button darkens, `primary` settles on its active brand fill, and `destructive` deepens its red tint. Hovering a pressed button still answers the pointer.

Inside `l-button-group`, a pressed button is raised above its neighbours so the border it shares with them is not clipped — the same treatment hover and focus already received.

Selection is still yours to manage: the group never sets `aria-pressed` itself. Both elements' descriptions have been rewritten to say so — `l-button-group` no longer describes itself as "a segmented control", which was the source of the confusion between the two. For a single-choice control that owns a `value` and submits it with a form, reach for `l-segmented-control` instead. The button group docs now lead with a single toolbar example combining stateless actions, independent toggles, and a single-choice set.
