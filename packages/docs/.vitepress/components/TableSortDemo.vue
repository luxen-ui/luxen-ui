<script setup>
import { computed, ref } from 'vue';

const products = [
  { sku: 'SKU-1042', name: 'Desk lamp', stock: 4210 },
  { sku: 'SKU-2087', name: 'Office chair', stock: 12004 },
  { sku: 'SKU-3110', name: 'Standing desk', stock: 865 },
  { sku: 'SKU-4021', name: 'Monitor arm', stock: 2390 },
];

const columns = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Name' },
  { key: 'stock', label: 'In stock', number: true },
];

// The table only shows the state; sorting is the page's job. One column at a
// time, cycling ascending → descending → unsorted.
const sort = ref({ key: 'stock', direction: 'descending' });

function toggle(key) {
  const current = sort.value?.key === key ? sort.value.direction : null;
  sort.value =
    current === null
      ? { key, direction: 'ascending' }
      : current === 'ascending'
        ? { key, direction: 'descending' }
        : null;
}

const rows = computed(() => {
  if (!sort.value) return products;
  const { key, direction } = sort.value;
  const sign = direction === 'ascending' ? 1 : -1;
  return [...products].toSorted((a, b) =>
    typeof a[key] === 'number' ? sign * (a[key] - b[key]) : sign * a[key].localeCompare(b[key]),
  );
});

const format = new Intl.NumberFormat('en');
</script>

<template>
  <div
    class="vp-raw component-wrapper bg-surface-sunken"
    style="padding-block: 24px; padding-inline: 12px"
  >
    <table class="l-table">
      <caption>
        Products
      </caption>
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :data-type="column.number ? 'number' : null"
            :aria-sort="sort?.key === column.key ? sort.direction : null"
          >
            <button
              type="button"
              @click="toggle(column.key)"
            >
              {{ column.label }}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in rows"
          :key="product.sku"
        >
          <th scope="row">{{ product.sku }}</th>
          <td>{{ product.name }}</td>
          <td data-type="number">{{ format.format(product.stock) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
