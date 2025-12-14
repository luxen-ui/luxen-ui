<script setup>
import { ref } from 'vue';

const loading = ref(false);
const lazy = ref(true);
const children = ref([]);
// Bumped on reset to force Vue to destroy + recreate the tree-item,
// which naturally wipes its internal `expanded` state.
const instance = ref(0);

async function onLazyLoad() {
  if (!lazy.value) return;
  loading.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  children.value = ['Remote item 1', 'Remote item 2', 'Remote item 3'];
  loading.value = false;
  lazy.value = false;
}

function reset() {
  lazy.value = true;
  children.value = [];
  instance.value++;
}
</script>

<template>
  <div
    class="vp-raw component-wrapper bg-surface-sunken"
    style="padding-block: 24px; padding-inline: 12px; flex-direction: column; align-items: stretch"
  >
    <l-tree style="width: 100%">
      <l-tree-item
        :key="instance"
        :lazy="lazy || null"
        :loading="loading || null"
        @lazy-load="onLazyLoad"
      >
        Load async children
        <l-tree-item
          v-for="label in children"
          :key="label"
        >
          {{ label }}
        </l-tree-item>
      </l-tree-item>
    </l-tree>

    <button
      type="button"
      class="l-button"
      data-size="sm"
      style="align-self: flex-start; margin-top: 8px"
      @click="reset"
    >
      Reset
    </button>
  </div>
</template>
