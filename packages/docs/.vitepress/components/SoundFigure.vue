<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * The live part of the Sound guide (`foundations/sound.md`): the same switch
 * as the nav bar, a listen button per sound, and a few elements to hear in
 * context. Dropped from the agent skill like every `*Figure` — the guide's
 * tables state what it shows.
 */
const NAMES = ['tap', 'toggle', 'select', 'open', 'close', 'notify', 'error'];

const PANEL = 'flex min-w-0 flex-col gap-3 p-4';
const TITLE = 'text-xs font-semibold tracking-wide text-(--vp-c-text-2) uppercase';

const enabled = ref(false);
const unsupported = ref(false);
let sound = null;
let showToast = null;
let unsubscribe = () => {};

onMounted(async () => {
  const [soundModule, toastModule] = await Promise.all([
    import('luxen-ui/sound'),
    import('luxen-ui/toast'),
  ]);
  sound = soundModule.sound;
  showToast = toastModule.toast;
  unsupported.value = sound.mutedBy === 'unsupported';
  unsubscribe = sound.subscribe((on) => {
    enabled.value = on;
  });
});

onBeforeUnmount(() => unsubscribe());

function onSwitch(event) {
  if (!sound) return;
  if (event.target.checked) {
    sound.enable();
    sound.play('toggle');
  } else {
    sound.disable();
  }
}
</script>

<template>
  <figure
    class="vp-raw my-6 overflow-hidden rounded-lg border border-(--vp-c-divider) text-sm text-(--vp-c-text-1)"
  >
    <div class="grid divide-y divide-(--vp-c-divider)">
      <div :class="PANEL">
        <label class="flex items-center gap-3 font-medium">
          <input
            type="checkbox"
            role="switch"
            class="l-switch"
            :checked="enabled"
            :disabled="unsupported"
            @change="onSwitch"
          />
          Interface sounds
        </label>
        <p
          v-if="unsupported"
          class="text-(--vp-c-text-2)"
        >
          This browser has no Web Audio, so it plays no sound.
        </p>
      </div>

      <div :class="PANEL">
        <p :class="TITLE">Listen</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="name in NAMES"
            :key="name"
            type="button"
            class="l-button"
            data-size="sm"
            :disabled="unsupported"
            @click="sound?.preview(name)"
          >
            <l-icon name="lucide:play"></l-icon>
            <span class="sr-only">Listen to</span>
            {{ name }}
          </button>
        </div>
      </div>

      <div :class="PANEL">
        <p :class="TITLE">Try it</p>
        <p class="text-(--vp-c-text-2)">
          {{
            enabled
              ? 'Each interaction makes one sound.'
              : 'Silent until you turn interface sounds on.'
          }}
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="l-button"
            commandfor="sound-figure-dialog"
            command="--show"
          >
            Open dialog
          </button>
          <l-dialog
            id="sound-figure-dialog"
            title="Changes saved"
          >
            <p>Your profile is up to date.</p>
            <button
              slot="footer"
              type="button"
              class="l-button"
              data-variant="primary"
              commandfor="sound-figure-dialog"
              command="--hide"
            >
              Close
            </button>
          </l-dialog>
          <l-segmented-control
            label="View"
            value="list"
          >
            <button value="list">List</button>
            <button value="board">Board</button>
          </l-segmented-control>
          <l-select
            label="Size"
            placeholder="Size"
            class="w-36"
          >
            <datalist>
              <option value="s">Small</option>
              <option value="m">Medium</option>
              <option value="l">Large</option>
            </datalist>
          </l-select>
          <button
            type="button"
            class="l-button"
            @click="showToast?.({ text: 'Profile saved' })"
          >
            Show toast
          </button>
        </div>
      </div>
    </div>
    <figcaption
      class="border-t border-(--vp-c-divider) bg-(--vp-c-bg-soft) px-4 py-2 text-[13px] leading-normal text-(--vp-c-text-2)"
    >
      <slot />
    </figcaption>
  </figure>
</template>
