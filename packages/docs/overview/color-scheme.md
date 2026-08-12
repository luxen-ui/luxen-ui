---
outline: deep
---

<script setup>
import buttonExample from '../.vitepress/examples/color-scheme/Button.html?raw'
</script>

# Color scheme

Luxen's tokens are built on `light-dark()`, which resolves to its dark value only when the page's used [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) includes `dark`. Declare it once and every element follows the operating system:

```css
:root {
  color-scheme: light dark;
}
```

That line **is** dark mode. A page that never declares `color-scheme` stays light whatever the OS prefers.

`luxen-ui/color-scheme` is **optional**, and only covers what CSS cannot: letting the user override the OS, and remembering that choice across visits and tabs. Skip it entirely if your app already owns its light/dark state — the tokens do not care who sets `color-scheme`.

It is a module rather than an element because a document has one scheme and often several controls for it — a header button, a menu row, a settings page — which all have to agree.

## Two states, three values

From Lea Verou's [Dark mode toggles should be a two-state switch](https://lea.verou.me/blog/2026/dark-mode-toggles/): a third position spends attention on a state the user can already reach.

| What happens                                                       | OS    | Stored | Page                          |
| ------------------------------------------------------------------ | ----- | ------ | ----------------------------- |
| Nothing chosen yet                                                 | light | —      | light                         |
| User toggles. Target is dark, the OS says light → override written | light | `dark` | **dark**                      |
| The OS switches to dark. The override now agrees — and is kept     | dark  | `dark` | dark, nothing visibly happens |
| The OS switches back to light                                      | light | `dark` | **still dark**                |
| User toggles. Target is light, which the OS already says → dropped | light | —      | light, following the OS again |

## Building a control

The glyph follows the scheme on its own and is `aria-hidden`, so what you wire is the state a screen reader hears — `aria-pressed` on a button, `checked` on a menu row.

<ComponentWrapper :html="buttonExample" />

::: code-group

```html [HTML]
<button
  class="l-button"
  data-icon-only
  aria-pressed="false"
  aria-label="Dark theme"
>
  <l-color-scheme-icon></l-color-scheme-icon>
</button>
```

```js [JS]
import 'luxen-ui/color-scheme-icon';
import { colorScheme } from 'luxen-ui/color-scheme';

const button = document.querySelector('button[aria-label="Dark theme"]');

button.addEventListener('click', () => colorScheme.toggle());

// Called once with the current scheme, then on every change — no initial pass.
colorScheme.subscribe((scheme) => {
  button.setAttribute('aria-pressed', String(scheme === 'dark'));
});
```

:::

Both this button and a [menu row](/elements/color-scheme-icon#in-a-menu-row) are live on the [`<l-color-scheme-icon>`](/elements/color-scheme-icon) page.

## Configuring it

```js
// luxen.config.mjs
import { defineConfig } from 'luxen-ui';

export default defineConfig({
  colorScheme: {
    storageKey: 'acme-color-scheme',
    apply: 'root',
  },
});
```

| Option       | Default                | Effect                                                                       |
| ------------ | ---------------------- | ---------------------------------------------------------------------------- |
| `storageKey` | `'luxen-color-scheme'` | Where the override lives. `''`, or a refused write, keeps it in memory only. |
| `apply`      | `false`                | `'root'` writes `color-scheme` on `<html>`: the override, else `light dark`. |

Baked in at build time by the Vite plugin, like a [renamed prefix](/overview/customizing-prefix). `configure()` stays for what the build cannot know — a key that depends on the signed-in user, say.

`apply: 'root'` replaces the `:root` rule above — the module then owns the declaration. It is off by default because most applications already own a color-mode story, and a library that rewrote `documentElement` behind their back would fight it.

## Before first paint

Storage is read after parse, so an overridden page paints in the OS scheme first, then corrects itself — a visible flash. The fix is the same everywhere: a **plain synchronous** `<script>` in `<head>`. Not `defer`, not `async`, not `type="module"` — each of those lets the page paint before it runs, which is the whole problem.

::: code-group

```html [index.html]
<!-- Vite, Vue, plain HTML -->
<script>
  try {
    document.documentElement.style.colorScheme =
      localStorage.getItem('luxen-color-scheme') || 'light dark';
  } catch {}
</script>
```

```vue [app.vue]
<script setup lang="ts">
// Nuxt — useHead is auto-imported. `tagPriority` hoists it to the top of <head>.
useHead({
  script: [
    {
      innerHTML: `try{document.documentElement.style.colorScheme=localStorage.getItem('luxen-color-scheme')||'light dark'}catch{}`,
      tagPriority: 'critical',
    },
  ],
});
</script>
```

```tsx [app/layout.tsx]
// Next.js App Router
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.style.colorScheme=localStorage.getItem('luxen-color-scheme')||'light dark'}catch{}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

:::

This is the one place a custom `storageKey` must be repeated by hand: the script runs before any module, so the build cannot rewrite it.

With a server rendering the page — Nuxt, Next — you can skip the script entirely by keeping the choice in a cookie and writing `color-scheme` on `<html>` server-side. There is then nothing to correct on the client, and this module becomes optional: set `storageKey: ''` and drive the glyph from your own state.

## Already using a color-mode library?

Keep it — it owns the state and the persistence. Both [VueUse's `useColorMode`](https://vueuse.org/core/useColorMode/) and [`@nuxtjs/color-mode`](https://github.com/nuxt-modules/color-mode) write a class on `<html>`, so two lines map it to what the tokens read:

```css
html.light {
  color-scheme: light;
}
html.dark {
  color-scheme: dark;
}
```

Drive [`<l-color-scheme-icon>`](/elements/color-scheme-icon) from their state through its `scheme` attribute, and you can skip everything above — with one exception, because they do not both cover the flash:

| Library               | Before first paint                                                           |
| --------------------- | ---------------------------------------------------------------------------- |
| `@nuxtjs/color-mode`  | Handled — the module injects its own blocking script into `<head>`.          |
| VueUse `useColorMode` | **Not handled** — it runs on mount, so the first paint uses the wrong class. |

With VueUse, add the blocking script yourself, reading its key and writing its class:

```html
<script>
  try {
    const mode = localStorage.getItem('vueuse-color-scheme') || 'auto';
    document.documentElement.classList.add(
      mode === 'auto'
        ? matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : mode,
    );
  } catch {}
</script>
```

## API reference

```js
import { colorScheme } from 'luxen-ui/color-scheme';
```

| Member                | Description                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| `current`             | `'light' \| 'dark'` — the scheme in effect: an override, else the OS preference.                 |
| `overridden`          | `true` while an override is stored, `false` while following the OS.                              |
| `set(scheme)`         | Choose a scheme, applying the rules above.                                                       |
| `toggle()`            | Flip to the other one. Returns the scheme now in effect.                                         |
| `subscribe(listener)` | Calls `listener(scheme, overridden)` now, then on every change. Returns an unsubscribe function. |
| `configure(config)`   | `storageKey` and `apply` at runtime — same fields as `luxen.config.mjs`.                         |
