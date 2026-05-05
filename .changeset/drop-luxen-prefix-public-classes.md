---
'luxen-ui': minor
---

Public element classes drop the `Luxen` prefix. Import them as `Avatar`, `Badge`, `Carousel`, `CarouselItem`, `Dialog`, `Divider`, `Drawer`, `Dropdown`, `DropdownItem`, `Icon`, `InputOtp`, `InputStepper`, `Popover`, `Rating`, `Skeleton`, `Spinner`, `Tabs`, `Toast`, `ToastItem`, `Tooltip`, `Tree`, and `TreeItem` — for example `import { Badge } from 'luxen-ui/badge'`. The internal base classes `LuxenElement` and `LuxenFormAssociatedElement` keep their prefix to avoid colliding with the DOM `Element` interface.

This is a breaking change at the import site. Rename the class at the call site, or alias on import:

```ts
import { Badge as LuxenBadge } from 'luxen-ui/badge';
```

Custom elements still register under the same default tags (`<l-badge>`, `<l-dialog>`, …) and `HTMLElementTagNameMap` augmentations are preserved, so `document.createElement('l-badge')` keeps its `Badge` typing.
