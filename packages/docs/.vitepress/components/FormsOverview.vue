<script setup>
import { computed, ref } from 'vue';

// Global state toggles — flip one and every control below updates so you can
// eyeball cross-control consistency.
const required = ref(false);
const disabled = ref(false);
const invalid = ref(false);

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
    </div>

    <form
      :key="stateKey"
      class="forms-overview__form"
    >
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

      <!-- Input stepper — value stays "5"; Error just tightens max so it is
           invalid (rangeOverflow), toggling only the styling, not the value. -->
      <l-form-field :invalid="attr(invalid)">
        <label>Quantity</label>
        <l-input-stepper>
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

      <!-- TODO: add select, radio, switch, input, textarea here as they ship —
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

.forms-overview__form {
  display: grid;
  gap: 2rem;
  max-inline-size: 28rem;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
}
</style>
