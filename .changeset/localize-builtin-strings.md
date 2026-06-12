---
'luxen-ui': minor
---

Built-in UI strings are now localizable. The accessible labels the components ship themselves — the spinner's "Loading", the carousel's slide/fullscreen buttons, the input-stepper's increment/decrement buttons, the prose-editor toolbar, and the stories-viewer controls — are resolved from a small in-house translation registry instead of being hardcoded in English. The active language follows the page: each element reads the closest `[lang]` ancestor (falling back to `<html lang>`, then English) and re-renders automatically when the document language changes.

English ships by default. Activate another locale with a side-effect import — French is included:

```js
import 'luxen-ui/translations/fr';
```

Register your own locale (or override terms) via the new `luxen-ui/localize` export:

```js
import { registerTranslation } from 'luxen-ui/localize';
registerTranslation({ $code: 'es', $name: 'Español', $dir: 'ltr', loading: 'Cargando' /* … */ });
```

A consumer-supplied label (an explicit `aria-label`, or a labelling prop) always takes precedence over the localized default. The mechanism is SSR-safe: importing the elements or the registry in Node touches no DOM APIs.
