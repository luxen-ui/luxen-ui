<script setup>
defineProps({
  data: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="vp-raw kbd-table">
    <div
      v-for="(row, i) in data"
      :key="i"
      class="kbd-table-item"
    >
      <dt>
        <span class="kbd-keys">
          <kbd
            v-for="(key, j) in row.Key.split(' + ')"
            :key="j"
            class="l-kbd"
            >{{ key }}</kbd
          >
        </span>
      </dt>
      <dd>{{ row.Description }}</dd>
    </div>
  </div>
</template>

<style>
.kbd-table {
  margin: 16px 0;
}

.kbd-table-item {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 10px 0;
}

.kbd-table-item + .kbd-table-item {
  border-top: 1px solid var(--vp-c-divider);
}

.kbd-table-item dt {
  flex-shrink: 0;
  min-width: 100px;
}

.kbd-keys {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.kbd-keys kbd + kbd::before {
  content: '+';
  margin-right: 4px;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-family: inherit;
}

.kbd-table-item dd {
  margin: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>
