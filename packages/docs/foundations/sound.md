---
title: Sound
outline: deep
---

# Sound <Badge type="warning">experimental</Badge>

`luxen-ui/sound` gives the interface short sounds, synthesized with Web Audio: no audio files, about 3 kB. It is **opt-in only** — every visitor starts with sound off, and only a control you provide turns it on. A sound confirms a change the screen already shows; it never replaces it.

The module is experimental: sound names and options may still change.

<SoundFigure>
Listen to each sound, then turn interface sounds on and use the elements. The switch in the top bar controls the same setting on every page.
</SoundFigure>

## Opt-in only

| What happens                    | Stored | Sound                                 |
| ------------------------------- | ------ | ------------------------------------- |
| Nothing chosen yet              | —      | off                                   |
| The visitor turns sound on      | `on`   | on                                    |
| The visitor turns it off        | —      | off                                   |
| Next visit, after turning it on | `on`   | on, as soon as the module is imported |

- Nothing turns sound on but `enable()`, `toggle()` or `set(true)`, called from the visitor's own control. No option ships it on.
- Off is the absence of a value: storage holds nothing for a visitor who never opted in.
- `prefers-reduced-motion` does not mute it. Sound is already off until chosen, so muting it there would only overrule a visitor who switched it on — often one who relies on it.
- Browsers start audio only inside a gesture. Importing the module opens nothing; the first sound plays from the first click after opting in.

## The seven sounds

| Sound    | Meaning              | Played when                                                                                                                                                   |
| -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tap`    | An action            | A plain button is clicked, with the `clicks` option on                                                                                                        |
| `toggle` | A state flipped      | A native checkbox or radio changes; `change` from `l-tabs`, `l-segmented-control`, `l-tag`, `l-rating` or `l-slider`                                          |
| `select` | A value picked       | `select` from `l-dropdown`, or from `l-carousel` when the visitor moves it; `change` from `l-select`, `l-combobox` or a native `<select>`                     |
| `open`   | Something opened     | `show` from `l-dialog`, `l-drawer`, `l-dropdown`, `l-select`, `l-combobox` or `l-stories-viewer`; `expand` from `l-tree-item`; a `<details>` or popover opens |
| `close`  | Something closed     | `hide`; `collapse` from `l-tree-item`; `remove` from `l-tag`; a `<dialog>`, `<details>` or popover closes                                                     |
| `notify` | The interface speaks | `l-toast` shows a toast — the only sound the visitor did not cause                                                                                            |
| `error`  | Something failed     | Never on its own: name it with `data-sound="error"` or `sound.play('error')`                                                                                  |

Bare clicks on plain controls are silent by default: the mouse or the key already answered them, and a sound on every click tires fast. The `clicks` option turns them on — `tap` for a button, `toggle` for a switch, a tab or an `aria-pressed` button, `select` for an option or a menu item, `open` for a link.

## What makes a sound

- **One interaction, one sound.** A click that opens a dialog plays `open` alone, even with `clicks` on: the element's event wins over the click. Picking a menu item plays `select`, not the `close` of the menu it shuts.
- **A sound answers the visitor.** It plays within half a second of a click, a key press or a touch — except `notify`, and the `change` of a focused native control, which the system's own picker can delay. `l-sticky-bar` revealed by scrolling stays silent.
- **Some elements also move on their own.** A toast and an `l-carousel` speak only when the visitor acted on them, so a toast timing out or a carousel on autoplay stays silent, even just after a click elsewhere. Escape, which dismisses a toast from anywhere, counts.
- **Nothing that did not happen.** A `show` or `hide` cancelled with `preventDefault()` is silent, and so is a disabled control or a checkbox whose click was cancelled. A link whose click a router cancels still navigates, so it still speaks.
- **Meaning, not wording.** Sounds follow roles and events, never button labels, so they work in every language.
- `l-tooltip` and `l-popover` make no sound.

## Steering with `data-sound`

```html
<!-- A table of selectable rows: silent -->
<tbody data-sound="none">
  …
</tbody>

<!-- One control, one named sound -->
<button
  class="l-button"
  data-variant="destructive"
  data-sound="error"
>
  Delete
</button>
```

`none` silences the element and everything inside it, shadow roots included. A sound name replaces the guess, and gives one to a plain control that would otherwise stay silent. On a control, either one covers everything its click does, including a dialog, menu or `<details>` it opens. A value that names no sound is ignored.

## Turning sound on

Place the control where the visitor can always find it again, such as the header. A **Preview** button next to it lets them hear a sound before opting in.

::: code-group

```html [HTML]
<button
  id="sound-toggle"
  class="l-button"
  data-icon-only
  aria-pressed="false"
  aria-label="Interface sounds"
>
  <l-icon name="lucide:volume-2"></l-icon>
</button>
<button
  id="sound-preview"
  class="l-button"
>
  Preview
</button>
```

```js [JS]
import { sound } from 'luxen-ui/sound';

const toggle = document.querySelector('#sound-toggle');
const preview = document.querySelector('#sound-preview');

// The click is also the gesture that lets the browser start audio.
toggle.addEventListener('click', () => {
  if (sound.toggle()) sound.play('toggle'); // answer "on" with a sound
});

// Plays even while sound is off, and changes nothing.
preview.addEventListener('click', () => sound.preview('notify'));

// Called once with the current state, then on every change.
sound.subscribe((on) => toggle.setAttribute('aria-pressed', String(on)));
```

:::

## Configuring it

```js
// luxen.config.mjs
import { defineConfig } from 'luxen-ui';

export default defineConfig({
  sound: {
    storageKey: 'acme-sound',
    volume: 0.5,
  },
});
```

| Option       | Default         | Effect                                                                                        |
| ------------ | --------------- | --------------------------------------------------------------------------------------------- |
| `storageKey` | `'luxen-sound'` | Where `on` is stored. `''`, or a refused write, keeps the choice for the visit only.          |
| `volume`     | `0.7`           | Master volume, from 0 to 1; a value outside is clamped.                                       |
| `events`     | `true`          | Element and native lifecycle events make sounds.                                              |
| `clicks`     | `false`         | Bare clicks on plain buttons and links make sounds too. A `data-sound` name plays either way. |
| `presets`    | —               | Your own recipes for any of the seven sounds, below.                                          |

Baked in at build time by the Vite plugin, like a [renamed prefix](/overview/customizing-prefix). No option turns sound on. `sound.configure()` takes the same fields at runtime.

### Your own sounds

A recipe is a list of layers played together. Replace any of the seven sounds in `luxen.config.mjs`; the others keep the default:

```js
// luxen.config.mjs
import { defineConfig } from 'luxen-ui';
import { presets } from 'luxen-ui/sound';

export default defineConfig({
  sound: {
    presets: {
      // A brand chime: two notes, the second after the first.
      notify: [
        { wave: 'sine', frequency: 660, decay: 0.08, gain: 0.12 },
        { wave: 'sine', frequency: 990, decay: 0.12, gain: 0.1, delay: 0.08 },
      ],
      // A default sound, retuned: `close` at half its level.
      close: presets.close.map((layer) => ({ ...layer, gain: (layer.gain ?? 0.2) / 2 })),
    },
  },
});
```

The Vite plugin checks every recipe when the build starts. An unknown sound name, wave or filter type, a missing `decay` or `frequency`, or a `gain` above 1 stops the build and names the field. A sound longer than 300 ms prints a warning.

Sounds that change while the page runs, such as one set per theme, or a page that loads Luxen from the CDN, pass the same object to `sound.configure({ presets })` instead. Those recipes are not checked.

| Field       | Value                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `wave`      | `'sine'`, `'square'`, `'sawtooth'`, `'triangle'`, or `'noise'` for a click or a breath                                        |
| `frequency` | Hz, or `{ from, to }` for a glide. Not used by `'noise'`                                                                      |
| `filter`    | `{ type, frequency, q }`, with a [`BiquadFilterNode`](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode) type |
| `attack`    | Seconds of fade-in. Omit it for a click                                                                                       |
| `decay`     | Seconds back to silence                                                                                                       |
| `gain`      | Peak level before `volume`. Default `0.2`                                                                                     |
| `delay`     | Seconds before the layer starts, for a two-note chime                                                                         |

The default sounds all end within 300 ms. Keep yours as short: an interface sound that lasts competes with the next interaction.

## Accessibility

<AccessibilityTable :data="[
  { Check: 'Off until the visitor turns it on', Description: 'Only `enable()`, `toggle()` or `set(true)` starts it; no option ships it on', Note: 'Sound can talk over a screen reader, so nobody gets it unasked' },
  { Check: 'Silent unless the visitor acted', Description: 'A sound plays within 500 ms of a click, a key press or a touch, except the `notify` of a toast and the `change` of a focused native control', Note: 'A toast leaving on its timer, a carousel on autoplay and a bar revealed by scrolling stay silent' },
  { Check: 'One sound per interaction', Description: 'A click and the element event it causes play once, the event’s sound' },
  { Check: 'Every default sound ends within 300 ms', Description: 'One-shots with no tail, so speech output is covered only briefly' },
]" :rules="[
  { Check: 'Keep the switch reachable from every page', Description: 'A header button rather than only a settings page', Note: 'Whoever turns sound on has to find how to turn it off' },
  { Check: 'Mirror the state in `aria-pressed`', Description: 'Update it from `sound.subscribe`; on a switch, update `checked` instead', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Don’t let a sound carry information alone', Description: 'Show every message a sound confirms: an `error` sound comes with a visible error', Note: 'Deaf and hard-of-hearing visitors, and anyone with sound off, never hear it' },
  { Check: 'Don’t turn sound on for the visitor', Description: 'Call `enable()` from their own control only, never on load or from another button' },
]" :references="[
  '[Material Design 2 — Applying sound to UI](https://m2.material.io/design/sound/applying-sound-to-ui.html) — when sound helps, and why silence is the default',
  '[Apple Human Interface Guidelines — Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback) — sound as one of several redundant channels',
  '[Google — Earcons](https://developers.google.com/assistant/conversation-design/earcons) — few, distinct sounds, because each one has to be learned',
]" />

## API reference

```js
import { sound, presets } from 'luxen-ui/sound';
```

| Member                  | Description                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`               | `true` while the visitor has sound on.                                                                                                    |
| `mutedBy`               | Why nothing plays: `'preference'` (sound off), `'unsupported'` (no Web Audio), or `null`.                                                 |
| `enable()`, `disable()` | Turn sound on or off, from the visitor's control.                                                                                         |
| `toggle()`              | Flip it. Returns the state now in effect.                                                                                                 |
| `set(on)`               | Turn it on with `true`, off with `false`.                                                                                                 |
| `subscribe(listener)`   | Calls `listener(enabled)` now, then on every change, other tabs included. Returns an unsubscribe function.                                |
| `play(name)`            | Play one sound for your own feedback. Silent while sound is off. From a click handler, it replaces the sound the click would have made.   |
| `preview(name)`         | Play one sound even while sound is off, for a Preview button. Changes nothing, and the click that asked for it makes no sound of its own. |
| `configure(config)`     | The options above, at runtime.                                                                                                            |
| `presets`               | The seven default recipes, to retune one and keep the rest.                                                                               |
