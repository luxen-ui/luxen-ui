---
outline: deep
---

<script setup>
import { onMounted } from 'vue'
import alertDialogExample from '../.vitepress/examples/alert-dialog/AlertDialog.html?raw'
import alertDialogDanger from '../.vitepress/examples/alert-dialog/AlertDialogDanger.html?raw'
import alertDialogCustomButtons from '../.vitepress/examples/alert-dialog/AlertDialogCustomButtons.html?raw'

// Wire the live async demo below: keep the dialog open with a spinner on the
// confirm action until a simulated request resolves, then close it.
onMounted(() => {
  const dialog = document.getElementById('async-confirm-demo')
  if (!dialog || dialog.__wired) return
  dialog.__wired = true
  dialog.addEventListener('confirm', async (event) => {
    event.preventDefault()
    dialog.loading = true
    await new Promise((resolve) => setTimeout(resolve, 1800))
    dialog.loading = false
    dialog.open = false
  })
})
</script>

# Alert dialog <Badge type="tip">&lt;l-alert-dialog&gt;</Badge>

An interruptive confirmation dialog built on [`<l-dialog>`](./dialog). It renders its own cancel/confirm actions, exposes `role="alertdialog"`, and closes when the user picks an action — unless you cancel the event. Use it to confirm a consequential action, not for generic content.

<ElementSpec element="alert-dialog" />

## Options

### Basic

Open with `command="--show"` on a trigger button. The cancel and confirm actions are rendered for you; label them with `cancel-text` and `confirm-text`. The dialog closes automatically when an action is picked.

<ComponentWrapper :html="alertDialogExample" />

::: details Code
::: code-group
<<< @/.vitepress/examples/alert-dialog/AlertDialog.html [HTML]
:::

### Danger

Add `tone="danger"` to render the confirm action as destructive — for delete, discard, or other irreversible actions.

<ComponentWrapper :html="alertDialogDanger" />

::: details Code
::: code-group
<<< @/.vitepress/examples/alert-dialog/AlertDialogDanger.html [HTML]
:::

### Custom actions

Slot your own `confirm` / `cancel` elements — a link, a button with an icon, any tone — to replace the built-in buttons. They still drive the `confirm` / `cancel` events. Keep the slotted element focusable.

<ComponentWrapper :html="alertDialogCustomButtons" />

::: details Code
::: code-group
<<< @/.vitepress/examples/alert-dialog/AlertDialogCustomButtons.html [HTML]
:::

## Examples

### Reacting to the choice

Listen for `confirm` and `cancel`. Both fire on the user's intent; the dialog closes on its own afterwards.

```js
const dialog = document.getElementById('confirm-delete');

dialog.addEventListener('confirm', () => deleteProject());
dialog.addEventListener('cancel', () => {
  /* optional: the user backed out */
});
```

### Async confirmation

`confirm` is cancelable. Call `preventDefault()` to keep the dialog open while an async task runs, set `loading` to show a spinner on the confirm action, then close it once the work resolves. The cancel action stays operable throughout. Try it — the confirm button stays busy for ~1.8s:

<ComponentWrapper>
  <button type="button" class="l-button" data-variant="destructive" command="--show" commandfor="async-confirm-demo">
    Delete account
  </button>
  <l-alert-dialog id="async-confirm-demo" tone="danger" title="Are you absolutely sure?" confirm-text="Delete account">
    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
  </l-alert-dialog>
</ComponentWrapper>

::: details Code
::: code-group

```html [HTML]
<button
  type="button"
  class="l-button"
  data-variant="destructive"
  command="--show"
  commandfor="confirm-delete"
>
  Delete account
</button>

<l-alert-dialog
  id="confirm-delete"
  tone="danger"
  title="Are you absolutely sure?"
  confirm-text="Delete account"
>
  This action cannot be undone. This will permanently delete your account and remove your data from
  our servers.
</l-alert-dialog>
```

```js [JS]
const dialog = document.getElementById('confirm-delete');

dialog.addEventListener('confirm', async (event) => {
  event.preventDefault(); // keep the dialog open during the request
  dialog.loading = true; // spinner on the confirm action
  await deleteAccount();
  dialog.loading = false;
  dialog.open = false; // close once it's done
});
```

:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Rendered as a native `<dialog>` with `role=&quot;alertdialog&quot;` — interruptive modal semantics', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Accessible name', Description: 'The `title` property renders as an `<h2>` and names the dialog', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Accessible description', Description: 'The body content is wired as the dialog description via `aria-describedby`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Focus management', Description: 'Focus is trapped inside the modal and lands on the cancel action — the least destructive choice', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Focus restoration', Description: 'Focus returns to the trigger element when the dialog closes', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order)' },
  { Check: 'Motion', Description: 'Respects `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Always set a meaningful `title` — it becomes the dialog heading and accessible name',
  'Write a body that describes the consequence — it becomes the accessible description',
  'Reserve `tone=&quot;danger&quot;` for irreversible actions',
  'When slotting a custom action, keep it focusable (a `<button>` or `<a href>`)',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Escape', Description: 'Dismisses the dialog (fires `cancel`)' },
  { Key: 'Tab', Description: 'Cycles focus through the actions inside the dialog' },
  { Key: 'Shift + Tab', Description: 'Cycles focus backward through the actions' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/alert-dialog';
```

:::

### Attributes & Properties

<ApiTable element="alert-dialog" section="properties" />

### Commands

Open and close the dialog by toggling its `open` property, or via the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) from any light-DOM button. Custom commands must start with `--`.

<ApiTable element="alert-dialog" section="commands" />

### Events

<ApiTable element="alert-dialog" section="events" />

### Slots

<ApiTable element="alert-dialog" section="slots" />

### CSS parts

<ApiTable element="alert-dialog" section="cssParts" />

### CSS custom properties

<ApiTable element="alert-dialog" section="cssProperties" />
