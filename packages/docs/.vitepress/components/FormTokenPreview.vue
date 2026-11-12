<script setup>
import { computed } from 'vue';
import { FORM_TOKEN_SPEC } from './form-token-spec.js';

/**
 * Live form control illustrating one `--l-form-*` token. The token is set on
 * the wrapper (it inherits into the control), either to its own default or —
 * with `highlight` — to the spec's highlight value, so the "Touches" cell
 * repaints only the part of the control that this token drives.
 */
const props = defineProps({
  token: { type: Object, required: true },
  highlight: { type: Boolean, default: false },
});

const spec = computed(() => FORM_TOKEN_SPEC[props.token.name]);
const preview = computed(() => spec.value?.preview);

/** State of a `mixed*` preview (rest, hover, invalid, disabled), or null for the others. */
const mixedState = computed(() => {
  const m = preview.value?.match(/^mixed(?:-(\w+))?$/);
  return m ? (m[1] ?? 'rest') : null;
});

/** Style marking the affected area — only in the "Touches" cell. */
const paint = computed(() => (props.highlight ? spec.value?.paint : null));

/** Gap tokens paint the field violet; its parts get the cell color back so only the gap shows. */
const gapPart = computed(() =>
  props.highlight && ['stacked', 'inline'].includes(preview.value)
    ? 'justify-self-stretch bg-(--vp-c-bg)'
    : '',
);

const rootStyle = computed(() => ({
  [props.token.name]: props.highlight ? spec.value.highlight : props.token.value,
  // Reset the parent cell's display typography (sized for "Aa" swatches).
  fontSize: 'var(--l-text-sm)',
  fontWeight: 'normal',
  lineHeight: 'normal',
}));

/** Hover can't be triggered on a static preview — route the hover color into the resting border. */
const hoverStyle = { '--l-form-control-border-color': 'var(--l-form-control-border-color-hover)' };

/**
 * Focus can't be triggered on a static (inert) preview either — pin the
 * `.l-input:focus-visible` recipe of input.css on the field instead: the border
 * in the ring color, the stroke as an outline drawn inward over it, the halo
 * as the box-shadow.
 */
const focusStyle = {
  borderColor: 'var(--l-focus-ring-color)',
  outline: 'var(--l-form-control-focus-border-width) solid var(--l-focus-ring-color)',
  outlineOffset: 'calc(var(--l-form-control-focus-border-width) * -1)',
  boxShadow:
    '0 0 0 var(--l-form-control-focus-halo-width) color-mix(in oklab, var(--l-focus-ring-color) 22%, transparent)',
};

/** The toggles' own hover halo, pinned on so the ratio is visible without hovering. */
const haloStyle = {
  boxShadow:
    '0 0 0 calc(var(--size) * var(--l-form-control-toggle-halo-ratio)) color-mix(in oklab, var(--accent), transparent 84%)',
};

/** Mirrors the `<mark>` styling of the l-combobox / l-select listbox (rendered in shadow DOM). */
const matchStyle = {
  background: 'var(--l-form-control-match-background-color)',
  fontWeight: 'var(--l-form-control-match-font-weight)',
  color: 'inherit',
  borderRadius: '2px',
};
</script>

<template>
  <div
    inert
    class="flex size-full items-center justify-center gap-4 px-3 text-start"
    :style="rootStyle"
  >
    <!-- Text control -->
    <input
      v-if="preview === 'input'"
      class="l-input w-full"
      value="Thelma Lavigne"
      aria-label="Full name"
      :style="paint"
    />
    <input
      v-else-if="preview === 'input-focus'"
      class="l-input w-full"
      value="Thelma Lavigne"
      aria-label="Full name"
      :style="[focusStyle, paint]"
    />
    <input
      v-else-if="preview === 'placeholder'"
      class="l-input w-full"
      placeholder="you@example.com"
      aria-label="Email"
    />
    <!-- Shared tokens: a text field over an unchecked checkbox and radio (and
         a switch where the token reaches it), so the highlight shows every
         control the token paints. -->
    <div
      v-else-if="mixedState"
      class="flex w-full flex-col gap-2"
      :style="[mixedState === 'hover' ? hoverStyle : null, paint]"
    >
      <input
        class="l-input w-full"
        value="Thelma Lavigne"
        aria-label="Full name"
        :disabled="mixedState === 'disabled'"
        :aria-invalid="mixedState === 'invalid' ? 'true' : null"
      />
      <div class="flex items-center gap-3">
        <input
          type="checkbox"
          class="l-checkbox"
          aria-label="Checkbox"
          :disabled="mixedState === 'disabled'"
          :aria-invalid="mixedState === 'invalid' ? 'true' : null"
        />
        <input
          type="radio"
          class="l-radio"
          aria-label="Radio"
          :disabled="mixedState === 'disabled'"
          :aria-invalid="mixedState === 'invalid' ? 'true' : null"
        />
        <input
          v-if="mixedState === 'disabled' || mixedState === 'invalid'"
          type="checkbox"
          role="switch"
          class="l-switch"
          aria-label="Switch"
          :disabled="mixedState === 'disabled'"
          :aria-invalid="mixedState === 'invalid' ? 'true' : null"
        />
      </div>
    </div>
    <select
      v-else-if="preview === 'select'"
      class="l-select w-full"
      aria-label="Plan"
      :style="paint"
    >
      <option>Starter</option>
    </select>

    <!-- Toggles -->
    <template v-else-if="preview === 'toggles-on'">
      <input
        type="checkbox"
        class="l-checkbox"
        aria-label="Checkbox"
        checked
        :style="paint"
      />
      <input
        type="radio"
        class="l-radio"
        aria-label="Radio"
        checked
        :style="paint"
      />
      <input
        type="checkbox"
        role="switch"
        class="l-switch"
        aria-label="Switch"
        checked
        :style="paint"
      />
    </template>
    <template v-else-if="preview === 'halo'">
      <input
        type="checkbox"
        class="l-checkbox"
        aria-label="Checkbox"
        checked
        :style="haloStyle"
      />
      <input
        type="radio"
        class="l-radio"
        aria-label="Radio"
        checked
        :style="haloStyle"
      />
    </template>
    <input
      v-else-if="preview === 'switch-off'"
      type="checkbox"
      role="switch"
      class="l-switch"
      aria-label="Switch"
    />
    <input
      v-else-if="preview === 'switch-off-disabled'"
      type="checkbox"
      role="switch"
      class="l-switch"
      aria-label="Switch"
      disabled
    />

    <!-- Field parts -->
    <l-form-field
      v-else-if="preview === 'label' || preview === 'stacked'"
      class="w-full"
      :style="paint"
    >
      <label :class="gapPart">Full name</label>
      <input value="Thelma Lavigne" />
    </l-form-field>
    <l-form-field
      v-else-if="preview === 'required'"
      class="w-full"
    >
      <label>Email</label>
      <input required />
    </l-form-field>
    <l-form-field
      v-else-if="preview === 'hint'"
      class="w-full"
    >
      <input
        value="jane@acme.com"
        aria-label="Email"
      />
      <p
        class="l-hint"
        :style="{ margin: 0 }"
      >
        We never share it.
      </p>
    </l-form-field>
    <l-form-field
      v-else-if="preview === 'error'"
      class="w-full"
      :invalid="true"
    >
      <!-- l-form-field re-runs validation: only a constraint failing at rest
           (required + empty) keeps the field invalid. -->
      <input
        aria-label="Email"
        required
      />
      <p
        class="l-error"
        :style="{ margin: 0 }"
      >
        This field is required.
      </p>
    </l-form-field>
    <!-- A disabled toggle field: the label and hint grey out through the token. -->
    <l-form-field v-else-if="preview === 'field-disabled'">
      <label>Remember me</label>
      <input
        type="checkbox"
        disabled
      />
      <p
        class="l-hint"
        :style="{ margin: 0 }"
      >
        On this device only
      </p>
    </l-form-field>
    <l-form-field
      v-else-if="preview === 'inline'"
      :style="paint"
    >
      <label :class="gapPart">Remember me</label>
      <input
        type="checkbox"
        checked
      />
    </l-form-field>

    <!-- Listbox option with a search match -->
    <div
      v-else-if="preview === 'match'"
      class="w-full rounded-md border border-default bg-surface-overlay p-1 text-primary"
    >
      <div class="rounded bg-state-hover px-2 py-1">
        Pro<mark :style="[matchStyle, paint]">duct</mark> designer
      </div>
    </div>
  </div>
</template>
