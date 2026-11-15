---
'luxen-ui': minor
---

New `luxen-ui/sound` (experimental): short interface sounds, off until the visitor turns them on. Nothing plays and nothing is stored until the visitor's own control calls `sound.enable()` or `sound.toggle()`. No option ships sound on, and `prefers-reduced-motion` does not overrule a visitor who chose it. Once on, seven synthesized sounds (`tap`, `toggle`, `select`, `open`, `close`, `notify`, `error`) follow the events that Luxen elements and native `<dialog>`, `<details>`, popovers and form controls already fire: one sound per interaction, and only in answer to the visitor, except the `notify` of a toast. Bare clicks on plain buttons and links stay silent unless you turn on `clicks`.

```js
import { sound } from 'luxen-ui/sound';

soundButton.addEventListener('click', () => sound.toggle());
sound.subscribe((on) => soundButton.setAttribute('aria-pressed', String(on)));
```

`sound.preview(name)` plays one sound while sound is off, for a "listen" button next to that control. `data-sound="none"` silences an element and everything inside it, and `data-sound="<name>"` sets the sound of one control. Set `storageKey`, `volume`, `events`, `clicks` and your own `presets` (recipes for any of the seven sounds) under `sound` in `luxen.config.mjs`: the Vite plugin bakes them in and checks every recipe when the build starts. `sound.configure()` takes the same fields at runtime, for sounds that follow a theme or for pages that load Luxen from the CDN. An application that never imports `luxen-ui/sound` carries none of it. See the new Foundations › Sound page; generated skills include it.
