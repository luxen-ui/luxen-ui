<script setup>
import { computed, ref } from 'vue';

// Global state toggles — flip one and every control below updates so you can
// eyeball cross-control consistency.
const required = ref(false);
const disabled = ref(false);
const invalid = ref(false);

// Control size — drives every control's height via `data-size` (native) / `size`
// (custom), all mapping the shared `--l-size-control-*` scale. Not part of
// `stateKey`: it's a pure CSS attribute, so it updates without a remount.
const size = ref('md');
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

// `l-form-field` wires its children once on connect, so we remount the whole
// form (via :key) whenever a toggle changes — each field then re-wires with the
// new attributes.
const stateKey = computed(() => `${required.value}|${disabled.value}|${invalid.value}`);

const hint = 'This is a hint to help the user.';
const error = 'This is an error message.';

// Custom-element boolean attrs must be `null` (not `false`) to be removed —
// Lit reads attribute *presence*, so `invalid="false"` would read as true.
const attr = (on) => (on ? '' : null);
</script>

<template>
  <!-- `vp-raw` opts out of VitePress prose styles (e.g. `.vp-doc p` margins),
       which would otherwise leak into the `.l-hint` / `.l-error` paragraphs. -->
  <div class="forms-overview vp-raw">
    <div class="forms-overview__bar">
      <label class="forms-overview__toggle">
        <input
          type="checkbox"
          class="l-checkbox"
          v-model="required"
        />
        Required
      </label>
      <label class="forms-overview__toggle">
        <input
          type="checkbox"
          class="l-checkbox"
          v-model="disabled"
        />
        Disabled
      </label>
      <label class="forms-overview__toggle">
        <input
          type="checkbox"
          class="l-checkbox"
          v-model="invalid"
        />
        Error
      </label>

      <div
        class="forms-overview__sizes"
        role="group"
        aria-label="Control size"
      >
        <button
          v-for="s in sizes"
          :key="s"
          type="button"
          :data-active="size === s"
          @click="size = s"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <form
      :key="stateKey"
      class="forms-overview__form"
    >
      <!-- Each input below mirrors the element's reference page. Error feeds a
           genuinely invalid value (typeMismatch / patternMismatch / range*) so
           `l-form-field` flags it via `aria-invalid` — never a decorative-only
           state. `l-input-group` adornments react through `:has()`. -->

      <!-- Text — a trailing slot inside l-input-group. -->
      <l-form-field :invalid="attr(invalid)">
        <label>Input text</label>
        <l-input-group :size="size">
          <input
            type="text"
            placeholder="Placeholder text"
            pattern="[A-Za-z ]+"
            title="Letters and spaces only"
            :value="invalid ? 'Jane123' : 'Jane Cooper'"
            :required="required"
            :disabled="disabled"
          />
          <span>slot end</span>
        </l-input-group>
        <p class="l-hint">{{ hint }}</p>
        <p class="l-error">{{ error }}</p>
      </l-form-field>

      <!-- Search — native clear button. -->
      <l-form-field :invalid="attr(invalid)">
        <label>Input search</label>
        <input
          type="search"
          :data-size="size"
          pattern="[A-Za-z ]+"
          title="Letters and spaces only"
          :value="invalid ? 'foo@bar' : 'This a value'"
          :required="required"
          :disabled="disabled"
        />
        <p class="l-hint">{{ hint }}</p>
        <p class="l-error">{{ error }}</p>
      </l-form-field>

      <!-- Number — a unit suffix inside l-input-group. Error tightens max so the
           value (170) overflows, like the stepper. -->
      <l-form-field :invalid="attr(invalid)">
        <label>Input number</label>
        <l-input-group :size="size">
          <input
            type="number"
            placeholder="Placeholder text"
            min="0"
            :max="invalid ? 100 : 300"
            value="170"
            :required="required"
            :disabled="disabled"
          />
          <span>cm</span>
        </l-input-group>
        <p class="l-hint">{{ hint }}</p>
        <p class="l-error">{{ error }}</p>
      </l-form-field>

      <!-- Password — l-input-group injects the show/hide toggle. Error feeds a
           too-short value (the `.{8,}` pattern fails). -->
      <l-form-field :invalid="attr(invalid)">
        <label>Input password</label>
        <l-input-group
          password-toggle
          :size="size"
        >
          <input
            type="password"
            autocomplete="current-password"
            pattern=".{8,}"
            title="At least 8 characters"
            :value="invalid ? 'abc' : 'supersecret'"
            :required="required"
            :disabled="disabled"
          />
        </l-input-group>
        <p class="l-hint">{{ hint }}</p>
        <p class="l-error">{{ error }}</p>
      </l-form-field>

      <!-- Date — custom calendar picker icon. Error feeds a date past max. -->
      <l-form-field :invalid="attr(invalid)">
        <label>Input date</label>
        <input
          type="date"
          :data-size="size"
          max="2025-12-31"
          :value="invalid ? '2026-06-13' : '2025-06-13'"
          :required="required"
          :disabled="disabled"
        />
        <p class="l-hint">{{ hint }}</p>
        <p class="l-error">{{ error }}</p>
      </l-form-field>

      <!-- Time — custom clock picker icon. Error feeds a time before min. -->
      <l-form-field :invalid="attr(invalid)">
        <label>Input time</label>
        <input
          type="time"
          :data-size="size"
          min="09:00"
          max="18:00"
          :value="invalid ? '07:30' : '14:30'"
          :required="required"
          :disabled="disabled"
        />
        <p class="l-hint">{{ hint }}</p>
        <p class="l-error">{{ error }}</p>
      </l-form-field>

      <!-- Checkbox -->
      <l-form-field :invalid="attr(invalid)">
        <label>Subscribe to the newsletter</label>
        <input
          type="checkbox"
          :required="required || invalid"
          :disabled="disabled"
          :checked="!invalid"
        />
        <p class="l-hint">{{ hint }}</p>
        <p class="l-error">{{ error }}</p>
      </l-form-field>

      <!-- Radio — a group, so the legend is the field label and the options
           share a name. `<fieldset disabled>` disables every option at once. -->
      <fieldset
        class="m-0 grid gap-[var(--l-form-field-gap)] border-0 p-0"
        :disabled="disabled"
      >
        <legend
          class="p-0 text-sm font-medium [color:var(--l-form-control-label-color)]"
          :class="
            required &&
            'after:ml-[0.25ch] after:[content:var(--l-form-control-required-content)] after:[color:var(--l-form-control-required-color)]'
          "
        >
          Notification preference
        </legend>
        <label
          class="flex cursor-pointer items-center gap-[var(--l-form-field-choice-gap)] text-sm"
        >
          <input
            type="radio"
            class="l-radio"
            name="overview-notifications"
            :required="required"
            :checked="!invalid"
            :aria-invalid="invalid ? 'true' : null"
          />
          All new messages
        </label>
        <label
          class="flex cursor-pointer items-center gap-[var(--l-form-field-choice-gap)] text-sm"
        >
          <input
            type="radio"
            class="l-radio"
            name="overview-notifications"
            :aria-invalid="invalid ? 'true' : null"
          />
          Direct messages and mentions
        </label>
        <p class="l-hint">{{ hint }}</p>
        <p
          class="l-error"
          :hidden="!invalid"
        >
          {{ error }}
        </p>
      </fieldset>

      <!-- Input stepper — value stays "5"; Error just tightens max so it is
           invalid (rangeOverflow), toggling only the styling, not the value. -->
      <l-form-field :invalid="attr(invalid)">
        <label>Quantity</label>
        <l-input-stepper :size="size">
          <input
            type="number"
            min="0"
            :max="invalid ? 3 : 10"
            value="5"
            :required="required"
            :disabled="disabled"
          />
        </l-input-stepper>
        <p class="l-hint">{{ hint }}</p>
        <p class="l-error">{{ error }}</p>
      </l-form-field>

      <!-- TODO: add select, radio, switch, textarea here as they ship —
           they reuse the same l-form-field wiring and --l-form-control-* tokens. -->
    </form>
  </div>
</template>

<style scoped>
.forms-overview__bar {
  position: sticky;
  top: var(--vp-nav-height, 64px);
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  margin-block-end: 1.5rem;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  background-color: var(--vp-c-bg-soft);
}

.forms-overview__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Segmented control to swap the shared control size live. */
.forms-overview__sizes {
  display: inline-flex;
  gap: 2px;
  margin-inline-start: auto;
  padding: 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.4rem;
  background-color: var(--vp-c-bg);
}

.forms-overview__sizes button {
  padding: 2px 9px;
  border-radius: 0.3rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.forms-overview__sizes button[data-active='true'] {
  background-color: var(--vp-c-brand-1);
  color: #fff;
}

.forms-overview__form {
  display: grid;
  gap: 2rem;
  max-inline-size: 28rem;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
}
</style>
