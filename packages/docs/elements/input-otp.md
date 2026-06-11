---
outline: deep
---

<script setup>
import otpDefault from '../.vitepress/examples/input-otp/InputOtpDefault.html?raw'
import otpFourDigits from '../.vitepress/examples/input-otp/InputOtpFourDigits.html?raw'
import otpSeparator from '../.vitepress/examples/input-otp/InputOtpSeparator.html?raw'
import otpDisabled from '../.vitepress/examples/input-otp/InputOtpDisabled.html?raw'
import otpSizes from '../.vitepress/examples/input-otp/InputOtpSizes.html?raw'
import otpCustom from '../.vitepress/examples/input-otp/InputOtpCustom.html?raw'
import notDefinedCss from 'luxen-ui/css/input-otp?raw'
</script>

# Input OTP <Badge type="tip">&lt;input&gt;</Badge>

A single native `<input>` with visual digit cells for one-time passcode entry. The `<l-input-otp>` wrapper renders individual bordered cells over a hidden input that handles keyboard, paste, and autocomplete.

<ElementSpec element="input-otp" />

## Options

### Default

<ComponentWrapper vertical :html="otpDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-otp/InputOtpDefault.html [HTML]
:::

### Digit count

Set `--digits` on `<l-input-otp>` to change the number of cells. The element automatically sets `maxlength` and `pattern` on the input.

<ComponentWrapper vertical :html="otpFourDigits" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-otp/InputOtpFourDigits.html [HTML]
:::

### Separator

Add `separator-after` attribute to insert a visual dash after the specified position (e.g., `separator-after="3"` for a 3-3 grouping).

<ComponentWrapper vertical :html="otpSeparator" />

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

### Custom colors

Override the `--cell-*` properties to retheme. Set `--cell-focus-ring` to a full `box-shadow` value (or `none`) to customize the active state. Target `.l-input-otp-cell` for typography tweaks.

<ComponentWrapper vertical :html="otpCustom" />

::: details Code
::: code-group
<<< @/.vitepress/examples/input-otp/InputOtpCustom.html [HTML]
:::

### Not defined

Before JS loads (`:not(:defined)`), the real `<input>` stays visible and usable as a single field styled with the cell tokens — the code can be entered even without JavaScript. Width tracks `--digits`, `--cell-size`, and `--cell-gap` so layout doesn't shift on hydration, and the field uses `--cell-bg-color` so custom themes carry over.

<NotDefinedPreview :css="notDefinedCss" direction="column" :height="240" html='<l-input-otp size="sm"><input /></l-input-otp><l-input-otp><input /></l-input-otp><l-input-otp size="lg"><input /></l-input-otp>' />

::: details Code
::: code-group

```html [HTML]
<l-input-otp>
  <input />
</l-input-otp>
```

:::

Once upgraded, the custom element replaces the input with its visual cells container.

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

::: info Why light DOM?
The native `<input>` stays a real form control — built-in validation, form submission, and `one-time-code` autofill work without JavaScript, and it's usable before the element upgrades. The visual cells are decorative (`aria-hidden="true"`).
:::

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

<ApiTable element="input-otp" section="properties" />

### CSS custom properties

Set `--digits` on `<l-input-otp>` to change the digit count.

<ApiTable element="input-otp" section="cssProperties" />
