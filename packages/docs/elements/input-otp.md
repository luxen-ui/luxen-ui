---
outline: deep
---

<script setup>
import otpDefault from '../.vitepress/examples/input-otp/InputOtpDefault.html?raw'
import otpFourDigits from '../.vitepress/examples/input-otp/InputOtpFourDigits.html?raw'
import otpSeparator from '../.vitepress/examples/input-otp/InputOtpSeparator.html?raw'
import otpDisabled from '../.vitepress/examples/input-otp/InputOtpDisabled.html?raw'
import otpSizes from '../.vitepress/examples/input-otp/InputOtpSizes.html?raw'
</script>

# Input OTP <Badge type="tip">&lt;input&gt;</Badge>

A single native `<input>` with visual digit cells for one-time passcode entry. The `<l-input-otp>` wrapper renders individual bordered cells over a hidden input that handles keyboard, paste, and autocomplete.

<ElementSpec
  tag="l-input-otp"
  type="progressive"
/>

## Options

### Default

<ComponentWrapper :html="otpDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-otp/InputOtpDefault.html [HTML]
:::

### Digit count

Set `--digits` on `<l-input-otp>` to change the number of cells. The element automatically sets `maxlength` and `pattern` on the input.

<ComponentWrapper :html="otpFourDigits" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-otp/InputOtpFourDigits.html [HTML]
:::

### Separator

Add `separator-after` attribute to insert a visual dash after the specified position (e.g., `separator-after="3"` for a 3-3 grouping).

<ComponentWrapper :html="otpSeparator" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-otp/InputOtpSeparator.html [HTML]
:::

### Size

Set the `size` attribute on `<l-input-otp>`: `sm`, `md` (default), `lg`.

<ComponentWrapper :html="otpSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-otp/InputOtpSizes.html [HTML]
:::

### Disabled

Native `disabled` attribute.

<ComponentWrapper :html="otpDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-otp/InputOtpDisabled.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Uses a native `<input>` element — built-in textbox semantics', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Accessible name', Description: 'Requires `<label>` or `aria-label` to describe the purpose of the code input', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Input purpose', Description: '`autocomplete=&quot;one-time-code&quot;` identifies the field for browser and password manager autofill', WCAG: '[WCAG 1.3.5](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose)' },
  { Check: 'Validation', Description: '`pattern` and `maxlength` provide client-side validation; `inputmode=&quot;numeric&quot;` triggers the numeric keyboard on mobile', WCAG: '[WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)' },
  { Check: 'Visual cells', Description: 'Cell container is `aria-hidden=&quot;true&quot;` — screen readers interact with the native input only', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
]" :rules="[
  'Always provide an accessible name via `<label>` or `aria-label`',
  '`autocomplete=&quot;one-time-code&quot;`, `inputmode=&quot;numeric&quot;`, `type=&quot;text&quot;`, `maxlength`, and `pattern` are set automatically by the custom element',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to/from the input' },
  { Key: '0–9', Description: 'Types a digit into the next available position' },
  { Key: 'Backspace', Description: 'Deletes the last entered digit' },
  { Key: 'Ctrl + V / Cmd + V', Description: 'Pastes a full code from clipboard' },
]" />

### Why light DOM?

The native `<input>` lives in the light DOM so it stays directly accessible for `<label>` association, form participation, and external CSS. The visual cells are purely decorative (`aria-hidden="true"`) — screen readers only see the real input.

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/input-otp';
```

```js [JS]
import 'luxen-ui/input-otp';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'size', Description: 'Control size: `sm`, `md` (default), `lg`' },
  { Attribute: 'separator-after', Description: 'Position after which to insert a visual separator dash (e.g., `3` for a 3-3 grouping)' },
]" />

### CSS custom properties

Set `--digits` on `<l-input-otp>` to change the digit count.

<ApiTable :data="[
  { Name: '--digits', Description: 'Number of digit cells (default: `6`). Drives `maxlength` and `pattern` automatically' },
  { Name: '--size', Description: 'Cell width and height (default: `2.75rem`). Font size scales automatically from this value' },
  { Name: '--gap', Description: 'Space between cells (default: `0.5rem`)' },
]" />
