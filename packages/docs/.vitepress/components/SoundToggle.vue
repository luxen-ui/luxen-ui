<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

// Interface sounds, opt-in: off until the visitor presses this button. The
// store is imported on mount, never during SSR; its docs-only settings live in
// theme/index.js.
const enabled = ref(false);
let sound = null;
let unsubscribe = () => {};

onMounted(async () => {
  ({ sound } = await import('luxen-ui/sound'));
  unsubscribe = sound.subscribe((on) => {
    enabled.value = on;
  });
});

onBeforeUnmount(() => unsubscribe());

function toggle() {
  if (!sound) return;
  // Turning sound on answers with a sound: the visitor learns at once that it
  // works, and how loud it is. Turning it off answers with silence.
  if (sound.toggle()) sound.play('toggle');
}
</script>

<template>
  <!-- `order-1`: placed after the theme picker and before the appearance
       switch — see the `.VPNavBar .content-body` rule in tailwind.css. -->
  <div class="order-1 flex items-center">
    <button
      id="sound-toggle"
      type="button"
      aria-label="Interface sounds"
      :aria-pressed="enabled"
      class="flex h-[var(--vp-nav-height)] items-center px-2 text-[var(--vp-c-text-2)] transition-colors hover:text-[var(--vp-c-text-1)] aria-pressed:text-[var(--vp-c-brand-1)]"
      @click="toggle"
    >
      <l-icon
        :name="enabled ? 'lucide:volume-2' : 'lucide:volume-x'"
        class="text-lg"
      ></l-icon>
    </button>
    <l-tooltip for="sound-toggle">Interface sounds: {{ enabled ? 'on' : 'off' }}</l-tooltip>
  </div>
</template>
