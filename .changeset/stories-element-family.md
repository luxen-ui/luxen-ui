---
'luxen-ui': minor
---

New `<l-stories>`, `<l-story>`, and `<l-stories-viewer>` elements for Instagram-style web stories on e-commerce surfaces. The thumbnail row supports four appearances (`rounded`, `squared`, `portrait`, `landscape`); thumbnail size, radius, and gap are tweaked via CSS custom properties (`--size`, `--radius`, `--gap`). Each story can opt into a `pulse` attribute for an animated halo + breathing scale that draws attention, and a `chapters="0,5,12"` attribute to split a single video into chapters with one progress segment each. The fullscreen viewer plays the video with mute toggle, play/pause button, auto-advance, keyboard control, tap-to-advance zones (left ~30% = previous, rest = next), swipe gestures, and a `cta` slot for shoppable overlays. On desktop the prev/next chevrons sit outside the frame on the dim backdrop; on mobile they are hidden and tap zones drive navigation.

```html
<l-stories
  for="brand"
  appearance="portrait"
>
  <l-story
    src="…video.mp4"
    poster="…jpg"
    label="Look #01"
  ></l-story>
  <l-story
    src="…video2.mp4"
    poster="…jpg"
    label="Look #02"
  ></l-story>
</l-stories>

<l-stories-viewer id="brand"></l-stories-viewer>
```
